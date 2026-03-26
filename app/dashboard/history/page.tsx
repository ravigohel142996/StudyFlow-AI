import { createClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, BookOpen, Calendar, Timer, Flame, Clock, TrendingUp, Award } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Summary {
  id: string;
  title: string;
  summary_text: string;
  created_at: string;
  flashcards: { question: string; answer: string }[];
}

interface Schedule {
  id: string;
  date: string;
  created_at: string;
  schedule_data: {
    summary?: string;
    totalStudyTime?: string;
    breakCount?: number;
  };
}

interface FocusSession {
  id: string;
  duration: number;
  notes: string;
  created_at: string;
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [summariesRes, schedulesRes, focusRes] = await Promise.all([
    supabase
      .from("summaries")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("schedules")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const summaries: Summary[] = summariesRes.data || [];
  const schedules: Schedule[] = schedulesRes.data || [];
  const focusSessions: FocusSession[] = focusRes.data || [];

  const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const totalFocusHours = Math.floor(totalFocusMinutes / 60);

  // Simple streak calculation (days with focus sessions in the last 7 days)
  const today = new Date();
  const streakDays = new Set(
    focusSessions
      .filter((s) => {
        const d = new Date(s.created_at);
        const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        return diff < 7;
      })
      .map((s) => new Date(s.created_at).toDateString())
  ).size;

  const stats = [
    { label: "Summaries", value: summaries.length, icon: BookOpen, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Schedules", value: schedules.length, icon: Calendar, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Focus Hours", value: `${totalFocusHours}h ${totalFocusMinutes % 60}m`, icon: Timer, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Day Streak", value: `${streakDays} days`, icon: Flame, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  // Weekly activity (last 7 days)
  const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });
    const sessions = focusSessions.filter((s) => {
      const sd = new Date(s.created_at);
      return sd.toDateString() === date.toDateString();
    });
    const minutes = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    return { day: dayLabel, minutes, sessions: sessions.length };
  });

  const maxMinutes = Math.max(...weeklyActivity.map((d) => d.minutes), 1);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
          History & Progress
        </h1>
        <p className="text-muted-foreground mt-1">Track your study journey and celebrate your wins</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Weekly activity chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            Weekly Focus Activity
          </CardTitle>
          <CardDescription>Minutes of focused study per day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-32">
            {weeklyActivity.map((day, i) => {
              const heightPct = (day.minutes / maxMinutes) * 100;
              const isToday = i === 6;
              return (
                <div key={day.day} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full flex items-end justify-center" style={{ height: "80px" }}>
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isToday
                          ? "bg-gradient-to-t from-violet-600 to-violet-400"
                          : "bg-violet-500/30"
                      }`}
                      style={{ height: day.minutes > 0 ? `${Math.max(heightPct, 4)}%` : "4px" }}
                      title={`${day.minutes} min`}
                    />
                  </div>
                  <span className={`text-xs ${isToday ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Progress value={(streakDays / 7) * 100} className="h-2 w-24" />
              <span className="text-xs text-muted-foreground">{streakDays}/7 days this week</span>
            </div>
            {streakDays >= 5 && (
              <Badge variant="success" className="gap-1">
                <Award className="w-3 h-3" />
                On fire! 🔥
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summaries History */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-400" />
                Recent Summaries
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/summarizer">+ New</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {summaries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No summaries yet</p>
                <Button variant="ghost" size="sm" className="mt-2" asChild>
                  <Link href="/dashboard/summarizer">Create your first summary →</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {summaries.map((s) => (
                  <div key={s.id} className="p-3 rounded-lg border border-border/50 bg-card/50">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate flex-1">{s.title}</p>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {s.flashcards?.length ?? 0} cards
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {s.summary_text}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(s.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedules + Focus Sessions */}
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Recent Schedules
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/scheduler">+ New</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No schedules yet</p>
                  <Button variant="ghost" size="sm" className="mt-1" asChild>
                    <Link href="/dashboard/scheduler">Generate a schedule →</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {schedules.map((s) => (
                    <div key={s.id} className="p-3 rounded-lg border border-border/50 bg-card/50 flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          Schedule for {new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.schedule_data?.totalStudyTime || "–"} · {s.schedule_data?.breakCount || 0} breaks
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Timer className="w-4 h-4 text-emerald-400" />
                Recent Focus Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {focusSessions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Timer className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No focus sessions yet</p>
                  <Button variant="ghost" size="sm" className="mt-1" asChild>
                    <Link href="/dashboard/focus">Start focusing →</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {focusSessions.slice(0, 5).map((s) => (
                    <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <Timer className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{s.duration} min focus</p>
                        <p className="text-xs text-muted-foreground">{formatDate(s.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
