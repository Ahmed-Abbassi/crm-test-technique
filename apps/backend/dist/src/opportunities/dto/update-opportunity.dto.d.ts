import { OpportunityStage } from '@prisma/client';
export declare class UpdateOpportunityDto {
    title?: string;
    amount?: number;
    expectedCloseDate?: string;
    stage?: OpportunityStage;
    notes?: string;
}
