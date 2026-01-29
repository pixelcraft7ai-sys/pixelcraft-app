import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Copy, FileJson, Code2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface ExportButtonProps {
  html: string;
  css: string;
  javascript: string;
  projectName?: string;
}

export function EnhancedExportButton({
  html,
  css,
  javascript,
  projectName = "pixelcraft-project",
}: ExportButtonProps) {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const generatePackageJson = () => {
    return JSON.stringify(
      {
        name: projectName.toLowerCase().replace(/\s+/g, "-"),
        version: "1.0.0",
        description: "Generated with PixelCraft",
        main: "index.html",
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview",
        },
        devDependencies: {
          vite: "^5.0.0",
        },
      },
      null,
      2
    );
  };

  const generateReadme = () => {
    return `# ${projectName}

Generated with **PixelCraft** - Describe. Generate. Deploy.

## Getting Started

1. Extract the ZIP file
2. Run \`npm install\` (if using Node.js)
3. Open \`index.html\` in your browser

## Files

- \`index.html\` - Main HTML file
- \`style.css\` - Stylesheet
- \`script.js\` - JavaScript code
- \`package.json\` - Project configuration

## Customization

Edit the HTML, CSS, and JavaScript files to customize your project.

---

Made with PixelCraft
`;
  };

  const downloadAsZip = async () => {
    try {
      setIsExporting(true);
      const { default: JSZip } = await import("jszip");

      const zip = new JSZip();

      // Add HTML file
      zip.file("index.html", html);

      // Add CSS file
      zip.file("style.css", css);

      // Add JavaScript file
      zip.file("script.js", javascript);

      // Add package.json
      zip.file("package.json", generatePackageJson());

      // Add README
      zip.file("README.md", generateReadme());

      // Add .gitignore
      zip.file(".gitignore", "node_modules/\ndist/\n.env\n");

      // Generate ZIP
      const blob = await zip.generateAsync({ type: "blob" });

      // Download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${projectName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t("export.zipDownloadSuccess") || "ZIP downloaded successfully!");
    } catch (error) {
      console.error("Error downloading ZIP:", error);
      toast.error(t("export.zipDownloadError") || "Failed to download ZIP");
    } finally {
      setIsExporting(false);
    }
  };

  const downloadAsHtml = () => {
    try {
      setIsExporting(true);

      // Create complete HTML document
      const completeHtml = `<!DOCTYPE html>
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

      // Download
      const blob = new Blob([completeHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${projectName}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t("export.htmlDownloadSuccess") || "HTML downloaded successfully!");
    } catch (error) {
      console.error("Error downloading HTML:", error);
      toast.error(t("export.htmlDownloadError") || "Failed to download HTML");
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const completeCode = `<!-- HTML -->
${html}

<!-- CSS -->
<style>
${css}
</style>

<!-- JavaScript -->
<script>
${javascript}
</script>`;

      await navigator.clipboard.writeText(completeCode);
      toast.success(t("export.copiedToClipboard") || "Code copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error(t("export.copyError") || "Failed to copy code");
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        onClick={downloadAsZip}
        disabled={isExporting || !html}
        className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
        title={t("export.downloadZipTooltip") || "Download as ZIP with project files"}
      >
        <Download className="w-4 h-4" />
        {t("export.downloadZip") || "ZIP"}
      </Button>

      <Button
        onClick={downloadAsHtml}
        disabled={isExporting || !html}
        variant="outline"
        className="flex items-center gap-2"
        title={t("export.downloadHtmlTooltip") || "Download as single HTML file"}
      >
        <Code2 className="w-4 h-4" />
        {t("export.downloadHtml") || "HTML"}
      </Button>

      <Button
        onClick={copyToClipboard}
        disabled={!html}
        variant="outline"
        className="flex items-center gap-2"
        title={t("export.copyCodeTooltip") || "Copy all code to clipboard"}
      >
        <Copy className="w-4 h-4" />
        {t("export.copyCode") || "Copy"}
      </Button>
    </div>
  );
}
