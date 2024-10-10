import { getCustomRepository } from 'typeorm';
import { AuditLogRepository } from '../repositories/audit_log.repository';

export const auditLog = async (
  actionType: string,
  userId: string,
  resourceId: string | null,
  resourceType: string | null,
  resourceName: string | null, // Add this
  ipAddress: string | null, // Add this
  metadata: any
) => {
  console.log(`Audit log operation started. Action: ${actionType}, User ID: ${userId}`);

  const auditLogRepository = getCustomRepository(AuditLogRepository);
  try {
    await auditLogRepository.createAuditLog(
      actionType,
      userId,
      resourceId,
      resourceType,
      resourceName, // Pass resourceName
      ipAddress, // Pass ipAddress
      metadata
    );
    console.log(`Audit log operation completed successfully for Action: ${actionType}, User ID: ${userId}`);
  } catch (error) {
    console.error(`Audit log operation FAILED for Action: ${actionType}, Error: ${error.message}`);
  }
};
