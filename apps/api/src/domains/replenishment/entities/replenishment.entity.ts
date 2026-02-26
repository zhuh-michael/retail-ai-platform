import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';

export enum PlanStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SUBMITTED = 'SUBMITTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ItemStatus {
  PENDING = 'PENDING',
  ADJUSTED = 'ADJUSTED',
  CONFIRMED = 'CONFIRMED',
}

@Entity('replenishment_plans')
@Index(['storeId', 'status'])
export class ReplenishmentPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_id', type: 'uuid' })
  @Index()
  storeId: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({
    type: 'enum',
    enum: PlanStatus,
    default: PlanStatus.DRAFT,
  })
  status: PlanStatus;

  @Column({ name: 'generated_at', type: 'timestamp' })
  generatedAt: Date;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt: Date;

  @Column({ name: 'confirmed_by', type: 'uuid', nullable: true })
  confirmedBy: string;

  @Column({ name: 'forecast_model', type: 'varchar', length: 50 })
  forecastModel: string;

  @Column({ name: 'external_factors', type: 'jsonb', nullable: true })
  externalFactors: Array<{
    type: string;
    name: string;
    impact: number;
    date: Date;
  }>;

  @OneToMany(() => ReplenishmentItem, (item) => item.plan, { cascade: true })
  items: ReplenishmentItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 状态流转验证
  canTransitionTo(newStatus: PlanStatus): boolean {
    const transitions: Record<PlanStatus, PlanStatus[]> = {
      [PlanStatus.DRAFT]: [PlanStatus.PENDING, PlanStatus.CANCELLED],
      [PlanStatus.PENDING]: [PlanStatus.CONFIRMED, PlanStatus.CANCELLED],
      [PlanStatus.CONFIRMED]: [PlanStatus.SUBMITTED],
      [PlanStatus.SUBMITTED]: [PlanStatus.COMPLETED],
      [PlanStatus.COMPLETED]: [],
      [PlanStatus.CANCELLED]: [],
    };

    return transitions[this.status].includes(newStatus);
  }

  // 确认计划
  confirm(userId: string): void {
    if (!this.canTransitionTo(PlanStatus.CONFIRMED)) {
      throw new Error('当前状态不可确认');
    }

    this.status = PlanStatus.CONFIRMED;
    this.confirmedAt = new Date();
    this.confirmedBy = userId;
  }

  // 提交计划
  submit(): void {
    if (!this.canTransitionTo(PlanStatus.SUBMITTED)) {
      throw new Error('当前状态不可提交');
    }

    this.status = PlanStatus.SUBMITTED;
  }

  // 取消计划
  cancel(): void {
    if (!this.canTransitionTo(PlanStatus.CANCELLED)) {
      throw new Error('当前状态不可取消');
    }

    this.status = PlanStatus.CANCELLED;
  }
}

@Entity('replenishment_items')
@Index(['planId'])
@Index(['skuId'])
export class ReplenishmentItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @ManyToOne(() => ReplenishmentPlan, (plan) => plan.items)
  @JoinColumn({ name: 'plan_id' })
  plan: ReplenishmentPlan;

  @Column({ name: 'sku_id', type: 'varchar', length: 50 })
  skuId: string;

  @Column({ name: 'product_name', type: 'varchar', length: 200 })
  productName: string;

  @Column({ name: 'current_stock', type: 'int' })
  currentStock: number;

  @Column({ name: 'suggested_quantity', type: 'int' })
  suggestedQuantity: number;

  @Column({ name: 'adjusted_quantity', type: 'int', nullable: true })
  adjustedQuantity: number | null;

  @Column({ name: 'forecast_data', type: 'jsonb' })
  forecastData: {
    period: string;
    predictedSales: number;
    confidence: number;
    model: string;
    factors: string[];
  };

  @Column({ name: 'reasoning', type: 'text' })
  reasoning: string;

  @Column({ name: 'adjustment_reason', type: 'text', nullable: true })
  adjustmentReason: string | null;

  @Column({
    type: 'enum',
    enum: ItemStatus,
    default: ItemStatus.PENDING,
  })
  status: ItemStatus;

  // 调整数量
  adjustQuantity(newQuantity: number, reason: string): void {
    if (this.plan.status !== PlanStatus.DRAFT && this.plan.status !== PlanStatus.PENDING) {
      throw new Error('计划已确认，不可调整');
    }

    const adjustmentRate = Math.abs(newQuantity - this.suggestedQuantity) / this.suggestedQuantity;

    if (adjustmentRate > 0.5 && !reason) {
      throw new Error('调整幅度超过±50% 必须记录原因');
    }

    this.adjustedQuantity = newQuantity;
    this.adjustmentReason = reason;
    this.status = ItemStatus.ADJUSTED;
  }

  // 获取最终数量
  getFinalQuantity(): number {
    return this.adjustedQuantity ?? this.suggestedQuantity;
  }

  // 确认项目
  confirm(): void {
    this.status = ItemStatus.CONFIRMED;
  }
}
