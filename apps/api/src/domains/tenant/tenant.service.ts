import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantStatus, PlanType } from './entities/tenant.entity';

interface CreateTenantInput {
  name: string;
  code: string;
  contactInfo: {
    companyName: string;
    address: string;
    phone: string;
    email: string;
    legalPerson: string;
  };
  subscription: {
    plan: PlanType;
    startDate: Date;
    endDate: Date;
    autoRenew?: boolean;
  };
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
  };
  quota?: {
    maxStores: number;
    maxUsers: number;
    maxApiCallsPerDay: number;
    maxStorageGB: number;
  };
}

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  /**
   * 创建新租户
   */
  async create(input: CreateTenantInput): Promise<Tenant> {
    // 验证输入
    if (input.code.length < 2) {
      throw new BadRequestException('租户编码至少 2 个字符');
    }

    // 检查编码是否已存在
    const existing = await this.tenantRepository.findOne({
      where: { code: input.code },
    });

    if (existing) {
      throw new ConflictException('租户编码已存在');
    }

    // 默认配额
    const defaultQuota = {
      maxStores: 50,
      maxUsers: 100,
      maxApiCallsPerDay: 100000,
      maxStorageGB: 100,
      features: ['basic-analytics', 'email-support'],
    };

    // 创建租户
    const tenant = this.tenantRepository.create({
      name: input.name,
      code: input.code,
      status: TenantStatus.ACTIVE,
      contactInfo: input.contactInfo,
      subscription: {
        plan: input.subscription.plan,
        startDate: input.subscription.startDate,
        endDate: input.subscription.endDate,
        autoRenew: input.subscription.autoRenew ?? false,
      },
      branding: input.branding || {},
      quota: input.quota || defaultQuota,
      expiresAt: input.subscription.endDate,
    });

    // 验证不变量
    tenant.validate();

    return await this.tenantRepository.save(tenant);
  }

  /**
   * 获取租户详情
   */
  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('租户不存在');
    }

    return tenant;
  }

  /**
   * 按编码获取租户
   */
  async findOneByCode(code: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { code },
    });

    if (!tenant) {
      throw new NotFoundException('租户不存在');
    }

    return tenant;
  }

  /**
   * 更新租户信息
   */
  async update(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const tenant = await this.findOne(id);

    // 合并更新
    Object.assign(tenant, updates);

    // 验证不变量
    tenant.validate();

    return await this.tenantRepository.save(tenant);
  }

  /**
   * 停用租户
   */
  async suspend(id: string, reason: string): Promise<Tenant> {
    const tenant = await this.findOne(id);

    if (tenant.status === TenantStatus.SUSPENDED) {
      throw new BadRequestException('租户已停用');
    }

    tenant.status = TenantStatus.SUSPENDED;
    return await this.tenantRepository.save(tenant);
  }

  /**
   * 续订订阅
   */
  async renewSubscription(
    id: string,
    plan: PlanType,
    endDate: Date,
  ): Promise<Tenant> {
    const tenant = await this.findOne(id);

    tenant.subscription.plan = plan;
    tenant.subscription.endDate = endDate;
    tenant.status = TenantStatus.ACTIVE;
    tenant.expiresAt = endDate;

    return await this.tenantRepository.save(tenant);
  }

  /**
   * 检查配额
   */
  async checkQuota(id: string, resource: 'stores' | 'users'): Promise<boolean> {
    const tenant = await this.findOne(id);

    if (tenant.status !== TenantStatus.ACTIVE) {
      return false;
    }

    // TODO: 查询实际使用数量
    const currentCount = 0;

    if (resource === 'stores') {
      return currentCount < tenant.quota.maxStores;
    } else {
      return currentCount < tenant.quota.maxUsers;
    }
  }
}
