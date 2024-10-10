import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { auditLog } from 'src/utils/audit_logs_logic';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse(); // Access the response object
    const user = request.user;
    const { method, originalUrl, headers, params } = request;

    return next.handle().pipe(
      tap(async () => {
        const actionType = this.getActionType(method, originalUrl);

        if (actionType) {
          const userId = user ? user.id : null; // Handle case when user is undefined (e.g., during login)
          const resourceId = request.params.id || null; // Assume resource ID from params or null

          // Access response information like status code or any other headers
          const statusCode = response.statusCode;

          await auditLog(
            actionType,
            userId, // Log userId only if available
            resourceId,
            null, // resourceType (customize as needed)
            null, // resourceName (replace with actual value or pass null)
            request.ip, // ipAddress from request
            {
              body: request.body,
              query: request.query,
              headers,
              url: originalUrl,
              params,
              statusCode,
            }
          );
        }
      })
    );
  }

  private getActionType(method: string, url: string): string | null {
    if (method === 'POST' && url.includes('data_queries')) return 'executeDataQuery';
    if (method === 'DELETE' && url.includes('data_queries')) return 'removeDataQuery';
    if (method === 'PUT' && url.includes('data_queries')) return 'updateDataQuery';
    return null;
  }
}
