import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity('users')
@Index(['tenant', 'username'], { unique: true })
@Index(['tenant', 'email'], { unique: true })
@Index(['tenant', 'phone'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar', length: 50 })
  username: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'password_salt', type: 'varchar', length: 100 })
  passwordSalt: string;

  @Column({ name: 'display_name', type: 'varchar', length: 50, nullable: true })
  displayName: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  roles: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 验证方法
  validate(): void {
    if (!this.username || this.username.length < 2) {
      throw new Error('用户名至少 2 个字符');
    }

    if (!this.passwordHash) {
      throw new Error('密码不能为空');
    }

    if (this.status === UserStatus.SUSPENDED) {
      throw new Error('用户已停用，无法操作');
    }
  }

  // 检查是否可以登录
  canLogin(): boolean {
    return (
      this.status === UserStatus.ACTIVE &&
      this.tenantId !== null
    );
  }
}
