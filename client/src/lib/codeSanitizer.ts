import DOMPurify from "isomorphic-dompurify";
import { z } from "zod";

// Validation schemas
export const htmlSchema = z.string()
  .min(1, "HTML cannot be empty")
  .max(50000, "HTML is too large");

export const cssSchema = z.string()
  .min(0)
  .max(50000, "CSS is too large");

export const jsSchema = z.string()
  .min(0)
  .max(50000, "JavaScript is too large");

// Sanitization options
const sanitizeOptions = {
  ALLOWED_TAGS: [
    "div", "p", "span", "a", "button", "input", "form", "label",
    "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li",
    "table", "tr", "td", "th", "thead", "tbody", "tfoot",
    "img", "video", "audio", "iframe", "canvas", "svg",
    "section", "article", "header", "footer", "nav", "main",
    "aside", "figure", "figcaption", "blockquote", "code", "pre"
  ],
  ALLOWED_ATTR: [
    "class", "id", "style", "data-*", "aria-*",
    "href", "src", "alt", "title", "placeholder",
    "type", "name", "value", "checked", "disabled",
    "width", "height", "viewBox", "xmlns"
  ],
  KEEP_CONTENT: true,
};

// CSS validation - prevent dangerous properties
const dangerousCSSPatterns = [
  /javascript:/gi,
  /expression\s*\(/gi,
  /@import/gi,
  /behavior:/gi,
];

export function sanitizeHTML(html: string): string {
  try {
    htmlSchema.parse(html);
    return DOMPurify.sanitize(html, sanitizeOptions);
  } catch (error) {
    console.error("HTML validation failed:", error);
    return "";
  }
}

export function sanitizeCSS(css: string): string {
  try {
    cssSchema.parse(css);
    
    // Check for dangerous patterns
    for (const pattern of dangerousCSSPatterns) {
      if (pattern.test(css)) {
        throw new Error("Dangerous CSS pattern detected");
      }
    }
    
    return css;
  } catch (error) {
    console.error("CSS validation failed:", error);
    return "";
  }
}

export function sanitizeJavaScript(js: string): string {
  try {
    jsSchema.parse(js);
    
    // Prevent dangerous operations
    const dangerousPatterns = [
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /innerHTML\s*=/gi,
      /document\.write/gi,
      /window\.location/gi,
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(js)) {
        throw new Error("Dangerous JavaScript pattern detected");
      }
    }
    
    return js;
  } catch (error) {
    console.error("JavaScript validation failed:", error);
    return "";
  }
}

export interface CodeValidationResult {
  valid: boolean;
  html: string;
  css: string;
  javascript: string;
  errors: string[];
}

export function validateAndSanitizeCode(
  html: string,
  css: string,
  js: string
): CodeValidationResult {
  const errors: string[] = [];
  
  let sanitizedHTML = "";
  let sanitizedCSS = "";
  let sanitizedJS = "";
  
  try {
    sanitizedHTML = sanitizeHTML(html);
  } catch (error) {
    errors.push(`HTML Error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
  
  try {
    sanitizedCSS = sanitizeCSS(css);
  } catch (error) {
    errors.push(`CSS Error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
  
  try {
    sanitizedJS = sanitizeJavaScript(js);
  } catch (error) {
    errors.push(`JavaScript Error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
  
  return {
    valid: errors.length === 0,
    html: sanitizedHTML,
    css: sanitizedCSS,
    javascript: sanitizedJS,
    errors,
  };
}
