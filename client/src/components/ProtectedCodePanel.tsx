import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Lock, Zap } from "lucide-react";
import { toast } from "sonner";

interface ProtectedCodePanelProps {
  html: string;
  css: string;
  javascript: string;
  isSubscribed: boolean;
  canDownload: boolean;
  onCopy?: () => void;
}

export function ProtectedCodePanel({
  html,
  css,
  javascript,
  isSubscribed,
  canDownload,
  onCopy,
}: ProtectedCodePanelProps) {
  const handleCopyClick = () => {
    if (!isSubscribed) {
      toast.error("Code copying is only available for paid subscribers");
      return;
    }
    onCopy?.();
  };

  const handleSelectCode = (e: React.MouseEvent<HTMLPreElement>) => {
    if (!isSubscribed) {
      e.preventDefault();
      toast.error("Code selection is disabled for free users");
    }
  };

  // Blur effect for free users
  const codeClassName = !isSubscribed
    ? "blur-sm select-none pointer-events-none"
    : "select-text";

  return (
    <div className="space-y-4">
      {/* HTML Code */}
      <Card className="p-4 relative">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">HTML</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyClick}
            disabled={!isSubscribed}
            className="text-gray-600"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        <pre
          className={`text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40 font-mono border border-gray-200 ${codeClassName}`}
          onMouseDown={handleSelectCode}
          onContextMenu={(e) => {
            if (!isSubscribed) e.preventDefault();
          }}
        >
          <code>{html || "<!-- HTML will appear here -->"}</code>
        </pre>
        {!isSubscribed && (
          <div className="absolute inset-0 flex items-center justify-center rounded bg-black/5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-gray-600 text-xs font-medium">
              <Lock className="w-4 h-4" />
              Upgrade to view
            </div>
          </div>
        )}
      </Card>

      {/* CSS Code */}
      <Card className="p-4 relative">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">CSS</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyClick}
            disabled={!isSubscribed}
            className="text-gray-600"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        <pre
          className={`text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40 font-mono border border-gray-200 ${codeClassName}`}
          onMouseDown={handleSelectCode}
          onContextMenu={(e) => {
            if (!isSubscribed) e.preventDefault();
          }}
        >
          <code>{css || "/* CSS will appear here */"}</code>
        </pre>
        {!isSubscribed && (
          <div className="absolute inset-0 flex items-center justify-center rounded bg-black/5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-gray-600 text-xs font-medium">
              <Lock className="w-4 h-4" />
              Upgrade to view
            </div>
          </div>
        )}
      </Card>

      {/* JavaScript Code */}
      <Card className="p-4 relative">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">JavaScript</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyClick}
            disabled={!isSubscribed}
            className="text-gray-600"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        <pre
          className={`text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40 font-mono border border-gray-200 ${codeClassName}`}
          onMouseDown={handleSelectCode}
          onContextMenu={(e) => {
            if (!isSubscribed) e.preventDefault();
          }}
        >
          <code>{javascript || "// JavaScript will appear here"}</code>
        </pre>
        {!isSubscribed && (
          <div className="absolute inset-0 flex items-center justify-center rounded bg-black/5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-gray-600 text-xs font-medium">
              <Lock className="w-4 h-4" />
              Upgrade to view
            </div>
          </div>
        )}
      </Card>

      {/* Upgrade Prompt for Free Users */}
      {!isSubscribed && (
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                Unlock Code Access
              </h4>
              <p className="text-xs text-gray-600 mb-3">
                Upgrade to Personal ($29/month) or Team ($99/month) plan to view, copy, and download generated code.
              </p>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                View Plans
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
