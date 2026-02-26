# 管理后台 Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package.json
COPY apps/admin/package*.json ./

# 安装依赖
RUN npm install --registry=https://registry.npmmirror.com

# 复制源代码
COPY apps/admin ./

# 构建生产版本
RUN npm run build

# 生产阶段 - 使用 Nginx
FROM nginx:alpine

# 复制自定义 Nginx 配置
COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建好的前端文件
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
