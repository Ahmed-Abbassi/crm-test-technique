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
exports.OpportunitiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let OpportunitiesService = class OpportunitiesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const client = await this.prisma.client.findUnique({
            where: { id: dto.clientId },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client with ID ${dto.clientId} not found`);
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
    async findAll(filters) {
        const { page, limit, stage, clientType } = filters;
        const skip = ((page ?? 1) - 1) * (limit ?? 20);
        const where = {};
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
    async findOne(id) {
        const opportunity = await this.prisma.opportunity.findUnique({
            where: { id },
            include: { client: true },
        });
        if (!opportunity) {
            throw new common_1.NotFoundException(`Opportunity with ID ${id} not found`);
        }
        return opportunity;
    }
    async update(id, dto) {
        const existing = await this.prisma.opportunity.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(`Opportunity with ID ${id} not found`);
        }
        const updateData = { ...dto };
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
    async remove(id) {
        const existing = await this.prisma.opportunity.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(`Opportunity with ID ${id} not found`);
        }
        await this.prisma.opportunity.delete({ where: { id } });
    }
    async getPipelineSummary() {
        const allOpps = await this.prisma.opportunity.findMany();
        const activeStages = [
            client_1.OpportunityStage.PROSPECTING,
            client_1.OpportunityStage.PROPOSAL,
            client_1.OpportunityStage.NEGOTIATION,
        ];
        const totalPipelineValue = allOpps
            .filter((o) => activeStages.includes(o.stage))
            .reduce((sum, o) => sum + Number(o.amount), 0);
        const totalCount = allOpps.length;
        const wonOpps = allOpps.filter((o) => o.stage === client_1.OpportunityStage.CLOSED_WON);
        const lostOpps = allOpps.filter((o) => o.stage === client_1.OpportunityStage.CLOSED_LOST);
        const wonValue = wonOpps.reduce((sum, o) => sum + Number(o.amount), 0);
        const lostCount = lostOpps.length;
        const winRate = wonOpps.length + lostOpps.length > 0
            ? (wonOpps.length / (wonOpps.length + lostOpps.length)) * 100
            : 0;
        const averageDealSize = allOpps.length > 0
            ? allOpps.reduce((sum, o) => sum + Number(o.amount), 0) / allOpps.length
            : 0;
        const stages = Object.values(client_1.OpportunityStage);
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
};
exports.OpportunitiesService = OpportunitiesService;
exports.OpportunitiesService = OpportunitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OpportunitiesService);
//# sourceMappingURL=opportunities.service.js.map