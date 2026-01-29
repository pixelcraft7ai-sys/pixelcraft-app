import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Package, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface MultiInterfaceExportButtonProps {
  projectId: number;
  projectTitle: string;
}

export function MultiInterfaceExportButton({
  projectId,
  projectTitle,
}: MultiInterfaceExportButtonProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("zip");
  const [options, setOptions] = useState({
    includeDocker: true,
    includeCI: true,
  });

  // Fetch export preview
  const { data: preview, isLoading: previewLoading } =
    trpc.multiInterfaceExport.getExportPreview.useQuery(
      { projectId },
      { enabled: isOpen }
    );

  // Fetch export options
  const { data: exportOptions } =
    trpc.multiInterfaceExport.getExportOptions.useQuery(undefined, {
      enabled: isOpen,
    });

  // Export mutation
  const { mutate: exportProject, isPending: isExporting } =
    trpc.multiInterfaceExport.exportProject.useMutation({
      onSuccess: (data) => {
        if (data.success && data.downloadUrl) {
          // Trigger download
          const link = document.createElement("a");
          link.href = data.downloadUrl;
          link.download = data.fileName || `${projectTitle}.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setIsOpen(false);
          alert(t("export.success", "Export Successful"));
        } else {
          alert(data.error || t("export.errorMessage", "Failed to export project"));
        }
      },
      onError: (error) => {
        alert(error.message || t("export.error", "Export Failed"));
      },
    });

  const handleExport = () => {
    exportProject({
      projectId,
      format: "zip" as const,
      includeDocker: options.includeDocker,
      includeCI: options.includeCI,
    });
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Package className="h-4 w-4" />
        {t("export.exportProject", "Export Project")}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("export.title", "Export Multi-Interface Project")}</DialogTitle>
            <DialogDescription>
              {t(
                "export.description",
                "Generate a complete project package with all interfaces, dependencies, and configuration files"
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Preview Section */}
            {previewLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : preview?.success && preview.stats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("export.totalInterfaces", "Total Interfaces")}
                    </p>
                    <p className="text-2xl font-bold">{preview.stats.totalInterfaces}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("export.dependencies", "Dependencies")}
                    </p>
                    <p className="text-2xl font-bold">{preview.stats.totalDependencies}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("export.languages", "Languages")}
                    </p>
                    <p className="text-sm font-semibold">
                      {preview.stats.languages.join(", ")}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {t("export.estimatedSize", "Estimated Size")}
                    </p>
                    <p className="text-lg font-semibold">{preview.estimatedSize}</p>
                  </div>
                </div>

                {/* Interface Breakdown */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">
                    {t("export.interfaceBreakdown", "Interface Breakdown")}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {preview.stats.frontendCount > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎨</span>
                        <span>
                          {preview.stats.frontendCount}{" "}
                          {t("export.frontend", "Frontend")}
                        </span>
                      </div>
                    )}
                    {preview.stats.backendCount > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚙️</span>
                        <span>
                          {preview.stats.backendCount}{" "}
                          {t("export.backend", "Backend")}
                        </span>
                      </div>
                    )}
                    {preview.stats.mobileCount > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📱</span>
                        <span>
                          {preview.stats.mobileCount} {t("export.mobile", "Mobile")}
                        </span>
                      </div>
                    )}
                    {preview.stats.apiCount > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔌</span>
                        <span>{preview.stats.apiCount} API</span>
                      </div>
                    )}
                    {preview.stats.databaseCount > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🗄️</span>
                        <span>
                          {preview.stats.databaseCount}{" "}
                          {t("export.database", "Database")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{preview?.error || t("export.loadError", "Failed to load preview")}</span>
              </div>
            )}

            {/* Export Options */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">
                {t("export.options", "Export Options")}
              </h4>

              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-input rounded-lg cursor-pointer hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={options.includeDocker}
                    onChange={(e) =>
                      setOptions({ ...options, includeDocker: e.target.checked })
                    }
                    className="rounded"
                  />
                  <div>
                    <p className="font-medium text-sm">
                      {t("export.docker", "Docker Configuration")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "export.dockerDesc",
                        "Include Dockerfile and docker-compose.yml"
                      )}
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-input rounded-lg cursor-pointer hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={options.includeCI}
                    onChange={(e) =>
                      setOptions({ ...options, includeCI: e.target.checked })
                    }
                    className="rounded"
                  />
                  <div>
                    <p className="font-medium text-sm">
                      {t("export.cicd", "CI/CD Pipeline")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "export.cicdDesc",
                        "Include GitHub Actions workflow for automated testing and deployment"
                      )}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Included Files */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">
                {t("export.includedFiles", "Included Files")}
              </h4>
              <div className="max-h-40 overflow-y-auto p-3 bg-muted rounded-lg text-xs font-mono space-y-1">
                {preview?.files?.slice(0, 10).map((file, idx) => (
                  <div key={idx} className="text-muted-foreground">
                    📄 {file}
                  </div>
                ))}
                {preview?.files && preview.files.length > 10 && (
                  <div className="text-muted-foreground italic">
                    ... and {preview.files.length - 10} more files
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isExporting}
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting || !preview?.success}
                className="gap-2"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("export.exporting", "Exporting...")}
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    {t("export.download", "Download ZIP")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
