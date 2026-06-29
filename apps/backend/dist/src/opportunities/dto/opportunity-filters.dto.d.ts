import { OpportunityStage, ClientType } from '@prisma/client';
export declare class OpportunityFiltersDto {
    stage?: OpportunityStage;
    clientType?: ClientType;
    isProblematic?: boolean;
    page?: number;
    limit?: number;
}
