import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Download, Loader2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ExportButtonProps {
  projectName: string;
  code: string;
  framework: "react" | "vue" | "angular" | "svelte" | "html";
  description?: string;
  includeTypeScript?: boolean;
}

export default function ExportButton({
  projectName,
  code,
  framework,
  description = "",
  includeTypeScript = true,
}: ExportButtonProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const exportMutation = trpc.export.exportProject.useMutation();
  const statusQuery = trpc.export.getStatus.useQuery();

  const handleExport = async () => {
    // Check if user can export
    if (!statusQuery.data?.canExport) {
      setShowUpgradePrompt(true);
      return;
    }

    setIsLoading(true);

    try {
      const result = await exportMutation.mutateAsync({
        projectName,
        code,
        framework,
        description,
        includeTypeScript,
      });

      if (result.success && result.data && result.filename) {
        // Convert base64 to blob
        const binaryString = atob(result.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "application/zip" });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.filename || "project.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success(t("export.success") || "Project exported successfully!");
      } else {
        toast.error((result as any).error || (t("export.error") || "Failed to export project"));
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error(t("export.error") || "Failed to export project");
    } finally {
      setIsLoading(false);
    }
  };

  if (statusQuery.isLoading) {
    return (
      <Button disabled variant="outline">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        {t("export.loading") || "Loading..."}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleExport}
        disabled={isLoading || !statusQuery.data?.canExport}
        className="gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("export.exporting") || "Exporting..."}
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            {t("export.download") || "Download Project"}
          </>
        )}
      </Button>

      {showUpgradePrompt && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              {t("export.upgrade_required") || "Upgrade Required"}
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
              {t("export.upgrade_message") ||
                "Upgrade to a paid plan to export and download your projects."}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => {
                // Navigate to pricing page
                window.location.href = '/pricing';
              }}
            >
              {t("export.view_plans") || "View Plans"}
            </Button>
          </div>
        </div>
      )}

      {statusQuery.data && !statusQuery.data.canExport && !showUpgradePrompt && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {statusQuery.data.message}
        </div>
      )}
    </div>
  );
}
