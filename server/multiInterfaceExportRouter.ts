import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { exportMultiInterfaceProject } from "./multiInterfaceExportService";
import { storagePut } from "./storage";

export const multiInterfaceExportRouter = router({
  /**
   * Export project as ZIP with all interfaces
   */
  exportProject: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        includeDocker: z.boolean().optional().default(true),
        includeCI: z.boolean().optional().default(true),
        format: z.enum(["zip"]).optional().default("zip"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Generate ZIP buffer
        const zipBuffer = await exportMultiInterfaceProject(input.projectId, ctx.user.id);

        // Upload to S3
        const fileName = `project-${input.projectId}-${Date.now()}.zip`;
        const { url } = await storagePut(fileName, zipBuffer, "application/zip");

        return {
          success: true,
          downloadUrl: url,
          fileName,
          size: zipBuffer.length,
          message: "Project exported successfully",
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to export project",
        };
      }
    }),

  /**
   * Get export preview/manifest
   */
  getExportPreview: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const { getDb } = await import("./db");
        const { projects, projectInterfaces, interfaceLinks } = await import(
          "../drizzle/schema"
        );
        const { eq } = await import("drizzle-orm");

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verify access
        const projectList = await db
          .select()
          .from(projects)
          .where(eq(projects.id, input.projectId))
          .limit(1);

        const project = projectList[0];
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        // Get interfaces
        const interfaces = await db
          .select()
          .from(projectInterfaces)
          .where(eq(projectInterfaces.projectId, input.projectId));

        // Get links
        const links = await db
          .select()
          .from(interfaceLinks)
          .where(eq(interfaceLinks.projectId, input.projectId));

        // Calculate stats
        const languageSet = new Set(interfaces.map((i) => i.language));
        const languages = Array.from(languageSet);

        const stats = {
          totalInterfaces: interfaces.length,
          frontendCount: interfaces.filter((i) => i.type === "frontend").length,
          backendCount: interfaces.filter((i) => i.type === "backend").length,
          mobileCount: interfaces.filter((i) => i.type === "mobile").length,
          apiCount: interfaces.filter((i) => i.type === "api").length,
          databaseCount: interfaces.filter((i) => i.type === "database").length,
          totalDependencies: links.length,
          languages,
        };

        // List files that will be included
        const interfaceFiles = interfaces.flatMap((i) => {
          const dir = i.name.toLowerCase().replace(/\s+/g, "-");
          return [
            `${dir}/Dockerfile`,
            `${dir}/README.md`,
            `${dir}/.env.example`,
            `${dir}/src/index.*`,
          ];
        });

        const files = [
          "README.md",
          "Makefile",
          ".gitignore",
          "docker-compose.yml",
          ".github/workflows/ci.yml",
          ...interfaceFiles,
        ];

        return {
          success: true,
          project: {
            id: project.id,
            title: project.title,
            description: project.description || "",
          },
          stats,
          files,
          estimatedSize: `${Math.round(files.length * 2)} KB`,
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Failed to get preview";
        return {
          success: false,
          error: errorMsg,
        };
      }
    }),

  /**
   * Get supported export options
   */
  getExportOptions: protectedProcedure.query(() => {
    return {
      formats: [
        {
          id: "zip",
          name: "ZIP Archive",
          description: "Complete project as ZIP file",
          extension: ".zip",
        },
      ],
      options: [
        {
          id: "includeDocker",
          name: "Include Docker Configuration",
          description: "Include Dockerfile and docker-compose.yml",
          default: true,
        },
        {
          id: "includeCI",
          name: "Include CI/CD Pipeline",
          description: "Include GitHub Actions workflow",
          default: true,
        },
      ],
      fileTypes: [
        {
          language: "nodejs",
          files: ["package.json", "tsconfig.json", ".env.example"],
        },
        {
          language: "python",
          files: ["requirements.txt", ".env.example"],
        },
        {
          language: "php",
          files: ["composer.json", ".env.example"],
        },
        {
          language: "java",
          files: ["pom.xml", ".env.example"],
        },
        {
          language: "csharp",
          files: ["app.csproj", ".env.example"],
        },
      ],
    };
  }),

  /**
   * Generate deployment script for a specific platform
   */
  generateDeploymentScript: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        platform: z.enum(["docker", "kubernetes", "heroku", "aws", "gcp"]),
      })
    )
    .query(async ({ input, ctx }) => {
      const scripts: Record<string, string> = {
        docker: `#!/bin/bash
# Docker Deployment Script

echo "Building Docker images..."
docker-compose build

echo "Starting containers..."
docker-compose up -d

echo "Checking container status..."
docker-compose ps

echo "Deployment complete!"
echo "Access your application at http://localhost:3000"
`,

        kubernetes: `apiVersion: v1
kind: Namespace
metadata:
  name: pixelcraft-app
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-deployment
  namespace: pixelcraft-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pixelcraft
  template:
    metadata:
      labels:
        app: pixelcraft
    spec:
      containers:
      - name: app
        image: pixelcraft:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
---
apiVersion: v1
kind: Service
metadata:
  name: app-service
  namespace: pixelcraft-app
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3000
  selector:
    app: pixelcraft
`,

        heroku: `#!/bin/bash
# Heroku Deployment Script

echo "Installing Heroku CLI..."
npm install -g heroku

echo "Logging in to Heroku..."
heroku login

echo "Creating Heroku app..."
heroku create your-app-name

echo "Setting environment variables..."
heroku config:set NODE_ENV=production

echo "Deploying to Heroku..."
git push heroku main

echo "Opening app..."
heroku open
`,

        aws: `#!/bin/bash
# AWS ECS Deployment Script

echo "Building Docker image..."
docker build -t pixelcraft:latest .

echo "Tagging image for ECR..."
docker tag pixelcraft:latest ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/pixelcraft:latest

echo "Pushing to ECR..."
docker push ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/pixelcraft:latest

echo "Updating ECS service..."
aws ecs update-service --cluster pixelcraft-cluster --service pixelcraft-service --force-new-deployment

echo "Deployment complete!"
`,

        gcp: `#!/bin/bash
# Google Cloud Platform Deployment Script

echo "Building Docker image..."
docker build -t gcr.io/PROJECT_ID/pixelcraft:latest .

echo "Pushing to Google Container Registry..."
docker push gcr.io/PROJECT_ID/pixelcraft:latest

echo "Deploying to Cloud Run..."
gcloud run deploy pixelcraft \\
  --image gcr.io/PROJECT_ID/pixelcraft:latest \\
  --platform managed \\
  --region us-central1 \\
  --allow-unauthenticated

echo "Deployment complete!"
`,
      };

      return {
        success: true,
        platform: input.platform,
        script: scripts[input.platform] || "",
        instructions: getDeploymentInstructions(input.platform),
      };
    }),
});

function getDeploymentInstructions(platform: string): string[] {
  const instructions: Record<string, string[]> = {
    docker: [
      "Ensure Docker and Docker Compose are installed",
      "Run: docker-compose up -d",
      "Access application at http://localhost:3000",
      "View logs: docker-compose logs -f",
      "Stop: docker-compose down",
    ],
    kubernetes: [
      "Ensure kubectl is configured",
      "Create namespace: kubectl apply -f deployment.yaml",
      "Check status: kubectl get pods -n pixelcraft-app",
      "Port forward: kubectl port-forward -n pixelcraft-app svc/app-service 3000:80",
      "View logs: kubectl logs -n pixelcraft-app -l app=pixelcraft",
    ],
    heroku: [
      "Install Heroku CLI",
      "Login: heroku login",
      "Create app: heroku create your-app-name",
      "Deploy: git push heroku main",
      "View logs: heroku logs --tail",
    ],
    aws: [
      "Configure AWS credentials",
      "Create ECR repository",
      "Create ECS cluster and service",
      "Update script with your AWS account ID and region",
      "Run deployment script",
    ],
    gcp: [
      "Install Google Cloud SDK",
      "Authenticate: gcloud auth login",
      "Set project: gcloud config set project PROJECT_ID",
      "Enable Cloud Run API",
      "Run deployment script",
    ],
  };

  return instructions[platform] || [];
}
