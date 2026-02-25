# RetailAI Copilot

> 零售企业"业务 + 人+AI"人机协作一体化转型平台

---

## 项目结构

```
retail-ai-platform/
├── apps/
│   ├── api/               # 后端 API (NestJS)
│   ├── admin/             # 总部决策端 + 配置中心 (React)
│   └── store/             # 门店执行端 (小程序/Taro)
├── packages/              # 共享包
├── infra/
│   ├── docker/            # Docker 配置
│   ├── k8s/               # K8s 部署配置
│   └── database/          # 数据库迁移
├── docs/                  # 文档
└── specs/                 # SDD 规格文档
```

---

## 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose（可选）

### 方式一：Docker Compose（推荐）

```bash
# 1. 启动所有服务
docker-compose up -d

# 2. 查看日志
docker-compose logs -f api

# 访问 http://localhost:3000/api/docs
```

### 方式二：本地开发

```bash
# 1. 启动数据库
docker-compose up -d postgres redis

# 2. 初始化数据库
psql -h localhost -U postgres -d retail_ai -f infra/database/migrations/001_initial_schema.sql

# 3. 启动后端
cd apps/api
cp .env.example .env
npm install
npm run dev

# 访问 http://localhost:3000/api/docs
```

### 运行测试

```bash
cd apps/api
npm test
npm run test:cov  # 带覆盖率
```

### 4. 启动前端（待实现）

```bash
cd apps/admin
npm install
npm run dev
```

---

## 技术栈

| 层次 | 技术 |
|------|------|
| 后端 | NestJS + TypeORM + PostgreSQL |
| 前端 | React + Ant Design Pro |
| 小程序 | Taro (微信小程序) |
| AI | Python (FastAPI) + Prophet + Qwen |
| 缓存 | Redis |
| 部署 | Docker + K8s |

---

## 核心功能

### 基础平台
- ✅ 多租户管理
- ✅ 用户认证与授权
- ⏳ 组织架构管理
- ⏳ 数据连接器

### 智能补货
- ✅ 销量预测
- ✅ 补货建议生成
- ✅ 人工微调
- ⏳ 确认下单

### 其他功能（待开发）
- ⏳ 客户画像
- ⏳ AI 搭配推荐
- ⏳ 智能排班
- ⏳ 营销内容工厂

---

## 开发进度

| 阶段 | 状态 | 完成度 |
|------|------|--------|
| 需求定义 | ✅ 完成 | 100% |
| UI 设计 | ✅ 完成 | 100% |
| 架构设计 | ✅ 完成 | 100% |
| 领域设计 | ✅ 完成 | 100% |
| 任务规划 | ✅ 完成 | 100% |
| Sprint 1 实现 | 🚧 进行中 | 40% |

---

## 文档

- [产品愿景](./specs/product/product-vision.md)
- [API 文档](http://localhost:3000/api/docs)
- [SDD 规格](./specs/)

---

## License

Proprietary
