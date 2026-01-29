import { invokeLLM } from "./_core/llm";

interface CodeGenerationRequest {
  description: string;
  style?: "modern" | "minimal" | "corporate" | "creative";
  includeResponsive?: boolean;
}

interface CodeGenerationResponse {
  html: string;
  css: string;
  javascript: string;
  description: string;
}

/**
 * Generate professional HTML/CSS/JS code from description using built-in LLM
 */
export async function generateCodeWithDeepSeek(
  request: CodeGenerationRequest
): Promise<CodeGenerationResponse> {
  const styleGuide = getStyleGuide(request.style || "modern");
  const responsiveNote = request.includeResponsive
    ? "Make sure the design is fully responsive with mobile-first approach."
    : "";

  const prompt = `You are an expert web designer and developer. Create professional, production-ready HTML/CSS/JavaScript code based on this description:

Description: ${request.description}

${styleGuide}

${responsiveNote}

Requirements:
1. Generate clean, semantic HTML5 code
2. Create modern, professional CSS with proper spacing, typography, and colors
3. Add interactive JavaScript if needed (smooth animations, hover effects, form handling)
4. Use CSS Grid or Flexbox for layout
5. Ensure accessibility (ARIA labels, semantic HTML)
6. Include proper color scheme and typography
7. Add smooth transitions and animations where appropriate
8. Make the design visually appealing and professional

Return your response in this exact JSON format (make sure it's valid JSON):
{
  "html": "<complete HTML code here>",
  "css": "<complete CSS code here>",
  "javascript": "<complete JavaScript code here>",
  "description": "Brief description of what was created"
}

Important: Return ONLY valid JSON, no additional text before or after.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an expert web designer and developer. Always return valid JSON with HTML, CSS, and JavaScript code. Return ONLY the JSON, no other text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("No content in LLM response");
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[LLM] Response content:", content);
      throw new Error("Could not extract JSON from LLM response");
    }

    const generatedCode = JSON.parse(jsonMatch[0]);

    // Validate and clean the generated code
    const html = sanitizeHtml(generatedCode.html || "");
    const css = sanitizeCss(generatedCode.css || "");
    const javascript = sanitizeJs(generatedCode.javascript || "");

    return {
      html,
      css,
      javascript,
      description: generatedCode.description || "Generated professional design",
    };
  } catch (error: any) {
    console.error("[Code Generation] Error:", error.message);
    throw new Error(`Failed to generate code: ${error.message}`);
  }
}

/**
 * Get style guide based on selected style
 */
function getStyleGuide(style: string): string {
  const guides: Record<string, string> = {
    modern: `Style Guide - Modern:
- Use a clean, minimalist design with plenty of whitespace
- Color palette: Blues, purples, and grays with accent colors
- Typography: Use modern sans-serif fonts (system fonts preferred)
- Shadows: Subtle box-shadows for depth
- Animations: Smooth transitions and micro-interactions
- Layout: Modern grid-based layout with asymmetric design
- Include hover effects and smooth transitions`,

    minimal: `Style Guide - Minimal:
- Extremely clean and simple design
- Limited color palette (mostly black, white, and one accent color)
- Typography: Large, bold headings with minimal text
- No unnecessary decorations or animations
- Focus on content and readability
- Maximum whitespace and breathing room
- Clean borders and subtle separators`,

    corporate: `Style Guide - Corporate:
- Professional and trustworthy appearance
- Color palette: Blues, grays, and professional accent colors
- Typography: Professional serif or sans-serif fonts
- Structure: Organized, hierarchical layout
- Icons and graphics: Professional, clean icons
- Subtle animations and transitions
- Professional spacing and alignment`,

    creative: `Style Guide - Creative:
- Bold, eye-catching design
- Vibrant color palette with complementary colors
- Typography: Mix of serif and sans-serif for visual interest
- Animations: Smooth, engaging animations and transitions
- Unique layout and creative use of space
- Visual effects and gradients
- Interactive elements and micro-interactions`,
  };

  return guides[style] || guides.modern;
}

/**
 * Sanitize HTML code
 */
function sanitizeHtml(html: string): string {
  // Remove any script tags or event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .trim();
}

/**
 * Sanitize CSS code
 */
function sanitizeCss(css: string): string {
  // Remove any import statements that might be malicious
  return css
    .replace(/@import\s+url\([^)]*\)/gi, "")
    .replace(/expression\s*\([^)]*\)/gi, "")
    .trim();
}

/**
 * Sanitize JavaScript code
 */
function sanitizeJs(js: string): string {
  // Remove any code that might be malicious
  return js
    .replace(/eval\s*\(/gi, "")
    .replace(/document\.write/gi, "")
    .replace(/window\.location/gi, "")
    .trim();
}

/**
 * Test LLM connection
 */
export async function testDeepSeekConnection(): Promise<boolean> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "user",
          content: "Say 'OK' if you can read this.",
        },
      ],
    });

    const content = response.choices?.[0]?.message?.content;
    return typeof content === "string" && content.length > 0;
  } catch (error) {
    console.error("[LLM] Connection test failed:", error);
    return false;
  }
}
