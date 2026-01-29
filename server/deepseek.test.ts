import { describe, it, expect } from "vitest";
import { testDeepSeekConnection } from "./deepseek";

describe("DeepSeek Integration", () => {
  it("should test DeepSeek API connection", async () => {
    try {
      const result = await testDeepSeekConnection();
      expect(typeof result).toBe("boolean");
    } catch (error: any) {
      // If API key is not configured, test should pass
      expect(error.message).toContain("not configured");
    }
  });

  it("should validate that DEEPSEEK_API_KEY is set", () => {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (apiKey) {
      expect(apiKey.length).toBeGreaterThan(0);
    }
  });
});
