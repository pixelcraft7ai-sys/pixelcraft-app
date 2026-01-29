import JSZip from "jszip";
import { saveAs } from "file-saver";

export interface ExportOptions {
  includeReadme: boolean;
  includeDockerfile: boolean;
  includeDockerCompose: boolean;
  includePackageJson: boolean;
  projectName: string;
}

export async function exportAsZip(
  html: string,
  css: string,
  javascript: string,
  options: ExportOptions
): Promise<void> {
  const zip = new JSZip();

  // Add main files
  zip.file("index.html", `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.projectName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  ${html}
  <script src="script.js"></script>
</body>
</html>`);

  zip.file("style.css", css);
  zip.file("script.js", javascript);

  // Add README
  if (options.includeReadme) {
    zip.file("README.md", `# ${options.projectName}

This project was generated with PixelCraft AI Code Generator.

## Getting Started

1. Open \`index.html\` in your browser
2. Modify the files as needed
3. Deploy to your hosting service

## Files

- \`index.html\` - Main HTML structure
- \`style.css\` - Styling
- \`script.js\` - JavaScript functionality

## License

MIT`);
  }

  // Add Dockerfile
  if (options.includeDockerfile) {
    zip.file("Dockerfile", `FROM node:18-alpine

WORKDIR /app

COPY . .

EXPOSE 3000

CMD ["npx", "http-server", "-p", "3000"]`);
  }

  // Add docker-compose.yml
  if (options.includeDockerCompose) {
    zip.file("docker-compose.yml", `version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    environment:
      - NODE_ENV=development`);
  }

  // Add package.json
  if (options.includePackageJson) {
    zip.file("package.json", JSON.stringify({
      name: options.projectName,
      version: "1.0.0",
      description: "Generated with PixelCraft AI Code Generator",
      main: "index.html",
      scripts: {
        serve: "http-server -p 3000",
        build: "echo 'Build script here'",
      },
      keywords: ["pixelcraft", "generated"],
      author: "",
      license: "MIT",
      devDependencies: {
        "http-server": "^14.1.1",
      },
    }, null, 2));
  }

  // Generate ZIP file
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${options.projectName}.zip`);
}

export async function exportSingleFile(
  content: string,
  filename: string,
  mimeType: string = "text/plain"
): Promise<void> {
  const blob = new Blob([content], { type: mimeType });
  saveAs(blob, filename);
}

export async function exportAsHTML(
  html: string,
  css: string,
  javascript: string,
  projectName: string
): Promise<void> {
  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <style>
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    ${javascript}
  </script>
</body>
</html>`;

  await exportSingleFile(fullHTML, `${projectName}.html`, "text/html");
}

export async function exportAsCSS(css: string, projectName: string): Promise<void> {
  await exportSingleFile(css, `${projectName}.css`, "text/css");
}

export async function exportAsJavaScript(js: string, projectName: string): Promise<void> {
  await exportSingleFile(js, `${projectName}.js`, "text/javascript");
}
