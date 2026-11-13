# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
VOLUME /tmp
VOLUME /app/data
VOLUME /app/models
COPY --from=build /app/target/fraud-detection-system-1.0.0.jar app.jar

ENV JAVA_OPTS="-Xms256m -Xmx768m"
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
