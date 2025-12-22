# Backend Dockerfile - Spring Boot
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Cache dependencies
COPY mvnw mvnw.cmd ./
COPY .mvn/ ./.mvn/
COPY pom.xml ./
RUN ./mvnw dependency:go-offline -B

# Build application
COPY src/ ./src/
RUN ./mvnw clean package -DskipTests -B

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy JAR file
COPY --from=builder /app/target/*.jar app.jar

# Create logs directory
RUN mkdir -p /app/logs

ENV JAVA_OPTS="-Xms256m -Xmx512m" \
    SERVER_PORT=8080 \
    SPRING_PROFILES_ACTIVE=docker

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
