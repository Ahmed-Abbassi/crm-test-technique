export type ClientType = 'COMPANY' | 'INDIVIDUAL';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'DISQUALIFIED';

export type OpportunityStage =
  | 'PROSPECTING'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export interface Lead {
  id: string;
  status: LeadStatus;
  email: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  title: string | null;
  source: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  convertedAt: string | null;
  convertedToClientId: string | null;
  convertedToClient?: Client | null;
  convertedToOpportunityId: string | null;
  convertedToOpportunity?: Opportunity | null;
}

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
  convertedFromLead?: Lead | null;
}

export interface Opportunity {
  id: string;
  title: string;
  amount: number;
  expectedCloseDate: string | null;
  stage: OpportunityStage;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  lastStageChange: string;
  clientId: string;
  client?: Client;
  convertedFromLead?: Lead | null;
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
  page?: number;
  limit?: number;
}

export interface LeadFilters {
  status?: LeadStatus;
  search?: string;
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
  expectedCloseDate?: string;
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
  companyName?: string;
  industry?: string;
  website?: string;
  employeeCount?: number;
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

export interface CreateLeadDto {
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

export interface UpdateLeadDto {
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

export interface ConvertLeadDto {
  createOpportunity?: boolean;
  opportunityTitle?: string;
  opportunityAmount?: number;
  expectedCloseDate?: string;
}