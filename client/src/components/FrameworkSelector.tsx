import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import type { CodeFramework } from "../../../server/codeGenerators";

interface FrameworkSelectorProps {
  onSelect: (framework: CodeFramework) => void;
  selected?: CodeFramework;
}

export default function FrameworkSelector({
  onSelect,
  selected = "html",
}: FrameworkSelectorProps) {
  const { t } = useTranslation();

  const frameworks = [
    {
      id: "html" as CodeFramework,
      name: "HTML/CSS/JS",
      description: t("framework.html_desc") || "Vanilla HTML, CSS, and JavaScript",
      icon: "🌐",
      color: "from-orange-500 to-red-500",
    },
    {
      id: "react" as CodeFramework,
      name: "React",
      description: t("framework.react_desc") || "Modern React with Hooks",
      icon: "⚛️",
      color: "from-blue-400 to-cyan-500",
    },
    {
      id: "vue" as CodeFramework,
      name: "Vue 3",
      description: t("framework.vue_desc") || "Vue 3 with Composition API",
      icon: "💚",
      color: "from-green-400 to-emerald-500",
    },
    {
      id: "angular" as CodeFramework,
      name: "Angular",
      description: t("framework.angular_desc") || "Angular with TypeScript",
      icon: "🅰️",
      color: "from-red-500 to-pink-500",
    },
    {
      id: "svelte" as CodeFramework,
      name: "Svelte",
      description: t("framework.svelte_desc") || "Svelte with reactive components",
      icon: "🔥",
      color: "from-orange-400 to-red-500",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-3">
          {t("framework.select") || "Select Framework"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t("framework.choose") || "Choose your preferred framework"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {frameworks.map((framework) => (
          <Card
            key={framework.id}
            className={`p-4 cursor-pointer transition-all ${
              selected === framework.id
                ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950"
                : "hover:shadow-lg"
            }`}
            onClick={() => onSelect(framework.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{framework.icon}</div>
              {selected === framework.id && (
                <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            <h4 className="font-semibold text-sm mb-1">{framework.name}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {framework.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
