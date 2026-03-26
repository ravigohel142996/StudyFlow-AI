import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  BookOpen,
  Calendar,
  Timer,
  BarChart3,
  ArrowRight,
  Brain,
  Sparkles,
  Target,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "AI Lecture Summarizer",
    description:
      "Upload PDFs or paste notes. Get instant summaries, key bullet points, and interactive flashcards in seconds.",
    color: "from-violet-500 to-purple-600",
    badge: "Most Popular",
  },
  {
    icon: Calendar,
    title: "Smart Scheduler",
    description:
      "Tell us your classes and deadlines. AI builds your optimized daily flow with Pomodoro blocks and smart breaks.",
    color: "from-cyan-500 to-blue-600",
    badge: "AI-Powered",
  },
  {
    icon: Timer,
    title: "Focus Mode",
    description:
      "Full-screen Pomodoro timer with an AI coach that keeps you motivated when you feel distracted or stuck.",
    color: "from-emerald-500 to-teal-600",
    badge: "New",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Track your study streaks, completed summaries, and focus sessions. Visualize your academic growth.",
    color: "from-amber-500 to-orange-600",
    badge: null,
  },
];

const steps = [
  {
    step: "01",
    title: "Upload or paste your content",
    description: "Drop in a PDF lecture or paste your notes directly.",
  },
  {
    step: "02",
    title: "AI does the heavy lifting",
    description:
      "Get summaries, flashcards, and an optimized schedule instantly.",
  },
  {
    step: "03",
    title: "Enter flow state",
    description:
      "Use Focus Mode with your AI coach to study smarter, not harder.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute -top-20 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-900/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <Badge
            variant="outline"
            className="mb-6 px-4 py-1.5 border-violet-500/40 text-violet-400 bg-violet-500/10 text-sm"
          >
            <Sparkles className="w-3.5 h-3.5 mr-2" />
            Built for LovHack Season 2 · Powered by AI
          </Badge>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Your AI co-pilot for
            <span className="block gradient-text">
              academic success
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            StudyFlow AI turns your chaotic student life into focused,
            productive flow. Summarize lectures, generate smart schedules, and
            enter deep focus — all powered by AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="gradient" size="xl" asChild>
              <Link href="/auth/signup">
                Start for free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link href="/auth/login">Sign in to dashboard</Link>
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            {["No credit card required", "Free to get started", "Instant AI results"].map(
              (item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {item}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to{" "}
              <span className="gradient-text">study smarter</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Four powerful AI-driven tools designed specifically for college
              students who want to maximize their academic potential.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="group border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5 bg-card/50 backdrop-blur-sm"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0 shadow-lg`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {feature.title}
                          </h3>
                          {feature.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {feature.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              From chaos to{" "}
              <span className="gradient-text">flow in minutes</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20">
                  <span className="text-white font-bold text-lg">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-cyan-500/20 rounded-3xl blur-xl" />
            <div className="relative border border-border/50 rounded-3xl p-12 bg-card/50 backdrop-blur-sm">
              <Brain className="w-12 h-12 mx-auto mb-4 text-violet-400" />
              <h2 className="text-3xl font-bold mb-4">
                Ready to unlock your{" "}
                <span className="gradient-text">academic potential?</span>
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Join students who are studying smarter with AI-powered tools.
              </p>
              <Button variant="gradient" size="xl" asChild>
                <Link href="/auth/signup">
                  Get Started — It&apos;s Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-sm">StudyFlow AI</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Target className="w-4 h-4" />
            Built for LovHack Season 2 with AI tools
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 StudyFlow AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
