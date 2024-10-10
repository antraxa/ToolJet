import { EntityRepository, Repository } from 'typeorm';
import { AuditLog } from '../entities/audit_log.entity';

@EntityRepository(AuditLog)
export class AuditLogRepository extends Repository<AuditLog> {
  public async createAuditLog(
    actionType: string,
    userId: string,
    resourceId: string | null,
    resourceType: string | null,
    resourceName: string | null,
    ipAddress: string | null,
    metadata: any
  ): Promise<AuditLog> {
    const auditLog = this.create({
      action_type: actionType, // Updated to snake_case
      user_id: userId, // Updated to snake_case
      resource_id: resourceId, // Updated to snake_case
      resource_type: resourceType, // Updated to snake_case
      resource_name: resourceName, // Updated to snake_case
      ip_address: ipAddress, // Updated to snake_case
      metadata: metadata,
    });
    return await this.save(auditLog);
  }
}
