"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Languages,
  ExternalLink,
  Bot,
  User as UserIcon,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  SUGGESTED_QUESTIONS_EN,
  SUGGESTED_QUESTIONS_HI,
  DeepLink,
} from "@/services/companion/career-companion.service";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  language: "en" | "hi";
  timestamp: string;
  deepLinks?: DeepLink[];
  isAiGenerated?: boolean;
}

// Message ID Generator
let messageCounter = 0;
function getUniqueMsgId(prefix: string): string {
  messageCounter += 1;
  return `${prefix}-${messageCounter}`;
}

// Extend Window interface for Web Speech API
interface IWindow extends Window {
  SpeechRecognition?: new () => any;
  webkitSpeechRecognition?: new () => any;
}

export default function CareerCompanionPage() {
  const [language, setLanguage] = React.useState<"en" | "hi">("en");
  const [inputMessage, setInputMessage] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Welcome to NexSkill AI Career Companion — From Skill to Opportunity! I can help you explore career pathways, identify high-impact skill gaps, optimize your resume for applicant tracking systems, and connect with experienced mentors. How can I assist your career journey today?",
      language: "en",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      deepLinks: [
        { label: "Career Explorer", href: "/dashboard/career-explorer" },
        { label: "Resume Analyzer", href: "/dashboard/resume" },
        { label: "Skill Assessments", href: "/dashboard/assessments" },
      ],
    },
  ]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [speakingId, setSpeakingId] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const recognitionRef = React.useRef<any>(null);

  // Initialize Speech Recognition on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const win = window as unknown as IWindow;
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
          setNotice("Microphone input timed out or was not permitted.");
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Auto-scroll to bottom of chat
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Clean up speech synthesis on unmount
  React.useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleLanguageChange = (newLang: "en" | "hi") => {
    setLanguage(newLang);
    if (messages.length === 1 && messages[0].id === "welcome-1") {
      if (newLang === "hi") {
        setMessages([
          {
            id: "welcome-1",
            role: "assistant",
            content:
              "करियरब्रिज AI करियर कम्पेनियन (Career Companion) में आपका स्वागत है! मैं आपकी करियर दिशा चुनने, आवश्यक कौशल समझने, रिज्यूमे सुधारने और अनुभवी मेंटर्स से जुड़ने में आपकी सहायता कर सकता हूँ। आज आप क्या जानना चाहते हैं?",
            language: "hi",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            deepLinks: [
              { label: "करियर एक्सप्लोरर", href: "/dashboard/career-explorer" },
              { label: "रिज्यूमे विश्लेषक", href: "/dashboard/resume" },
              { label: "स्किल असेसमेंट", href: "/dashboard/assessments" },
            ],
          },
        ]);
      } else {
        setMessages([
          {
            id: "welcome-1",
            role: "assistant",
            content:
              "Welcome to NexSkill AI Career Companion — From Skill to Opportunity! I can help you explore career pathways, identify high-impact skill gaps, optimize your resume for applicant tracking systems, and connect with experienced mentors. How can I assist your career journey today?",
            language: "en",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            deepLinks: [
              { label: "Career Explorer", href: "/dashboard/career-explorer" },
              { label: "Resume Analyzer", href: "/dashboard/resume" },
              { label: "Skill Assessments", href: "/dashboard/assessments" },
            ],
          },
        ]);
      }
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setNotice("Voice speech recognition is not supported in this browser. Please type your message.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = language === "hi" ? "hi-IN" : "en-US";
        recognitionRef.current.start();
        setIsListening(true);
        setNotice(null);
      } catch (err) {
        console.error("Speech recognition start failed:", err);
        setIsListening(false);
      }
    }
  };

  const speakText = (id: string, text: string, lang: "en" | "hi") => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setNotice("Text-to-speech audio synthesis is not supported in this browser.");
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-US";
    utterance.rate = 0.95;

    utterance.onend = () => {
      setSpeakingId(null);
    };

    utterance.onerror = () => {
      setSpeakingId(null);
    };

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleClearChat = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
    setMessages([
      {
        id: getUniqueMsgId("welcome"),
        role: "assistant",
        content:
          language === "hi"
            ? "वार्तालाप रीसेट कर दिया गया है। आप करियर से संबंधित कोई भी नया प्रश्न पूछ सकते हैं।"
            : "Conversation cleared. Feel free to ask any career question, explore skill pathways, or request resume feedback.",
        language,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = (messageText ?? inputMessage).trim();
    if (!textToSend || isLoading) return;

    if (speakingId) {
      window.speechSynthesis?.cancel();
      setSpeakingId(null);
    }

    const userMsg: ChatMessage = {
      id: getUniqueMsgId("user"),
      role: "user",
      content: textToSend,
      language,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);
    setNotice(null);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/companion/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          language,
          history: historyPayload,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to communicate with Career Companion");
      }

      const companionReply: ChatMessage = {
        id: getUniqueMsgId("assistant"),
        role: "assistant",
        content: json.data.reply,
        language: json.data.language || language,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        deepLinks: json.data.deepLinks || [],
        isAiGenerated: json.data.isAiGenerated,
      };

      setMessages((prev) => [...prev, companionReply]);
    } catch (err: unknown) {
      console.error("Companion chat error:", err);
      const fallbackReply: ChatMessage = {
        id: getUniqueMsgId("assistant-fallback"),
        role: "assistant",
        content:
          language === "hi"
            ? "माफ़ कीजिए, सर्वर से संपर्क करने में समस्या आई। कृपया पुनः प्रयास करें अथवा अपने Career Explorer और Roadmap पृष्ठों की समीक्षा करें।"
            : "We encountered a momentary communication glitch. Please try asking your question again or explore our Career Explorer and Learning Roadmap modules.",
        language,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentSuggestedQuestions =
    language === "hi" ? SUGGESTED_QUESTIONS_HI : SUGGESTED_QUESTIONS_EN;

  return (
    <StudentPortalLayout>
      <div className="space-y-4 max-w-5xl mx-auto">
        <PageHeader
          title="Multilingual AI Career Companion"
          description="Interactive, real-time career counselor supporting English and Hindi (Devanagari). Ask about technical interview prep, resume optimization, required skill stacks, and mentorship."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Career Support" },
            { label: "AI Career Companion" },
          ]}
          actions={
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <div className="flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleLanguageChange("en")}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                    language === "en"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange("hi")}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1",
                    language === "hi"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <Languages className="w-3.5 h-3.5" />
                  हिन्दी
                </button>
              </div>

              {/* Clear chat button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearChat}
                className="gap-1.5 text-xs text-slate-600"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </Button>
            </div>
          }
        />

        {notice && (
          <div className="flex items-center gap-2 p-3 text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
            <button
              onClick={() => setNotice(null)}
              className="ml-auto text-amber-600 hover:underline font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Suggested Queries Chips Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>{language === "hi" ? "सुझाए गए प्रश्न:" : "Suggested Questions:"}</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {currentSuggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendMessage(q)}
                disabled={isLoading}
                className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50/80 text-indigo-700 border border-indigo-200/70 hover:bg-indigo-100 hover:border-indigo-300 transition-colors shrink-0 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Transcript Area */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 shadow-xs flex flex-col h-[520px]">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3 max-w-[88%] sm:max-w-[80%]",
                    isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-xs",
                      isAssistant
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-800 text-white"
                    )}
                  >
                    {isAssistant ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "rounded-2xl p-4 text-sm leading-relaxed space-y-2 shadow-xs",
                      isAssistant
                        ? "bg-white border border-slate-200 text-slate-800"
                        : "bg-indigo-600 text-white"
                    )}
                  >
                    <div className="whitespace-pre-line">{msg.content}</div>

                    {/* Deep links attached to assistant message */}
                    {isAssistant && msg.deepLinks && msg.deepLinks.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 mt-2 flex flex-wrap gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-400 block w-full">
                          {msg.language === "hi" ? "संबंधित संसाधन:" : "Related Tools:"}
                        </span>
                        {msg.deepLinks.map((link, lIdx) => (
                          <Link
                            key={lIdx}
                            href={link.href}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-colors"
                          >
                            <span>{link.label}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Metadata & Actions row */}
                    <div
                      className={cn(
                        "flex items-center justify-between gap-3 text-[11px] pt-1",
                        isAssistant ? "text-slate-400" : "text-indigo-200"
                      )}
                    >
                      <span>{msg.timestamp}</span>

                      {isAssistant && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(msg.id, msg.content)}
                            title="Copy reply"
                            className="p-1 hover:text-indigo-600 transition-colors"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => speakText(msg.id, msg.content, msg.language)}
                            title={speakingId === msg.id ? "Stop audio" : "Listen in speech"}
                            className="p-1 hover:text-indigo-600 transition-colors"
                          >
                            {speakingId === msg.id ? (
                              <VolumeX className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading typing indicator */}
            {isLoading && (
              <div className="flex gap-3 max-w-[80%] mr-auto">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="rounded-2xl p-4 bg-white border border-slate-200 text-slate-800 shadow-xs flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">
                    {language === "hi" ? "करियर कम्पेनियन सोच रहा है..." : "Companion is analyzing your request..."}
                  </span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200 rounded-b-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Mic Voice Input Button */}
              <button
                type="button"
                onClick={toggleListening}
                title={
                  isListening
                    ? "Listening... Click to stop"
                    : "Speak your question (Voice Input)"
                }
                className={cn(
                  "p-2.5 rounded-xl border transition-all shrink-0",
                  isListening
                    ? "bg-rose-50 text-rose-600 border-rose-300 animate-pulse ring-2 ring-rose-400"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  isListening
                    ? language === "hi"
                      ? "सुन रहा हूँ... बोलिए..."
                      : "Listening... speak now..."
                    : language === "hi"
                    ? "अपना करियर संबंधी प्रश्न यहाँ टाइप करें (उदा. रिज्यूमे, कोडिंग स्किल्स)..."
                    : "Ask about career paths, resume tips, interview prep, or mentors..."
                }
                disabled={isLoading}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all disabled:opacity-50"
              />

              {/* Send Button */}
              <Button
                type="submit"
                variant="primary"
                disabled={!inputMessage.trim() || isLoading}
                className="gap-1.5 px-4 shrink-0 rounded-xl shadow-xs"
              >
                <span>{language === "hi" ? "भेजें" : "Send"}</span>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </StudentPortalLayout>
  );
}
