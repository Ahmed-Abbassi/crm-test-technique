import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { Prisma, LeadStatus, ClientType, OpportunityStage } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLeadDto) {
    const existing = await this.prisma.lead.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('A lead with this email already exists');
    }

    return this.prisma.lead.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        firstName: dto.firstName,
        lastName: dto.lastName,
        companyName: dto.companyName,
        title: dto.title,
        source: dto.source,
        notes: dto.notes,
        status: dto.status ?? LeadStatus.NEW,
      },
    });
  }

  async findAll(params: { page: number; limit: number; status?: string; search?: string }) {
    const { page, limit, status, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {};

    if (status) {
      where.status = status as LeadStatus;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      items: leads,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        convertedToClient: true,
        convertedToOpportunity: true,
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  async update(id: string, dto: UpdateLeadDto) {
    const existing = await this.prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    if (dto.email && dto.email !== existing.email) {
      const emailConflict = await this.prisma.lead.findUnique({
        where: { email: dto.email },
      });
      if (emailConflict) {
        throw new ConflictException('A lead with this email already exists');
      }
    }

    return this.prisma.lead.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    await this.prisma.lead.delete({ where: { id } });
  }

  /**
   * Convert a QUALIFIED lead into a Client + (optional) Opportunity.
   * After conversion, the lead is marked as converted and no longer active.
   */
  async convert(id: string, dto: ConvertLeadDto) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    if (lead.status !== LeadStatus.QUALIFIED) {
      throw new BadRequestException(
        `Cannot convert lead with status "${lead.status}". Only QUALIFIED leads can be converted.`,
      );
    }

    if (lead.convertedAt) {
      throw new BadRequestException('This lead has already been converted.');
    }

    // Determine client type based on whether we have a company name
    const clientType = lead.companyName ? ClientType.COMPANY : ClientType.INDIVIDUAL;

    // Create the client
    const client = await this.prisma.client.create({
      data: {
        type: clientType,
        email: lead.email,
        phone: lead.phone,
        companyName: lead.companyName,
        firstName: lead.firstName,
        lastName: lead.lastName,
      },
    });

    // Optionally create an opportunity
    let opportunity = null;
    if (dto.createOpportunity) {
      opportunity = await this.prisma.opportunity.create({
        data: {
          title: dto.opportunityTitle || `Deal with ${lead.companyName || `${lead.firstName} ${lead.lastName}`}`,
          amount: dto.opportunityAmount ?? 0,
          expectedCloseDate: dto.expectedCloseDate ? new Date(dto.expectedCloseDate) : null,
          stage: OpportunityStage.PROPOSAL,
          clientId: client.id,
          lastStageChange: new Date(),
        },
      });
    }

    // Mark lead as converted
    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data: {
        status: LeadStatus.QUALIFIED,
        convertedAt: new Date(),
        convertedToClientId: client.id,
        convertedToOpportunityId: opportunity?.id,
      },
      include: {
        convertedToClient: true,
        convertedToOpportunity: true,
      },
    });

    return updatedLead;
  }
}