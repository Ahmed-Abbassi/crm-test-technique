import { OpportunityStage } from '@prisma/client';
export declare class CreateOpportunityDto {
    title: string;
    amount: number;
    expectedCloseDate?: string;
    stage: OpportunityStage;
    notes?: string;
    clientId: string;
}
