import { Test, TestingModule } from '@nestjs/testing';
import { TenantService } from './tenant.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tenant, TenantStatus, PlanType } from './entities/tenant.entity';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('TenantService', () => {
  let service: TenantService;
  let repository: any;

  const mockTenant: Partial<Tenant> = {
    id: 'test-uuid',
    name: 'Test Tenant',
    code: 'test-tenant',
    status: TenantStatus.ACTIVE,
    contactInfo: {
      companyName: 'Test Corp',
      address: 'Test Address',
      phone: '123456789',
      email: 'test@example.com',
      legalPerson: 'Test Person',
    },
    subscription: {
      plan: PlanType.BASIC,
      startDate: new Date(),
      endDate: new Date('2027-01-01'),
      autoRenew: false,
    },
    quota: {
      maxStores: 50,
      maxUsers: 100,
      maxApiCallsPerDay: 100000,
      maxStorageGB: 100,
      features: [],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  it('应该定义', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('应该成功创建租户', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(mockTenant);
      repository.save.mockResolvedValue(mockTenant);

      const input = {
        name: 'Test Tenant',
        code: 'test-tenant',
        contactInfo: {
          companyName: 'Test Corp',
          address: 'Test Address',
          phone: '123456789',
          email: 'test@example.com',
          legalPerson: 'Test Person',
        },
        subscription: {
          plan: PlanType.BASIC,
          startDate: new Date(),
          endDate: new Date('2027-01-01'),
          autoRenew: false,
        },
      };

      const result = await service.create(input);

      expect(result).toEqual(mockTenant);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { code: 'test-tenant' },
      });
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('应该拒绝重复的租户编码', async () => {
      repository.findOne.mockResolvedValue(mockTenant);

      const input = {
        name: 'Test Tenant',
        code: 'test-tenant',
        contactInfo: {
          companyName: 'Test Corp',
          address: 'Test Address',
          phone: '123456789',
          email: 'test@example.com',
          legalPerson: 'Test Person',
        },
        subscription: {
          plan: PlanType.BASIC,
          startDate: new Date(),
          endDate: new Date('2027-01-01'),
          autoRenew: false,
        },
      };

      await expect(service.create(input)).rejects.toThrow(ConflictException);
    });

    it('应该拒绝过短的租户编码', async () => {
      const input = {
        name: 'Test Tenant',
        code: 't',
        contactInfo: {
          companyName: 'Test Corp',
          address: 'Test Address',
          phone: '123456789',
          email: 'test@example.com',
          legalPerson: 'Test Person',
        },
        subscription: {
          plan: PlanType.BASIC,
          startDate: new Date(),
          endDate: new Date('2027-01-01'),
          autoRenew: false,
        },
      };

      await expect(service.create(input)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('应该返回租户', async () => {
      repository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findOne('test-uuid');

      expect(result).toEqual(mockTenant);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-uuid' },
      });
    });

    it('应该抛出 404 当租户不存在', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkQuota', () => {
    it('应该返回 true 当配额充足', async () => {
      repository.findOne.mockResolvedValue(mockTenant);

      const result = await service.checkQuota('test-uuid', 'users');

      expect(result).toBe(true);
    });
  });
});
