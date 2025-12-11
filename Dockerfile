# ---------- Backend ----------
FROM node:20-alpine AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ .

# ---------- Frontend ----------
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --omit=dev
COPY frontend/ .
RUN npm run build

# ---------- Final image ----------
FROM node:20-alpine
WORKDIR /app

# Copy backend files
COPY --from=backend /app/backend .
# Copy built frontend static files into public folder for Express
RUN mkdir -p public && cp -R /app/frontend/dist/* public/

ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "src/server.js"]
