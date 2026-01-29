import { describe, it, expect } from "vitest";
import {
  generateLinkedHTML,
  generateEnhancedCSS,
  generateEnhancedJS,
  generatePackageJson,
  generateReadme,
  generateGitignore,
  generateDockerfile,
  generateCompleteProject,
} from "../client/src/lib/enhancedCodeGenerator";

describe("Enhanced Code Generation with File Linking", () => {
  const testProjectName = "test-project";
  const testHTML = "<h1>Test</h1>";
  const testCSS = "body { color: blue; }";
  const testJS = "console.log('test');";

  describe("HTML Generation with Linking", () => {
    it("should generate HTML with proper CSS link", () => {
      const html = generateLinkedHTML(testHTML, "style.css", "script.js");
      expect(html).toContain('<link rel="stylesheet" href="style.css">');
      expect(html).toContain("<h1>Test</h1>");
    });

    it("should generate HTML with proper JS script tag", () => {
      const html = generateLinkedHTML(testHTML, "style.css", "script.js");
      expect(html).toContain('<script src="script.js"></script>');
    });

    it("should include proper meta tags", () => {
      const html = generateLinkedHTML(testHTML);
      expect(html).toContain('charset="UTF-8"');
      expect(html).toContain('name="viewport"');
      expect(html).toContain("<!DOCTYPE html>");
    });

    it("should include Google Fonts link", () => {
      const html = generateLinkedHTML(testHTML);
      expect(html).toContain("fonts.googleapis.com");
      expect(html).toContain("Cairo");
    });

    it("should have RTL support", () => {
      const html = generateLinkedHTML(testHTML);
      expect(html).toContain('dir="rtl"');
      expect(html).toContain('lang="ar"');
    });
  });

  describe("CSS Generation with Enhancements", () => {
    it("should include CSS variables", () => {
      const css = generateEnhancedCSS(testCSS);
      expect(css).toContain("--primary-color");
      expect(css).toContain("--secondary-color");
      expect(css).toContain("--text-primary");
    });

    it("should include utility classes", () => {
      const css = generateEnhancedCSS(testCSS);
      expect(css).toContain(".container");
      expect(css).toContain(".btn");
      expect(css).toContain(".card");
    });

    it("should include responsive design", () => {
      const css = generateEnhancedCSS(testCSS);
      expect(css).toContain("@media");
      expect(css).toContain("768px");
    });

    it("should include smooth transitions", () => {
      const css = generateEnhancedCSS(testCSS);
      expect(css).toContain("transition");
      expect(css).toContain("0.3s ease");
    });

    it("should preserve custom CSS", () => {
      const css = generateEnhancedCSS(testCSS);
      expect(css).toContain(testCSS);
    });
  });

  describe("JavaScript Generation with Utilities", () => {
    it("should include utility functions", () => {
      const js = generateEnhancedJS(testJS);
      expect(js).toContain("utils.ready");
      expect(js).toContain("utils.select");
      expect(js).toContain("utils.on");
    });

    it("should use strict mode", () => {
      const js = generateEnhancedJS(testJS);
      expect(js).toContain("'use strict'");
    });

    it("should initialize on DOM ready", () => {
      const js = generateEnhancedJS(testJS);
      expect(js).toContain("DOMContentLoaded");
    });

    it("should export utilities for modules", () => {
      const js = generateEnhancedJS(testJS);
      expect(js).toContain("module.exports");
    });

    it("should preserve custom JavaScript", () => {
      const js = generateEnhancedJS(testJS);
      expect(js).toContain(testJS);
    });
  });

  describe("Package.json Generation", () => {
    it("should generate valid JSON", () => {
      const json = generatePackageJson(testProjectName);
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it("should include project metadata", () => {
      const json = JSON.parse(generatePackageJson(testProjectName));
      expect(json.name).toBeDefined();
      expect(json.version).toBe("1.0.0");
      expect(json.description).toContain("PixelCraft");
    });

    it("should include npm scripts", () => {
      const json = JSON.parse(generatePackageJson(testProjectName));
      expect(json.scripts.start).toBeDefined();
      expect(json.scripts.dev).toBeDefined();
      expect(json.scripts.build).toBeDefined();
    });

    it("should include dependencies", () => {
      const json = JSON.parse(generatePackageJson(testProjectName));
      expect(json.devDependencies["http-server"]).toBeDefined();
    });
  });

  describe("README Generation", () => {
    it("should include project title", () => {
      const readme = generateReadme(testProjectName);
      expect(readme).toContain(testProjectName);
    });

    it("should include PixelCraft attribution", () => {
      const readme = generateReadme(testProjectName);
      expect(readme).toContain("PixelCraft");
    });

    it("should include installation instructions", () => {
      const readme = generateReadme(testProjectName);
      expect(readme).toContain("Installation");
      expect(readme).toContain("npm install");
    });

    it("should include project structure", () => {
      const readme = generateReadme(testProjectName);
      expect(readme).toContain("Project Structure");
      expect(readme).toContain("index.html");
    });

    it("should include deployment instructions", () => {
      const readme = generateReadme(testProjectName);
      expect(readme).toContain("Deployment");
      expect(readme).toContain("Vercel");
      expect(readme).toContain("Netlify");
    });
  });

  describe("Gitignore Generation", () => {
    it("should ignore node_modules", () => {
      const gitignore = generateGitignore();
      expect(gitignore).toContain("node_modules");
    });

    it("should ignore environment files", () => {
      const gitignore = generateGitignore();
      expect(gitignore).toContain(".env");
    });

    it("should ignore IDE files", () => {
      const gitignore = generateGitignore();
      expect(gitignore).toContain(".vscode");
      expect(gitignore).toContain(".idea");
    });

    it("should ignore build artifacts", () => {
      const gitignore = generateGitignore();
      expect(gitignore).toContain("dist");
      expect(gitignore).toContain("build");
    });
  });

  describe("Dockerfile Generation", () => {
    it("should use Node.js alpine image", () => {
      const dockerfile = generateDockerfile();
      expect(dockerfile).toContain("FROM node:18-alpine");
    });

    it("should set working directory", () => {
      const dockerfile = generateDockerfile();
      expect(dockerfile).toContain("WORKDIR /app");
    });

    it("should expose port 8000", () => {
      const dockerfile = generateDockerfile();
      expect(dockerfile).toContain("EXPOSE 8000");
    });

    it("should include npm commands", () => {
      const dockerfile = generateDockerfile();
      expect(dockerfile).toContain("npm install");
      expect(dockerfile).toContain("npm start");
    });
  });

  describe("Complete Project Generation", () => {
    it("should generate all required files", () => {
      const project = generateCompleteProject(
        "Test Project",
        testHTML,
        testCSS,
        testJS,
        testProjectName
      );

      expect(project.html).toBeDefined();
      expect(project.css).toBeDefined();
      expect(project.javascript).toBeDefined();
      expect(project.packageJson).toBeDefined();
      expect(project.readme).toBeDefined();
      expect(project.gitignore).toBeDefined();
      expect(project.dockerfile).toBeDefined();
    });

    it("should link HTML to CSS and JS", () => {
      const project = generateCompleteProject(
        "Test Project",
        testHTML,
        testCSS,
        testJS,
        testProjectName
      );

      expect(project.html).toContain("style.css");
      expect(project.html).toContain("script.js");
    });

    it("should include proper file structure", () => {
      const project = generateCompleteProject(
        "Test Project",
        testHTML,
        testCSS,
        testJS,
        testProjectName
      );

      const readme = project.readme || "";
      expect(readme).toContain("index.html");
      expect(readme).toContain("style.css");
      expect(readme).toContain("script.js");
    });

    it("should generate valid JSON files", () => {
      const project = generateCompleteProject(
        "Test Project",
        testHTML,
        testCSS,
        testJS,
        testProjectName
      );

      expect(() => JSON.parse(project.packageJson || "{}")).not.toThrow();
    });
  });

  describe("File Linking Integrity", () => {
    it("should maintain file references consistency", () => {
      const project = generateCompleteProject(
        "Test Project",
        testHTML,
        testCSS,
        testJS,
        testProjectName
      );

      // HTML should reference CSS and JS
      expect(project.html).toContain("style.css");
      expect(project.html).toContain("script.js");

      // CSS should be valid
      expect(project.css).toContain(":root");
      expect(project.css).toContain("body");

      // JS should have utilities
      expect(project.javascript).toContain("utils");
    });

    it("should include all necessary imports", () => {
      const project = generateCompleteProject(
        "Test Project",
        testHTML,
        testCSS,
        testJS,
        testProjectName
      );

      expect(project.javascript).toContain("'use strict'");
      expect(project.html).toContain("<!DOCTYPE html>");
      expect(project.css).toContain("@media");
    });
  });
});
