import { OpportunitiesService, OpportunityWithFlags } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { OpportunityFiltersDto } from './dto/opportunity-filters.dto';
export declare class OpportunitiesController {
    private readonly opportunitiesService;
    constructor(opportunitiesService: OpportunitiesService);
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
    findOne(id: string): Promise<OpportunityWithFlags>;
    update(id: string, dto: UpdateOpportunityDto): Promise<OpportunityWithFlags>;
    remove(id: string): Promise<void>;
}
