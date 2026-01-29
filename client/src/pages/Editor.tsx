import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Loader2, Sparkles, Users, Maximize2, Minimize2, GripVertical } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { DesignTemplates } from "@/components/DesignTemplates";
import { CollaboratorsList } from "@/components/CollaboratorsList";
import { ActivityFeed } from "@/components/ActivityFeed";
import { SecurePreview } from "@/components/SecurePreview";
import { StrictCodeProtection } from "@/components/StrictCodeProtection";
import { EnhancedExportButton } from "@/components/EnhancedExportButton";
import { EnhancedCodePanel } from "@/components/EnhancedCodePanel";
import { ProgrammingLanguageSelector, type ProgrammingLanguage } from "@/components/ProgrammingLanguageSelector";
import { generateCodeForLanguage } from "@/lib/multiLanguageCodeGenerator";

interface EditorState {
  description: string;
  generatedHtml: string;
  generatedCss: string;
  generatedJs: string;
  selectedLanguage: ProgrammingLanguage;
}

export default function Editor() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [state, setState] = useState<EditorState>({
    description: "",
    generatedHtml: "",
    generatedCss: "",
    generatedJs: "",
    selectedLanguage: "html",
  });

  const [projectId, setProjectId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<"modern" | "minimal" | "corporate" | "creative">("modern");
  const [showCollabPanel, setShowCollabPanel] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panelSizes, setPanelSizes] = useState({ left: 33, middle: 34, right: 33 });
  const [isDragging, setIsDragging] = useState<string | null>(null);

  // Fetch subscription info
  const subscriptionQuery = trpc.subscription.current.useQuery(undefined, {
    enabled: !!user,
  });

  // Code generation mutation
  const generateCodeMutation = trpc.codeGeneration.generateFromDescription.useMutation();
  const stylesQuery = trpc.codeGeneration.getStyles.useQuery();
  const logActivityMutation = trpc.collaboration.logActivity.useMutation();

  const subscription = subscriptionQuery.data;
  const canDownload = subscription?.subscription_plans?.canDownload === 1;
  const isSubscribed = subscription?.subscription_plans?.id !== 1; // 1 = Free plan
  const styles = stylesQuery.data || [];

  // Generate code when description changes
  useEffect(() => {
    if (state.description.trim() && state.description.length > 10) {
      generateCodeFromDescription();
    }
  }, [selectedStyle]);

  const generateCodeFromDescription = async () => {
    if (!state.description.trim()) {
      toast.error(t("editor.enterDescription"));
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateCodeMutation.mutateAsync({
        description: state.description,
        style: selectedStyle,
        includeResponsive: true,
      });

      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          generatedHtml: result.data.html,
          generatedCss: result.data.css,
          generatedJs: result.data.javascript,
        }));
        toast.success(t("editor.codeGenerationSuccess"));

        // Log activity
        if (projectId) {
          try {
            await logActivityMutation.mutateAsync({
              projectId,
              action: "generate_code",
              fieldChanged: "generated_code",
              oldValue: undefined,
              newValue: `${result.data.html.substring(0, 50)}...`,
            });
          } catch (error) {
            console.error("Failed to log activity:", error);
          }
        }
      }
    } catch (error: any) {
      toast.error(t("errors.failedToGenerate") + ": " + error.message);
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateSelect = (prompt: string) => {
    setState(prev => ({
      ...prev,
      description: prompt,
    }));
  };

  const handleMouseDown = (divider: string) => {
    setIsDragging(divider);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(null);
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      // Handle resizing logic here
    };

    if (isDragging) {
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mousemove", handleMouseMove);
      return () => {
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [isDragging]);

  const handleSaveProject = async () => {
    if (!state.description.trim()) {
      toast.error(t("editor.enterDescription"));
      return;
    }

    setIsSaving(true);
    try {
      // Log activity
      if (projectId) {
        await logActivityMutation.mutateAsync({
          projectId,
          action: "update_title",
          fieldChanged: "project",
          oldValue: undefined,
          newValue: "Project saved",
        });
      }
      toast.success(t("editor.projectSaveSuccess"));
    } catch (error) {
      toast.error(t("errors.failedToSave"));
    } finally {
      setIsSaving(false);
    }
  };

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t("editor.accessRequired")}</h1>
          <p className="text-gray-600 mb-6">
            {t("editor.signInToAccess")}
          </p>
          <a href="/">
            <Button className="bg-purple-600 hover:bg-purple-700">
              {t("editor.goToHome")}
            </Button>
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              {t("editor.title")}
            </h1>
            <p className="text-sm text-gray-600">
              {subscription?.subscription_plans?.name || "Free"} {t("common.language")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-2"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCollabPanel(!showCollabPanel)}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              {t("editor.collaboration")}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className={`flex-1 flex overflow-hidden ${isFullscreen ? 'fixed inset-0 top-16 z-50' : ''}`}>
        {/* Left Panel - Description Editor */}
        <div style={{ width: `${panelSizes.left}%` }} className="border-r border-gray-200 bg-white flex flex-col overflow-auto">
          <div className="p-4 border-b border-gray-200 sticky top-0 bg-white">
            <h2 className="text-lg font-semibold text-gray-900">{t("editor.description")}</h2>
            <p className="text-xs text-gray-500 mt-1">
              {t("editor.descriptionHint")}
            </p>
          </div>

          {/* Templates Section */}
          <div className="p-4 border-b border-gray-200">
            <DesignTemplates 
              onSelectTemplate={handleTemplateSelect}
              isLoading={isGenerating}
            />
          </div>

          {/* Programming Language Selector */}
          <div className="px-4 pt-4 pb-2">
            <ProgrammingLanguageSelector
              selectedLanguage={state.selectedLanguage}
              onLanguageChange={(lang) =>
                setState({ ...state, selectedLanguage: lang })
              }
            />
          </div>

          {/* Style Selector */}
          <div className="px-4 pt-4 pb-2">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              {t("editor.designStyle")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id as any)}
                  className={`p-2 rounded text-sm font-medium transition ${
                    selectedStyle === style.id
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  title={style.description}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            value={state.description}
            onChange={(e) => setState({ ...state, description: e.target.value })}
            placeholder={t("editor.descriptionPlaceholder")}
            className="flex-1 border-0 rounded-0 resize-none p-4 focus:ring-0 focus:border-0"
          />
          <div className="p-4 border-t border-gray-200 space-y-2 sticky bottom-0 bg-white">
            <Button
              onClick={generateCodeFromDescription}
              disabled={isGenerating || state.description.length < 10}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("editor.generating")}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t("editor.generateDesign")}
                </>
              )}
            </Button>
            <Button
              onClick={handleSaveProject}
              disabled={isSaving}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {isSaving ? t("editor.saving") : t("editor.saveProject")}
            </Button>
          </div>
        </div>

        {/* Middle Panel - Live Preview */}
        <div className="w-1/3 border-r border-gray-200 bg-gray-100 flex flex-col overflow-hidden">
          <SecurePreview
            html={state.generatedHtml}
            css={state.generatedCss}
            javascript={state.generatedJs}
            isSubscribed={isSubscribed}
            canDownload={canDownload}
          />
        </div>

        {/* Right Panel - Enhanced Code Panel or Collaboration */}
        <div className="w-1/3 bg-white flex flex-col overflow-hidden">
          {showCollabPanel ? (
            <>
              <div className="p-4 border-b border-gray-200 bg-white sticky top-0">
                <h2 className="text-lg font-semibold text-gray-900">{t("editor.collaboration")}</h2>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {projectId && (
                  <>
                    <CollaboratorsList projectId={projectId} isOwner={true} />
                    <ActivityFeed projectId={projectId} />
                  </>
                )}
                {!projectId && (
                  <Card className="p-4 text-center">
                    <p className="text-sm text-gray-600">
                      {t("editor.startByDescribing")}
                    </p>
                  </Card>
                )}
              </div>
            </>
          ) : (
            <EnhancedCodePanel
              html={state.generatedHtml}
              css={state.generatedCss}
              javascript={state.generatedJs}
              projectName={state.description || "pixelcraft-project"}
            />
          )}
        </div>
      </div>
    </div>
  );
}
