import { useState, useEffect, useRef } from "react";
import { AlertCircle, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SecurePreviewProps {
  html: string;
  css: string;
  javascript: string;
  isSubscribed: boolean;
  canDownload: boolean;
}

export function SecurePreview({
  html,
  css,
  javascript,
  isSubscribed,
  canDownload,
}: SecurePreviewProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sanitize HTML to prevent XSS
  const sanitizeHTML = (htmlContent: string): string => {
    // Remove script tags and event handlers
    const sanitized = htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
      .replace(/on\w+\s*=\s*[^\s>]*/gi, "");

    return sanitized;
  };

  const sanitizedHtml = sanitizeHTML(html);

  const iframeContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }
    ${css}
  </style>
</head>
<body>
  ${sanitizedHtml}
  <script>
    // Disable right-click context menu
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      return false;
    });
    
    // Disable text selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    
    // Disable developer tools shortcuts
    document.addEventListener('keydown', function(e) {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || 
          (e.ctrlKey && e.shiftKey && e.key === 'C') || 
          (e.ctrlKey && e.shiftKey && e.key === 'J')) {
        e.preventDefault();
        return false;
      }
    });
    
    ${javascript}
  </script>
</body>
</html>`;

  // Reload iframe when content changes
  useEffect(() => {
    setIframeKey((prev) => prev + 1);
  }, [html, css, javascript]);

  // Preview available for all users (development mode)
  if (!html) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <Card className="p-8 text-center max-w-sm">
          <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Preview Locked
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Start by describing your design to see a live preview
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-100">
      {/* Preview Header */}
      <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Live Preview</h3>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowPreview(!showPreview)}
          className="text-gray-600"
        >
          {showPreview ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Preview Content */}
      {showPreview ? (
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-lg shadow-sm h-full min-h-full">
            {html ? (
              <iframe
                key={iframeKey}
                ref={iframeRef}
                srcDoc={iframeContent}
                className="w-full h-full border-0"
                title="Live Preview"
                sandbox="allow-scripts"
                style={{ isolation: "isolate" }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <p className="text-sm">No preview available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-100">
          <Card className="p-8 text-center max-w-sm">
            <EyeOff className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Preview Hidden
            </h3>
            <p className="text-sm text-gray-600">
              Click the eye icon to show the preview again
            </p>
          </Card>
        </div>
      )}

      {/* Security Notice for Free Users */}
      {!isSubscribed && html && (
        <div className="bg-blue-50 border-t border-blue-200 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900">
              <strong>Free Plan:</strong> Preview only. Code access and download require a paid subscription.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
