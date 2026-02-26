# RetailAI Copilot - Docker 部署指南

## 📦 快速启动

### 方式一：使用启动脚本（推荐）

```bash
cd /opt/code/retail-ai-platform

# 启动所有服务
./scripts/start-docker.sh

# 停止所有服务
./scripts/stop-docker.sh
```

### 方式二：手动启动

```bash
# 1. 启动数据库和 Redis
docker run -d --name retail-ai-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15-alpine
docker run -d --name retail-ai-redis -p 6379:6379 redis:7-alpine

# 2. 启动后端 API
cd apps/api
npm install
npm run dev

# 3. 构建并启动前端
cd apps/admin
npm install
npm run build

# 4. 启动 Nginx
docker run -d --name retail-ai-nginx -p 80:80 -v $(pwd)/infra/docker/nginx.conf:/etc/nginx/conf.d/default.conf nginx:alpine
```

---

## 🌐 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| **管理后台** | http://localhost:8080 | 前端页面 |
| **API 文档** | http://localhost:8080/api/docs | Swagger UI |
| **健康检查** | http://localhost:8080/health | 服务状态 |
| **数据库** | localhost:5432 | PostgreSQL |
| **Redis** | localhost:6379 | Redis 缓存 |

---

## 🔧 外部访问配置

### 1. 本地访问（默认）

```bash
http://localhost
```

### 2. 局域网访问

需要修改 Nginx 配置或绑定到服务器 IP：

```bash
# 查看服务器 IP
ip addr show | grep inet

# 假设服务器 IP 是 192.168.1.100
http://192.168.1.100
```

### 3. 公网访问

需要：
1. 服务器有公网 IP
2. 防火墙开放 80 端口
3. 域名解析（可选）

```bash
# 防火墙设置（Ubuntu）
sudo ufw allow 80/tcp

# 防火墙设置（CentOS）
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

---

## 📊 服务架构

```
                    ┌─────────────┐
                    │   Nginx     │
                    │   Port 80   │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼──────┐          ┌──────▼──────┐
       │  Admin UI   │          │  Backend    │
       │ (Static)    │          │   API:3000  │
       └─────────────┘          └──────┬──────┘
                                       │
                              ┌────────┴────────┐
                              │                 │
                       ┌──────▼──────┐  ┌──────▼──────┐
                       │ PostgreSQL  │  │    Redis    │
                       │   :5432     │  │   :6379     │
                       └─────────────┘  └─────────────┘
```

---

## 🔍 常用命令

### 查看服务状态

```bash
# 查看所有容器
docker ps --filter "name=retail-ai"

# 查看日志
docker logs retail-ai-nginx
docker logs retail-ai-postgres
```

### 重启服务

```bash
# 重启 Nginx
docker restart retail-ai-nginx

# 重启 API（需要手动）
# 在 API 容器内按 Ctrl+C 然后重新 npm run dev
```

### 数据库管理

```bash
# 进入数据库
docker exec -it retail-ai-postgres psql -U postgres -d retail_ai

# 导入 SQL
docker exec -i retail-ai-postgres psql -U postgres -d retail_ai < backup.sql

# 导出 SQL
docker exec retail-ai-postgres pg_dump -U postgres -d retail_ai > backup.sql
```

---

## ⚠️ 故障排查

### 1. Nginx 无法启动

```bash
# 检查配置文件
docker exec retail-ai-nginx nginx -t

# 查看日志
docker logs retail-ai-nginx
```

### 2. API 连接数据库失败

确保数据库已启动并且网络正常：

```bash
# 检查数据库容器
docker ps | grep postgres

# 测试连接
docker exec retail-ai-api ping postgres
```

### 3. 前端页面空白

检查 Nginx 配置和前端构建：

```bash
# 重新构建前端
cd apps/admin
npm run build

# 重启 Nginx
docker restart retail-ai-nginx
```

---

## 📝 环境变量

### API 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| NODE_ENV | development | 运行环境 |
| DB_HOST | postgres | 数据库主机 |
| DB_PORT | 5432 | 数据库端口 |
| DB_USER | postgres | 数据库用户 |
| DB_PASSWORD | postgres | 数据库密码 |
| DB_NAME | retail_ai | 数据库名称 |
| REDIS_HOST | redis | Redis 主机 |
| REDIS_PORT | 6379 | Redis 端口 |
| JWT_SECRET | retail-ai-super-secret-jwt-key-2026 | JWT 密钥 |

---

## 🚀 生产部署

### 1. 修改密码

```bash
# 修改数据库密码
docker exec retail-ai-postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'your-strong-password';"

# 修改 JWT 密钥
# 编辑 docker-compose.yml 或启动命令中的 JWT_SECRET
```

### 2. 启用 HTTPS

使用 Let's Encrypt 免费证书：

```bash
# 安装 certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
```

### 3. 配置域名

在 Nginx 配置中添加：

```nginx
server_name your-domain.com www.your-domain.com;
```

---

## 📄 相关文件

- `docker-compose.yml` - Docker Compose 配置
- `infra/docker/api.Dockerfile` - API Dockerfile
- `infra/docker/admin.Dockerfile` - 管理后台 Dockerfile
- `infra/docker/nginx.conf` - Nginx 配置
- `scripts/start-docker.sh` - 启动脚本
- `scripts/stop-docker.sh` - 停止脚本

---

**最后更新**: 2026-02-26  
**版本**: 1.0.0
