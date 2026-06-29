export type ClientType = 'COMPANY' | 'INDIVIDUAL';

export type OpportunityStage =
  | 'LEAD'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

export interface Client {
  id: string;
  type: ClientType;
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
  createdAt: string;
  updatedAt: string;
  opportunities?: Opportunity[];
}

export interface Opportunity {
  id: string;
  title: string;
  amount: number;
  expectedCloseDate: string;
  stage: OpportunityStage;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  lastStageChange: string;
  clientId: string;
  client?: Client;
  isLate: boolean;
  isStagnant: boolean;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface OpportunityFilters {
  stage?: OpportunityStage;
  clientType?: ClientType;
  isProblematic?: boolean;
  page?: number;
  limit?: number;
}

export interface ClientListParams {
  page?: number;
  limit?: number;
  type?: ClientType;
  search?: string;
}

export interface PipelineSummary {
  totalPipelineValue: number;
  totalCount: number;
  wonValue: number;
  lostCount: number;
  winRate: number;
  averageDealSize: number;
  problematicCount: number;
  byStage: {
    stage: OpportunityStage;
    count: number;
    totalValue: number;
  }[];
}

export interface CreateOpportunityDto {
  title: string;
  amount: number;
  expectedCloseDate: string;
  stage: OpportunityStage;
  notes?: string;
  clientId: string;
}

export interface UpdateOpportunityDto {
  title?: string;
  amount?: number;
  expectedCloseDate?: string;
  stage?: OpportunityStage;
  notes?: string;
}

export interface CreateClientDto {
  type: ClientType;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  // Company fields
  companyName?: string;
  industry?: string;
  website?: string;
  employeeCount?: number;
  // Individual fields
  firstName?: string;
  lastName?: string;
}

export interface UpdateClientDto {
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