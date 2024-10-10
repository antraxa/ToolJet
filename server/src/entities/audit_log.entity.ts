import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('audit_logs') // Explicitly set the table name
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string; // UUID type

  @Column('uuid')
  user_id: string; // Updated to snake_case

  @Column('uuid', { nullable: true })
  organization_id: string; // Updated to snake_case

  @Column({ type: 'varchar', length: 255 })
  action_type: string; // Updated to snake_case

  @Column('uuid', { nullable: true })
  resource_id: string; // Updated to snake_case

  @Column({ type: 'varchar', length: 255, nullable: true })
  resource_type: string; // Updated to snake_case

  @Column({ type: 'varchar', length: 255, nullable: true })
  resource_name: string; // Updated to snake_case

  @Column({ type: 'varchar', length: 255, nullable: true })
  ip_address: string; // Updated to snake_case

  @Column({ type: 'json', nullable: true })
  metadata: object;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date; // Updated to snake_case
}
