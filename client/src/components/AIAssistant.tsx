import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Sparkles, X, Minimize2, Maximize2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  description?: string;
  language?: string;
  onSuggestion?: (suggestion: string) => void;
}

export function AIAssistant({
  description = "",
  language = "html",
  onSuggestion,
}: AIAssistantProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: t("assistant.greeting") || "مرحباً! أنا مساعدك الذكي في PixelCraft. يمكنني مساعدتك في تحسين مشروعك وتقديم اقتراحات. كيف يمكنني مساعدتك؟",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateSuggestions = (userMessage: string): string => {
    const suggestions: { [key: string]: string[] } = {
      design: [
        "جرب إضافة تدرج لوني جميل في الخلفية",
        "يمكنك استخدام ظلال ناعمة لتحسين العمق",
        "أضف رموز وأيقونات لتحسين التصميم",
      ],
      functionality: [
        "أضف نموذج تواصل للمستخدمين",
        "يمكنك إضافة شريط بحث",
        "جرب إضافة قائمة تنقل ديناميكية",
      ],
      performance: [
        "استخدم الصور المضغوطة لتحسين السرعة",
        "أضف تحميل كسول للصور",
        "استخدم CSS Grid لتحسين التخطيط",
      ],
      accessibility: [
        "تأكد من تباين الألوان الكافي",
        "أضف نصوص بديلة للصور",
        "استخدم عناوين دلالية صحيحة",
      ],
    };

    const message = userMessage.toLowerCase();
    for (const [key, msgs] of Object.entries(suggestions)) {
      if (message.includes(key)) {
        return msgs[Math.floor(Math.random() * msgs.length)];
      }
    }

    return "هذا اقتراح رائع! جرب إضافة المزيد من التفاعلية والرسوم المتحركة لتحسين تجربة المستخدم.";
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Simulate AI response with smart suggestions
      const suggestion = generateSuggestions(input);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: suggestion,
        timestamp: new Date(),
      };

      setTimeout(() => {
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);

        if (onSuggestion) {
          onSuggestion(suggestion);
        }
      }, 800);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(t("assistant.error") || "حدث خطأ في المساعد الذكي");
      setIsLoading(false);
    }
  };

  const quickSuggestions = [
    { text: "تحسين التصميم", emoji: "🎨" },
    { text: "إضافة وظائف", emoji: "⚙️" },
    { text: "تحسين الأداء", emoji: "⚡" },
    { text: "إمكانية الوصول", emoji: "♿" },
  ];

  if (isMinimized) {
    return (
      <Button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 rounded-full w-14 h-14 bg-purple-600 hover:bg-purple-700 shadow-lg flex items-center justify-center"
        title="فتح المساعد الذكي"
      >
        <Sparkles className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] flex flex-col shadow-2xl border border-purple-200 bg-white z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold">
            {t("assistant.title") || "المساعد الذكي"}
          </h3>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(true)}
            className="text-white hover:bg-purple-500"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-purple-500"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.role === "user"
                  ? "bg-purple-600 text-white rounded-br-none"
                  : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString("ar-SA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg rounded-bl-none">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length === 1 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-white">
          <p className="text-xs text-gray-600 mb-2">
            {t("assistant.suggestions") || "اقتراحات سريعة:"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {quickSuggestions.map((suggestion, idx) => (
              <Button
                key={idx}
                size="sm"
                variant="outline"
                onClick={() => {
                  setInput(suggestion.text);
                  setTimeout(() => handleSendMessage(), 100);
                }}
                className="text-xs"
              >
                <span>{suggestion.emoji}</span>
                <span>{suggestion.text}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !isLoading) {
                handleSendMessage();
              }
            }}
            placeholder={t("assistant.placeholder") || "اسأل المساعد..."}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700"
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
