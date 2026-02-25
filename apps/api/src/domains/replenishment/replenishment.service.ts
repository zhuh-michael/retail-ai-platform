import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ReplenishmentPlan,
  ReplenishmentItem,
  PlanStatus,
  ItemStatus,
} from './entities/replenishment.entity';
import { ForecastService } from './services/forecast.service';

interface GeneratePlanInput {
  storeId: string;
  tenantId: string;
  period: string; // '7d', '14d', '30d'
  items: Array<{
    skuId: string;
    productName: string;
    currentStock: number;
    historicalSales: number[]; // 日均销量历史
    leadTimeDays: number;
  }>;
  externalFactors?: Array<{
    type: string;
    name: string;
    impact: number;
    date: Date;
  }>;
}

@Injectable()
export class ReplenishmentService {
  constructor(
    @InjectRepository(ReplenishmentPlan)
    private planRepository: Repository<ReplenishmentPlan>,
    @InjectRepository(ReplenishmentItem)
    private itemRepository: Repository<ReplenishmentItem>,
    private forecastService: ForecastService,
  ) {}

  /**
   * 生成补货计划
   */
  async generatePlan(input: GeneratePlanInput): Promise<ReplenishmentPlan> {
    if (input.items.length === 0) {
      throw new BadRequestException('补货计划必须至少包含一个商品');
    }

    // 解析预测天数
    const days = parseInt(input.period.replace('d', ''));

    // 创建计划
    const plan = this.planRepository.create({
      storeId: input.storeId,
      tenantId: input.tenantId,
      status: PlanStatus.DRAFT,
      generatedAt: new Date(),
      forecastModel: 'simple_moving_average',
      externalFactors: input.externalFactors || [],
      items: [],
    });

    // 生成每个商品的补货建议
    for (const itemInput of input.items) {
      // 预测销量
      const forecast = this.forecastService.predict(
        itemInput.skuId,
        input.storeId,
        days,
        itemInput.historicalSales,
      );

      // 计算安全库存
      const averageDailySales =
        itemInput.historicalSales.reduce((a, b) => a + b, 0) /
        itemInput.historicalSales.length;
      const safetyStock = this.forecastService.calculateSafetyStock(
        averageDailySales,
        itemInput.leadTimeDays,
      );

      // 计算建议补货量
      const suggestedQuantity = this.forecastService.calculateReplenishmentQuantity(
        forecast.predictedSales,
        safetyStock,
        itemInput.currentStock,
      );

      // 生成理由
      const reasoning = this.forecastService.generateReasoning(
        forecast.predictedSales,
        safetyStock,
        itemInput.currentStock,
        input.externalFactors?.map((f) => f.name) || [],
      );

      // 创建补货明细
      const item = this.itemRepository.create({
        skuId: itemInput.skuId,
        productName: itemInput.productName,
        currentStock: itemInput.currentStock,
        suggestedQuantity,
        forecastData: forecast,
        reasoning,
        status: ItemStatus.PENDING,
      });

      plan.items.push(item);
    }

    return await this.planRepository.save(plan);
  }

  /**
   * 获取补货计划详情
   */
  async findOne(id: string): Promise<ReplenishmentPlan> {
    const plan = await this.planRepository.findOne({
      where: { id },
      relations: ['items'],
      order: {
        items: {
          skuId: 'ASC',
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('补货计划不存在');
    }

    return plan;
  }

  /**
   * 获取门店补货计划列表
   */
  async findByStore(storeId: string, status?: PlanStatus): Promise<ReplenishmentPlan[]> {
    const where: any = { storeId };

    if (status) {
      where.status = status;
    }

    return await this.planRepository.find({
      where,
      relations: ['items'],
      order: { generatedAt: 'DESC' },
      take: 50,
    });
  }

  /**
   * 调整补货量
   */
  async adjustQuantity(
    itemId: string,
    newQuantity: number,
    reason: string,
  ): Promise<ReplenishmentItem> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['plan'],
    });

    if (!item) {
      throw new NotFoundException('补货明细不存在');
    }

    // 验证
    if (newQuantity < 0) {
      throw new BadRequestException('补货量不能为负数');
    }

    // 调整
    item.adjustQuantity(newQuantity, reason);

    return await this.itemRepository.save(item);
  }

  /**
   * 确认补货计划
   */
  async confirmPlan(planId: string, userId: string): Promise<ReplenishmentPlan> {
    const plan = await this.findOne(planId);

    if (plan.status !== PlanStatus.DRAFT && plan.status !== PlanStatus.PENDING) {
      throw new ConflictException('当前状态不可确认');
    }

    // 确认所有项目
    for (const item of plan.items) {
      item.confirm();
    }

    // 确认计划
    plan.confirm(userId);

    await this.itemRepository.save(plan.items);
    return await this.planRepository.save(plan);
  }

  /**
   * 取消补货计划
   */
  async cancelPlan(planId: string): Promise<ReplenishmentPlan> {
    const plan = await this.findOne(planId);

    plan.cancel();
    return await this.planRepository.save(plan);
  }
}
