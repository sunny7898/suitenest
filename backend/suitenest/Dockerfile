# Stage 1: Build the application
FROM maven:3.8.4-openjdk-17 as build

# Set the working directory in the container for the build stage
WORKDIR /app

# Copy the Maven build configuration file to the container
COPY pom.xml .

# Download the dependencies specified in the pom.xml
RUN mvn dependency:go-offline

# Copy the source code into the container
COPY src ./src

# Package the application into a JAR file, skipping tests
RUN mvn clean package -DskipTests

# Stage 2: Create a smaller runtime image
FROM openjdk:17-jdk-slim

# Set the working directory in the container for the runtime stage
WORKDIR /app

# Copy the packaged JAR file from the build stage to the runtime stage
COPY --from=build /app/target/suitenest-0.0.1-SNAPSHOT.jar .

# Expose the port the application will run on
EXPOSE 9192

# Command to run the Spring Boot application
ENTRYPOINT ["java", "-jar", "/app/suitenest-0.0.1-SNAPSHOT.jar"]
