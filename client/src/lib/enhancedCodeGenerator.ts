import type { ProgrammingLanguage } from "@/components/ProgrammingLanguageSelector";

export interface LinkedProject {
  html: string;
  css: string;
  javascript: string;
  packageJson?: string;
  readme?: string;
  gitignore?: string;
  indexJs?: string;
  envExample?: string;
  dockerfile?: string;
  dockerCompose?: string;
}

/**
 * Generate HTML with proper CSS and JS links
 */
export function generateLinkedHTML(
  content: string,
  cssFile: string = "style.css",
  jsFile: string = "script.js"
): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Generated with PixelCraft">
    <title>PixelCraft Project</title>
    <link rel="stylesheet" href="${cssFile}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div id="app">
${content}
    </div>
    <script src="${jsFile}"></script>
</body>
</html>`;
}

/**
 * Generate CSS with modern styling
 */
export function generateEnhancedCSS(baseCSS: string): string {
  return `/* PixelCraft Generated Styles */
:root {
    --primary-color: #7c3aed;
    --secondary-color: #ec4899;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
    --dark-bg: #0f172a;
    --light-bg: #f8fafc;
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    --border-color: #e2e8f0;
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
}

body {
    font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: var(--text-primary);
    background-color: var(--light-bg);
    line-height: 1.6;
}

/* Smooth transitions */
* {
    transition: all 0.3s ease;
}

/* Utility Classes */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
}

.btn-primary:hover {
    background-color: #6d28d9;
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
}

.card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
}

/* Responsive */
@media (max-width: 768px) {
    .container {
        padding: 0 15px;
    }
}

/* Custom Styles */
${baseCSS}`;
}

/**
 * Generate JavaScript with proper module structure
 */
export function generateEnhancedJS(baseJS: string): string {
  return `// PixelCraft Generated JavaScript
'use strict';

// Utility Functions
const utils = {
    ready: (callback) => {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    },
    
    select: (selector) => document.querySelector(selector),
    selectAll: (selector) => document.querySelectorAll(selector),
    
    on: (element, event, handler) => {
        if (element) element.addEventListener(event, handler);
    },
    
    addClass: (element, className) => {
        if (element) element.classList.add(className);
    },
    
    removeClass: (element, className) => {
        if (element) element.classList.remove(className);
    },
    
    toggleClass: (element, className) => {
        if (element) element.classList.toggle(className);
    },
};

// Initialize Application
utils.ready(() => {
    console.log('✨ PixelCraft Application Loaded');
    
    // Your custom code here
${baseJS}
    
    console.log('✅ All features initialized');
});

// Export utilities for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = utils;
}`;
}

/**
 * Generate package.json with all dependencies linked
 */
export function generatePackageJson(projectName: string): string {
  return JSON.stringify(
    {
      name: projectName.toLowerCase().replace(/\s+/g, "-"),
      version: "1.0.0",
      description: "Generated with PixelCraft - Code Generator",
      main: "index.js",
      scripts: {
        start: "http-server . -p 8000 -o",
        dev: "http-server . -p 8000 -c-1",
        build: "echo 'Build script here'",
        test: "echo 'Test script here'",
      },
      keywords: ["pixelcraft", "generated", "web-app"],
      author: "PixelCraft",
      license: "MIT",
      devDependencies: {
        "http-server": "^14.1.1",
      },
    },
    null,
    2
  );
}

/**
 * Generate comprehensive README
 */
export function generateReadme(projectName: string): string {
  return `# ${projectName}

Generated with **PixelCraft** - Describe. Generate. Deploy.

## 🚀 Getting Started

### Prerequisites
- Node.js (optional, for local development)
- Modern web browser

### Installation

1. Extract the project files
2. Open \`index.html\` directly in your browser, or
3. Run a local server:

\`\`\`bash
npm install
npm start
\`\`\`

## 📁 Project Structure

\`\`\`
project/
├── index.html      # Main HTML file
├── style.css       # Stylesheet
├── script.js       # JavaScript code
├── package.json    # Project configuration
├── README.md       # This file
└── .env.example    # Environment variables template
\`\`\`

## 🎨 Features

- Modern, responsive design
- Smooth animations and transitions
- Cross-browser compatible
- Mobile-friendly
- Accessibility compliant

## 🛠️ Customization

### Editing HTML
Open \`index.html\` and modify the content between the \`<body>\` tags.

### Styling
Edit \`style.css\` to customize colors, fonts, and layouts. CSS variables are defined at the top for easy customization.

### JavaScript
Add your custom code in \`script.js\`. The file includes utility functions for common DOM operations.

## 📱 Responsive Design

The project is built with mobile-first approach. Breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance

## 🚀 Deployment

### Deploy to Vercel
\`\`\`bash
npm install -g vercel
vercel
\`\`\`

### Deploy to Netlify
1. Push to GitHub
2. Connect to Netlify
3. Deploy automatically

### Deploy to GitHub Pages
\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
\`\`\`

## 📝 License

MIT License - Feel free to use this project for personal and commercial purposes.

## 🤝 Support

For issues or questions, visit [PixelCraft Documentation](https://pixelcraft.example.com)

---

**Made with PixelCraft** ✨
`;
}

/**
 * Generate .env.example
 */
export function generateEnvExample(): string {
  return `# Environment Variables
# Copy this file to .env and fill in your values

# Application
APP_NAME=PixelCraft Project
APP_ENV=development
APP_DEBUG=true

# Server
SERVER_PORT=8000
SERVER_HOST=localhost

# API
API_BASE_URL=http://localhost:3000
API_KEY=your_api_key_here

# Database (if needed)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pixelcraft_db
DB_USER=user
DB_PASSWORD=password
`;
}

/**
 * Generate Dockerfile for containerization
 */
export function generateDockerfile(): string {
  return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "start"]
`;
}

/**
 * Generate docker-compose.yml
 */
export function generateDockerCompose(): string {
  return `version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
    volumes:
      - .:/app
      - /app/node_modules
`;
}

/**
 * Generate .gitignore
 */
export function generateGitignore(): string {
  return `# Dependencies
node_modules/
npm-debug.log
yarn-error.log

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Build
dist/
build/
.cache/

# Logs
logs/
*.log

# Temporary
tmp/
temp/
`;
}

/**
 * Generate complete linked project
 */
export function generateCompleteProject(
  description: string,
  htmlContent: string,
  cssContent: string,
  jsContent: string,
  projectName: string = "pixelcraft-project"
): LinkedProject {
  return {
    html: generateLinkedHTML(htmlContent),
    css: generateEnhancedCSS(cssContent),
    javascript: generateEnhancedJS(jsContent),
    packageJson: generatePackageJson(projectName),
    readme: generateReadme(projectName),
    gitignore: generateGitignore(),
    envExample: generateEnvExample(),
    dockerfile: generateDockerfile(),
    dockerCompose: generateDockerCompose(),
  };
}
