"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, MessageCircle, X, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Message = { id: string; role: "user" | "bot"; text: string };

export function AskReportBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "bot", text: "Zekai Asistan yakında bu rapor üzerinden sorularını yanıtlayabilecek. Şimdilik rapor verilerini yukarıdan inceleyebilirsin." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", text: userMsg }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: "Bu özellik şu an geliştirme aşamasında. Ürün raporunu incelemek için yukarıdaki sekmeleri kullanabilirsin.",
        }
      ]);
    }, 800);
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => setIsOpen(true)}
            className="group fixed bottom-20 right-3 z-50 flex cursor-pointer items-center gap-2.5 rounded-full bg-[#adff41] px-4 py-3 text-sm font-bold text-[#0a0a0f] shadow-2xl hover:bg-[#9aef30] transition-all hover:scale-105 sm:bottom-24 sm:right-6 sm:px-5 sm:py-3.5"
          >
            <div className="flex size-7 items-center justify-center rounded-full bg-black/10 text-[#0a0a0f] transition-transform group-hover:scale-110">
               <Sparkles className="size-4" />
            </div>
            Asistan (Yakında)
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-20 right-3 z-50 flex w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-[24px] border border-border bg-background/80 shadow-2xl backdrop-blur-3xl sm:bottom-24 sm:right-6 sm:w-[360px]"
            style={{ height: "480px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 bg-card/30 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="relative flex size-9 items-center justify-center rounded-full bg-[#adff41]/20 text-[#5a8a00] dark:text-[#adff41]">
                  <Bot className="size-5" />
                  <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground leading-tight">Zekai Asistan</h3>
                  <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Şu an rapora odaklı</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="cursor-pointer rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                    msg.role === "user" 
                      ? "bg-[#adff41] text-[#0a0a0f] rounded-br-sm font-medium" 
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                   <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-muted px-4 py-3.5 shadow-sm">
                      <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                   </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background border-t border-border/50">
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Rapora bir soru sor..."
                  className="w-full rounded-full border border-border bg-muted/50 py-3 pl-4 pr-12 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[#adff41]/50 focus:bg-background transition-colors shadow-inner"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1.5 flex size-9 items-center justify-center rounded-full bg-[#adff41] text-[#0a0a0f] disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground transition-colors hover:bg-[#9aef30]"
                >
                  <Send className="size-4 ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
