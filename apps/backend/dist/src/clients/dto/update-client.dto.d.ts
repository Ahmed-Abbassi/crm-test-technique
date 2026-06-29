import { ClientType } from '@prisma/client';
export declare class UpdateClientDto {
    type?: ClientType;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    companyName?: string;
    industry?: string;
    website?: string;
    employeeCount?: number;
    firstName?: string;
    lastName?: string;
}
