import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Prisma } from '@prisma/client';
export declare class ClientsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateClientDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string | null;
        firstName: string | null;
        lastName: string | null;
        companyName: string | null;
        type: import("@prisma/client").$Enums.ClientType;
        address: string | null;
        city: string | null;
        country: string | null;
        industry: string | null;
        website: string | null;
        employeeCount: number | null;
    }>;
    findAll(params: {
        page: number;
        limit: number;
        type?: string;
        search?: string;
    }): Promise<{
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            phone: string | null;
            firstName: string | null;
            lastName: string | null;
            companyName: string | null;
            type: import("@prisma/client").$Enums.ClientType;
            address: string | null;
            city: string | null;
            country: string | null;
            industry: string | null;
            website: string | null;
            employeeCount: number | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        opportunities: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            notes: string | null;
            amount: Prisma.Decimal;
            expectedCloseDate: Date | null;
            stage: import("@prisma/client").$Enums.OpportunityStage;
            lastStageChange: Date;
            clientId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string | null;
        firstName: string | null;
        lastName: string | null;
        companyName: string | null;
        type: import("@prisma/client").$Enums.ClientType;
        address: string | null;
        city: string | null;
        country: string | null;
        industry: string | null;
        website: string | null;
        employeeCount: number | null;
    }>;
    update(id: string, dto: UpdateClientDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string | null;
        firstName: string | null;
        lastName: string | null;
        companyName: string | null;
        type: import("@prisma/client").$Enums.ClientType;
        address: string | null;
        city: string | null;
        country: string | null;
        industry: string | null;
        website: string | null;
        employeeCount: number | null;
    }>;
    remove(id: string): Promise<void>;
}
