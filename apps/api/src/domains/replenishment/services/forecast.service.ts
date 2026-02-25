import { Injectable } from '@nestjs/common';

interface ForecastData {
  period: string;
  predictedSales: number;
  confidence: number;
  model: string;
  factors: string[];
}

/**
 * 销量预测服务（简化版 MVP）
 * 
 * 使用移动平均算法进行预测
 * 后续会升级为 Prophet/LSTM 模型
 */
@Injectable()
export class ForecastService {
  /**
   * 预测销量
   * 
   * @param skuId SKU ID
   * @param storeId 门店 ID
   * @param days 预测天数
   * @param historicalSales 历史销售数据（日均销量）
   */
  predict(
    skuId: string,
    storeId: string,
    days: number,
    historicalSales: number[],
  ): ForecastData {
    if (historicalSales.length === 0) {
      // 无历史数据，返回 0
      return {
        period: `${days}d`,
        predictedSales: 0,
        confidence: 0,
        model: 'none',
        factors: ['无历史数据'],
      };
    }

    // 简单移动平均（MVP 版本）
    const averageSales =
      historicalSales.reduce((sum, val) => sum + val, 0) / historicalSales.length;

    const predictedSales = Math.round(averageSales * days);

    // 置信度计算（基于数据量）
    const confidence = Math.min(0.95, 0.5 + historicalSales.length * 0.05);

    return {
      period: `${days}d`,
      predictedSales,
      confidence: Math.round(confidence * 100) / 100,
      model: 'simple_moving_average',
      factors: [`基于${historicalSales.length}天历史数据`],
    };
  }

  /**
   * 计算安全库存
   * 
   * 安全库存 = 日均销量 × 备货周期 × 安全系数 (1.5)
   */
  calculateSafetyStock(
    averageDailySales: number,
    leadTimeDays: number,
    safetyFactor: number = 1.5,
  ): number {
    return Math.round(averageDailySales * leadTimeDays * safetyFactor);
  }

  /**
   * 计算建议补货量
   * 
   * 建议补货量 = max(0, 预测销量 + 安全库存 - 当前库存 - 在途库存)
   */
  calculateReplenishmentQuantity(
    forecastedSales: number,
    safetyStock: number,
    currentStock: number,
    inTransitStock: number = 0,
  ): number {
    const quantity = forecastedSales + safetyStock - currentStock - inTransitStock;
    return Math.max(0, quantity);
  }

  /**
   * 生成补货理由
   */
  generateReasoning(
    forecastedSales: number,
    safetyStock: number,
    currentStock: number,
    externalFactors: string[] = [],
  ): string {
    const reasons: string[] = [];

    reasons.push(`预测销量${forecastedSales}件`);
    reasons.push(`安全库存${safetyStock}件`);
    reasons.push(`当前库存${currentStock}件`);

    if (externalFactors.length > 0) {
      reasons.push(...externalFactors);
    }

    return `建议补货，因为${reasons.join('，')}`;
  }
}
