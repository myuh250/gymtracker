# ==============================================================================
# MULTI-STAGE DOCKERFILE - GYM TRACKER (CLEAN & REVIEW-READY)
#
# Architecture:
# - Stage 1: Build Frontend (React + Vite)
# - Stage 2: Build Backend (Spring Boot)
# - Stage 3: Runtime (Nginx + Backend + LLM via Supervisord)
#
# Purpose:
# - Single container for local deployment / demo / portfolio
# - Infrastructure (DB, Redis, PgVector) runs via docker-compose
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: Frontend Builder (React + Vite)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

# Install dependencies (need devDependencies for build)
COPY frontend/package*.json ./
RUN npm ci

# Build static files
COPY frontend/ ./
RUN npm run build
# Output: /frontend/dist

# ------------------------------------------------------------------------------
# STAGE 2: Backend Builder (Spring Boot)
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jdk-alpine AS backend-builder

WORKDIR /backend

# Cache dependencies
COPY backend/mvnw backend/mvnw.cmd ./
COPY backend/.mvn/ ./.mvn/
COPY backend/pom.xml ./
RUN ./mvnw dependency:go-offline -B

# Build application
COPY backend/src/ ./src/
RUN ./mvnw clean package -DskipTests -B
# Output: /backend/target/app.jar

# ------------------------------------------------------------------------------
# STAGE 3: Runtime Container
# ------------------------------------------------------------------------------
FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    openjdk-21-jre-headless \
    nginx \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create directories
WORKDIR /app
RUN mkdir -p \
    /app/backend \
    /app/frontend \
    /app/llm-service \
    /app/logs

# ------------------------------------------------------------------------------
# Copy artifacts
# ------------------------------------------------------------------------------

# Backend
COPY --from=backend-builder /backend/target/*.jar /app/backend/app.jar

# Frontend
COPY --from=frontend-builder /frontend/dist/ /app/frontend/

# LLM service
COPY llm-service/ /app/llm-service/
RUN pip install --no-cache-dir -r /app/llm-service/requirements.txt

# ------------------------------------------------------------------------------
# Nginx Configuration
# ------------------------------------------------------------------------------
COPY <<'EOF' /etc/nginx/sites-available/default
server {
    listen 80;
    server_name localhost;

    # Frontend
    location / {
        root /app/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # LLM Service
    location /llm/ {
        rewrite ^/llm/(.*)$ /$1 break;
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
EOF

RUN rm -f /etc/nginx/sites-enabled/default && \
    ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# ------------------------------------------------------------------------------
# Supervisord Configuration
# ------------------------------------------------------------------------------
COPY <<'EOF' /etc/supervisor/conf.d/supervisord.conf
[supervisord]
nodaemon=true
logfile=/app/logs/supervisord.log
pidfile=/var/run/supervisord.pid

[program:backend]
command=java $JAVA_OPTS -jar /app/backend/app.jar
directory=/app/backend
autostart=true
autorestart=true
stdout_logfile=/app/logs/backend.out.log
stderr_logfile=/app/logs/backend.err.log
environment=SERVER_PORT="8080",SPRING_PROFILES_ACTIVE="docker"

[program:llm-service]
command=uvicorn app.main:app --host 0.0.0.0 --port 8001
directory=/app/llm-service
autostart=true
autorestart=true
stdout_logfile=/app/logs/llm.out.log
stderr_logfile=/app/logs/llm.err.log

[program:nginx]
command=/usr/sbin/nginx -g "daemon off;"
autostart=true
autorestart=true
priority=999
stdout_logfile=/app/logs/nginx.out.log
stderr_logfile=/app/logs/nginx.err.log
EOF

# ------------------------------------------------------------------------------
# Environment Variables
# ------------------------------------------------------------------------------
ENV JAVA_OPTS="-Xms256m -Xmx512m" \
    SERVER_PORT=8080 \
    SPRING_PROFILES_ACTIVE=docker \
    BACKEND_BASE_URL=http://localhost:8080 \
    LLM_SERVICE_BASE_URL=http://localhost:8001

# ------------------------------------------------------------------------------
# Expose & Healthcheck
# ------------------------------------------------------------------------------
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# ------------------------------------------------------------------------------
# Start
# ------------------------------------------------------------------------------
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
