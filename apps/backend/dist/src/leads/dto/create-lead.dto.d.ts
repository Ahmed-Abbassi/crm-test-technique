import { LeadStatus } from '@prisma/client';
export declare class CreateLeadDto {
    email: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    title?: string;
    source?: string;
    notes?: string;
    status?: LeadStatus;
}
