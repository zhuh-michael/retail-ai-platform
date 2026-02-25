# Sprint 1 - 任务规划

**Sprint**: 1  
**周期**: 2026-02-26 ~ 2026-03-08 (2 周)  
**目标**: 完成基础平台核心功能（F-000-P）+ 智能补货 MVP（F-001）

---

## Sprint 目标

### 必须完成（P0）
- ✅ 租户管理基础功能
- ✅ 用户认证与登录
- ✅ 智能补货建议生成（核心流程）

### 争取完成（P1）
- ⚡ 补货量调整功能
- ⚡ 简单的数据看板

---

## 任务列表

### 基础平台（F-000-P）

| Task ID | 任务名称 | 类别 | 估时 | 依赖 | DoD |
|---------|---------|------|------|------|-----|
| TASK-001 | 创建 Tenant 实体和值对象 | 后端 - 领域 | 2h | - | 代码 + 测试 |
| TASK-002 | 实现 TenantRepository | 后端 - 数据 | 2h | TASK-001 | 代码 + 测试 |
| TASK-003 | 创建租户管理 API | 后端-API | 3h | TASK-002 | 代码 + 测试 + API 文档 |
| TASK-004 | 创建 User 实体和认证逻辑 | 后端 - 领域 | 3h | TASK-001 | 代码 + 测试 |
| TASK-005 | 实现 JWT Token 生成与验证 | 后端 - 安全 | 2h | TASK-004 | 代码 + 测试 |
| TASK-006 | 登录/注册 API | 后端-API | 3h | TASK-005 | 代码 + 测试 + API 文档 |
| TASK-007 | 租户管理页面（Web） | 前端 - 配置端 | 4h | TASK-003 | 页面 + 联调 |
| TASK-008 | 登录页面（Web+ 移动端） | 前端 | 3h | TASK-006 | 页面 + 联调 |

### 智能补货（F-001）

| Task ID | 任务名称 | 类别 | 估时 | 依赖 | DoD |
|---------|---------|------|------|------|-----|
| TASK-009 | 创建 ReplenishmentPlan 实体 | 后端 - 领域 | 2h | - | 代码 + 测试 |
| TASK-010 | 实现销量预测服务（简化版） | 后端-AI | 4h | - | 代码 + 测试 |
| TASK-011 | 生成补货建议逻辑 | 后端 - 领域 | 3h | TASK-009,010 | 代码 + 测试 |
| TASK-012 | 补货建议 API | 后端-API | 2h | TASK-011 | 代码 + 测试 + API 文档 |
| TASK-013 | 补货量调整 API | 后端-API | 2h | TASK-012 | 代码 + 测试 |
| TASK-014 | 补货建议列表页（移动端） | 前端 - 小程序 | 4h | TASK-012 | 页面 + 联调 |
| TASK-015 | 补货详情页 + 调整（移动端） | 前端 - 小程序 | 4h | TASK-013 | 页面 + 联调 |

### 基础设施

| Task ID | 任务名称 | 类别 | 估时 | 依赖 | DoD |
|---------|---------|------|------|------|-----|
| TASK-016 | 数据库 Schema 设计与迁移 | 后端 - 数据 | 3h | - | 迁移脚本 + 验证 |
| TASK-017 | 项目脚手架搭建 | 后端 + 前端 | 2h | - | 可运行项目 |
| TASK-018 | CI/CD 配置 | DevOps | 2h | TASK-017 | 自动化构建 |

---

## 任务详情

### TASK-001: 创建 Tenant 实体和值对象

**描述**: 实现租户领域的核心实体和值对象

**DoD**:
- [ ] Tenant 实体类（含不变量验证）
- [ ] 值对象：TenantId, ContactInfo, Subscription, Branding, Quota
- [ ] 单元测试覆盖 > 90%
- [ ] 代码审查通过

**影响文件**:
- `src/domains/tenant/entities/tenant.ts`
- `src/domains/tenant/value-objects/*.ts`
- `tests/unit/domains/tenant.test.ts`

---

### TASK-002: 实现 TenantRepository

**描述**: 实现租户数据访问层

**DoD**:
- [ ] TenantRepository 接口
- [ ] PostgreSQL 实现（使用 TypeORM/Prisma）
- [ ] 集成测试通过
- [ ] 性能测试（CRUD 操作 < 50ms）

**影响文件**:
- `src/domains/tenant/repositories/tenant-repository.ts`
- `src/infrastructure/database/tenant-repository.impl.ts`

---

### TASK-003: 创建租户管理 API

**描述**: 实现租户管理的 RESTful API

**DoD**:
- [ ] POST /api/v1/tenants - 创建租户
- [ ] GET /api/v1/tenants/:id - 获取租户详情
- [ ] PUT /api/v1/tenants/:id - 更新租户
- [ ] API 文档（Swagger/OpenAPI）
- [ ] 集成测试通过

**影响文件**:
- `src/api/controllers/tenant.controller.ts`
- `src/api/routes/tenant.routes.ts`
- `docs/api/tenant.yaml`

---

### TASK-004: 创建 User 实体和认证逻辑

**描述**: 实现用户实体和密码管理

**DoD**:
- [ ] User 实体类
- [ ] PasswordService（bcrypt 哈希）
- [ ] 密码强度验证
- [ ] 单元测试通过

**影响文件**:
- `src/domains/auth/entities/user.ts`
- `src/domains/auth/services/password.service.ts`

---

### TASK-005: 实现 JWT Token 生成与验证

**描述**: 实现 JWT 认证机制

**DoD**:
- [ ] AccessToken 生成（2 小时）
- [ ] RefreshToken 生成（7 天）
- [ ] Token 验证中间件
- [ ] Token 刷新逻辑
- [ ] 单元测试通过

**影响文件**:
- `src/domains/auth/services/token.service.ts`
- `src/api/middleware/auth.middleware.ts`

---

### TASK-006: 登录/注册 API

**描述**: 实现用户认证 API

**DoD**:
- [ ] POST /api/v1/auth/login - 登录
- [ ] POST /api/v1/auth/register - 注册
- [ ] POST /api/v1/auth/refresh - 刷新 Token
- [ ] 错误处理（401/403/409）
- [ ] 集成测试通过

**影响文件**:
- `src/api/controllers/auth.controller.ts`
- `src/api/routes/auth.routes.ts`

---

### TASK-007: 租户管理页面（Web）

**描述**: 实现配置端的租户管理页面

**DoD**:
- [ ] 租户列表页（表格展示）
- [ ] 创建租户表单
- [ ] 租户详情页
- [ ] 配额管理功能
- [ ] 与后端联调通过

**影响文件**:
- `apps/admin/pages/tenants/index.tsx`
- `apps/admin/pages/tenants/create.tsx`
- `apps/admin/pages/tenants/[id].tsx`

---

### TASK-008: 登录页面（Web+ 移动端）

**描述**: 实现统一的登录页面

**DoD**:
- [ ] Web 端登录页
- [ ] 移动端登录页（小程序）
- [ ] 表单验证
- [ ] 错误提示
- [ ] 与后端联调通过

**影响文件**:
- `apps/admin/pages/login.tsx`
- `apps/store/pages/login/index.tsx`

---

### TASK-009: 创建 ReplenishmentPlan 实体

**描述**: 实现补货计划实体

**DoD**:
- [ ] ReplenishmentPlan 聚合根
- [ ] ReplenishmentItem 子实体
- [ ] 值对象：ForecastData, ExternalFactor, Feedback
- [ ] 状态流转验证
- [ ] 单元测试通过

**影响文件**:
- `src/domains/replenishment/entities/*.ts`

---

### TASK-010: 实现销量预测服务（简化版）

**描述**: 实现简化的销量预测功能（MVP 版本）

**DoD**:
- [ ] 基于历史销售的移动平均预测
- [ ] 支持 7 天/14 天/30 天预测
- [ ] 预测结果包含置信度
- [ ] 单元测试 + 准确率测试

**影响文件**:
- `src/domains/forecasting/services/forecast.service.ts`

---

### TASK-011: 生成补货建议逻辑

**描述**: 实现补货建议生成核心逻辑

**DoD**:
- [ ] 补货量计算公式
- [ ] 安全库存计算
- [ ] 理由说明生成
- [ ] 单元测试通过

**影响文件**:
- `src/domains/replenishment/services/replenishment.service.ts`

---

### TASK-012: 补货建议 API

**描述**: 实现补货建议相关 API

**DoD**:
- [ ] GET /api/v1/stores/:id/replenishments - 列表
- [ ] GET /api/v1/replenishments/:id - 详情
- [ ] 分页支持
- [ ] 集成测试通过

**影响文件**:
- `src/api/controllers/replenishment.controller.ts`

---

### TASK-013: 补货量调整 API

**描述**: 实现补货量调整 API

**DoD**:
- [ ] PUT /api/v1/replenishments/:id/items/:itemId/adjust
- [ ] 调整原因记录
- [ ] 幅度验证（±50% 二次确认）
- [ ] 集成测试通过

**影响文件**:
- `src/api/controllers/replenishment.controller.ts`

---

### TASK-014: 补货建议列表页（移动端）

**描述**: 实现小程序端的补货建议列表页

**DoD**:
- [ ] 列表展示（商品、建议量、理由）
- [ ] 下拉刷新
- [ ] 筛选功能
- [ ] 与后端联调通过

**影响文件**:
- `apps/store/pages/replenish/index.tsx`

---

### TASK-015: 补货详情页 + 调整（移动端）

**描述**: 实现补货详情和调整功能

**DoD**:
- [ ] 详情页展示
- [ ] 数量调整（数字输入 + 快捷按钮）
- [ ] 调整原因输入
- [ ] 确认下单
- [ ] 与后端联调通过

**影响文件**:
- `apps/store/pages/replenish/[id].tsx`

---

### TASK-016: 数据库 Schema 设计与迁移

**描述**: 设计数据库表结构并创建迁移脚本

**DoD**:
- [ ] tenants 表
- [ ] users 表
- [ ] replenishment_plans 表
- [ ] replenishment_items 表
- [ ] 迁移脚本可执行
- [ ] 回滚脚本

**影响文件**:
- `src/infrastructure/database/migrations/*.sql`

---

### TASK-017: 项目脚手架搭建

**描述**: 搭建前后端项目脚手架

**DoD**:
- [ ] 后端 NestJS 项目
- [ ] 前端 React 项目（Web）
- [ ] 小程序项目（Taro）
- [ ] 可运行 Hello World
- [ ] 开发文档

**影响文件**:
- `apps/*/package.json`
- `apps/*/src/`

---

### TASK-018: CI/CD 配置

**描述**: 配置自动化构建和部署

**DoD**:
- [ ] GitHub Actions 工作流
- [ ] 自动化测试
- [ ] Docker 镜像构建
- [ ] 部署脚本

**影响文件**:
- `.github/workflows/ci.yml`
- `Dockerfile`

---

## Sprint 容量评估

| 成员 | 可用工时 | 任务工时 | 缓冲 |
|------|---------|---------|------|
| 小五 (AI) | 80h | 60h | 20h |

**总估时**: 约 60 小时  
**可用工时**: 80 小时（2 周 × 5 天 × 8 小时）  
**缓冲**: 20 小时（25%）

---

## 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| AI 预测准确率低 | 中 | 高 | MVP 使用简化算法，后续优化 |
| 前端开发时间长 | 中 | 中 | 优先保障后端，前端简化 |
| 数据库设计变更 | 低 | 中 | 预留迁移脚本 |

---

*文档状态：AI 自检通过，待 Human 快速确认*
