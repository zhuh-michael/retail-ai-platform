import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product, MatchOccasion } from './entities/product.entity';
import { NotFoundException } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;
  let repository: any;

  const mockProduct: Partial<Product> = {
    id: 'product-001',
    tenantId: 'tenant-001',
    skuCode: 'SKU001',
    name: '真丝衬衫',
    category: '上衣',
    subCategory: '衬衫',
    styleTags: {
      styles: ['ELEGANT', 'BUSINESS'],
      colors: ['白色', '黑色'],
      patterns: ['纯色'],
      seasons: ['春', '秋'],
      occasions: [MatchOccasion.BUSINESS, MatchOccasion.DAILY],
    },
    price: 899,
    stockQuantity: 50,
    imageUrls: ['/images/shirt.jpg'],
    active: true,
  };

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('应该定义', () => {
    expect(service).toBeDefined();
  });

  describe('findBySkuCode', () => {
    it('应该成功找到商品', async () => {
      repository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findBySkuCode('tenant-001', 'SKU001');

      expect(result).toEqual(mockProduct);
    });

    it('应该拒绝不存在的商品', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.findBySkuCode('tenant-001', 'NON_EXISTENT')
      ).rejects.toThrow(NotFoundException);
    });

    it('应该拒绝停用的商品', async () => {
      const inactiveProduct = { ...mockProduct, active: false };
      repository.findOne.mockResolvedValue(inactiveProduct);

      await expect(
        service.findBySkuCode('tenant-001', 'SKU001')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateMatches', () => {
    it('应该生成搭配推荐', async () => {
      repository.findOne.mockResolvedValue(mockProduct);
      repository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { id: 'product-002', price: 699, category: '下装' },
          { id: 'product-003', price: 799, category: '鞋子' },
        ]),
      });

      const result = await service.generateMatches('tenant-001', 'product-001');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
