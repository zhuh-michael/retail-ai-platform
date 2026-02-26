#!/bin/bash

set -e

echo "🚀 启动 RetailAI Copilot 所有服务..."

# 创建网络
echo "📡 创建 Docker 网络..."
docker network create retail-ai-network 2>/dev/null || true

# 启动数据库
echo "🗄️  启动 PostgreSQL..."
docker run -d \
  --name retail-ai-postgres \
  --network retail-ai-network \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=retail_ai \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  -v $(pwd)/infra/database/migrations:/docker-entrypoint-initdb.d \
  postgres:15-alpine

# 启动 Redis
echo "💾 启动 Redis..."
docker run -d \
  --name retail-ai-redis \
  --network retail-ai-network \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7-alpine

# 等待数据库就绪
echo "⏳ 等待数据库启动..."
sleep 5

# 构建并启动 API
echo "🔧 构建并启动 API 服务..."
cd apps/api
npm install --registry=https://registry.npmmirror.com
npm run build &

# 直接运行 API（不使用 Docker，因为需要实时编译）
echo "🚀 启动 API 开发服务器..."
npm run dev &
API_PID=$!
cd ../..

# 等待 API 启动
echo "⏳ 等待 API 启动..."
sleep 10

# 构建并启动前端
echo "🎨 构建管理后台..."
cd apps/admin
npm install --registry=https://registry.npmmirror.com
npm run build
cd ../..

# 启动 Nginx
echo "🌐 启动 Nginx..."
docker run -d \
  --name retail-ai-nginx \
  --network retail-ai-network \
  -p 80:80 \
  -v $(pwd)/infra/docker/nginx.conf:/etc/nginx/conf.d/default.conf \
  nginx:alpine

echo ""
echo "✅ 所有服务已启动！"
echo ""
echo "📊 访问地址:"
echo "   - 管理后台：http://localhost"
echo "   - API 文档：http://localhost/api/docs"
echo "   - 健康检查：http://localhost/health"
echo ""
echo "📦 容器状态:"
docker ps --filter "name=retail-ai"
echo ""
echo "⚠️  按 Ctrl+C 停止所有服务"
echo "   运行：docker-compose down 或 ./scripts/stop-docker.sh"

# 等待 API 进程
wait $API_PID
