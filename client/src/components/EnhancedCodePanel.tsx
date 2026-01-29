import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { EnhancedExportButton } from "./EnhancedExportButton";

interface CodePanelProps {
  html: string;
  css: string;
  javascript: string;
  projectName?: string;
}

type FileType = "html" | "css" | "js" | "package" | "readme";

interface FileTab {
  id: FileType;
  label: string;
  content: string;
  language: string;
}

export function EnhancedCodePanel({
  html,
  css,
  javascript,
  projectName = "pixelcraft-project",
}: CodePanelProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<FileType>("html");
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const packageJson = JSON.stringify(
    {
      name: projectName.toLowerCase().replace(/\s+/g, "-"),
      version: "1.0.0",
      description: "Generated with PixelCraft",
      main: "index.html",
      scripts: {
        dev: "vite",
        build: "vite build",
      },
    },
    null,
    2
  );

  const readme = `# ${projectName}

Generated with **PixelCraft**

## Getting Started

1. Extract files
2. Open index.html in browser
3. Customize as needed

---
Made with PixelCraft`;

  const files: FileTab[] = [
    { id: "html", label: "index.html", content: html, language: "html" },
    { id: "css", label: "style.css", content: css, language: "css" },
    { id: "js", label: "script.js", content: javascript, language: "javascript" },
    { id: "package", label: "package.json", content: packageJson, language: "json" },
    { id: "readme", label: "README.md", content: readme, language: "markdown" },
  ];

  const currentFile = files.find((f) => f.id === activeTab);
  const lineCount = currentFile?.content.split("\n").length || 0;
  const fileSize = new Blob([currentFile?.content || ""]).size;

  const copyToClipboard = () => {
    if (currentFile) {
      navigator.clipboard.writeText(currentFile.content);
      toast.success(t("export.copiedToClipboard") || "Copied to clipboard!");
    }
  };

  const downloadFile = () => {
    if (currentFile) {
      const blob = new Blob([currentFile.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = currentFile.label;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(t("export.fileDownloaded") || "File downloaded!");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header with export buttons */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("editor.projectFiles") || "Project Files"}
          </h2>
          <div className="flex gap-2">
            <EnhancedExportButton
              html={html}
              css={css}
              javascript={javascript}
              projectName={projectName}
            />
          </div>
        </div>

        {/* File tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => setActiveTab(file.id)}
              className={`px-3 py-2 rounded text-sm font-medium whitespace-nowrap transition ${
                activeTab === file.id
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {file.label}
            </button>
          ))}
        </div>
      </div>

      {/* File info bar */}
      {currentFile && (
        <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 flex justify-between items-center text-xs text-gray-600">
          <div className="flex gap-4">
            <span>{lineCount} lines</span>
            <span>{fileSize} bytes</span>
            <span>{currentFile.language}</span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              className="h-6 px-2"
            >
              {showLineNumbers ? (
                <EyeOff className="w-3 h-3" />
              ) : (
                <Eye className="w-3 h-3" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={copyToClipboard}
              className="h-6 px-2"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={downloadFile}
              className="h-6 px-2"
            >
              <Download className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Code display */}
      <div className="flex-1 overflow-auto bg-gray-900 p-4">
        {currentFile ? (
          <pre className="text-gray-100 text-xs font-mono leading-relaxed">
            {showLineNumbers && (
              <span className="text-gray-500 mr-4 select-none">
                {currentFile.content
                  .split("\n")
                  .map((_, i) => i + 1)
                  .join("\n")}
              </span>
            )}
            <code>{currentFile.content}</code>
          </pre>
        ) : (
          <Card className="p-4 text-center h-full flex items-center justify-center">
            <p className="text-sm text-gray-600">
              {t("editor.noCodeGenerated") || "No code generated yet"}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
