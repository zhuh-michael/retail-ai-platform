import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
}

export enum PlanType {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  ENTERPRISE = 'ENTERPRISE',
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  code: string;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.ACTIVE,
  })
  @Index()
  status: TenantStatus;

  @Column({ type: 'jsonb' })
  contactInfo: {
    companyName: string;
    address: string;
    phone: string;
    email: string;
    legalPerson: string;
  };

  @Column({ type: 'jsonb' })
  subscription: {
    plan: PlanType;
    startDate: Date;
    endDate: Date;
    autoRenew: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  branding: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    customDomain?: string;
  };

  @Column({ type: 'jsonb' })
  quota: {
    maxStores: number;
    maxUsers: number;
    maxApiCallsPerDay: number;
    maxStorageGB: number;
    features: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  expiresAt: Date;

  // 不变量验证
  validate(): void {
    if (!this.code || this.code.length < 2) {
      throw new Error('租户编码至少 2 个字符');
    }

    if (!this.name || this.name.length < 2 || this.name.length > 100) {
      throw new Error('企业名称长度 2-100 字符');
    }

    if (this.status === TenantStatus.EXPIRED && new Date() > this.expiresAt) {
      throw new Error('过期租户不可操作');
    }
  }

  // 检查是否可创建新用户
  canCreateUser(currentUserCount: number): boolean {
    return (
      this.status === TenantStatus.ACTIVE &&
      currentUserCount < this.quota.maxUsers &&
      new Date() < this.expiresAt
    );
  }

  // 检查是否可创建新门店
  canCreateStore(currentStoreCount: number): boolean {
    return (
      this.status === TenantStatus.ACTIVE &&
      currentStoreCount < this.quota.maxStores
    );
  }
}
