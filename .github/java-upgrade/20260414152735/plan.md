# Java Upgrade Plan

## Overview
- Project: `backend` Maven service for AI-Powered Job Portal.
- Current Java target: `17`.
- Target Java LTS: `21`.
- Scope: update backend runtime target to Java 21, validate compilation and tests.

## Available Tools
- Maven Wrapper: `backend/mvnw` via `.mvn/wrapper/maven-wrapper.properties` using Maven `3.9.9`.
- Installed Maven: `3.9.12` available on system.
- Installed JDKs: Java `24.0.1` currently available.
- Required JDK: Java `21` is missing and will be installed for the target runtime.
- Version control: `git` available; project is on branch `main`.

## Guidelines
- Upgrade runtime to the latest Java LTS version, which is Java 21.
- Keep the current Spring Boot `3.3.5` stack unchanged unless compatibility issues require a dependency update.
- Use Maven Wrapper for reproducible build execution.
- Validate with `mvnw clean test` after the runtime upgrade.

## Technology Stack
- `org.springframework.boot:spring-boot-starter-parent:3.3.5`
- `java.version` property: `17`
- `maven-compiler-plugin` configured with `<release>${java.version}</release>`
- `spring-boot-starter-web`, `spring-boot-starter-security`, `spring-boot-starter-data-jpa`, `spring-boot-starter-validation`, `spring-boot-starter-cache`, `spring-boot-starter-mail`
- `jjwt` 0.11.5
- `apache-tika` 2.9.1
- `commons-io` 2.15.1
- `spring-boot-starter-test`, `spring-security-test`

## Derived Upgrades
- Primary upgrade: `backend/pom.xml` change `<java.version>` from `17` to `21`.
- No Spring Boot version upgrade is required for Java 21 compatibility.
- Maven Wrapper can continue with `3.9.9`; no wrapper version upgrade is necessary.

## Key Challenges
- Ensuring JDK 21 is installed and selected for the upgrade build.
- Verifying the existing Spring Boot 3.3.5 backend compiles cleanly against Java 21.
- Confirming test execution passes after the runtime target change.

## Upgrade Steps
1. Setup Environment
   - Install JDK 21 on the machine.
   - Confirm Maven Wrapper and local Maven are available.
   - Validate that JDK 21 is ready for use.

2. Setup Baseline
   - Run `backend/mvnw -q clean test-compile` using the currently available JDK 24 and current code.
   - Record baseline compilation and test compilation status.

3. Apply Java 21 Target Upgrade
   - Update `backend/pom.xml` property `<java.version>` from `17` to `21`.
   - Run `backend/mvnw -q -DskipTests clean test-compile` with JDK 21 to validate compile compatibility.
   - Run `backend/mvnw -q clean test` with JDK 21 to validate the full backend test suite.

4. Final Validation
   - Confirm `backend/mvnw -q clean test` passes under JDK 21.
   - Ensure no runtime or compilation issues remain.
   - Document any remaining limitations.

## Options
- Run tests before and after the upgrade: `true`
