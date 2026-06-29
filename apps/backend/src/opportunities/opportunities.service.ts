import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { OpportunityFiltersDto } from './dto/opportunity-filters.dto';
import { Prisma, OpportunityStage } from '@prisma/client';

@Injectable()
export class OpportunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOpportunityDto) {
    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });
    if (!client) {
      throw new NotFoundException(`Client with ID ${dto.clientId} not found`);
    }

    return this.prisma.opportunity.create({
      data: {
        title: dto.title,
        amount: dto.amount,
        expectedCloseDate: dto.expectedCloseDate ? new Date(dto.expectedCloseDate) : null,
        stage: dto.stage,
        notes: dto.notes,
        clientId: dto.clientId,
        lastStageChange: new Date(),
      },
      include: { client: true },
    });
  }

  async findAll(filters: OpportunityFiltersDto) {
    const { page, limit, stage, clientType } = filters;
    const skip = ((page ?? 1) - 1) * (limit ?? 20);

    const where: Prisma.OpportunityWhereInput = {};

    if (stage) {
      where.stage = stage;
    }

    if (clientType) {
      where.client = { type: clientType };
    }

    const [opportunities, total] = await Promise.all([
      this.prisma.opportunity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { client: true },
      }),
      this.prisma.opportunity.count({ where }),
    ]);

    return {
      items: opportunities,
      meta: { total, page: page ?? 1, limit: limit ?? 20, totalPages: Math.ceil(total / (limit ?? 20)) },
    };
  }

  async findOne(id: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!opportunity) {
      throw new NotFoundException(`Opportunity with ID ${id} not found`);
    }

    return opportunity;
  }

  async update(id: string, dto: UpdateOpportunityDto) {
    const existing = await this.prisma.opportunity.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Opportunity with ID ${id} not found`);
    }

    const updateData: Prisma.OpportunityUpdateInput = { ...dto };

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

    return opportunity;
  }

  async remove(id: string) {
    const existing = await this.prisma.opportunity.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Opportunity with ID ${id} not found`);
    }
    await this.prisma.opportunity.delete({ where: { id } });
  }

  async getPipelineSummary() {
    const allOpps = await this.prisma.opportunity.findMany();

    const activeStages: OpportunityStage[] = [
      OpportunityStage.PROSPECTING,
      OpportunityStage.PROPOSAL,
      OpportunityStage.NEGOTIATION,
    ];

    const totalPipelineValue = allOpps
      .filter((o) => activeStages.includes(o.stage))
      .reduce((sum, o) => sum + Number(o.amount), 0);

    const totalCount = allOpps.length;
    const wonOpps = allOpps.filter((o) => o.stage === OpportunityStage.CLOSED_WON);
    const lostOpps = allOpps.filter((o) => o.stage === OpportunityStage.CLOSED_LOST);

    const wonValue = wonOpps.reduce((sum, o) => sum + Number(o.amount), 0);
    const lostCount = lostOpps.length;
    const winRate =
      wonOpps.length + lostOpps.length > 0
        ? (wonOpps.length / (wonOpps.length + lostOpps.length)) * 100
        : 0;

    const averageDealSize =
      allOpps.length > 0
        ? allOpps.reduce((sum, o) => sum + Number(o.amount), 0) / allOpps.length
        : 0;

    const stages = Object.values(OpportunityStage);
    const byStage = stages.map((stage) => {
      const stageOpps = allOpps.filter((o) => o.stage === stage);
      return {
        stage,
        count: stageOpps.length,
        totalValue: stageOpps.reduce((sum, o) => sum + Number(o.amount), 0),
      };
    });

    return {
      totalPipelineValue,
      totalCount,
      wonValue,
      lostCount,
      winRate: Math.round(winRate * 100) / 100,
      averageDealSize: Math.round(averageDealSize * 100) / 100,
      problematicCount: 0,
      byStage,
    };
  }
}