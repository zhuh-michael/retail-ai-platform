# API 使用示例

## 认证流程

### 1. 登录

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "tenantCode": "retail-cn",
    "username": "admin",
    "password": "SecureP@ss123"
  }'
```

**响应**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 7200,
  "user": {
    "id": "uuid",
    "username": "admin",
    "displayName": "管理员",
    "roles": ["admin"]
  },
  "tenant": {
    "id": "uuid",
    "name": "XX 零售企业",
    "branding": {...}
  }
}
```

### 2. 使用 Access Token

```bash
curl -X GET http://localhost:3000/api/v1/tenants/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. 刷新 Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

## 租户管理

### 创建租户

```bash
curl -X POST http://localhost:3000/api/v1/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "XX 零售企业",
    "code": "retail-cn",
    "contactInfo": {
      "companyName": "XX 零售企业",
      "address": "北京市朝阳区 XX 路 XX 号",
      "phone": "13800138000",
      "email": "contact@retail.com",
      "legalPerson": "张三"
    },
    "subscription": {
      "plan": "STANDARD",
      "startDate": "2026-01-01",
      "endDate": "2027-12-31"
    },
    "branding": {
      "primaryColor": "#1890ff"
    }
  }'
```

### 获取租户详情

```bash
curl -X GET http://localhost:3000/api/v1/tenants/{tenantId} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 停用租户

```bash
curl -X POST http://localhost:3000/api/v1/tenants/{tenantId}/suspend \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "reason": "欠费停用"
  }'
```

---

## 智能补货

### 生成补货计划

```bash
curl -X POST http://localhost:3000/api/v1/replenishments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "storeId": "store-001",
    "tenantId": "tenant-001",
    "period": "7d",
    "items": [
      {
        "skuId": "sku-001",
        "productName": "真丝衬衫",
        "currentStock": 5,
        "historicalSales": [5, 6, 7, 5, 8, 6, 7],
        "leadTimeDays": 3
      }
    ],
    "externalFactors": [
      {
        "type": "PROMOTION",
        "name": "周末大促",
        "impact": 0.3,
        "date": "2026-03-01"
      }
    ]
  }'
```

**响应**:
```json
{
  "id": "plan-uuid",
  "storeId": "store-001",
  "status": "DRAFT",
  "generatedAt": "2026-02-25T10:00:00Z",
  "items": [
    {
      "id": "item-uuid",
      "skuId": "sku-001",
      "productName": "真丝衬衫",
      "currentStock": 5,
      "suggestedQuantity": 20,
      "forecastData": {
        "period": "7d",
        "predictedSales": 18,
        "confidence": 0.85
      },
      "reasoning": "建议补货 20 件，因为预测 7 天销量 18 件，安全库存 5 件"
    }
  ]
}
```

### 调整补货量

```bash
curl -X PUT http://localhost:3000/api/v1/replenishments/{planId}/items/{itemId}/adjust \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "quantity": 25,
    "reason": "下周有社区活动"
  }'
```

### 确认补货计划

```bash
curl -X POST http://localhost:3000/api/v1/replenishments/{planId}/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "userId": "user-uuid"
  }'
```

### 获取补货计划列表

```bash
curl -X GET "http://localhost:3000/api/v1/replenishments?storeId=store-001&status=PENDING" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 错误处理

### 常见错误码

| 状态码 | 说明 | 示例 |
|--------|------|------|
| 400 | 请求参数错误 | 密码强度不足 |
| 401 | 未授权 | Token 无效或过期 |
| 403 | 禁止访问 | 权限不足 |
| 404 | 资源不存在 | 租户不存在 |
| 409 | 冲突 | 租户编码已存在 |
| 500 | 服务器错误 | 数据库连接失败 |

### 错误响应格式

```json
{
  "statusCode": 400,
  "message": "密码至少 8 个字符",
  "error": "Bad Request"
}
```

---

## SDK 示例（JavaScript）

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/v1';

class RetailAIClient {
  constructor(tenantCode) {
    this.tenantCode = tenantCode;
    this.accessToken = null;
  }

  async login(username, password) {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      tenantCode: this.tenantCode,
      username,
      password,
    });
    
    this.accessToken = response.data.accessToken;
    return response.data;
  }

  async request(config) {
    return axios({
      ...config,
      baseURL: API_BASE,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
  }

  async getTenants() {
    const response = await this.request({
      method: 'GET',
      url: '/tenants',
    });
    return response.data;
  }

  async generateReplenishment(storeId, items) {
    const response = await this.request({
      method: 'POST',
      url: '/replenishments',
      data: {
        storeId,
        tenantId: this.tenantCode,
        period: '7d',
        items,
      },
    });
    return response.data;
  }
}

// 使用示例
async function main() {
  const client = new RetailAIClient('retail-cn');
  
  // 登录
  await client.login('admin', 'SecureP@ss123');
  
  // 获取租户列表
  const tenants = await client.getTenants();
  console.log('Tenants:', tenants);
  
  // 生成补货计划
  const plan = await client.generateReplenishment('store-001', [
    {
      skuId: 'sku-001',
      productName: '真丝衬衫',
      currentStock: 5,
      historicalSales: [5, 6, 7, 5, 8, 6, 7],
      leadTimeDays: 3,
    },
  ]);
  console.log('Replenishment Plan:', plan);
}

main().catch(console.error);
```

---

## Postman 集合

导入以下 JSON 到 Postman 快速测试 API：

```json
{
  "info": {
    "name": "RetailAI Copilot API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"tenantCode\": \"retail-cn\",\n  \"username\": \"admin\",\n  \"password\": \"SecureP@ss123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "login"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    }
  ]
}
```
