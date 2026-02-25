# Replenishment 领域 - 领域规格

**Domain**: replenishment  
**创建日期**: 2026-02-25  
**状态**: self-checked

---

## 领域职责

负责智能补货建议的生成、调整、确认和追踪。基于销量预测、库存状态、业务规则生成补货建议，支持人工微调和反馈闭环。

---

## 领域模型

### 聚合根

#### ReplenishmentPlan（补货计划）

```
ReplenishmentPlan
├── id: PlanId (UUID)
├── storeId: StoreId
├── tenantId: TenantId
├── status: PlanStatus (枚举)
├── generatedAt: DateTime
├── confirmedAt: DateTime (可选)
├── confirmedBy: UserId (可选)
├── items: ReplenishmentItem[] (子实体)
├── forecastModel: ForecastModelRef
├── externalFactors: ExternalFactor[] (值对象)
└── feedback: Feedback (可选，值对象)
```

**不变量**:
1. 补货计划必须至少包含一个商品
2. 确认后的计划不可修改（只能撤销）
3. 计划状态流转：DRAFT → PENDING → CONFIRMED → SUBMITTED → COMPLETED

#### ReplenishmentItem（补货明细）

```
ReplenishmentItem
├── id: ItemId (UUID)
├── planId: PlanId
├── skuId: SkuId
├── productName: string
├── currentStock: number
├── suggestedQuantity: number (AI 建议)
├── adjustedQuantity: number (人工调整后)
├── forecastedSales: ForecastData (值对象)
├── reasoning: string (AI 理由)
├── adjustmentReason: string (可选，人工调整原因)
└── status: ItemStatus
```

**不变量**:
1. 建议补货量 >= 0
2. 调整幅度超过±50% 必须记录原因
3. 必须关联有效的 SKU

### 值对象

#### PlanId
```
PlanId
└── value: UUID
```

#### ForecastData
```
ForecastData
├── period: string (如 "7d", "14d", "30d")
├── predictedSales: number
├── confidence: number (0-1)
├── model: string (模型名称)
└── factors: string[] (影响因素)
```

#### ExternalFactor
```
ExternalFactor
├── type: FactorType (HOLIDAY | WEATHER | EVENT | PROMOTION)
├── name: string
├── impact: number (-1 到 1)
└── date: Date
```

#### Feedback
```
Feedback
├── adoptionRate: number (采纳率)
├── adjustmentRate: number (调整率)
├── accuracy: number (预测准确率)
├── userComments: string[] (用户评价)
└── submittedAt: DateTime
```

### 领域服务

#### ReplenishmentService
- `generatePlan(storeId: StoreId, period: string): ReplenishmentPlan`
- `adjustQuantity(itemId: ItemId, newQuantity: number, reason: string): void`
- `confirmPlan(planId: PlanId, userId: UserId): void`
- `submitToSupplier(planId: PlanId): void`
- `cancelPlan(planId: PlanId): void`

#### ForecastService
- `predictSales(skuId: SkuId, storeId: StoreId, days: number): ForecastData`
- `getForecastFactors(skuId: SkuId, storeId: StoreId): ExternalFactor[]`
- `retrainModel(storeId: StoreId): void`

#### InventoryService
- `getCurrentStock(storeId: StoreId, skuId: SkuId): number`
- `getSafetyStock(skuId: SkuId): number`
- `getLeadTime(skuId: SkuId): number`

---

## API 契约

### GET /api/v1/stores/{storeId}/replenishments

**描述**: 获取门店补货计划列表

**请求参数**:
- `status`: 可选，筛选状态
- `page`: 页码
- `size`: 每页大小

**响应 (200)**:
```json
{
  "items": [
    {
      "id": "uuid",
      "storeId": "uuid",
      "status": "PENDING",
      "generatedAt": "2026-02-25T08:00:00Z",
      "itemCount": 25,
      "totalSuggestedQuantity": 500
    }
  ],
  "total": 10,
  "page": 1,
  "size": 20
}
```

---

### GET /api/v1/replenishments/{planId}

**描述**: 获取补货计划详情

**响应 (200)**:
```json
{
  "id": "uuid",
  "storeId": "uuid",
  "storeName": "XX 店",
  "status": "PENDING",
  "generatedAt": "2026-02-25T08:00:00Z",
  "items": [
    {
      "id": "uuid",
      "skuId": "sku-001",
      "productName": "真丝衬衫",
      "currentStock": 5,
      "suggestedQuantity": 20,
      "adjustedQuantity": null,
      "forecastedSales": {
        "period": "7d",
        "predictedSales": 18,
        "confidence": 0.85
      },
      "reasoning": "建议补货 20 件，因为预测 7 天销量 18 件，安全库存 5 件"
    }
  ],
  "externalFactors": [
    {"type": "WEATHER", "name": "周末降雨", "impact": 0.2}
  ]
}
```

---

### PUT /api/v1/replenishments/{planId}/items/{itemId}/adjust

**描述**: 调整补货量

**请求**:
```json
{
  "quantity": 25,
  "reason": "下周有社区活动"
}
```

**响应 (200)**:
```json
{
  "itemId": "uuid",
  "originalQuantity": 20,
  "adjustedQuantity": 25,
  "adjustmentRate": 0.25,
  "reason": "下周有社区活动"
}
```

**错误响应**:
| 状态码 | 错误 | 说明 |
|--------|------|------|
| 400 | BadRequest | 调整量无效 |
| 409 | Conflict | 计划已确认，不可调整 |

---

### POST /api/v1/replenishments/{planId}/confirm

**描述**: 确认补货计划

**请求**:
```json
{
  "items": [
    {"itemId": "uuid", "quantity": 20},
    {"itemId": "uuid", "quantity": 15}
  ]
}
```

**响应 (200)**:
```json
{
  "planId": "uuid",
  "status": "CONFIRMED",
  "confirmedAt": "2026-02-25T10:00:00Z",
  "confirmedBy": "user-id",
  "orderNo": "ORD-20260225-001"
}
```

---

## 数据模型

### 表：replenishment_plans

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 计划 ID |
| store_id | UUID | NOT NULL, FK | 门店 ID |
| tenant_id | UUID | NOT NULL, FK | 租户 ID |
| status | VARCHAR(20) | NOT NULL | 状态 |
| generated_at | TIMESTAMP | NOT NULL | 生成时间 |
| confirmed_at | TIMESTAMP | NULL | 确认时间 |
| confirmed_by | UUID | NULL, FK | 确认人 |
| forecast_model | VARCHAR(50) | NOT NULL | 预测模型 |
| external_factors | JSONB | NULL | 外部因素 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |

### 表：replenishment_items

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 明细 ID |
| plan_id | UUID | NOT NULL, FK | 计划 ID |
| sku_id | VARCHAR(50) | NOT NULL | SKU ID |
| product_name | VARCHAR(200) | NOT NULL | 商品名称 |
| current_stock | INTEGER | NOT NULL | 当前库存 |
| suggested_quantity | INTEGER | NOT NULL | 建议补货量 |
| adjusted_quantity | INTEGER | NULL | 调整后数量 |
| forecast_data | JSONB | NOT NULL | 预测数据 |
| reasoning | TEXT | NOT NULL | AI 理由 |
| adjustment_reason | TEXT | NULL | 调整原因 |
| status | VARCHAR(20) | NOT NULL | 状态 |

**索引**:
- `idx_items_plan` ON replenishment_items(plan_id)
- `idx_items_sku` ON replenishment_items(sku_id)
- `idx_plans_store_status` ON replenishment_plans(store_id, status)

---

## 单元测试规格

### ReplenishmentPlan 实体测试

- [ ] 创建有效补货计划
- [ ] 计划必须至少一个商品
- [ ] 状态流转验证
- [ ] 确认后不可修改

### ReplenishmentService 测试

- [ ] 生成补货计划
- [ ] 调整补货量
- [ ] 调整幅度超 50% 记录原因
- [ ] 确认计划
- [ ] 撤销计划

### ForecastService 测试

- [ ] 7 天预测准确率 > 80%
- [ ] 30 天预测准确率 > 70%
- [ ] 外部因素正确应用

---

## 事件

### 领域事件

| 事件名称 | 触发时机 | 负载 |
|---------|---------|------|
| ReplenishmentPlanGenerated | 补货计划生成 | {planId, storeId, itemCount} |
| ReplenishmentItemAdjusted | 补货量调整 | {itemId, planId, oldQty, newQty} |
| ReplenishmentPlanConfirmed | 计划确认 | {planId, userId, orderNo} |
| ReplenishmentPlanSubmitted | 提交供应商 | {planId, supplierId} |
| ReplenishmentPlanCompleted | 计划完成 | {planId, completedAt} |

---

## 业务规则

### 补货量计算规则

```
建议补货量 = max(0, 预测销量 + 安全库存 - 当前库存 - 在途库存)
```

### 安全库存规则

```
安全库存 = 日均销量 × 备货周期 × 安全系数 (1.5)
```

### 预测模型选择

| 商品类型 | 模型 | 说明 |
|---------|------|------|
| 畅销品 | LSTM | 深度学习，捕捉复杂模式 |
| 常规品 | Prophet | 时间序列，可解释性强 |
| 新品 | 相似品类比 | 无历史数据 |

---

## 依赖关系

| 依赖 Domain | 关系类型 | 说明 |
|------------|---------|------|
| forecasting | 消费者 | 调用预测服务 |
| inventory | 消费者 | 查询库存状态 |
| product | 消费者 | 查询商品信息 |
| order | 提供者 | 确认后生成采购订单 |

---

*文档状态：AI 自检通过*
