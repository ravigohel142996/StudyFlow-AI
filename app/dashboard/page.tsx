import { createClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Timer,
  Flame,
  CheckCircle2,
  Clock,
  Coffee,
  Brain,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const sampleSchedule = [
  { time: "9:00 AM", duration: "25 min", task: "Study Calculus Chapter 5", type: "work", priority: "high" },
  { time: "9:25 AM", duration: "5 min", task: "Short Break", type: "break", priority: "low" },
  { time: "9:30 AM", duration: "25 min", task: "Review Physics Notes", type: "work", priority: "high" },
  { time: "9:55 AM", duration: "5 min", task: "Short Break", type: "break", priority: "low" },
  { time: "10:00 AM", duration: "25 min", task: "Write CS Assignment", type: "work", priority: "medium" },
  { time: "10:25 AM", duration: "15 min", task: "Long Break", type: "break", priority: "low" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";

  // Fetch real stats
  const [summariesResult, schedulesResult, focusResult] = await Promise.all([
    supabase.from("summaries").select("id", { count: "exact" }).eq("user_id", user!.id),
    supabase.from("schedules").select("id", { count: "exact" }).eq("user_id", user!.id),
    supabase.from("focus_sessions").select("duration").eq("user_id", user!.id),
  ]);

  const summaryCount = summariesResult.count ?? 0;
  const scheduleCount = schedulesResult.count ?? 0;
  const totalFocusMinutes = (focusResult.data ?? []).reduce(
    (acc: number, s: { duration: number }) => acc + (s.duration || 0),
    0
  );

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const energyLevel = hour >= 9 && hour <= 11 ? 90 : hour >= 14 && hour <= 16 ? 60 : 75;

  const stats = [
    {
      label: "Summaries Created",
      value: summaryCount,
      icon: BookOpen,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      href: "/dashboard/summarizer",
    },
    {
      label: "Focus Minutes",
      value: totalFocusMinutes,
      icon: Timer,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      href: "/dashboard/focus",
    },
    {
      label: "Schedules Built",
      value: scheduleCount,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      href: "/dashboard/scheduler",
    },
    {
      label: "Study Streak",
      value: "🔥 1 day",
      icon: Flame,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      href: "/dashboard/history",
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {greeting}, <span className="gradient-text">{userName}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/summarizer">
              <BookOpen className="w-4 h-4 mr-2" />
              Summarize
            </Link>
          </Button>
          <Button variant="gradient" size="sm" asChild>
            <Link href="/dashboard/focus">
              <Zap className="w-4 h-4 mr-2" />
              Focus Now
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="border-border/50 hover:border-border transition-all duration-200 hover:shadow-md cursor-pointer group">
                <CardContent className="p-4">
                  <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <Card className="border-border/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg">Today&apos;s Flow</CardTitle>
                <CardDescription>Your AI-generated study schedule</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/scheduler">Regenerate</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {sampleSchedule.map((block, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    block.type === "break"
                      ? "border-border/30 bg-muted/30"
                      : block.priority === "high"
                      ? "border-violet-500/30 bg-violet-500/5"
                      : "border-border/50 bg-card/50"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {block.type === "break" ? (
                      <Coffee className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Brain className="w-4 h-4 text-violet-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${block.type === "break" ? "text-muted-foreground" : ""}`}>
                      {block.task}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {block.time} · {block.duration}
                    </p>
                  </div>
                  {block.type === "work" && (
                    <Badge
                      variant={block.priority === "high" ? "default" : "secondary"}
                      className="text-xs flex-shrink-0"
                    >
                      {block.priority}
                    </Badge>
                  )}
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full mt-2 text-muted-foreground" asChild>
                <Link href="/dashboard/scheduler">
                  <Clock className="w-4 h-4 mr-2" />
                  Generate full schedule
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Energy Level */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Energy Level
              </CardTitle>
              <CardDescription>Based on your schedule patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Focus Capacity</span>
                    <span className="font-semibold text-violet-400">{energyLevel}%</span>
                  </div>
                  <Progress value={energyLevel} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Peak Hours</span>
                    <span className="text-muted-foreground text-xs">9 AM – 11 AM</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  💡 You&apos;re in a{" "}
                  <span className="text-violet-400 font-medium">
                    {energyLevel > 80 ? "high" : energyLevel > 60 ? "medium" : "low"}
                  </span>{" "}
                  energy zone. Schedule your hardest tasks now.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Upload a lecture PDF", href: "/dashboard/summarizer", icon: BookOpen },
                { label: "Build today's schedule", href: "/dashboard/scheduler", icon: Clock },
                { label: "Start focus session", href: "/dashboard/focus", icon: Timer },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.label}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-sm"
                    asChild
                  >
                    <Link href={action.href}>
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      {action.label}
                    </Link>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
