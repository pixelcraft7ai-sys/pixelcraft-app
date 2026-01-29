import JSZip from "jszip";
import { getDb } from "./db";
import { projectInterfaces, interfaceLinks, projects } from "../drizzle/schema";
import { eq } from "drizzle-orm";

interface ExportInterface {
  id: number;
  name: string;
  type: "frontend" | "backend" | "mobile" | "api" | "database";
  language: string;
  framework?: string | null;
  generatedCode?: string | null;
  dependencies?: string | null;
  version?: string | null;
  description?: string | null;
  status?: string | null;
  projectId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ExportLink {
  id: number;
  sourceInterfaceId: number;
  targetInterfaceId: number;
  linkType: string;
  apiEndpoint?: string | null;
  description?: string | null;
  projectId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Generate package.json for Node.js/Express backend
 */
function generateNodeJsPackageJson(
  projectName: string,
  interfaces: ExportInterface[]
): string {
  const deps: Record<string, string> = {
    express: "^4.18.0",
    cors: "^2.8.0",
    "body-parser": "^1.20.0",
    typescript: "^5.0.0",
    "@types/express": "^4.17.0",
    "@types/node": "^20.0.0",
    "ts-node": "^10.0.0",
  };

  return JSON.stringify(
    {
      name: projectName.toLowerCase().replace(/\s+/g, "-"),
      version: "1.0.0",
      description: `Multi-interface project with ${interfaces.length} interfaces`,
      main: "dist/index.js",
      scripts: {
        build: "tsc",
        start: "node dist/index.js",
        dev: "ts-node src/index.ts",
        test: "jest",
      },
      dependencies: deps,
      devDependencies: {
        jest: "^29.0.0",
        "@types/jest": "^29.0.0",
      },
    },
    null,
    2
  );
}

/**
 * Generate requirements.txt for Python/Flask backend
 */
function generatePythonRequirements(interfaces: ExportInterface[]): string {
  const deps = [
    "Flask==2.3.0",
    "Flask-CORS==4.0.0",
    "python-dotenv==1.0.0",
    "gunicorn==21.0.0",
    "pytest==7.0.0",
  ];

  return deps.join("\n");
}

/**
 * Generate composer.json for PHP/Laravel backend
 */
function generateComposerJson(projectName: string): string {
  return JSON.stringify(
    {
      name: projectName.toLowerCase().replace(/\s+/g, "-"),
      description: "Multi-interface Laravel project",
      type: "project",
      require: {
        php: "^8.0",
        "laravel/framework": "^10.0",
        "laravel/cors": "^2.0",
      },
      require_dev: {
        phpunit: "^9.0",
      },
      autoload: {
        psr4: {
          App: "app/",
        },
      },
    },
    null,
    2
  );
}

/**
 * Generate pom.xml for Java/Spring Boot
 */
function generatePomXml(projectName: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  
  <groupId>com.pixelcraft</groupId>
  <artifactId>${projectName.toLowerCase().replace(/\s+/g, "-")}</artifactId>
  <version>1.0.0</version>
  <packaging>jar</packaging>
  
  <name>PixelCraft Project</name>
  <description>Multi-interface Spring Boot application</description>
  
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.0.0</version>
    <relativePath/>
  </parent>
  
  <properties>
    <java.version>17</java.version>
  </properties>
  
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
    </dependency>
  </dependencies>
  
  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>`;
}

/**
 * Generate .csproj for C#/.NET Core
 */
function generateCsprojFile(projectName: string): string {
  return `<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net7.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.App" Version="7.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="7.0.0" />
    <PackageReference Include="Microsoft.AspNetCore.Cors" Version="7.0.0" />
  </ItemGroup>

</Project>`;
}

/**
 * Generate Dockerfile for an interface
 */
function generateDockerfile(iface: ExportInterface): string {
  switch (iface.language) {
    case "nodejs":
      return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]`;

    case "python":
      return `FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]`;

    case "php":
      return `FROM php:8.1-fpm

WORKDIR /app

RUN apt-get update && apt-get install -y composer

COPY composer.json composer.lock ./
RUN composer install --no-dev

COPY . .

EXPOSE 9000

CMD ["php-fpm"]`;

    case "java":
      return `FROM maven:3.8-openjdk-17 as builder

WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM openjdk:17-slim

WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]`;

    case "csharp":
      return `FROM mcr.microsoft.com/dotnet/sdk:7.0 as builder

WORKDIR /app
COPY . .
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:7.0

WORKDIR /app
COPY --from=builder /app/out .

EXPOSE 80

ENTRYPOINT ["dotnet", "app.dll"]`;

    default:
      return `FROM node:18-alpine
WORKDIR /app
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`;
  }
}

/**
 * Generate docker-compose.yml for multi-interface project
 */
function generateDockerCompose(
  projectName: string,
  interfaces: ExportInterface[],
  links: ExportLink[]
): string {
  const services: Record<string, any> = {};

  interfaces.forEach((iface) => {
    const serviceName = iface.name.toLowerCase().replace(/\s+/g, "-");
    services[serviceName] = {
      build: `./${serviceName}`,
      container_name: `${projectName.toLowerCase()}-${serviceName}`,
      environment: {
        NODE_ENV: "production",
        FLASK_ENV: "production",
      },
      ports: [getPortForInterface(iface)],
      depends_on: links
        .filter((l) => l.targetInterfaceId === iface.id)
        .map((l) => {
          const depInterface = interfaces.find((i) => i.id === l.sourceInterfaceId);
          return depInterface?.name.toLowerCase().replace(/\s+/g, "-");
        })
        .filter(Boolean),
    };
  });

  return `version: '3.8'

services:
${Object.entries(services)
  .map(
    ([name, config]) => `
  ${name}:
    build: ./${name}
    container_name: ${projectName.toLowerCase()}-${name}
    environment:
      NODE_ENV: production
      FLASK_ENV: production
    ports:
      - "${getPortForInterface(interfaces.find((i) => i.name.toLowerCase().replace(/\s+/g, "-") === name) || interfaces[0])}"
    depends_on:
      ${config.depends_on.map((dep: string) => `- ${dep}`).join("\n      ")}
`
  )
  .join("\n")}
`;
}

/**
 * Get port for interface type
 */
function getPortForInterface(iface: ExportInterface): string {
  const basePort = 3000;
  const portMap: Record<string, number> = {
    frontend: 3000,
    backend: 3001,
    mobile: 3002,
    api: 3003,
    database: 5432,
  };
  return `${portMap[iface.type] || basePort}:${portMap[iface.type] || basePort}`;
}

/**
 * Generate comprehensive README
 */
function generateReadme(
  projectName: string,
  interfaces: ExportInterface[],
  links: ExportLink[]
): string {
  const interfacesList = interfaces
    .map(
      (i) =>
        `- **${i.name}** (${i.type}): ${i.language} - ${i.framework || "No framework"}`
    )
    .join("\n");

  const linksList = links
    .map((l) => {
      const source = interfaces.find((i) => i.id === l.sourceInterfaceId);
      const target = interfaces.find((i) => i.id === l.targetInterfaceId);
      return `- ${source?.name} **${l.linkType}** ${target?.name}`;
    })
    .join("\n");

  return `# ${projectName}

Generated by PixelCraft - Multi-Interface Code Generator

## Project Structure

This project contains ${interfaces.length} interfaces:

${interfacesList}

## Interface Dependencies

${linksList || "No dependencies defined"}

## Quick Start

### Using Docker Compose (Recommended)

\`\`\`bash
docker-compose up -d
\`\`\`

### Manual Setup

#### Frontend Interface
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

#### Backend Interface
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`

## API Documentation

Each interface exposes its own API. See the respective interface directory for documentation.

## Development

### Build All Interfaces
\`\`\`bash
make build
\`\`\`

### Run All Interfaces
\`\`\`bash
make run
\`\`\`

### Test All Interfaces
\`\`\`bash
make test
\`\`\`

## Deployment

### Docker

\`\`\`bash
docker build -t ${projectName.toLowerCase()}:latest .
docker run -p 3000:3000 ${projectName.toLowerCase()}:latest
\`\`\`

### Kubernetes

See \`k8s/\` directory for Kubernetes manifests.

## Environment Variables

Create a \`.env\` file in the root directory:

\`\`\`
NODE_ENV=production
DATABASE_URL=postgresql://user:password@localhost:5432/db
API_KEY=your-api-key
\`\`\`

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: \`make test\`
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please visit the PixelCraft documentation.
`;
}

/**
 * Generate Makefile for common tasks
 */
function generateMakefile(interfaces: ExportInterface[]): string {
  const interfaceDirs = interfaces
    .map((i) => i.name.toLowerCase().replace(/\s+/g, "-"))
    .join(" ");

  return `.PHONY: build run test clean install deploy

build:
\t@echo "Building all interfaces..."
${interfaces.map((i) => `\tcd ${i.name.toLowerCase().replace(/\s+/g, "-")} && npm run build && cd ..`).join("\n")}

run:
\t@echo "Running all interfaces..."
\tdocker-compose up -d

stop:
\t@echo "Stopping all interfaces..."
\tdocker-compose down

test:
\t@echo "Testing all interfaces..."
${interfaces.map((i) => `\tcd ${i.name.toLowerCase().replace(/\s+/g, "-")} && npm test && cd ..`).join("\n")}

install:
\t@echo "Installing dependencies..."
${interfaces.map((i) => `\tcd ${i.name.toLowerCase().replace(/\s+/g, "-")} && npm install && cd ..`).join("\n")}

clean:
\t@echo "Cleaning up..."
\tdocker-compose down -v
\tfind . -name "node_modules" -type d -exec rm -rf {} +
\tfind . -name "dist" -type d -exec rm -rf {} +

logs:
\tdocker-compose logs -f

status:
\tdocker-compose ps

deploy:
\t@echo "Deploying to production..."
\tdocker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

help:
\t@echo "Available commands:"
\t@echo "  make build     - Build all interfaces"
\t@echo "  make run       - Run all interfaces with Docker Compose"
\t@echo "  make stop      - Stop all interfaces"
\t@echo "  make test      - Test all interfaces"
\t@echo "  make install   - Install dependencies"
\t@echo "  make clean     - Clean up containers and dependencies"
\t@echo "  make logs      - View logs"
\t@echo "  make status    - Check container status"
\t@echo "  make deploy    - Deploy to production"
`;
}

/**
 * Generate GitHub Actions workflow
 */
function generateGitHubWorkflow(): string {
  const secrets = "secrets";
  return `name: CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: make install
    
    - name: Build
      run: make build
    
    - name: Run tests
      run: make test
    
    - name: Build Docker images
      run: docker-compose build
    
    - name: Push to registry
      if: github.event_name == 'push' && github.ref == 'refs/heads/main'
      run: |
        docker login -u \${{ ${secrets}.DOCKER_USERNAME }} -p \${{ ${secrets}.DOCKER_PASSWORD }}
        docker-compose push
`;
}

/**
 * Main export function for multi-interface projects
 */
export async function exportMultiInterfaceProject(
  projectId: number,
  userId: number
): Promise<Buffer> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Fetch project
  const projectList = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  const project = projectList[0];
  if (!project || project.userId !== userId) {
    throw new Error("Unauthorized");
  }

  // Fetch interfaces
  const interfaces = await db
    .select()
    .from(projectInterfaces)
    .where(eq(projectInterfaces.projectId, projectId));

  // Fetch links
  const links = await db
    .select()
    .from(interfaceLinks)
    .where(eq(interfaceLinks.projectId, projectId));

  const zip = new JSZip();

  // Add root level files
  zip.file("README.md", generateReadme(project.title, interfaces, links));
  zip.file("Makefile", generateMakefile(interfaces));
  zip.file(".gitignore", generateGitIgnore());
  zip.file(
    "docker-compose.yml",
    generateDockerCompose(project.title, interfaces, links)
  );
  zip.file(".github/workflows/ci.yml", generateGitHubWorkflow());

  // Create interface directories
  for (const iface of interfaces) {
    const ifaceData = iface as any;
    const interfaceDir = iface.name.toLowerCase().replace(/\s+/g, "-");
    const folder = zip.folder(interfaceDir)!;

    // Add generated code
    if (ifaceData.generatedCode) {
      const ext = getFileExtensionForLanguage(iface.language);
      folder.file(`src/index${ext}`, ifaceData.generatedCode || "");
    }

    // Add Dockerfile
    folder.file("Dockerfile", generateDockerfile(iface));

    // Add language-specific config files
    switch (iface.language) {
      case "nodejs":
        folder.file("package.json", generateNodeJsPackageJson(iface.name, [ifaceData]));
        folder.file(".env.example", generateEnvExample(ifaceData));
        folder.file("tsconfig.json", generateTsConfig());
        break;

      case "python":
        folder.file("requirements.txt", generatePythonRequirements([ifaceData]));
        folder.file(".env.example", generateEnvExample(ifaceData));
        folder.file("app.py", generatePythonApp(ifaceData));
        break;

      case "php":
        folder.file("composer.json", generateComposerJson(iface.name));
        folder.file(".env.example", generateEnvExample(ifaceData));
        folder.file("index.php", (ifaceData.generatedCode || "") || "<?php\n// Generated PHP code\n");
        break;

      case "java":
        folder.file("pom.xml", generatePomXml(iface.name));
        folder.file(".env.example", generateEnvExample(ifaceData));
        folder.file("src/main/java/Application.java", generateJavaApp(ifaceData));
        break;

      case "csharp":
        folder.file("app.csproj", generateCsprojFile(iface.name));
        folder.file(".env.example", generateEnvExample(ifaceData));
        folder.file("Program.cs", generateCSharpApp(ifaceData));
        break;

      default:
        folder.file(".env.example", generateEnvExample(ifaceData));
    }

    // Add README for interface
    folder.file("README.md", generateInterfaceReadme(ifaceData));
  }

  // Generate and return ZIP
  return await zip.generateAsync({ type: "nodebuffer" });
}

/**
 * Helper functions for file generation
 */

function generateGitIgnore(): string {
  return `node_modules/
dist/
build/
.env
.env.local
.DS_Store
*.log
.vscode/
.idea/
__pycache__/
*.pyc
.pytest_cache/
vendor/
.gradle/
bin/
obj/
`;
}

function generateEnvExample(iface: ExportInterface): string {
  return `# Environment variables for ${iface.name}

NODE_ENV=development
PORT=3000
DATABASE_URL=
API_KEY=
SECRET_KEY=
LOG_LEVEL=info
`;
}

function generateTsConfig(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        target: "ES2020",
        module: "commonjs",
        lib: ["ES2020"],
        outDir: "./dist",
        rootDir: "./src",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
      include: ["src/**/*"],
      exclude: ["node_modules"],
    },
    null,
    2
  );
}

function generatePythonApp(iface: ExportInterface): string {
  return `from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "${iface.name}"})

@app.route('/api/info', methods=['GET'])
def info():
    return jsonify({
        "name": "${iface.name}",
        "type": "${iface.type}",
        "version": "${iface.version}"
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
`;
}

function generateJavaApp(iface: ExportInterface): string {
  return `package com.pixelcraft;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class Application {
    
    @GetMapping("/api/health")
    public HealthResponse health() {
        return new HealthResponse("healthy", "${iface.name}");
    }
    
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
`;
}

function generateCSharpApp(iface: ExportInterface): string {
  return `using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors();

app.MapGet("/api/health", () => new { status = "healthy", service = "${iface.name}" });

app.Run();
`;
}

function generateInterfaceReadme(iface: any): string {
  return `# ${iface.name}

**Type:** ${iface.type}  
**Language:** ${iface.language}  
**Framework:** ${iface.framework || "None"}  
**Version:** ${iface.version || "1.0.0"}

## Overview

${iface.description || "This is a generated interface for the PixelCraft project."}

## Setup

### Prerequisites
- Node.js 18+ (for Node.js interfaces)
- Python 3.11+ (for Python interfaces)
- PHP 8.1+ (for PHP interfaces)
- Java 17+ (for Java interfaces)
- .NET 7+ (for C# interfaces)

### Installation

\`\`\`bash
npm install
# or
pip install -r requirements.txt
# or
composer install
\`\`\`

### Running

\`\`\`bash
npm run dev
# or
python app.py
# or
mvn spring-boot:run
\`\`\`

## API Endpoints

- \`GET /api/health\` - Health check
- \`GET /api/info\` - Service information

## Testing

\`\`\`bash
npm test
\`\`\`

## Deployment

See the main README.md for deployment instructions.
`;
}

function getFileExtensionForLanguage(language: string): string {
  const extensions: Record<string, string> = {
    nodejs: ".ts",
    python: ".py",
    php: ".php",
    java: ".java",
    csharp: ".cs",
    react: ".tsx",
    vue: ".vue",
    angular: ".ts",
    svelte: ".svelte",
    html: ".html",
  };
  return extensions[language] || ".txt";
}
