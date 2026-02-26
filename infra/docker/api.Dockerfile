# 后端 API Dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制 package.json
COPY apps/api/package*.json ./

# 安装依赖
RUN npm install --registry=https://registry.npmmirror.com

# 复制源代码
COPY apps/api ./

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "run", "dev"]
