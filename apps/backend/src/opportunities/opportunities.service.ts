import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { OpportunityFiltersDto } from './dto/opportunity-filters.dto';
import { Prisma, OpportunityStage } from '@prisma/client';

export interface OpportunityWithFlags {
  id: string;
  title: string;
  amount: number;
  expectedCloseDate: Date;
  stage: OpportunityStage;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastStageChange: Date;
  clientId: string;
  isLate: boolean;
  isStagnant: boolean;
  client?: Record<string, unknown>;
}

@Injectable()
export class OpportunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  private computeProblematicFlags(
    opportunity: {
      expectedCloseDate: Date;
      lastStageChange: Date;
      stage: OpportunityStage;
    },
  ): { isLate: boolean; isStagnant: boolean } {
    const now = new Date();
    const closedStages: OpportunityStage[] = [OpportunityStage.WON, OpportunityStage.LOST];
    const isClosed = closedStages.includes(opportunity.stage);

    const isLate = !isClosed && new Date(opportunity.expectedCloseDate) < now;

    const stagnantThreshold = new Date();
    stagnantThreshold.setDate(stagnantThreshold.getDate() - 14);
    const isStagnant =
      !isClosed && new Date(opportunity.lastStageChange) < stagnantThreshold;

    return { isLate, isStagnant };
  }

  private mapWithFlags(opportunity: any): OpportunityWithFlags {
    const { isLate, isStagnant } = this.computeProblematicFlags(opportunity);
    return {
      ...opportunity,
      amount: Number(opportunity.amount),
      isLate,
      isStagnant,
    };
  }

  async create(dto: CreateOpportunityDto) {
    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });
    if (!client) {
      throw new NotFoundException(
        `Client with ID ${dto.clientId} not found`,
      );
    }

    const opportunity = await this.prisma.opportunity.create({
      data: {
        title: dto.title,
        amount: dto.amount,
        expectedCloseDate: new Date(dto.expectedCloseDate),
        stage: dto.stage,
        notes: dto.notes,
        clientId: dto.clientId,
        lastStageChange: new Date(),
      },
      include: { client: true },
    });

    return this.mapWithFlags(opportunity);
  }

  async findAll(filters: OpportunityFiltersDto) {
    const { page, limit, stage, clientType, isProblematic } = filters;
    const skip = ((page ?? 1) - 1) * (limit ?? 20);

    const where: Prisma.OpportunityWhereInput = {};

    if (stage) {
      where.stage = stage;
    }

    if (clientType) {
      where.client = {
        type: clientType,
      };
    }

    let opportunities = await this.prisma.opportunity.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        client: true,
      },
    });

    const total = await this.prisma.opportunity.count({ where });

    const mapped = opportunities.map((o) => this.mapWithFlags(o));

    // Filter by problematic flag if requested
    let filtered = mapped;
    if (isProblematic === true) {
      filtered = mapped.filter((o) => o.isLate || o.isStagnant);
    }

    return {
      items: filtered,
      meta: {
        total,
        page: page ?? 1,
        limit: limit ?? 20,
        totalPages: Math.ceil(total / (limit ?? 20)),
      },
    };
  }

  async findOne(id: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!opportunity) {
      throw new NotFoundException(
        `Opportunity with ID ${id} not found`,
      );
    }

    return this.mapWithFlags(opportunity);
  }

  async update(id: string, dto: UpdateOpportunityDto) {
    const existing = await this.prisma.opportunity.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        `Opportunity with ID ${id} not found`,
      );
    }

    const updateData: Prisma.OpportunityUpdateInput = {
      ...dto,
    };

    // Auto-update lastStageChange when stage changes
    if (dto.stage && dto.stage !== existing.stage) {
      updateData.lastStageChange = new Date();
    }

    if (dto.expectedCloseDate) {
      updateData.expectedCloseDate = new Date(dto.expectedCloseDate);
    }

    if (dto.amount !== undefined) {
      updateData.amount = dto.amount;
    }

    const opportunity = await this.prisma.opportunity.update({
      where: { id },
      data: updateData,
      include: { client: true },
    });

    return this.mapWithFlags(opportunity);
  }

  async remove(id: string) {
    const existing = await this.prisma.opportunity.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        `Opportunity with ID ${id} not found`,
      );
    }

    await this.prisma.opportunity.delete({
      where: { id },
    });
  }

  async getPipelineSummary() {
    const allOpps = await this.prisma.opportunity.findMany();

    const totalPipelineValue = allOpps
      .filter(
        (o) =>
          o.stage !== OpportunityStage.WON &&
          o.stage !== OpportunityStage.LOST,
      )
      .reduce((sum, o) => sum + Number(o.amount), 0);

    const totalCount = allOpps.length;
    const wonOpps = allOpps.filter(
      (o) => o.stage === OpportunityStage.WON,
    );
    const lostOpps = allOpps.filter(
      (o) => o.stage === OpportunityStage.LOST,
    );

    const wonValue = wonOpps.reduce(
      (sum, o) => sum + Number(o.amount),
      0,
    );
    const lostCount = lostOpps.length;
    const winRate =
      wonOpps.length + lostOpps.length > 0
        ? (wonOpps.length / (wonOpps.length + lostOpps.length)) * 100
        : 0;

    const averageDealSize =
      allOpps.length > 0
        ? allOpps.reduce((sum, o) => sum + Number(o.amount), 0) /
          allOpps.length
        : 0;

    const allWithFlags = allOpps.map((o) => this.mapWithFlags(o));
    const problematicCount = allWithFlags.filter(
      (o) => o.isLate || o.isStagnant,
    ).length;

    const stages = Object.values(OpportunityStage);
    const byStage = stages.map((stage) => {
      const stageOpps = allOpps.filter((o) => o.stage === stage);
      return {
        stage,
        count: stageOpps.length,
        totalValue: stageOpps.reduce(
          (sum, o) => sum + Number(o.amount),
          0,
        ),
      };
    });

    return {
      totalPipelineValue,
      totalCount,
      wonValue,
      lostCount,
      winRate: Math.round(winRate * 100) / 100,
      averageDealSize: Math.round(averageDealSize * 100) / 100,
      problematicCount,
      byStage,
    };
  }
}