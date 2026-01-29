import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Code2, Eye, Zap, Sparkles, Layers, Rocket } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Navigation */}
      <nav className="border-b border-purple-500/20 backdrop-blur-md bg-slate-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">{t("common.appName")}</span>
          </div>
          <div className={`flex gap-4 items-center ${isRTL ? "flex-row-reverse" : ""}`}>
            <Link href="/pricing">
              <Button variant="ghost" className="text-gray-300 hover:text-white">
                {t("home.pricing_section")}
              </Button>
            </Link>
            <LanguageSwitcher />
            {isAuthenticated ? (
              <>
                <span className="text-gray-300">{t("auth.welcome")}, {user?.name}</span>
                <Link href="/editor">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    {t("home.goToEditor")}
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  {t("auth.signIn")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className={`text-center mb-20 ${isRTL ? "rtl" : "ltr"}`}>
          <div className="inline-block mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              {t("home.aiPowered")}
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {t("home.title")}
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t("home.subtitle")}
          </p>
          {!isAuthenticated && (
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-shadow">
                {t("home.getStarted")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border-purple-500/20 p-8 hover:border-purple-500/50 transition hover:shadow-lg hover:shadow-purple-500/10">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {t("home.smartEditor")}
            </h3>
            <p className="text-gray-400">
              {t("home.smartEditorDesc")}
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border-purple-500/20 p-8 hover:border-purple-500/50 transition hover:shadow-lg hover:shadow-purple-500/10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {t("home.livePreview")}
            </h3>
            <p className="text-gray-400">
              {t("home.livePreviewDesc")}
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border-purple-500/20 p-8 hover:border-purple-500/50 transition hover:shadow-lg hover:shadow-purple-500/10">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {t("home.instantExport")}
            </h3>
            <p className="text-gray-400">
              {t("home.instantExportDesc")}
            </p>
          </Card>
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Layers className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">{t("home.multiLanguage")}</h4>
              <p className="text-gray-400">{t("home.multiLanguageDesc")}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Rocket className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">{t("home.fastPerformance")}</h4>
              <p className="text-gray-400">{t("home.fastPerformanceDesc")}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">{t("home.aiPowered")}</h4>
              <p className="text-gray-400">{t("home.aiPoweredDesc")}</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {isAuthenticated && (
          <div className="text-center bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t("home_extra.ready")}
            </h2>
            <p className="text-gray-300 mb-8">
              {t("home_extra.startCreating")}
            </p>
            <Link href="/editor">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                {t("home.goToEditor")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-400">
          <p>&copy; 2025 {t("common.appName")}. {t("home_extra.allRightsReserved")}</p>
        </div>
      </footer>
    </div>
  );
}
