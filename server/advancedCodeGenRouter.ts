import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  generateCode,
  getFrameworkDependencies,
  getFileExtension,
  type CodeFramework,
} from "./codeGenerators";

export const advancedCodeGenRouter = router({
  // Generate code with framework selection
  generate: protectedProcedure
    .input(
      z.object({
        description: z.string().min(10, "Description must be at least 10 characters"),
        framework: z.enum(["react", "vue", "angular", "svelte", "html", "nodejs", "python", "php", "java", "csharp"]),
        style: z.string(),
        includeTypeScript: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await generateCode({
          description: input.description,
          framework: input.framework,
          style: input.style,
          includeTypeScript: input.includeTypeScript,
        });

        return {
          success: true,
          code: result.code,
          framework: result.framework,
          language: result.language,
          fileExtension: getFileExtension(result.framework, input.includeTypeScript),
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to generate code",
        };
      }
    }),

  // Get framework dependencies
  getDependencies: protectedProcedure
    .input(
      z.object({
        framework: z.enum(["react", "vue", "angular", "svelte", "html", "nodejs", "python", "php", "java", "csharp"]),
        includeTypeScript: z.boolean().default(true),
      })
    )
    .query(({ input }) => {
      return getFrameworkDependencies(input.framework, input.includeTypeScript);
    }),

  // Get available frameworks
  getFrameworks: protectedProcedure.query(() => {
    return [
      {
        id: "html",
        name: "HTML/CSS/JS",
        description: "Vanilla HTML, CSS, and JavaScript",
        icon: "🌐",
        category: "frontend",
      },
      {
        id: "react",
        name: "React",
        description: "Modern React with Hooks and TypeScript",
        icon: "⚛️",
        category: "frontend",
      },
      {
        id: "vue",
        name: "Vue 3",
        description: "Vue 3 with Composition API",
        icon: "💚",
        category: "frontend",
      },
      {
        id: "angular",
        name: "Angular",
        description: "Angular with TypeScript",
        icon: "🅰️",
        category: "frontend",
      },
      {
        id: "svelte",
        name: "Svelte",
        description: "Svelte with reactive components",
        icon: "🔥",
        category: "frontend",
      },
      {
        id: "nodejs",
        name: "Node.js/Express",
        description: "Express.js backend with TypeScript",
        icon: "🟢",
        category: "backend",
      },
      {
        id: "python",
        name: "Python/Flask",
        description: "Flask backend with type hints",
        icon: "🐍",
        category: "backend",
      },
      {
        id: "php",
        name: "PHP/Laravel",
        description: "Laravel framework with modern PHP",
        icon: "🐘",
        category: "backend",
      },
      {
        id: "java",
        name: "Java/Spring Boot",
        description: "Spring Boot enterprise framework",
        icon: "☕",
        category: "backend",
      },
      {
        id: "csharp",
        name: "C#/.NET Core",
        description: ".NET Core with ASP.NET",
        icon: "#️⃣",
        category: "backend",
      },
    ];
  }),

  // Get design styles
  getStyles: protectedProcedure.query(() => {
    return [
      {
        id: "modern",
        name: "Modern",
        description: "Clean, contemporary design with bold colors",
      },
      {
        id: "minimal",
        name: "Minimal",
        description: "Simple, elegant design with whitespace",
      },
      {
        id: "corporate",
        name: "Corporate",
        description: "Professional business design",
      },
      {
        id: "creative",
        name: "Creative",
        description: "Artistic, expressive design",
      },
      {
        id: "dark",
        name: "Dark Mode",
        description: "Dark theme with accent colors",
      },
      {
        id: "glassmorphism",
        name: "Glassmorphism",
        description: "Modern glass effect design",
      },
    ];
  }),

  // Get code templates
  getTemplates: protectedProcedure.query(() => {
    return [
      {
        id: "landing",
        name: "Landing Page",
        description: "Hero section with CTA",
        icon: "🚀",
      },
      {
        id: "portfolio",
        name: "Portfolio",
        description: "Showcase your work",
        icon: "🎨",
      },
      {
        id: "blog",
        name: "Blog",
        description: "Article listing and detail pages",
        icon: "📝",
      },
      {
        id: "ecommerce",
        name: "E-Commerce",
        description: "Product catalog and shopping",
        icon: "🛍️",
      },
      {
        id: "dashboard",
        name: "Dashboard",
        description: "Analytics and data visualization",
        icon: "📊",
      },
      {
        id: "contact",
        name: "Contact Form",
        description: "Contact form with validation",
        icon: "📧",
      },
      {
        id: "saas",
        name: "SaaS",
        description: "Software as a Service landing",
        icon: "☁️",
      },
      {
        id: "mobile",
        name: "Mobile App",
        description: "Mobile-first responsive design",
        icon: "📱",
      },
    ];
  }),

  // Validate code generation
  validate: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        framework: z.enum(["react", "vue", "angular", "svelte", "html"]),
      })
    )
    .query(({ input }) => {
      const errors: string[] = [];

      // Basic validation based on framework
      switch (input.framework) {
        case "react":
          if (!input.code.includes("export")) {
            errors.push("React component must have an export statement");
          }
          if (!input.code.includes("function") && !input.code.includes("const")) {
            errors.push("React component must define a function or const");
          }
          break;

        case "vue":
          if (!input.code.includes("<template>")) {
            errors.push("Vue component must have a template section");
          }
          if (!input.code.includes("<script")) {
            errors.push("Vue component must have a script section");
          }
          break;

        case "angular":
          if (!input.code.includes("@Component")) {
            errors.push("Angular component must have @Component decorator");
          }
          if (!input.code.includes("export class")) {
            errors.push("Angular component must export a class");
          }
          break;

        case "svelte":
          if (!input.code.includes("<script") && !input.code.includes("<style")) {
            errors.push("Svelte component should have script or style sections");
          }
          break;

        case "html":
          if (!input.code.includes("<html") && !input.code.includes("<div")) {
            errors.push("HTML must contain HTML elements");
          }
          break;
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    }),
});
