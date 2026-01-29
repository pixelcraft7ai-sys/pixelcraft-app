import { describe, it, expect } from "vitest";
import {
  getFrameworkDependencies,
  getFileExtension,
  type CodeFramework,
} from "./codeGenerators";

describe("Multi-Framework Code Generation", () => {
  // Test 1: React dependencies
  it("should return correct React dependencies", () => {
    const deps = getFrameworkDependencies("react", true);
    expect(deps.react).toBeDefined();
    expect(deps["react-dom"]).toBeDefined();
    expect(deps["@types/react"]).toBeDefined();
  });

  // Test 2: Vue dependencies
  it("should return correct Vue dependencies", () => {
    const deps = getFrameworkDependencies("vue", true);
    expect(deps.vue).toBeDefined();
    expect(deps.typescript).toBeDefined();
  });

  // Test 3: Angular dependencies
  it("should return correct Angular dependencies", () => {
    const deps = getFrameworkDependencies("angular", true);
    expect(deps["@angular/core"]).toBeDefined();
    expect(deps["@angular/common"]).toBeDefined();
    expect(deps.rxjs).toBeDefined();
  });

  // Test 4: Svelte dependencies
  it("should return correct Svelte dependencies", () => {
    const deps = getFrameworkDependencies("svelte", true);
    expect(deps.svelte).toBeDefined();
    expect(deps.typescript).toBeDefined();
  });

  // Test 5: HTML dependencies (minimal)
  it("should return minimal dependencies for HTML", () => {
    const deps = getFrameworkDependencies("html", false);
    expect(deps.tailwindcss).toBeDefined();
    expect(Object.keys(deps).length).toBeLessThan(5);
  });

  // Test 6: React file extension with TypeScript
  it("should return .tsx for React with TypeScript", () => {
    const ext = getFileExtension("react", true);
    expect(ext).toBe(".tsx");
  });

  // Test 7: React file extension without TypeScript
  it("should return .jsx for React without TypeScript", () => {
    const ext = getFileExtension("react", false);
    expect(ext).toBe(".jsx");
  });

  // Test 8: Vue file extension
  it("should return .vue for Vue", () => {
    const ext = getFileExtension("vue", true);
    expect(ext).toBe(".vue");
  });

  // Test 9: Angular file extension
  it("should return .ts for Angular", () => {
    const ext = getFileExtension("angular", true);
    expect(ext).toBe(".ts");
  });

  // Test 10: Svelte file extension
  it("should return .svelte for Svelte", () => {
    const ext = getFileExtension("svelte", true);
    expect(ext).toBe(".svelte");
  });

  // Test 11: HTML file extension
  it("should return .html for HTML", () => {
    const ext = getFileExtension("html", false);
    expect(ext).toBe(".html");
  });

  // Test 12: Framework comparison
  it("should have different dependencies for different frameworks", () => {
    const reactDeps = getFrameworkDependencies("react", true);
    const vueDeps = getFrameworkDependencies("vue", true);
    expect(reactDeps).not.toEqual(vueDeps);
  });

  // Test 13: TypeScript support for React
  it("should include TypeScript types for React when enabled", () => {
    const withTS = getFrameworkDependencies("react", true);
    const withoutTS = getFrameworkDependencies("react", false);
    expect(withTS["@types/react"]).toBeDefined();
    expect(withoutTS["@types/react"]).toBeUndefined();
  });

  // Test 14: TypeScript support for Vue
  it("should include TypeScript for Vue when enabled", () => {
    const withTS = getFrameworkDependencies("vue", true);
    const withoutTS = getFrameworkDependencies("vue", false);
    expect(withTS.typescript).toBeDefined();
    expect(withoutTS.typescript).toBeUndefined();
  });

  // Test 15: All frameworks have Tailwind
  it("should include Tailwind CSS for all frameworks", () => {
    const frameworks: CodeFramework[] = ["react", "vue", "angular", "svelte", "html"];
    frameworks.forEach((framework) => {
      const deps = getFrameworkDependencies(framework, true);
      expect(deps.tailwindcss).toBeDefined();
    });
  });

  // Test 16: React has more dependencies
  it("should have more dependencies for React than HTML", () => {
    const reactDeps = getFrameworkDependencies("react", true);
    const htmlDeps = getFrameworkDependencies("html", false);
    expect(Object.keys(reactDeps).length).toBeGreaterThan(
      Object.keys(htmlDeps).length
    );
  });

  // Test 17: Angular has RxJS
  it("should include RxJS for Angular", () => {
    const deps = getFrameworkDependencies("angular", true);
    expect(deps.rxjs).toBeDefined();
  });

  // Test 18: Vue has vue-tsc
  it("should include vue-tsc for Vue with TypeScript", () => {
    const deps = getFrameworkDependencies("vue", true);
    expect(deps["vue-tsc"]).toBeDefined();
  });

  // Test 19: Svelte has svelte-check
  it("should include svelte-check for Svelte with TypeScript", () => {
    const deps = getFrameworkDependencies("svelte", true);
    expect(deps["svelte-check"]).toBeDefined();
  });

  // Test 20: React DOM is paired with React
  it("should include react-dom when React is included", () => {
    const deps = getFrameworkDependencies("react", true);
    expect(deps.react).toBeDefined();
    expect(deps["react-dom"]).toBeDefined();
  });

  // Test 21: Angular platform dependencies
  it("should include Angular platform dependencies", () => {
    const deps = getFrameworkDependencies("angular", true);
    expect(deps["@angular/platform-browser"]).toBeDefined();
    expect(deps["@angular/platform-browser-dynamic"]).toBeDefined();
  });

  // Test 22: Version consistency
  it("should use consistent versions across frameworks", () => {
    const reactDeps = getFrameworkDependencies("react", true);
    const vueDeps = getFrameworkDependencies("vue", true);
    expect(reactDeps.tailwindcss).toBe(vueDeps.tailwindcss);
  });

  // Test 23: Framework detection by extension
  it("should correctly identify framework by file extension", () => {
    const extensions = {
      react: ".tsx",
      vue: ".vue",
      angular: ".ts",
      svelte: ".svelte",
      html: ".html",
    };

    Object.entries(extensions).forEach(([framework, ext]) => {
      const result = getFileExtension(framework as CodeFramework, true);
      expect(result).toBe(ext);
    });
  });

  // Test 24: TypeScript optional for React and Svelte
  it("should make TypeScript optional for React and Svelte", () => {
    const reactWithoutTS = getFileExtension("react", false);
    const svelteWithoutTS = getFileExtension("svelte", false);
    expect(reactWithoutTS).toBe(".jsx");
    expect(svelteWithoutTS).toBe(".svelte");
  });

  // Test 25: All frameworks supported
  it("should support all major frameworks", () => {
    const frameworks: CodeFramework[] = ["react", "vue", "angular", "svelte", "html"];
    frameworks.forEach((framework) => {
      const deps = getFrameworkDependencies(framework, true);
      expect(Object.keys(deps).length).toBeGreaterThan(0);
    });
  });

  // Test 26: Dependencies are strings
  it("should return version strings for all dependencies", () => {
    const deps = getFrameworkDependencies("react", true);
    Object.values(deps).forEach((version) => {
      expect(typeof version).toBe("string");
      expect(version).toMatch(/^\^/);
    });
  });

  // Test 27: No empty dependencies
  it("should not return empty dependency objects", () => {
    const frameworks: CodeFramework[] = ["react", "vue", "angular", "svelte", "html"];
    frameworks.forEach((framework) => {
      const deps = getFrameworkDependencies(framework, true);
      expect(Object.keys(deps).length).toBeGreaterThan(0);
    });
  });

  // Test 28: Angular always TypeScript
  it("should always use TypeScript for Angular", () => {
    const depsWithTS = getFrameworkDependencies("angular", true);
    const depsWithoutTS = getFrameworkDependencies("angular", false);
    expect(depsWithTS.typescript).toBeDefined();
    expect(depsWithoutTS.typescript).toBeDefined();
  });

  // Test 29: Framework-specific packages
  it("should include framework-specific packages", () => {
    const reactDeps = getFrameworkDependencies("react", true);
    const vueDeps = getFrameworkDependencies("vue", true);
    expect(reactDeps.react).toBeDefined();
    expect(vueDeps.vue).toBeDefined();
    expect(reactDeps.vue).toBeUndefined();
    expect(vueDeps.react).toBeUndefined();
  });

  // Test 30: Common dependencies
  it("should include common dependencies like Tailwind", () => {
    const frameworks: CodeFramework[] = ["react", "vue", "angular", "svelte", "html"];
    frameworks.forEach((framework) => {
      const deps = getFrameworkDependencies(framework, true);
      expect(deps.tailwindcss).toBeDefined();
    });
  });
});
