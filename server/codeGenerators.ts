import { invokeLLM } from "./_core/llm";

export type CodeFramework = "react" | "vue" | "angular" | "svelte" | "html" | "nodejs" | "python" | "php" | "java" | "csharp";

interface CodeGenerationOptions {
  description: string;
  framework: CodeFramework;
  style: string;
  includeTypeScript: boolean;
}

/**
 * Generate React component code from description
 */
export async function generateReactCode(
  description: string,
  style: string,
  includeTypeScript: boolean = true
): Promise<string> {
  const prompt = `Generate a professional React ${
    includeTypeScript ? "TypeScript" : "JavaScript"
  } component based on this description:

${description}

Design Style: ${style}

Requirements:
- Use functional components with hooks
- Include proper TypeScript types if enabled
- Use Tailwind CSS for styling
- Make it responsive and accessible
- Include proper error handling
- Add comments explaining the code
- Export the component as default
- Include any necessary imports

Generate ONLY the component code, starting with imports and ending with the export statement.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert React developer. Generate clean, production-ready React components.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content || "";
  return typeof content === "string" ? content : "";
}

/**
 * Generate Vue component code from description
 */
export async function generateVueCode(
  description: string,
  style: string,
  includeTypeScript: boolean = true
): Promise<string> {
  const prompt = `Generate a professional Vue 3 ${
    includeTypeScript ? "TypeScript" : "JavaScript"
  } component based on this description:

${description}

Design Style: ${style}

Requirements:
- Use Composition API with <script setup>
- Include proper TypeScript types if enabled
- Use Tailwind CSS for styling
- Make it responsive and accessible
- Include proper error handling
- Add comments explaining the code
- Use scoped styles
- Include any necessary imports

Generate ONLY the component code in Single File Component format (.vue).`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert Vue developer. Generate clean, production-ready Vue components.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content || "";
  return typeof content === "string" ? content : "";
}

/**
 * Generate Angular component code from description
 */
export async function generateAngularCode(
  description: string,
  style: string,
  includeTypeScript: boolean = true
): Promise<string> {
  const prompt = `Generate a professional Angular TypeScript component based on this description:

${description}

Design Style: ${style}

Requirements:
- Use Angular best practices
- Include proper TypeScript types
- Use Tailwind CSS for styling
- Make it responsive and accessible
- Include proper error handling
- Add comments explaining the code
- Include @Component decorator
- Add proper imports
- Use OnInit lifecycle hook if needed

Generate ONLY the component TypeScript code.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert Angular developer. Generate clean, production-ready Angular components.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content || "";
  return typeof content === "string" ? content : "";
}

/**
 * Generate Svelte component code from description
 */
export async function generateSvelteCode(
  description: string,
  style: string,
  includeTypeScript: boolean = true
): Promise<string> {
  const prompt = `Generate a professional Svelte ${
    includeTypeScript ? "TypeScript" : "JavaScript"
  } component based on this description:

${description}

Design Style: ${style}

Requirements:
- Use modern Svelte syntax
- Include proper TypeScript types if enabled
- Use Tailwind CSS for styling
- Make it responsive and accessible
- Include proper error handling
- Add comments explaining the code
- Use reactive declarations where appropriate
- Include scoped styles

Generate ONLY the Svelte component code.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert Svelte developer. Generate clean, production-ready Svelte components.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content || "";
  return typeof content === "string" ? content : "";
}

/**
 * Generate Node.js/Express backend code from description
 */
export async function generateNodeJsCode(
  description: string,
  style: string
): Promise<string> {
  const prompt = `Generate a professional Node.js Express backend API based on this description:

${description}

Style: ${style}

Requirements:
- Use Express.js framework
- Include proper TypeScript types
- Create RESTful API endpoints
- Include error handling middleware
- Add proper validation
- Include comments explaining the code
- Use async/await for async operations
- Include necessary imports
- Add CORS and security headers

Generate ONLY the server code, starting with imports.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert Node.js/Express developer. Generate clean, production-ready backend code.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content || "";
  return typeof content === "string" ? content : "";
}

/**
 * Generate Python/Flask backend code from description
 */
export async function generatePythonCode(
  description: string,
  style: string
): Promise<string> {
  const prompt = `Generate a professional Python Flask backend API based on this description:

${description}

Style: ${style}

Requirements:
- Use Flask framework
- Include proper type hints
- Create RESTful API endpoints
- Include error handling
- Add proper validation with marshmallow
- Include comments explaining the code
- Use async/await where appropriate
- Include necessary imports
- Add CORS support
- Include database models if needed

Generate ONLY the Flask application code.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert Python/Flask developer. Generate clean, production-ready backend code.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content || "";
  return typeof content === "string" ? content : "";
}

/**
 * Generate PHP/Laravel backend code from description
 */
export async function generatePHPCode(
  description: string,
  style: string
): Promise<string> {
  const prompt = `Generate a professional PHP Laravel backend API based on this description:

${description}

Style: ${style}

Requirements:
- Use Laravel framework
- Include proper type hints
- Create RESTful API endpoints
- Include error handling
- Add proper validation with Laravel validation
- Include comments explaining the code
- Use Eloquent ORM for database
- Include necessary imports
- Add CORS support
- Include models and controllers

Generate ONLY the Laravel controller/route code.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert PHP/Laravel developer. Generate clean, production-ready backend code.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content || "";
  return typeof content === "string" ? content : "";
}

/**
 * Generate Java/Spring Boot backend code from description
 */
export async function generateJavaCode(
  description: string,
  style: string
): Promise<string> {
  const prompt = `Generate a professional Java Spring Boot backend API based on this description:

${description}

Style: ${style}

Requirements:
- Use Spring Boot framework
- Include proper type hints
- Create RESTful API endpoints with @RestController
- Include error handling with @ExceptionHandler
- Add proper validation with @Valid
- Include comments explaining the code
- Use @Service and @Repository patterns
- Include necessary imports
- Add CORS configuration
- Include JPA entities

Generate ONLY the Spring Boot controller code.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert Java/Spring Boot developer. Generate clean, production-ready backend code.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content || "";
  return typeof content === "string" ? content : "";
}

/**
 * Generate C#/.NET Core backend code from description
 */
export async function generateCSharpCode(
  description: string,
  style: string
): Promise<string> {
  const prompt = `Generate a professional C# .NET Core backend API based on this description:

${description}

Style: ${style}

Requirements:
- Use .NET Core with ASP.NET Core
- Include proper type hints
- Create RESTful API endpoints with [ApiController]
- Include error handling
- Add proper validation with DataAnnotations
- Include comments explaining the code
- Use dependency injection
- Include necessary using statements
- Add CORS configuration
- Include Entity Framework models

Generate ONLY the ASP.NET Core controller code.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert C#/.NET Core developer. Generate clean, production-ready backend code.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content || "";
  return typeof content === "string" ? content : "";
}

/**
 * Generate HTML/CSS/JS code from description
 */
export async function generateHTMLCode(
  description: string,
  style: string
): Promise<{ html: string; css: string; js: string }> {
  const prompt = `Generate professional HTML, CSS, and JavaScript code based on this description:

${description}

Design Style: ${style}

Requirements:
- Create semantic HTML5
- Use modern CSS with Tailwind CSS classes
- Include vanilla JavaScript for interactivity
- Make it responsive and accessible
- Include proper error handling
- Add comments explaining the code
- Optimize for performance

Return the response in this exact format:
<!-- HTML START -->
[HTML code here]
<!-- HTML END -->

<!-- CSS START -->
[CSS code here]
<!-- CSS END -->

<!-- JS START -->
[JavaScript code here]
<!-- JS END -->`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert web developer. Generate clean, production-ready HTML, CSS, and JavaScript code.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content || "";
  const contentStr = typeof content === "string" ? content : "";

  // Parse the response to extract HTML, CSS, and JS
  const htmlRegex = /<!-- HTML START -->([\s\S]*?)<!-- HTML END -->/;
  const cssRegex = /<!-- CSS START -->([\s\S]*?)<!-- CSS END -->/;
  const jsRegex = /<!-- JS START -->([\s\S]*?)<!-- JS END -->/;

  const htmlMatch = contentStr.match(htmlRegex);
  const cssMatch = contentStr.match(cssRegex);
  const jsMatch = contentStr.match(jsRegex);

  return {
    html: htmlMatch ? htmlMatch[1].trim() : "",
    css: cssMatch ? cssMatch[1].trim() : "",
    js: jsMatch ? jsMatch[1].trim() : "",
  };
}

/**
 * Main code generation function that routes to appropriate generator
 */
export async function generateCode(
  options: CodeGenerationOptions
): Promise<{
  code: string;
  framework: CodeFramework;
  language: "html" | "jsx" | "vue" | "ts" | "svelte";
}> {
  let code = "";
  let language: "html" | "jsx" | "vue" | "ts" | "svelte" = "html";

  switch (options.framework) {
    case "react":
      code = await generateReactCode(
        options.description,
        options.style,
        options.includeTypeScript
      );
      language = "jsx";
      break;

    case "vue":
      code = await generateVueCode(
        options.description,
        options.style,
        options.includeTypeScript
      );
      language = "vue";
      break;

    case "angular":
      code = await generateAngularCode(
        options.description,
        options.style,
        options.includeTypeScript
      );
      language = "ts";
      break;

    case "svelte":
      code = await generateSvelteCode(
        options.description,
        options.style,
        options.includeTypeScript
      );
      language = "svelte";
      break;

    case "nodejs":
      code = await generateNodeJsCode(options.description, options.style);
      language = "ts";
      break;

    case "python":
      code = await generatePythonCode(options.description, options.style);
      language = "ts";
      break;

    case "php":
      code = await generatePHPCode(options.description, options.style);
      language = "ts";
      break;

    case "java":
      code = await generateJavaCode(options.description, options.style);
      language = "ts";
      break;

    case "csharp":
      code = await generateCSharpCode(options.description, options.style);
      language = "ts";
      break;

    case "html":
    default:
      const htmlCode = await generateHTMLCode(options.description, options.style);
      code = `${htmlCode.html}\n\n<style>\n${htmlCode.css}\n</style>\n\n<script>\n${htmlCode.js}\n</script>`;
      language = "html";
      break;
  }

  return { code, framework: options.framework, language };
}

/**
 * Generate package.json dependencies for a framework
 */
export function getFrameworkDependencies(
  framework: CodeFramework,
  includeTypeScript: boolean = true
): Record<string, string> {
  const baseDeps = {
    tailwindcss: "^4.0.0",
  };

  switch (framework) {
    case "react":
      return {
        ...baseDeps,
        react: "^18.0.0",
        "react-dom": "^18.0.0",
        ...(includeTypeScript && {
          "@types/react": "^18.0.0",
          "@types/react-dom": "^18.0.0",
        }),
      };

    case "vue":
      return {
        ...baseDeps,
        vue: "^3.0.0",
        ...(includeTypeScript && {
          typescript: "^5.0.0",
          "vue-tsc": "^1.0.0",
        }),
      };

    case "angular":
      return {
        ...baseDeps,
        "@angular/core": "^17.0.0",
        "@angular/common": "^17.0.0",
        "@angular/platform-browser": "^17.0.0",
        "@angular/platform-browser-dynamic": "^17.0.0",
        typescript: "^5.0.0",
        rxjs: "^7.0.0",
      };

    case "svelte":
      return {
        ...baseDeps,
        svelte: "^4.0.0",
        ...(includeTypeScript && {
          typescript: "^5.0.0",
          "svelte-check": "^3.0.0",
        }),
      };

    case "nodejs":
      return {
        express: "^4.18.0",
        cors: "^2.8.0",
        "body-parser": "^1.20.0",
        typescript: "^5.0.0",
        "@types/express": "^4.17.0",
        "@types/node": "^20.0.0",
      };

    case "python":
      return {
        Flask: "2.3.0",
        "Flask-CORS": "4.0.0",
        marshmallow: "3.19.0",
        "python-dotenv": "1.0.0",
      };

    case "php":
      return {
        laravel: "10.0.0",
        "laravel/cors": "2.0.0",
        "laravel/sanctum": "3.0.0",
      };

    case "java":
      return {
        "spring-boot-starter-web": "3.0.0",
        "spring-boot-starter-data-jpa": "3.0.0",
        "spring-boot-starter-validation": "3.0.0",
        "spring-boot-devtools": "3.0.0",
      };

    case "csharp":
      return {
        "Microsoft.AspNetCore.App": "7.0.0",
        "Microsoft.EntityFrameworkCore": "7.0.0",
        "Microsoft.AspNetCore.Cors": "7.0.0",
      };

    default:
      return baseDeps;
  }
}

/**
 * Get file extension for generated code
 */
export function getFileExtension(
  framework: CodeFramework,
  includeTypeScript: boolean = true
): string {
  switch (framework) {
    case "react":
      return includeTypeScript ? ".tsx" : ".jsx";
    case "vue":
      return ".vue";
    case "angular":
      return ".ts";
    case "svelte":
      return ".svelte";
    case "nodejs":
      return ".ts";
    case "python":
      return ".py";
    case "php":
      return ".php";
    case "java":
      return ".java";
    case "csharp":
      return ".cs";
    case "html":
    default:
      return ".html";
  }
}
