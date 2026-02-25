# 部署指南

## 环境要求

- Docker 20+
- Docker Compose 2.0+
- 2GB+ 内存
- 10GB+ 存储空间

## 快速部署（Docker Compose）

### 1. 克隆项目

```bash
git clone git@github.com:zhuh-michael/retail-ai-platform.git
cd retail-ai-platform
```

### 2. 配置环境变量

```bash
cd apps/api
cp .env.example .env
# 编辑 .env 文件，修改配置
```

### 3. 启动服务

```bash
# 启动所有服务（后台运行）
docker-compose up -d

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps
```

### 4. 访问服务

- **API**: http://localhost:3000
- **API 文档**: http://localhost:3000/api/docs
- **管理后台**: http://localhost:3001

### 5. 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷（谨慎使用）
docker-compose down -v
```

## 生产环境部署

### Docker 部署

```bash
# 构建生产镜像
docker build -f infra/docker/api.Dockerfile -t retail-ai-api:prod .

# 运行容器
docker run -d \
  --name retail-ai-api \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=your-db-host \
  -e DB_PASSWORD=your-secure-password \
  retail-ai-api:prod
```

### Kubernetes 部署（待实现）

```bash
# 应用配置
kubectl apply -f infra/k8s/

# 查看状态
kubectl get pods
kubectl get services
```

## 数据库管理

### 初始化数据库

```bash
# 方式一：Docker Compose 自动初始化
docker-compose up -d postgres

# 方式二：手动执行迁移
psql -h localhost -U postgres -d retail_ai \
  -f infra/database/migrations/001_initial_schema.sql
```

### 备份数据库

```bash
# 导出数据
pg_dump -h localhost -U postgres retail_ai > backup.sql

# 恢复数据
psql -h localhost -U postgres retail_ai < backup.sql
```

## 监控与日志

### 查看日志

```bash
# API 日志
docker-compose logs api

# 数据库日志
docker-compose logs postgres

# 实时日志
docker-compose logs -f api
```

### 健康检查

```bash
# API 健康检查
curl http://localhost:3000/health

# 数据库连接检查
docker-compose exec postgres pg_isready
```

## 常见问题

### Q: 端口被占用怎么办？
A: 修改 `docker-compose.yml` 中的端口映射，例如 `3001:3000` 改为 `3010:3000`。

### Q: 数据库连接失败？
A: 检查 `.env` 文件中的数据库配置，确认数据库服务已启动。

### Q: 如何重置数据库？
A: 删除数据卷并重新启动：
```bash
docker-compose down -v
docker-compose up -d
```

### Q: 如何查看 API 文档？
A: 访问 http://localhost:3000/api/docs（Swagger UI）。

## 性能优化建议

1. **数据库索引**: 确保高频查询字段有索引
2. **缓存策略**: 使用 Redis 缓存热点数据
3. **连接池**: 配置合理的数据库连接池大小
4. **负载均衡**: 多实例部署时使用 Nginx 负载均衡
5. **CDN**: 静态资源使用 CDN 加速

## 安全建议

1. **修改默认密码**: 生产环境必须修改数据库密码
2. **HTTPS**: 使用 HTTPS 加密传输
3. **防火墙**: 仅开放必要端口
4. **定期备份**: 配置自动备份策略
5. **日志审计**: 开启操作日志审计
