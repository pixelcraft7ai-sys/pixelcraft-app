import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Link as LinkIcon } from "lucide-react";

interface Interface {
  id: number;
  name: string;
  type: "frontend" | "backend" | "mobile" | "api" | "database";
  language: string;
  status: "draft" | "active" | "archived";
}

interface InterfaceSelectorProps {
  interfaces: Interface[];
  selectedInterfaceId?: number;
  onSelectInterface: (id: number) => void;
  onCreateInterface: (name: string, type: string, language: string) => void;
  onDeleteInterface: (id: number) => void;
  onLinkInterface: (sourceId: number, targetId: number) => void;
}

const InterfaceTypeIcons: Record<string, string> = {
  frontend: "🎨",
  backend: "⚙️",
  mobile: "📱",
  api: "🔌",
  database: "🗄️",
};

const LanguageIcons: Record<string, string> = {
  react: "⚛️",
  vue: "💚",
  angular: "🅰️",
  svelte: "🔥",
  html: "🌐",
  nodejs: "🟢",
  python: "🐍",
  php: "🐘",
  java: "☕",
  csharp: "#️⃣",
};

export function InterfaceSelector({
  interfaces,
  selectedInterfaceId,
  onSelectInterface,
  onCreateInterface,
  onDeleteInterface,
  onLinkInterface,
}: InterfaceSelectorProps) {
  const { t } = useTranslation();
  const [newInterfaceName, setNewInterfaceName] = useState("");
  const [newInterfaceType, setNewInterfaceType] = useState("frontend");
  const [newInterfaceLanguage, setNewInterfaceLanguage] = useState("react");
  const [linkSourceId, setLinkSourceId] = useState<number | null>(null);
  const [linkTargetId, setLinkTargetId] = useState<number | null>(null);

  const handleCreateInterface = () => {
    if (newInterfaceName.trim()) {
      onCreateInterface(newInterfaceName, newInterfaceType, newInterfaceLanguage);
      setNewInterfaceName("");
    }
  };

  const handleLinkInterfaces = () => {
    if (linkSourceId && linkTargetId && linkSourceId !== linkTargetId) {
      onLinkInterface(linkSourceId, linkTargetId);
      setLinkSourceId(null);
      setLinkTargetId(null);
    }
  };

  const isSelected = (id: number) => selectedInterfaceId === id;

  return (
    <div className="w-full space-y-4 p-4 border-r border-border bg-card">
      <div className="space-y-2">
        <h3 className="font-semibold text-sm text-foreground">
          {t("editor.interfaces", "Interfaces")}
        </h3>

        {/* Interface List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {interfaces.map((iface) => (
            <div
              key={iface.id}
              onClick={() => onSelectInterface(iface.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                isSelected(iface.id)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span>{InterfaceTypeIcons[iface.type]}</span>
                  <span>{LanguageIcons[iface.language]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{iface.name}</p>
                    <p className="text-xs opacity-75">{iface.type}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteInterface(iface.id);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create New Interface */}
      <div className="space-y-2 border-t border-border pt-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase">
          {t("editor.createInterface", "Create Interface")}
        </h4>
        <input
          type="text"
          placeholder={t("editor.interfaceName", "Interface name")}
          value={newInterfaceName}
          onChange={(e) => setNewInterfaceName(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
        />
        <Select value={newInterfaceType} onValueChange={setNewInterfaceType}>
          <SelectTrigger className="w-full h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="frontend">Frontend</SelectItem>
            <SelectItem value="backend">Backend</SelectItem>
            <SelectItem value="mobile">Mobile</SelectItem>
            <SelectItem value="api">API</SelectItem>
            <SelectItem value="database">Database</SelectItem>
          </SelectContent>
        </Select>
        <Select value={newInterfaceLanguage} onValueChange={setNewInterfaceLanguage}>
          <SelectTrigger className="w-full h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="react">React</SelectItem>
            <SelectItem value="vue">Vue 3</SelectItem>
            <SelectItem value="angular">Angular</SelectItem>
            <SelectItem value="svelte">Svelte</SelectItem>
            <SelectItem value="html">HTML/CSS/JS</SelectItem>
            <SelectItem value="nodejs">Node.js/Express</SelectItem>
            <SelectItem value="python">Python/Flask</SelectItem>
            <SelectItem value="php">PHP/Laravel</SelectItem>
            <SelectItem value="java">Java/Spring Boot</SelectItem>
            <SelectItem value="csharp">C#/.NET Core</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={handleCreateInterface}
          className="w-full"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("editor.addInterface", "Add Interface")}
        </Button>
      </div>

      {/* Link Interfaces */}
      {interfaces.length > 1 && (
        <div className="space-y-2 border-t border-border pt-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase">
            {t("editor.linkInterfaces", "Link Interfaces")}
          </h4>
          <Select
            value={linkSourceId?.toString() || ""}
            onValueChange={(val) => setLinkSourceId(parseInt(val))}
          >
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder={t("editor.selectSource", "Select source")} />
            </SelectTrigger>
            <SelectContent>
              {interfaces.map((iface) => (
                <SelectItem key={iface.id} value={iface.id.toString()}>
                  {iface.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={linkTargetId?.toString() || ""}
            onValueChange={(val) => setLinkTargetId(parseInt(val))}
          >
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder={t("editor.selectTarget", "Select target")} />
            </SelectTrigger>
            <SelectContent>
              {interfaces.map((iface) => (
                <SelectItem key={iface.id} value={iface.id.toString()}>
                  {iface.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleLinkInterfaces}
            disabled={!linkSourceId || !linkTargetId || linkSourceId === linkTargetId}
            className="w-full"
            size="sm"
            variant="outline"
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            {t("editor.createLink", "Create Link")}
          </Button>
        </div>
      )}
    </div>
  );
}
