import { LeadStatus } from '@prisma/client';
export declare class UpdateLeadDto {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    title?: string;
    source?: string;
    notes?: string;
    status?: LeadStatus;
}
