#!/bin/bash

echo "🛑 停止所有 RetailAI 服务..."

# 停止 Nginx
docker stop retail-ai-nginx 2>/dev/null && docker rm retail-ai-nginx 2>/dev/null

# 停止 Redis
docker stop retail-ai-redis 2>/dev/null && docker rm retail-ai-redis 2>/dev/null

# 停止 PostgreSQL
docker stop retail-ai-postgres 2>/dev/null && docker rm retail-ai-postgres 2>/dev/null

# 删除网络
docker network rm retail-ai-network 2>/dev/null

echo "✅ 所有服务已停止"
