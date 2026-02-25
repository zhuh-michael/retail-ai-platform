import { Test, TestingModule } from '@nestjs/testing';
import { ReplenishmentService } from './replenishment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReplenishmentPlan, ReplenishmentItem, PlanStatus, ItemStatus } from './entities/replenishment.entity';
import { ForecastService } from './services/forecast.service';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';

describe('ReplenishmentService', () => {
  let service: ReplenishmentService;
  let planRepository: any;
  let itemRepository: any;
  let forecastService: any;

  beforeEach(async () => {
    planRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    itemRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    forecastService = {
      predict: jest.fn(),
      calculateSafetyStock: jest.fn(),
      calculateReplenishmentQuantity: jest.fn(),
      generateReasoning: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReplenishmentService,
        {
          provide: getRepositoryToken(ReplenishmentPlan),
          useValue: planRepository,
        },
        {
          provide: getRepositoryToken(ReplenishmentItem),
          useValue: itemRepository,
        },
        {
          provide: ForecastService,
          useValue: forecastService,
        },
      ],
    }).compile();

    service = module.get<ReplenishmentService>(ReplenishmentService);
  });

  it('应该定义', () => {
    expect(service).toBeDefined();
  });

  describe('generatePlan', () => {
    it('应该成功生成补货计划', async () => {
      const input = {
        storeId: 'store-001',
        tenantId: 'tenant-001',
        period: '7d',
        items: [
          {
            skuId: 'sku-001',
            productName: 'Test Product',
            currentStock: 10,
            historicalSales: [5, 6, 7, 5, 8, 6, 7],
            leadTimeDays: 3,
          },
        ],
      };

      forecastService.predict.mockReturnValue({
        period: '7d',
        predictedSales: 44,
        confidence: 0.85,
        model: 'simple_moving_average',
        factors: ['基于 7 天历史数据'],
      });

      forecastService.calculateSafetyStock.mockReturnValue(10);
      forecastService.calculateReplenishmentQuantity.mockReturnValue(44);
      forecastService.generateReasoning.mockReturnValue('建议补货，因为预测销量 44 件');

      planRepository.create.mockReturnValue({
        id: 'plan-001',
        ...input,
        status: PlanStatus.DRAFT,
        items: [],
      });

      itemRepository.create.mockReturnValue({
        id: 'item-001',
        ...input.items[0],
        suggestedQuantity: 44,
        forecastData: { period: '7d', predictedSales: 44 },
        reasoning: '建议补货，因为预测销量 44 件',
        status: ItemStatus.PENDING,
      });

      planRepository.save.mockResolvedValue({ id: 'plan-001', items: ['item-001'] });

      const result = await service.generatePlan(input);

      expect(result).toHaveProperty('id');
      expect(planRepository.create).toHaveBeenCalled();
      expect(itemRepository.create).toHaveBeenCalled();
    });

    it('应该拒绝空商品列表', async () => {
      const input = {
        storeId: 'store-001',
        tenantId: 'tenant-001',
        period: '7d',
        items: [],
      };

      await expect(service.generatePlan(input)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('应该返回补货计划', async () => {
      planRepository.findOne.mockResolvedValue({
        id: 'plan-001',
        storeId: 'store-001',
        status: PlanStatus.DRAFT,
        items: [],
      });

      const result = await service.findOne('plan-001');

      expect(result).toHaveProperty('id', 'plan-001');
    });

    it('应该抛出 404 当计划不存在', async () => {
      planRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('adjustQuantity', () => {
    it('应该成功调整补货量', async () => {
      const item = {
        id: 'item-001',
        planId: 'plan-001',
        suggestedQuantity: 20,
        status: ItemStatus.PENDING,
        adjustQuantity: jest.fn(),
      };

      itemRepository.findOne.mockResolvedValue(item);
      itemRepository.save.mockResolvedValue(item);

      const result = await service.adjustQuantity('item-001', 25, '下周有活动');

      expect(result).toHaveProperty('id', 'item-001');
    });

    it('应该拒绝负数补货量', async () => {
      const item = {
        id: 'item-001',
        planId: 'plan-001',
        suggestedQuantity: 20,
        status: ItemStatus.PENDING,
      };

      itemRepository.findOne.mockResolvedValue(item);

      await expect(service.adjustQuantity('item-001', -5, 'reason')).rejects.toThrow(BadRequestException);
    });
  });

  describe('confirmPlan', () => {
    it('应该成功确认计划', async () => {
      const plan = {
        id: 'plan-001',
        status: PlanStatus.DRAFT,
        items: [{ confirm: jest.fn() }],
        confirm: jest.fn(),
      };

      planRepository.findOne.mockResolvedValue(plan);
      itemRepository.save.mockResolvedValue(plan.items);
      planRepository.save.mockResolvedValue(plan);

      const result = await service.confirmPlan('plan-001', 'user-001');

      expect(result).toHaveProperty('id', 'plan-001');
      expect(plan.confirm).toHaveBeenCalledWith('user-001');
    });

    it('应该拒绝确认已确认的计划', async () => {
      const plan = {
        id: 'plan-001',
        status: PlanStatus.CONFIRMED,
        items: [],
      };

      planRepository.findOne.mockResolvedValue(plan);

      await expect(service.confirmPlan('plan-001', 'user-001')).rejects.toThrow(ConflictException);
    });
  });
});
