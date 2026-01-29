/**
 * Mock code generator that transforms structured descriptions into HTML/CSS/JS
 * This is a simplified version that demonstrates the concept
 */

interface GeneratedCode {
  html: string;
  css: string;
  js: string;
}

/**
 * Parse a structured description and generate HTML/CSS/JS
 * Supports basic format like:
 * - Element type (div, button, input, h1, etc.)
 * - Dimensions (width, height)
 * - Colors and styling
 * - Text content
 */
export function generateCodeFromDescription(description: string): GeneratedCode {
  // Extract basic information from the description
  const lines = description.split("\n").filter(line => line.trim());
  
  let html = '<div class="container">\n';
  let css = `
.container {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
`;
  let js = `
// Interactive elements
document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', function() {
    console.log('Button clicked:', this.textContent);
  });
});
`;

  // Simple parsing logic - extract common patterns
  let bgColor = "#ffffff";
  let textColor = "#333333";
  let elementCount = 0;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Extract background color
    if (lowerLine.includes("background") || lowerLine.includes("خلفية")) {
      const colorMatch = line.match(/#[0-9a-f]{6}/i);
      if (colorMatch) bgColor = colorMatch[0];
    }
    
    // Extract text color
    if (lowerLine.includes("color") || lowerLine.includes("لون")) {
      const colorMatch = line.match(/#[0-9a-f]{6}/i);
      if (colorMatch) textColor = colorMatch[0];
    }

    // Create elements based on keywords
    if (lowerLine.includes("button") || lowerLine.includes("زر")) {
      const text = extractText(line);
      html += `  <button class="btn">${text || "Click me"}</button>\n`;
      if (!css.includes(".btn")) {
        css += `
.btn {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin: 10px 0;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #2980b9;
}
`;
      }
      elementCount++;
    }
    
    if (lowerLine.includes("input") || lowerLine.includes("حقل")) {
      const placeholder = extractPlaceholder(line);
      html += `  <input type="text" class="input-field" placeholder="${placeholder || "Enter text..."}" />\n`;
      if (!css.includes(".input-field")) {
        css += `
.input-field {
  width: 100%;
  max-width: 400px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  margin: 10px 0;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
}
`;
      }
      elementCount++;
    }

    if (lowerLine.includes("heading") || lowerLine.includes("h1") || lowerLine.includes("عنوان")) {
      const text = extractText(line);
      html += `  <h1 class="heading">${text || "Heading"}</h1>\n`;
      if (!css.includes(".heading")) {
        css += `
.heading {
  font-size: 32px;
  font-weight: bold;
  margin: 20px 0;
  color: ${textColor};
}
`;
      }
      elementCount++;
    }

    if (lowerLine.includes("paragraph") || lowerLine.includes("text") || lowerLine.includes("فقرة")) {
      const text = extractText(line);
      html += `  <p class="paragraph">${text || "This is a paragraph of text."}</p>\n`;
      if (!css.includes(".paragraph")) {
        css += `
.paragraph {
  font-size: 16px;
  line-height: 1.6;
  color: ${textColor};
  margin: 15px 0;
}
`;
      }
      elementCount++;
    }
  }

  // Add container styling
  css += `
.container {
  background-color: ${bgColor};
  color: ${textColor};
}
`;

  html += "</div>";

  // If no elements were created, add a default message
  if (elementCount === 0) {
    html = `<div class="container">
  <h1 class="heading">Welcome to PixelCraft</h1>
  <p class="paragraph">Your structured description will be converted to code here.</p>
  <p class="paragraph">Try describing elements like: button, input field, heading, or paragraph.</p>
</div>`;
  }

  return { html, css, js };
}

/**
 * Extract text content from a line
 */
function extractText(line: string): string {
  // Look for text between quotes
  const quoted = line.match(/"([^"]*)"|'([^']*)'/);
  if (quoted) {
    return quoted[1] || quoted[2] || "";
  }
  
  // Or extract after a colon
  const afterColon = line.split(":").pop();
  if (afterColon) {
    return afterColon.trim().split(/[,\.]/).shift() || "";
  }
  
  return "";
}

/**
 * Extract placeholder text from a line
 */
function extractPlaceholder(line: string): string {
  const placeholderMatch = line.match(/placeholder[:\s]+["']([^"']*)["']/i);
  if (placeholderMatch) {
    return placeholderMatch[1];
  }
  
  const arabicMatch = line.match(/نص المساعدة[:\s]+["']([^"']*)["']/i);
  if (arabicMatch) {
    return arabicMatch[1];
  }
  
  return "";
}
