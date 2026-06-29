import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { OpportunityFiltersDto } from './dto/opportunity-filters.dto';
export declare class OpportunitiesController {
    private readonly opportunitiesService;
    constructor(opportunitiesService: OpportunitiesService);
    create(dto: CreateOpportunityDto): Promise<{
        client: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        expectedCloseDate: Date | null;
        stage: import("@prisma/client").$Enums.OpportunityStage;
        lastStageChange: Date;
        clientId: string;
    }>;
    findAll(filters: OpportunityFiltersDto): Promise<{
        items: ({
            client: {
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
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            notes: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            expectedCloseDate: Date | null;
            stage: import("@prisma/client").$Enums.OpportunityStage;
            lastStageChange: Date;
            clientId: string;
        })[];
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
            stage: "NEGOTIATION" | "PROPOSAL" | "PROSPECTING" | "CLOSED_WON" | "CLOSED_LOST";
            count: number;
            totalValue: number;
        }[];
    }>;
    findOne(id: string): Promise<{
        client: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        expectedCloseDate: Date | null;
        stage: import("@prisma/client").$Enums.OpportunityStage;
        lastStageChange: Date;
        clientId: string;
    }>;
    update(id: string, dto: UpdateOpportunityDto): Promise<{
        client: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        expectedCloseDate: Date | null;
        stage: import("@prisma/client").$Enums.OpportunityStage;
        lastStageChange: Date;
        clientId: string;
    }>;
    remove(id: string): Promise<void>;
}
