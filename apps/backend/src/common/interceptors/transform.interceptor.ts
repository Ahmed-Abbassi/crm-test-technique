import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        // If response already has our shape, pass through
        if (
          response &&
          typeof response === 'object' &&
          'data' in response &&
          'meta' in response
        ) {
          return response;
        }

        // If it's a paginated response with meta
        if (
          response &&
          typeof response === 'object' &&
          'items' in response &&
          'meta' in response
        ) {
          return {
            data: (response as { items: T }).items,
            meta: (response as { meta: PaginationMeta }).meta,
          };
        }

        // DELETE returns 204, skip wrapping
        const httpContext = context.switchToHttp();
        const res = httpContext.getResponse();
        if (res.statusCode === 204) {
          return response;
        }

        return { data: response };
      }),
    );
  }
}