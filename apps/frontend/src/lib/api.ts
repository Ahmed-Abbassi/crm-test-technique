import type {
  ApiResponse,
  Opportunity,
  OpportunityFilters,
  PipelineSummary,
  Client,
  ClientListParams,
  CreateOpportunityDto,
  UpdateOpportunityDto,
  CreateClientDto,
  UpdateClientDto,
} from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiError extends Error {
  statusCode: number;
  errors: string[];

  constructor(statusCode: number, message: string, errors: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const json = await res.json();

  if (!res.ok) {
    throw new ApiError(
      res.status,
      json.message || 'An error occurred',
      json.errors || [],
    );
  }

  // Unwrap { data, meta } envelope
  if (json && typeof json === 'object' && 'data' in json) {
    return json as T;
  }

  return json as T;
}

export const api = {
  opportunities: {
    list: (filters?: OpportunityFilters) => {
      const params = new URLSearchParams();
      if (filters?.stage) params.set('stage', filters.stage);
      if (filters?.clientType) params.set('clientType', filters.clientType);
      if (filters?.isProblematic !== undefined)
        params.set('isProblematic', String(filters.isProblematic));
      if (filters?.page) params.set('page', String(filters.page));
      if (filters?.limit) params.set('limit', String(filters.limit));
      const qs = params.toString();
      return request<ApiResponse<Opportunity[]>>(
        `/opportunities${qs ? `?${qs}` : ''}`,
      );
    },
    get: (id: string) =>
      request<ApiResponse<Opportunity>>(`/opportunities/${id}`),
    create: (data: CreateOpportunityDto) =>
      request<ApiResponse<Opportunity>>('/opportunities', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: UpdateOpportunityDto) =>
      request<ApiResponse<Opportunity>>(`/opportunities/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/opportunities/${id}`, { method: 'DELETE' }),
    pipeline: () =>
      request<ApiResponse<PipelineSummary>>(
        '/opportunities/pipeline/summary',
      ),
  },
  clients: {
    list: (params?: ClientListParams) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.type) searchParams.set('type', params.type);
      if (params?.search) searchParams.set('search', params.search);
      const qs = searchParams.toString();
      return request<ApiResponse<Client[]>>(
        `/clients${qs ? `?${qs}` : ''}`,
      );
    },
    get: (id: string) =>
      request<ApiResponse<Client>>(`/clients/${id}`),
    create: (data: CreateClientDto) =>
      request<ApiResponse<Client>>('/clients', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: UpdateClientDto) =>
      request<ApiResponse<Client>>(`/clients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/clients/${id}`, { method: 'DELETE' }),
  },
};

export { ApiError };