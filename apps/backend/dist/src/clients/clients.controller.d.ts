import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    create(dto: CreateClientDto): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.ClientType;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string | null;
        address: string | null;
        city: string | null;
        country: string | null;
        companyName: string | null;
        industry: string | null;
        website: string | null;
        employeeCount: number | null;
        firstName: string | null;
        lastName: string | null;
    }>;
    findAll(page?: number, limit?: number, type?: string, search?: string): Promise<{
        items: {
            id: string;
            type: import("@prisma/client").$Enums.ClientType;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            phone: string | null;
            address: string | null;
            city: string | null;
            country: string | null;
            companyName: string | null;
            industry: string | null;
            website: string | null;
            employeeCount: number | null;
            firstName: string | null;
            lastName: string | null;
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
            amount: import("@prisma/client/runtime/library").Decimal;
            expectedCloseDate: Date;
            stage: import("@prisma/client").$Enums.OpportunityStage;
            notes: string | null;
            lastStageChange: Date;
            clientId: string;
        }[];
    } & {
        id: string;
        type: import("@prisma/client").$Enums.ClientType;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string | null;
        address: string | null;
        city: string | null;
        country: string | null;
        companyName: string | null;
        industry: string | null;
        website: string | null;
        employeeCount: number | null;
        firstName: string | null;
        lastName: string | null;
    }>;
    update(id: string, dto: UpdateClientDto): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.ClientType;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string | null;
        address: string | null;
        city: string | null;
        country: string | null;
        companyName: string | null;
        industry: string | null;
        website: string | null;
        employeeCount: number | null;
        firstName: string | null;
        lastName: string | null;
    }>;
    remove(id: string): Promise<void>;
}
