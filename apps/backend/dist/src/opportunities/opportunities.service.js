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
    computeProblematicFlags(opportunity) {
        const now = new Date();
        const closedStages = [client_1.OpportunityStage.WON, client_1.OpportunityStage.LOST];
        const isClosed = closedStages.includes(opportunity.stage);
        const isLate = !isClosed && new Date(opportunity.expectedCloseDate) < now;
        const stagnantThreshold = new Date();
        stagnantThreshold.setDate(stagnantThreshold.getDate() - 14);
        const isStagnant = !isClosed && new Date(opportunity.lastStageChange) < stagnantThreshold;
        return { isLate, isStagnant };
    }
    mapWithFlags(opportunity) {
        const { isLate, isStagnant } = this.computeProblematicFlags(opportunity);
        return {
            ...opportunity,
            amount: Number(opportunity.amount),
            isLate,
            isStagnant,
        };
    }
    async create(dto) {
        const client = await this.prisma.client.findUnique({
            where: { id: dto.clientId },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client with ID ${dto.clientId} not found`);
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
    async findAll(filters) {
        const { page, limit, stage, clientType, isProblematic } = filters;
        const skip = ((page ?? 1) - 1) * (limit ?? 20);
        const where = {};
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
    async findOne(id) {
        const opportunity = await this.prisma.opportunity.findUnique({
            where: { id },
            include: { client: true },
        });
        if (!opportunity) {
            throw new common_1.NotFoundException(`Opportunity with ID ${id} not found`);
        }
        return this.mapWithFlags(opportunity);
    }
    async update(id, dto) {
        const existing = await this.prisma.opportunity.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Opportunity with ID ${id} not found`);
        }
        const updateData = {
            ...dto,
        };
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
    async remove(id) {
        const existing = await this.prisma.opportunity.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Opportunity with ID ${id} not found`);
        }
        await this.prisma.opportunity.delete({
            where: { id },
        });
    }
    async getPipelineSummary() {
        const allOpps = await this.prisma.opportunity.findMany();
        const totalPipelineValue = allOpps
            .filter((o) => o.stage !== client_1.OpportunityStage.WON &&
            o.stage !== client_1.OpportunityStage.LOST)
            .reduce((sum, o) => sum + Number(o.amount), 0);
        const totalCount = allOpps.length;
        const wonOpps = allOpps.filter((o) => o.stage === client_1.OpportunityStage.WON);
        const lostOpps = allOpps.filter((o) => o.stage === client_1.OpportunityStage.LOST);
        const wonValue = wonOpps.reduce((sum, o) => sum + Number(o.amount), 0);
        const lostCount = lostOpps.length;
        const winRate = wonOpps.length + lostOpps.length > 0
            ? (wonOpps.length / (wonOpps.length + lostOpps.length)) * 100
            : 0;
        const averageDealSize = allOpps.length > 0
            ? allOpps.reduce((sum, o) => sum + Number(o.amount), 0) /
                allOpps.length
            : 0;
        const allWithFlags = allOpps.map((o) => this.mapWithFlags(o));
        const problematicCount = allWithFlags.filter((o) => o.isLate || o.isStagnant).length;
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
            problematicCount,
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