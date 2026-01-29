import { describe, it, expect } from "vitest";
import { generateCodeForLanguage } from "../client/src/lib/multiLanguageCodeGenerator";

describe("Multi-Language Code Generation", () => {
  const testDescription = "Test Project";

  describe("Frontend Languages", () => {
    it("should generate HTML/CSS code", () => {
      const result = generateCodeForLanguage(testDescription, "html");
      expect(result.html).toBeDefined();
      expect(result.css).toBeDefined();
      expect(result.javascript).toBeDefined();
      expect(result.html).toContain(testDescription);
    });

    it("should generate React code with package.json", () => {
      const result = generateCodeForLanguage(testDescription, "react");
      expect(result.javascript).toBeDefined();
      expect(result.packageJson).toBeDefined();
      expect(result.javascript).toContain("React");
      expect(JSON.parse(result.packageJson!).dependencies.react).toBeDefined();
    });

    it("should generate Vue code with package.json", () => {
      const result = generateCodeForLanguage(testDescription, "vue");
      expect(result.javascript).toBeDefined();
      expect(result.packageJson).toBeDefined();
      expect(result.javascript).toContain("Vue");
      expect(JSON.parse(result.packageJson!).dependencies.vue).toBeDefined();
    });

    it("should generate Angular code with package.json", () => {
      const result = generateCodeForLanguage(testDescription, "angular");
      expect(result.javascript).toBeDefined();
      expect(result.packageJson).toBeDefined();
      expect(result.javascript).toContain("@angular/core");
      expect(JSON.parse(result.packageJson!).dependencies["@angular/core"]).toBeDefined();
    });

    it("should generate Svelte code with package.json", () => {
      const result = generateCodeForLanguage(testDescription, "svelte");
      expect(result.javascript).toBeDefined();
      expect(result.packageJson).toBeDefined();
      expect(result.javascript).toContain("Svelte");
      expect(JSON.parse(result.packageJson!).devDependencies.svelte).toBeDefined();
    });
  });

  describe("Backend Languages", () => {
    it("should generate Python/Flask code with requirements.txt", () => {
      const result = generateCodeForLanguage(testDescription, "python");
      expect(result.python).toBeDefined();
      expect(result.requirements).toBeDefined();
      expect(result.python).toContain("Flask");
      expect(result.requirements).toContain("Flask");
    });

    it("should generate Node.js/Express code with package.json", () => {
      const result = generateCodeForLanguage(testDescription, "nodejs");
      expect(result.nodejs).toBeDefined();
      expect(result.packageJson).toBeDefined();
      expect(result.nodejs).toContain("express");
      expect(JSON.parse(result.packageJson!).dependencies.express).toBeDefined();
    });

    it("should generate PHP code with composer.json", () => {
      const result = generateCodeForLanguage(testDescription, "php");
      expect(result.php).toBeDefined();
      expect(result.composerJson).toBeDefined();
      expect(result.php).toContain("<?php");
      expect(JSON.parse(result.composerJson!).name).toBeDefined();
    });

    it("should generate Java code with pom.xml", () => {
      const result = generateCodeForLanguage(testDescription, "java");
      expect(result.java).toBeDefined();
      expect(result.pomXml).toBeDefined();
      expect(result.java).toContain("public class");
      expect(result.pomXml).toContain("<?xml");
    });

    it("should generate C# code with .csproj", () => {
      const result = generateCodeForLanguage(testDescription, "csharp");
      expect(result.csharp).toBeDefined();
      expect(result.csprojXml).toBeDefined();
      expect(result.csharp).toContain("class Program");
      expect(result.csprojXml).toContain("<Project");
    });
  });

  describe("Code Quality", () => {
    it("should include project description in generated code", () => {
      const languages = ["html", "react", "vue", "python", "nodejs", "php", "java", "csharp"] as const;
      
      languages.forEach((lang) => {
        const result = generateCodeForLanguage(testDescription, lang);
        const allCode = Object.values(result).join(" ");
        expect(allCode).toContain(testDescription);
      });
    });

    it("should generate valid JSON for package.json and composer.json", () => {
      const reactResult = generateCodeForLanguage(testDescription, "react");
      expect(() => JSON.parse(reactResult.packageJson!)).not.toThrow();

      const phpResult = generateCodeForLanguage(testDescription, "php");
      expect(() => JSON.parse(phpResult.composerJson!)).not.toThrow();
    });

    it("should generate valid XML for pom.xml and .csproj", () => {
      const javaResult = generateCodeForLanguage(testDescription, "java");
      expect(javaResult.pomXml).toContain("<?xml");
      expect(javaResult.pomXml).toContain("</project>");

      const csharpResult = generateCodeForLanguage(testDescription, "csharp");
      expect(csharpResult.csprojXml).toContain("<Project");
      expect(csharpResult.csprojXml).toContain("</Project>");
    });

    it("should include proper imports and dependencies", () => {
      const reactResult = generateCodeForLanguage(testDescription, "react");
      expect(reactResult.javascript).toContain("import React");

      const pythonResult = generateCodeForLanguage(testDescription, "python");
      expect(pythonResult.python).toContain("from flask import");

      const nodeResult = generateCodeForLanguage(testDescription, "nodejs");
      expect(nodeResult.nodejs).toContain("require('express')");
    });
  });

  describe("Language-Specific Features", () => {
    it("React should use JSX syntax", () => {
      const result = generateCodeForLanguage(testDescription, "react");
      expect(result.javascript).toContain("<div");
      expect(result.javascript).toContain("className");
    });

    it("Vue should use template syntax", () => {
      const result = generateCodeForLanguage(testDescription, "vue");
      expect(result.javascript).toContain("<template>");
      expect(result.javascript).toContain("<script setup>");
    });

    it("Python should use proper indentation", () => {
      const result = generateCodeForLanguage(testDescription, "python");
      expect(result.python).toContain("def ");
      expect(result.python).toContain("    ");
    });

    it("Java should use proper class structure", () => {
      const result = generateCodeForLanguage(testDescription, "java");
      expect(result.java).toContain("public class");
      expect(result.java).toContain("public static void main");
    });

    it("C# should use proper namespace structure", () => {
      const result = generateCodeForLanguage(testDescription, "csharp");
      expect(result.csharp).toContain("class Program");
      expect(result.csharp).toContain("static void Main");
    });
  });
});
