# Tenant 领域 - 领域规格

**Domain**: tenant  
**创建日期**: 2026-02-25  
**状态**: self-checked

---

## 领域职责

负责零售企业租户的全生命周期管理，包括租户创建、配置、配额管理、状态变更等。确保多租户数据隔离和品牌定制能力。

---

## 领域模型

### 聚合根

#### Tenant（租户）

```
Tenant
├── id: TenantId (UUID)
├── name: string (企业名称)
├── code: string (租户编码，唯一)
├── status: TenantStatus (枚举)
├── contactInfo: ContactInfo (值对象)
├── subscription: Subscription (值对象)
├── branding: Branding (值对象)
├── quota: Quota (值对象)
├── createdAt: DateTime
├── updatedAt: DateTime
└── expiresAt: DateTime
```

**不变量**:
1. 租户编码在全局唯一
2. 过期租户不可创建新用户
3. 停用租户数据必须保留至少 2 年

### 值对象

#### TenantId
```
TenantId
└── value: UUID
```

#### ContactInfo
```
ContactInfo
├── companyName: string
├── address: string
├── phone: string
├── email: string
└── legalPerson: string
```

#### Subscription
```
Subscription
├── plan: PlanType (BASIC | STANDARD | ENTERPRISE)
├── startDate: Date
├── endDate: Date
└── autoRenew: boolean
```

#### Branding
```
Branding
├── logoUrl: string
├── primaryColor: string
├── secondaryColor: string
└── customDomain: string (可选)
```

#### Quota
```
Quota
├── maxStores: number (最大门店数)
├── maxUsers: number (最大用户数)
├── maxApiCallsPerDay: number (日 API 调用量)
├── maxStorageGB: number (存储空间 GB)
└── features: string[] (功能特性列表)
```

### 领域服务

#### TenantLifecycleService
- `createTenant(input: CreateTenantInput): Tenant`
- `activateTenant(tenantId: TenantId): void`
- `suspendTenant(tenantId: TenantId, reason: string): void`
- `renewSubscription(tenantId: TenantId, plan: PlanType): void`

#### QuotaService
- `checkQuota(tenantId: TenantId, resource: ResourceType): boolean`
- `consumeQuota(tenantId: TenantId, resource: ResourceType, amount: number): void`
- `getQuotaUsage(tenantId: TenantId): QuotaUsage`

---

## API 契约

### POST /api/v1/tenants

**描述**: 创建新租户

**请求**:
```json
{
  "name": "string (必需，2-100 字符)",
  "code": "string (必需，唯一)",
  "contactInfo": {
    "companyName": "string",
    "address": "string",
    "phone": "string",
    "email": "string",
    "legalPerson": "string"
  },
  "subscription": {
    "plan": "BASIC | STANDARD | ENTERPRISE",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD"
  },
  "branding": {
    "logoUrl": "string",
    "primaryColor": "string"
  }
}
```

**响应 (201)**:
```json
{
  "id": "uuid",
  "name": "string",
  "code": "string",
  "status": "ACTIVE",
  "createdAt": "2026-02-25T10:00:00Z"
}
```

**错误响应**:
| 状态码 | 错误 | 说明 |
|--------|------|------|
| 400 | BadRequest | 参数验证失败 |
| 409 | Conflict | 租户编码已存在 |

---

### GET /api/v1/tenants/{tenantId}

**描述**: 获取租户详情

**响应 (200)**:
```json
{
  "id": "uuid",
  "name": "string",
  "code": "string",
  "status": "ACTIVE",
  "contactInfo": {...},
  "subscription": {...},
  "branding": {...},
  "quota": {...},
  "quotaUsage": {
    "stores": {"used": 10, "total": 50},
    "users": {"used": 45, "total": 100},
    "apiCalls": {"used": 5000, "total": 100000}
  }
}
```

---

### PUT /api/v1/tenants/{tenantId}/quota

**描述**: 调整租户配额

**请求**:
```json
{
  "maxStores": 100,
  "maxUsers": 200,
  "maxApiCallsPerDay": 500000
}
```

**响应 (200)**: 更新后的配额信息

---

## 数据模型

### 表：tenants

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 租户 ID |
| name | VARCHAR(100) | NOT NULL | 企业名称 |
| code | VARCHAR(50) | UNIQUE NOT NULL | 租户编码 |
| status | VARCHAR(20) | NOT NULL DEFAULT 'ACTIVE' | 状态 |
| contact_info | JSONB | NOT NULL | 联系信息 |
| subscription | JSONB | NOT NULL | 订阅信息 |
| branding | JSONB | NOT NULL | 品牌配置 |
| quota | JSONB | NOT NULL | 配额配置 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |
| expires_at | TIMESTAMP | NULL | 过期时间 |

**索引**:
- `idx_tenants_code` ON tenants(code)
- `idx_tenants_status` ON tenants(status)
- `idx_tenants_expires_at` ON tenants(expires_at)

---

## 单元测试规格

### Tenant 实体测试

- [ ] 创建有效租户
- [ ] 拒绝重复的租户编码
- [ ] 停用租户不可创建新用户
- [ ] 过期租户自动标记为 EXPIRED
- [ ] 配额检查逻辑正确

### QuotaService 测试

- [ ] 配额充足时返回 true
- [ ] 配额不足时返回 false
- [ ] 配额消耗正确记录
- [ ] 配额使用统计准确

---

## 事件

### 领域事件

| 事件名称 | 触发时机 | 负载 |
|---------|---------|------|
| TenantCreated | 租户创建成功 | {tenantId, code, name} |
| TenantActivated | 租户激活 | {tenantId, activatedAt} |
| TenantSuspended | 租户停用 | {tenantId, reason, suspendedAt} |
| QuotaExceeded | 配额超出 | {tenantId, resource, current, limit} |
| SubscriptionExpiring | 订阅即将过期 | {tenantId, expiresAt, daysLeft} |

---

## 依赖关系

| 依赖 Domain | 关系类型 | 说明 |
|------------|---------|------|
| auth | 消费者 | 租户创建后触发管理员账号创建 |
| organization | 提供者 | 租户包含组织架构 |

---

*文档状态：AI 自检通过*
