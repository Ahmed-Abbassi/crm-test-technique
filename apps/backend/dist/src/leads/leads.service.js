"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let LeadsService = class LeadsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existing = await this.prisma.lead.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new common_1.ConflictException('A lead with this email already exists');
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
                status: dto.status ?? client_1.LeadStatus.NEW,
            },
        });
    }
    async findAll(params) {
        const { page, limit, status, search } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
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
    async findOne(id) {
        const lead = await this.prisma.lead.findUnique({
            where: { id },
            include: {
                convertedToClient: true,
                convertedToOpportunity: true,
            },
        });
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${id} not found`);
        }
        return lead;
    }
    async update(id, dto) {
        const existing = await this.prisma.lead.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(`Lead with ID ${id} not found`);
        }
        if (dto.email && dto.email !== existing.email) {
            const emailConflict = await this.prisma.lead.findUnique({
                where: { email: dto.email },
            });
            if (emailConflict) {
                throw new common_1.ConflictException('A lead with this email already exists');
            }
        }
        return this.prisma.lead.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        const existing = await this.prisma.lead.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(`Lead with ID ${id} not found`);
        }
        await this.prisma.lead.delete({ where: { id } });
    }
    async convert(id, dto) {
        const lead = await this.prisma.lead.findUnique({ where: { id } });
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${id} not found`);
        }
        if (lead.status !== client_1.LeadStatus.QUALIFIED) {
            throw new common_1.BadRequestException(`Cannot convert lead with status "${lead.status}". Only QUALIFIED leads can be converted.`);
        }
        if (lead.convertedAt) {
            throw new common_1.BadRequestException('This lead has already been converted.');
        }
        const clientType = lead.companyName ? client_1.ClientType.COMPANY : client_1.ClientType.INDIVIDUAL;
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
        let opportunity = null;
        if (dto.createOpportunity) {
            opportunity = await this.prisma.opportunity.create({
                data: {
                    title: dto.opportunityTitle || `Deal with ${lead.companyName || `${lead.firstName} ${lead.lastName}`}`,
                    amount: dto.opportunityAmount ?? 0,
                    expectedCloseDate: dto.expectedCloseDate ? new Date(dto.expectedCloseDate) : null,
                    stage: client_1.OpportunityStage.PROPOSAL,
                    clientId: client.id,
                    lastStageChange: new Date(),
                },
            });
        }
        const updatedLead = await this.prisma.lead.update({
            where: { id },
            data: {
                status: client_1.LeadStatus.QUALIFIED,
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
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map