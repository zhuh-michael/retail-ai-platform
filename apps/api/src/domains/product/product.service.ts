import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, MatchOccasion } from './entities/product.entity';

export interface MatchRecommendation {
  id: string;
  score: number;
  reason: string;
  items: Product[];
  totalPrice: number;
  imageUrl?: string;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  /**
   * 通过 SKU 代码查找商品
   */
  async findBySkuCode(tenantId: string, skuCode: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { tenantId, skuCode, active: true },
    });

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    return product;
  }

  /**
   * 生成搭配推荐
   */
  async generateMatches(
    tenantId: string,
    baseProductId: string,
    stylePreferences?: string[],
    occasion?: string,
  ): Promise<MatchRecommendation[]> {
    // 获取基础商品
    const baseProduct = await this.findBySkuCode(tenantId, baseProductId);

    // 查找搭配商品
    const recommendations: MatchRecommendation[] = [];

    // 搭配方案 1: 同风格搭配
    const casualMatch = await this.findMatchingProducts(
      tenantId,
      baseProduct,
      baseProduct.styleTags.styles,
      '同风格日常搭配',
    );
    if (casualMatch) {
      recommendations.push(casualMatch);
    }

    // 搭配方案 2: 商务场合搭配
    if (occasion === MatchOccasion.BUSINESS || baseProduct.styleTags.occasions.includes(MatchOccasion.BUSINESS)) {
      const businessMatch = await this.findMatchingProducts(
        tenantId,
        baseProduct,
        [MatchOccasion.BUSINESS],
        '商务场合搭配',
      );
      if (businessMatch) {
        recommendations.push(businessMatch);
      }
    }

    // 搭配方案 3: 撞色搭配
    const colorMatch = await this.findMatchingProducts(
      tenantId,
      baseProduct,
      undefined,
      '时尚撞色搭配',
      true,
    );
    if (colorMatch) {
      recommendations.push(colorMatch);
    }

    return recommendations.slice(0, 3); // 最多返回 3 套搭配
  }

  /**
   * 查找搭配商品
   */
  private async findMatchingProducts(
    tenantId: string,
    baseProduct: Product,
    targetStyles?: string[],
    reason?: string,
    useContrastColor: boolean = false,
  ): Promise<MatchRecommendation | null> {
    // 根据品类确定需要搭配的品类
    let targetCategories: string[] = [];
    if (baseProduct.category === '上衣') {
      targetCategories = ['下装', '鞋子'];
    } else if (baseProduct.category === '下装') {
      targetCategories = ['上衣', '鞋子'];
    }

    // 查询搭配商品
    const query = this.productRepository
      .createQueryBuilder('product')
      .where('product.tenantId = :tenantId', { tenantId })
      .andWhere('product.category IN (:...categories)', { categories: targetCategories })
      .andWhere('product.active = true')
      .andWhere('product.stockQuantity > 0')
      .limit(3);

    if (targetStyles && targetStyles.length > 0) {
      query.andWhere('product.styleTags->>styles LIKE :styles', {
        styles: `%${targetStyles[0]}%`,
      });
    }

    const products = await query.getMany();

    if (products.length === 0) {
      return null;
    }

    // 计算总价
    const totalPrice = products.reduce((sum, p) => sum + Number(p.price), 0) + Number(baseProduct.price);

    return {
      id: `match-${Date.now()}`,
      score: 0.9,
      reason: reason || '基于风格和场合的智能搭配',
      items: [baseProduct, ...products],
      totalPrice,
    };
  }
}
