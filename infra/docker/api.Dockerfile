# 后端 API Dockerfile (生产环境)
FROM node:18-alpine

# 安装编译依赖（用于 bcrypt 等原生模块）
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 复制 package.json
COPY apps/api/package*.json ./

# 安装依赖
RUN npm install --registry=https://registry.npmmirror.com

# 复制源代码
COPY apps/api ./

# 构建生产版本
RUN npm run build

# 暴露端口
EXPOSE 3000

# 生产环境启动
CMD ["npm", "run", "start"]
