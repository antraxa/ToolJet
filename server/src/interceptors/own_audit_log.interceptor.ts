import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { auditLog } from 'src/utils/own_audit_logs_logic';
@Injectable()
export class OwnAuditLogInterceptor implements NestInterceptor {
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
              method,
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
    if (method === 'GET' && url.includes('data_queries')) return 'getDataQuery';
    if (method === 'PUT' && url.includes('data_queries')) return 'updateDataQuery';
    if (method === 'GET' && url.includes('/api/logout')) return 'logout';
    if (method === 'DELETE' && url.includes('/api/apps')) return 'deleteApp';
    if (method === 'POST' && url.includes('/api/apps')) return 'createApp';
    if (method === 'POST' && url.includes('/api/v2/data_sources')) return 'createDataSource';
    if (method === 'DELETE' && url.includes('/api/v2/data_sources')) return 'deleteDataSource';
    if (url.includes('/api/session')) return null; // Skip logging for session details
    if (method === 'GET' && url.includes('/api/apps')) return null; // Skip logging for fetching apps
    if (url.includes('/api/authorize')) return null; // Skip logging for authorization
    if (url.includes('/api/data_sources/test_connection')) return null; // Skip logging for testing data source connection
    if (method === 'GET' && url.includes('/api/v2/data_sources')) return null; // Skip logging for fetching data sources

    return 'unknownAction';
  }
}
