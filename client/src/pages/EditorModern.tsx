import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Loader2, Sparkles, Users, Zap, Code2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { DesignTemplates } from "@/components/DesignTemplates";
import { CollaboratorsList } from "@/components/CollaboratorsList";
import { ActivityFeed } from "@/components/ActivityFeed";
import { SecurePreview } from "@/components/SecurePreview";
import { EnhancedCodePanel } from "@/components/EnhancedCodePanel";
import { ProgrammingLanguageSelector, type ProgrammingLanguage } from "@/components/ProgrammingLanguageSelector";
import { generateCodeForLanguage } from "@/lib/multiLanguageCodeGenerator";
import { AIAssistant } from "@/components/AIAssistant";
import { generateCompleteProject } from "@/lib/enhancedCodeGenerator";

interface EditorState {
  description: string;
  generatedHtml: string;
  generatedCss: string;
  generatedJs: string;
  selectedLanguage: ProgrammingLanguage;
}

export default function EditorModern() {
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
  const [aiSuggestion, setAiSuggestion] = useState("");

  const subscriptionQuery = trpc.subscription.current.useQuery(undefined, {
    enabled: !!user,
  });

  const generateCodeMutation = trpc.codeGeneration.generateFromDescription.useMutation();
  const stylesQuery = trpc.codeGeneration.getStyles.useQuery();
  const logActivityMutation = trpc.collaboration.logActivity.useMutation();

  const subscription = subscriptionQuery.data;
  const canDownload = subscription?.subscription_plans?.canDownload === 1;
  const isSubscribed = subscription?.subscription_plans?.id !== 1;
  const styles = stylesQuery.data || [];

  useEffect(() => {
    if (state.description.trim() && state.description.length > 10) {
      generateCodeFromDescription();
    }
  }, [selectedStyle, state.selectedLanguage]);

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
        // Generate complete linked project
        const linkedProject = generateCompleteProject(
          state.description,
          result.data.html,
          result.data.css,
          result.data.javascript,
          state.description || "pixelcraft-project"
        );

        setState((prev) => ({
          ...prev,
          generatedHtml: linkedProject.html,
          generatedCss: linkedProject.css,
          generatedJs: linkedProject.javascript,
        }));

        toast.success(t("editor.codeGenerationSuccess"));

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
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateSelect = (prompt: string) => {
    setState((prev) => ({
      ...prev,
      description: prompt,
    }));
  };

  const handleSaveProject = async () => {
    if (!state.description.trim()) {
      toast.error(t("editor.enterDescription"));
      return;
    }

    setIsSaving(true);
    try {
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

  if (!isAuthenticated) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
        <Card className="p-8 text-center max-w-md shadow-2xl">
          <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t("editor.accessRequired")}</h1>
          <p className="text-gray-600 mb-6">{t("editor.signInToAccess")}</p>
          <Link href="/login">
            <Button className="bg-purple-600 hover:bg-purple-700 w-full">
              {t("auth.signIn")}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("editor.title")}</h1>
              <p className="text-sm text-purple-100">
                {subscription?.subscription_plans?.name || "Free"} Plan
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCollabPanel(!showCollabPanel)}
              className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Users className="w-4 h-4" />
              {t("editor.collaboration")}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden gap-4 p-4">
        {/* Left Panel - Input */}
        <div className="w-1/3 flex flex-col gap-4 overflow-auto">
          {/* Description Card */}
          <Card className="p-4 bg-white/10 border-purple-400/30 backdrop-blur text-white flex-1 flex flex-col">
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-300" />
                {t("editor.description")}
              </h2>
              <p className="text-xs text-purple-200">{t("editor.descriptionHint")}</p>
            </div>

            {/* Templates */}
            <div className="mb-4 pb-4 border-b border-purple-400/30">
              <DesignTemplates
                onSelectTemplate={handleTemplateSelect}
                isLoading={isGenerating}
              />
            </div>

            {/* Language Selector */}
            <div className="mb-4 pb-4 border-b border-purple-400/30">
              <ProgrammingLanguageSelector
                selectedLanguage={state.selectedLanguage}
                onLanguageChange={(lang) =>
                  setState({ ...state, selectedLanguage: lang })
                }
              />
            </div>

            {/* Style Selector */}
            <div className="mb-4">
              <label className="text-sm font-medium text-purple-100 block mb-2">
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
                        : "bg-white/10 text-purple-100 hover:bg-white/20"
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <Textarea
              value={state.description}
              onChange={(e) => setState({ ...state, description: e.target.value })}
              placeholder={t("editor.descriptionPlaceholder")}
              className="flex-1 bg-white/10 border-purple-400/30 text-white placeholder-purple-300 resize-none mb-4"
            />

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={generateCodeFromDescription}
                disabled={isGenerating || state.description.length < 10}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("editor.generating")}
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    {t("editor.generateDesign")}
                  </>
                )}
              </Button>
              <Button
                onClick={handleSaveProject}
                disabled={isSaving}
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {isSaving ? t("editor.saving") : t("editor.saveProject")}
              </Button>
            </div>
          </Card>
        </div>

        {/* Middle Panel - Preview */}
        <div className="w-1/3 flex flex-col gap-4 overflow-hidden">
          <Card className="flex-1 bg-white/10 border-purple-400/30 backdrop-blur overflow-hidden">
            <SecurePreview
              html={state.generatedHtml}
              css={state.generatedCss}
              javascript={state.generatedJs}
              isSubscribed={isSubscribed}
              canDownload={canDownload}
            />
          </Card>
        </div>

        {/* Right Panel - Code or Collaboration */}
        <div className="w-1/3 flex flex-col gap-4 overflow-hidden">
          <Card className="flex-1 bg-white/10 border-purple-400/30 backdrop-blur overflow-hidden">
            {showCollabPanel ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-purple-400/30">
                  <h2 className="text-lg font-semibold text-white">
                    {t("editor.collaboration")}
                  </h2>
                </div>
                <div className="flex-1 overflow-auto p-4 space-y-4">
                  {projectId && (
                    <>
                      <CollaboratorsList projectId={projectId} isOwner={true} />
                      <ActivityFeed projectId={projectId} />
                    </>
                  )}
                  {!projectId && (
                    <Card className="p-4 text-center text-purple-200">
                      <p className="text-sm">{t("editor.startByDescribing")}</p>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <EnhancedCodePanel
                html={state.generatedHtml}
                css={state.generatedCss}
                javascript={state.generatedJs}
                projectName={state.description || "pixelcraft-project"}
              />
            )}
          </Card>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant
        description={state.description}
        language={state.selectedLanguage}
        onSuggestion={setAiSuggestion}
      />
    </div>
  );
}
