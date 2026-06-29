import { PrismaService } from '../prisma/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { OpportunityFiltersDto } from './dto/opportunity-filters.dto';
import { OpportunityStage } from '@prisma/client';
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
export declare class OpportunitiesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private computeProblematicFlags;
    private mapWithFlags;
    create(dto: CreateOpportunityDto): Promise<OpportunityWithFlags>;
    findAll(filters: OpportunityFiltersDto): Promise<{
        items: OpportunityWithFlags[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<OpportunityWithFlags>;
    update(id: string, dto: UpdateOpportunityDto): Promise<OpportunityWithFlags>;
    remove(id: string): Promise<void>;
    getPipelineSummary(): Promise<{
        totalPipelineValue: number;
        totalCount: number;
        wonValue: number;
        lostCount: number;
        winRate: number;
        averageDealSize: number;
        problematicCount: number;
        byStage: {
            stage: "NEGOTIATION" | "PROPOSAL" | "QUALIFIED" | "LEAD" | "WON" | "LOST";
            count: number;
            totalValue: number;
        }[];
    }>;
}
