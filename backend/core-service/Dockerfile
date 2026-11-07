FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
COPY common-lib ./common-lib
COPY core-service ./core-service
COPY ai-worker-service/pom.xml ./ai-worker-service/pom.xml
RUN mvn clean package -pl common-lib,core-service -am -DskipTests -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /workspace/core-service/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Xmx384m", "-jar", "app.jar"]
