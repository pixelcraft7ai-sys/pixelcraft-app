import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Code2 } from "lucide-react";

export type ProgrammingLanguage = "html" | "react" | "vue" | "angular" | "svelte" | "python" | "nodejs" | "php" | "java" | "csharp";

interface LanguageSelectorProps {
  selectedLanguage: ProgrammingLanguage;
  onLanguageChange: (language: ProgrammingLanguage) => void;
}

const LANGUAGES: { id: ProgrammingLanguage; name: string; category: string }[] = [
  // Frontend
  { id: "html", name: "HTML/CSS", category: "Frontend" },
  { id: "react", name: "React", category: "Frontend" },
  { id: "vue", name: "Vue.js", category: "Frontend" },
  { id: "angular", name: "Angular", category: "Frontend" },
  { id: "svelte", name: "Svelte", category: "Frontend" },
  // Backend
  { id: "nodejs", name: "Node.js", category: "Backend" },
  { id: "python", name: "Python", category: "Backend" },
  { id: "php", name: "PHP", category: "Backend" },
  { id: "java", name: "Java", category: "Backend" },
  { id: "csharp", name: "C#/.NET", category: "Backend" },
];

export function ProgrammingLanguageSelector({
  selectedLanguage,
  onLanguageChange,
}: LanguageSelectorProps) {
  const { t } = useTranslation();

  const frontendLanguages = LANGUAGES.filter((l) => l.category === "Frontend");
  const backendLanguages = LANGUAGES.filter((l) => l.category === "Backend");

  return (
    <div className="w-full space-y-4">
      <div>
        <label className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
          <Code2 className="w-4 h-4" />
          {t("editor.programmingLanguage") || "Programming Language"}
        </label>

        {/* Frontend Languages */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-600 mb-2">Frontend</p>
          <div className="grid grid-cols-2 gap-2">
            {frontendLanguages.map((lang) => (
              <Button
                key={lang.id}
                onClick={() => onLanguageChange(lang.id)}
                variant={selectedLanguage === lang.id ? "default" : "outline"}
                className={`text-sm ${
                  selectedLanguage === lang.id
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {lang.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Backend Languages */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Backend</p>
          <div className="grid grid-cols-2 gap-2">
            {backendLanguages.map((lang) => (
              <Button
                key={lang.id}
                onClick={() => onLanguageChange(lang.id)}
                variant={selectedLanguage === lang.id ? "default" : "outline"}
                className={`text-sm ${
                  selectedLanguage === lang.id
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {lang.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
