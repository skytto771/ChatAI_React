# ============================================
# 星语 (StarTalk) 前端 Dockerfile
# ============================================
FROM node:alpine AS builder

WORKDIR /app

# 安装依赖
COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

# 复制源码并构建
COPY . .
RUN npm run build

# ============================================
# 生产运行阶段（Nginx）
# ============================================
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
