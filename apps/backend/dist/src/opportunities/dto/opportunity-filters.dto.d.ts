import { OpportunityStage, ClientType } from '@prisma/client';
export declare class OpportunityFiltersDto {
    stage?: OpportunityStage;
    clientType?: ClientType;
    page?: number;
    limit?: number;
}
