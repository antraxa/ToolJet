import { EntityManager } from 'typeorm';
import { dbTransactionWrap } from 'src/helpers/database.helper';
import { OwnAuditLog } from '../entities/own_audit_log.entity';

export const auditLog = async (
  actionType: string,
  userId: string,
  resourceId: string | null,
  resourceType: string | null,
  resourceName: string | null, // Add this
  ipAddress: string | null, // Add this
  metadata: any,
  manager?: EntityManager
) => {
  console.log(`Audit log operation started. Action: ${actionType}, User ID: ${userId}`);

  return await dbTransactionWrap(async (manager: EntityManager) => {
    const auditLog = manager.create(OwnAuditLog, {
      action_type: actionType,
      user_id: userId,
      resource_id: resourceId,
      resource_type: resourceType,
      resource_name: resourceName,
      ip_address: ipAddress,
      metadata: metadata,
    });

    try {
      await manager.save(auditLog);
      console.log(`Audit log operation completed successfully for Action: ${actionType}, User ID: ${userId}`);
    } catch (error) {
      console.error(`Audit log operation FAILED for Action: ${actionType}, Error: ${error.message}`);
    }
  }, manager);
};
