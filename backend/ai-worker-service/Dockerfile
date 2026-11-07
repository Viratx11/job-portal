FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
COPY common-lib ./common-lib
COPY core-service/pom.xml ./core-service/pom.xml
COPY ai-worker-service ./ai-worker-service
RUN mvn clean package -pl common-lib,ai-worker-service -am -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /workspace/ai-worker-service/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-Xmx384m", "-jar", "app.jar"]
