"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Timer, Play, Pause, RotateCcw, SkipForward, Send, Loader2, Bot, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase";
import { formatTime } from "@/lib/utils";

type Mode = "work" | "break" | "longBreak";

const DURATIONS: Record<Mode, number> = {
  work: 25 * 60,
  break: 5 * 60,
  longBreak: 15 * 60,
};

const MODE_LABELS: Record<Mode, string> = {
  work: "Focus Time",
  break: "Short Break",
  longBreak: "Long Break",
};

const MODE_COLORS: Record<Mode, string> = {
  work: "from-violet-600 to-purple-700",
  break: "from-emerald-600 to-teal-700",
  longBreak: "from-cyan-600 to-blue-700",
};

interface Message {
  role: "user" | "ai";
  content: string;
}

const QUICK_PROMPTS = [
  "I'm distracted 😵",
  "Motivate me! 🔥",
  "I need a study tip",
  "I completed a task! 🎉",
];

export default function FocusPage() {
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessions] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hey! I'm Aria, your AI study coach 🧠 I'm here to keep you focused and motivated. Start your timer and let's crush those goals! 💪" },
  ]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionStartRef = useRef<Date | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleModeComplete = useCallback(async () => {
    setIsRunning(false);
    if (mode === "work") {
      const newSessions = sessionsCompleted + 1;
      setSessions(newSessions);

      // Log to Supabase
      const duration = DURATIONS.work / 60;
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("focus_sessions").insert({
          user_id: user.id,
          duration,
          notes: `Pomodoro session #${newSessions}`,
        });
      }

      const nextMode: Mode = newSessions % 4 === 0 ? "longBreak" : "break";
      toast({
        title: "🎉 Focus session complete!",
        description: `Great work! Time for a ${nextMode === "longBreak" ? "long" : "short"} break.`,
      });
      setMode(nextMode);
      setTimeLeft(DURATIONS[nextMode]);

      // Auto AI message
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: `Amazing work! You just completed Pomodoro #${newSessions}! 🎉 Take your break — you've earned it. Come back refreshed and ready to keep going! 🌟` },
      ]);
    } else {
      toast({ title: "Break over! Let's get back to work 💪" });
      setMode("work");
      setTimeLeft(DURATIONS.work);
    }
  }, [mode, sessionsCompleted, toast]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            handleModeComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, handleModeComplete]);

  const handleStart = () => {
    if (!isRunning) sessionStartRef.current = new Date();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(DURATIONS[mode]);
  };

  const handleSkip = () => {
    setIsRunning(false);
    const nextMode: Mode = mode === "work" ? "break" : "work";
    setMode(nextMode);
    setTimeLeft(DURATIONS[nextMode]);
  };

  const switchMode = (m: Mode) => {
    setIsRunning(false);
    setMode(m);
    setTimeLeft(DURATIONS[m]);
  };

  const sendMessage = async (msg?: string) => {
    const text = msg || input.trim();
    if (!text) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setChatLoading(true);

    try {
      const context = `Mode: ${MODE_LABELS[mode]}, Time left: ${formatTime(timeLeft)}, Sessions done: ${sessionsCompleted}`;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, context }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", content: data.response }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "ai",
        content: "You're doing great! Keep pushing — every minute of focus brings you closer to your goals! 💪",
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const progress = ((DURATIONS[mode] - timeLeft) / DURATIONS[mode]) * 100;
  const circumference = 2 * Math.PI * 110;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`${fullscreen ? "fixed inset-0 z-50 bg-background" : "p-6"} max-w-6xl mx-auto`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Timer className="w-6 h-6 text-violet-400" />
              Focus Mode
            </h1>
            <p className="text-muted-foreground mt-1">Pomodoro timer with your AI study coach</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              🍅 {sessionsCompleted} sessions
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => setFullscreen(!fullscreen)}>
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer */}
          <div className="lg:col-span-2">
            <Card className="border-border/50">
              <CardContent className="p-8">
                {/* Mode selector */}
                <div className="flex gap-2 justify-center mb-8">
                  {(["work", "break", "longBreak"] as Mode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => switchMode(m)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        mode === m
                          ? "bg-violet-600/20 text-violet-400 border border-violet-500/40"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {MODE_LABELS[m]}
                    </button>
                  ))}
                </div>

                {/* Circular timer */}
                <div className="flex flex-col items-center">
                  <div className="relative w-64 h-64">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
                      {/* Background circle */}
                      <circle
                        cx="120"
                        cy="120"
                        r="110"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="8"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="120"
                        cy="120"
                        r="110"
                        fill="none"
                        stroke="url(#timerGradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#7c3aed" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold font-mono tracking-tight">
                        {formatTime(timeLeft)}
                      </span>
                      <span className={`text-sm font-medium mt-1 bg-gradient-to-r ${MODE_COLORS[mode]} bg-clip-text text-transparent`}>
                        {MODE_LABELS[mode]}
                      </span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-4 mt-8">
                    <Button variant="ghost" size="icon" className="w-12 h-12" onClick={handleReset}>
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="gradient"
                      className="w-16 h-16 rounded-full text-2xl"
                      onClick={handleStart}
                    >
                      {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="w-12 h-12" onClick={handleSkip}>
                      <SkipForward className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border/50">
                  {[
                    { label: "Sessions Done", value: sessionsCompleted },
                    { label: "Focus Time", value: `${sessionsCompleted * 25}m` },
                    { label: "Until Long Break", value: `${4 - (sessionsCompleted % 4)} left` },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Chat Coach */}
          <div>
            <Card className="border-border/50 h-full flex flex-col" style={{ minHeight: "500px" }}>
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bot className="w-4 h-4 text-violet-400" />
                  Aria – AI Coach
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ml-auto" />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 p-4 pt-0 gap-3 min-h-0">
                {/* Messages */}
                <ScrollArea className="flex-1 pr-1">
                  <div className="space-y-3">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "bg-violet-600/80 text-white rounded-br-sm"
                              : "bg-muted text-foreground rounded-bl-sm"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <span key={i} className={`w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Quick prompts */}
                <div className="flex flex-wrap gap-1.5 flex-shrink-0">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => sendMessage(p)}
                      disabled={chatLoading}
                      className="text-xs px-2.5 py-1 rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors disabled:opacity-50"
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="flex gap-2 flex-shrink-0">
                  <Input
                    placeholder="Ask Aria anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="h-8 text-sm"
                    disabled={chatLoading}
                  />
                  <Button
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => sendMessage()}
                    disabled={chatLoading || !input.trim()}
                  >
                    {chatLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
