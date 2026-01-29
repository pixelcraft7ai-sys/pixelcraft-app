import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { generateCodeWithDeepSeek, testDeepSeekConnection } from "./deepseek";

export const codeGenerationRouter = router({
  /**
   * Generate professional code from description using DeepSeek
   */
  generateFromDescription: protectedProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      if (typeof obj.description !== "string") throw new Error("description must be string");
      return {
        description: obj.description,
        style: (obj.style as string) || "modern",
        includeResponsive: (obj.includeResponsive as boolean) || true,
      };
    })
    .mutation(async ({ input }: any) => {
      try {
        const result = await generateCodeWithDeepSeek({
          description: input.description,
          style: input.style,
          includeResponsive: input.includeResponsive,
        });

        return {
          success: true,
          data: result,
        };
      } catch (error: any) {
        console.error("[Code Generation] Error:", error);
        throw new Error(`Failed to generate code: ${error.message}`);
      }
    }),

  /**
   * Test DeepSeek API connection
   */
  testConnection: publicProcedure.query(async () => {
    try {
      const isConnected = await testDeepSeekConnection();
      return {
        connected: isConnected,
        message: isConnected ? "DeepSeek API is connected" : "Failed to connect to DeepSeek API",
      };
    } catch (error: any) {
      return {
        connected: false,
        message: error.message,
      };
    }
  }),

  /**
   * Get available design styles
   */
  getStyles: publicProcedure.query(() => {
    return [
      {
        id: "modern",
        name: "Modern",
        description: "Clean, minimalist design with modern aesthetics",
      },
      {
        id: "minimal",
        name: "Minimal",
        description: "Extremely simple and focused design",
      },
      {
        id: "corporate",
        name: "Corporate",
        description: "Professional and trustworthy appearance",
      },
      {
        id: "creative",
        name: "Creative",
        description: "Bold and eye-catching design",
      },
    ];
  }),
});
