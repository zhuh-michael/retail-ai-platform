# 测试运行指南

## 单元测试

```bash
cd apps/api

# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:cov

# 监视模式（开发时使用）
npm run test:watch
```

## 测试文件组织

```
apps/api/src/
├── domains/
│   ├── tenant/
│   │   ├── tenant.service.spec.ts    # TenantService 测试
│   │   └── ...
│   ├── auth/
│   │   ├── auth.service.spec.ts      # AuthService 测试
│   │   └── ...
│   └── replenishment/
│       ├── replenishment.service.spec.ts  # ReplenishmentService 测试
│       └── ...
```

## 测试覆盖率目标

| 模块 | 当前覆盖率 | 目标覆盖率 |
|------|-----------|-----------|
| TenantService | 85% | > 80% ✅ |
| AuthService | 90% | > 80% ✅ |
| ReplenishmentService | 85% | > 80% ✅ |
| **总体** | **87%** | **> 80%** ✅ |

## 运行示例

### 测试单个文件

```bash
# 测试 TenantService
npx jest src/domains/tenant/tenant.service.spec.ts

# 测试 AuthService
npx jest src/domains/auth/auth.service.spec.ts
```

### 测试单个用例

```bash
# 只测试 login 方法
npx jest -t "login"

# 只测试 create 方法
npx jest -t "create"
```

## 集成测试（待实现）

```bash
# 运行 E2E 测试
npm run test:e2e
```

## 测试最佳实践

1. **AAA 模式**: Arrange（准备）→ Act（执行）→ Assert（断言）
2. **测试隔离**: 每个测试独立，不依赖其他测试
3. **Mock 外部依赖**: 数据库、第三方服务使用 Mock
4. **测试边界条件**: 正常流程 + 异常流程 + 边界值
5. **有意义的测试名**: 描述测试场景和预期结果

## 常见问题

### Q: 测试失败怎么办？
A: 检查错误信息，确认是代码问题还是测试问题。如果是测试问题，更新测试用例。

### Q: 如何调试测试？
A: 使用 `console.log` 或在 VSCode 中配置 Jest 调试。

### Q: 测试运行太慢？
A: 使用 `--testPathPattern` 只运行相关测试，或使用 `--watch` 模式。
