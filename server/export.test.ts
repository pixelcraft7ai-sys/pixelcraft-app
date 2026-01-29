import { describe, it, expect, beforeEach } from "vitest";
import { createProjectZip, generateProjectFilename, getExportFileExtension } from "./exportService";
import type { CodeFramework } from "./codeGenerators";

describe("Export Service", () => {
  describe("createProjectZip", () => {
    it("should create a ZIP file for React project", async () => {
      const zipBuffer = await createProjectZip({
        projectName: "Test React App",
        code: "export default function App() { return <div>Hello</div> }",
        framework: "react",
        description: "A test React application",
        includeTypeScript: true,
      });

      expect(zipBuffer).toBeInstanceOf(Buffer);
      expect(zipBuffer.length).toBeGreaterThan(0);
      // ZIP files start with PK signature
      expect(zipBuffer[0]).toBe(0x50); // 'P'
      expect(zipBuffer[1]).toBe(0x4b); // 'K'
    });

    it("should create a ZIP file for Vue project", async () => {
      const zipBuffer = await createProjectZip({
        projectName: "Test Vue App",
        code: "<template><div>Hello</div></template>",
        framework: "vue",
        description: "A test Vue application",
        includeTypeScript: true,
      });

      expect(zipBuffer).toBeInstanceOf(Buffer);
      expect(zipBuffer.length).toBeGreaterThan(0);
      expect(zipBuffer[0]).toBe(0x50);
      expect(zipBuffer[1]).toBe(0x4b);
    });

    it("should create a ZIP file for Angular project", async () => {
      const zipBuffer = await createProjectZip({
        projectName: "Test Angular App",
        code: "export class AppComponent {}",
        framework: "angular",
        description: "A test Angular application",
        includeTypeScript: true,
      });

      expect(zipBuffer).toBeInstanceOf(Buffer);
      expect(zipBuffer.length).toBeGreaterThan(0);
      expect(zipBuffer[0]).toBe(0x50);
      expect(zipBuffer[1]).toBe(0x4b);
    });

    it("should create a ZIP file for Svelte project", async () => {
      const zipBuffer = await createProjectZip({
        projectName: "Test Svelte App",
        code: "<h1>Hello</h1>",
        framework: "svelte",
        description: "A test Svelte application",
        includeTypeScript: true,
      });

      expect(zipBuffer).toBeInstanceOf(Buffer);
      expect(zipBuffer.length).toBeGreaterThan(0);
      expect(zipBuffer[0]).toBe(0x50);
      expect(zipBuffer[1]).toBe(0x4b);
    });

    it("should create a ZIP file for HTML project", async () => {
      const zipBuffer = await createProjectZip({
        projectName: "Test HTML App",
        code: "<div>Hello</div>",
        framework: "html",
        description: "A test HTML application",
        includeTypeScript: false,
      });

      expect(zipBuffer).toBeInstanceOf(Buffer);
      expect(zipBuffer.length).toBeGreaterThan(0);
      expect(zipBuffer[0]).toBe(0x50);
      expect(zipBuffer[1]).toBe(0x4b);
    });

    it("should include package.json in ZIP", async () => {
      const zipBuffer = await createProjectZip({
        projectName: "Test App",
        code: "console.log('test')",
        framework: "react",
        description: "Test",
        includeTypeScript: true,
      });

      // Check if package.json is in the ZIP (simplified check)
      const zipString = zipBuffer.toString("binary");
      expect(zipString).toContain("package.json");
    });

    it("should include README.md in ZIP", async () => {
      const zipBuffer = await createProjectZip({
        projectName: "Test App",
        code: "console.log('test')",
        framework: "react",
        description: "Test Description",
        includeTypeScript: true,
      });

      const zipString = zipBuffer.toString("binary");
      expect(zipString).toContain("README.md");
      expect(zipString).toContain("Test Description");
    });

    it("should include .gitignore in ZIP", async () => {
      const zipBuffer = await createProjectZip({
        projectName: "Test App",
        code: "console.log('test')",
        framework: "react",
        description: "Test",
        includeTypeScript: true,
      });

      const zipString = zipBuffer.toString("binary");
      expect(zipString).toContain(".gitignore");
    });

    it("should include tsconfig.json for TypeScript projects", async () => {
      const zipBuffer = await createProjectZip({
        projectName: "Test App",
        code: "console.log('test')",
        framework: "react",
        description: "Test",
        includeTypeScript: true,
      });

      const zipString = zipBuffer.toString("binary");
      expect(zipString).toContain("tsconfig.json");
    });

    it("should include vite.config.ts in ZIP", async () => {
      const zipBuffer = await createProjectZip({
        projectName: "Test App",
        code: "console.log('test')",
        framework: "react",
        description: "Test",
        includeTypeScript: true,
      });

      const zipString = zipBuffer.toString("binary");
      expect(zipString).toContain("vite.config.ts");
    });

    it("should include index.html in ZIP", async () => {
      const zipBuffer = await createProjectZip({
        projectName: "Test App",
        code: "console.log('test')",
        framework: "react",
        description: "Test",
        includeTypeScript: true,
      });

      const zipString = zipBuffer.toString("binary");
      expect(zipString).toContain("index.html");
    });

    it("should include src/main.tsx in ZIP", async () => {
      const zipBuffer = await createProjectZip({
        projectName: "Test App",
        code: "console.log('test')",
        framework: "react",
        description: "Test",
        includeTypeScript: true,
      });

      const zipString = zipBuffer.toString("binary");
      expect(zipString).toContain("main.tsx");
    });

    it("should include src/index.css in ZIP", async () => {
      const zipBuffer = await createProjectZip({
        projectName: "Test App",
        code: "console.log('test')",
        framework: "react",
        description: "Test",
        includeTypeScript: true,
      });

      const zipString = zipBuffer.toString("binary");
      expect(zipString).toContain("index.css");
    });

    it("should handle special characters in project name", async () => {
      const zipBuffer = await createProjectZip({
        projectName: "Test App @#$",
        code: "console.log('test')",
        framework: "react",
        description: "Test",
        includeTypeScript: true,
      });

      expect(zipBuffer).toBeInstanceOf(Buffer);
      expect(zipBuffer.length).toBeGreaterThan(0);
    });

    it("should handle long project names", async () => {
      const longName = "A".repeat(100);
      const zipBuffer = await createProjectZip({
        projectName: longName,
        code: "console.log('test')",
        framework: "react",
        description: "Test",
        includeTypeScript: true,
      });

      expect(zipBuffer).toBeInstanceOf(Buffer);
      expect(zipBuffer.length).toBeGreaterThan(0);
    });

    it("should handle empty description", async () => {
      const zipBuffer = await createProjectZip({
        projectName: "Test App",
        code: "console.log('test')",
        framework: "react",
        description: "",
        includeTypeScript: true,
      });

      expect(zipBuffer).toBeInstanceOf(Buffer);
      expect(zipBuffer.length).toBeGreaterThan(0);
    });
  });

  describe("generateProjectFilename", () => {
    it("should generate filename with .zip extension", () => {
      const filename = generateProjectFilename("My Project");
      expect(filename.endsWith(".zip")).toBe(true);
    });

    it("should convert spaces to hyphens", () => {
      const filename = generateProjectFilename("My Test Project");
      expect(filename).toContain("my-test-project");
    });

    it("should convert to lowercase", () => {
      const filename = generateProjectFilename("MyProject");
      expect(filename).toContain("myproject");
    });

    it("should include pixelcraft suffix", () => {
      const filename = generateProjectFilename("My Project");
      expect(filename).toContain("pixelcraft");
    });

    it("should handle special characters", () => {
      const filename = generateProjectFilename("My@Project#Test");
      expect(filename.endsWith(".zip")).toBe(true);
      expect(filename).toContain("pixelcraft");
    });
  });

  describe("getExportFileExtension", () => {
    it("should return .vue for Vue framework", () => {
      expect(getExportFileExtension("vue")).toBe(".vue");
    });

    it("should return .svelte for Svelte framework", () => {
      expect(getExportFileExtension("svelte")).toBe(".svelte");
    });

    it("should return .ts for Angular framework", () => {
      expect(getExportFileExtension("angular")).toBe(".ts");
    });

    it("should return .tsx for React framework", () => {
      expect(getExportFileExtension("react")).toBe(".tsx");
    });

    it("should return .tsx for HTML framework (default)", () => {
      expect(getExportFileExtension("html")).toBe(".tsx");
    });

    it("should return .tsx for unknown framework", () => {
      expect(getExportFileExtension("unknown" as CodeFramework)).toBe(".tsx");
    });
  });
});
