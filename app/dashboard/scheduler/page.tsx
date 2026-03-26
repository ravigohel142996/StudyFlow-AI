"use client";

import { useState } from "react";
import {
  Calendar,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  Brain,
  Coffee,
  Clock,
  Save,
  CheckCheck,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase";

interface Task {
  id: string;
  subject: string;
  task: string;
  deadline: string;
  priority: "high" | "medium" | "low";
}

interface ScheduleBlock {
  time: string;
  duration: string;
  task: string;
  subject: string;
  type: "work" | "break" | "meal";
  priority: "high" | "medium" | "low";
  tip?: string;
}

interface GeneratedSchedule {
  schedule: ScheduleBlock[];
  summary: string;
  totalStudyTime: string;
  breakCount: number;
}

const DEMO_TASKS: Task[] = [
  { id: "1", subject: "Mathematics", task: "Complete Problem Set 4", deadline: "Tomorrow", priority: "high" },
  { id: "2", subject: "Computer Science", task: "Finish Lab Assignment 3", deadline: "In 3 days", priority: "high" },
  { id: "3", subject: "Physics", task: "Review Chapter 7 – Waves", deadline: "In 5 days", priority: "medium" },
  { id: "4", subject: "English", task: "Write essay outline", deadline: "Next week", priority: "low" },
];

export default function SchedulerPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [studyHours, setStudyHours] = useState("9:00 AM to 9:00 PM");
  const [preferences, setPreferences] = useState("Standard Pomodoro, include lunch break");
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    subject: "",
    task: "",
    deadline: "",
    priority: "medium",
  });
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addTask = () => {
    if (!newTask.subject || !newTask.task) {
      toast({ title: "Fill in subject and task", variant: "destructive" });
      return;
    }
    setTasks([...tasks, { ...newTask, id: Date.now().toString() }]);
    setNewTask({ subject: "", task: "", deadline: "", priority: "medium" });
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const loadDemo = () => {
    setTasks(DEMO_TASKS);
    toast({ title: "Demo tasks loaded!", description: "Now click Generate My Daily Flow." });
  };

  const generateSchedule = async () => {
    if (tasks.length === 0) {
      toast({ title: "Add at least one task first", variant: "destructive" });
      return;
    }
    setLoading(true);
    setSchedule(null);
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks, studyHours, preferences }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSchedule(data);
      setSaved(false);
    } catch (err) {
      toast({
        title: "Schedule generation failed",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSchedule = async () => {
    if (!schedule) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Not logged in", variant: "destructive" }); setSaving(false); return; }

    const { error } = await supabase.from("schedules").insert({
      user_id: user.id,
      date: new Date().toISOString().split("T")[0],
      schedule_data: schedule,
    });

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      setSaved(true);
      toast({ title: "Schedule saved!", description: "Find it in your History tab." });
    }
    setSaving(false);
  };

  const blockIcon = (type: string) => {
    if (type === "break") return <Coffee className="w-4 h-4 text-amber-400" />;
    if (type === "meal") return <Utensils className="w-4 h-4 text-emerald-400" />;
    return <Brain className="w-4 h-4 text-violet-400" />;
  };

  const priorityVariant = (p: string) => {
    if (p === "high") return "default";
    if (p === "medium") return "secondary";
    return "outline";
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6 text-cyan-400" />
          Smart Scheduler
        </h1>
        <p className="text-muted-foreground mt-1">
          Add your tasks and let AI build your perfect study flow
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Task input */}
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Add Tasks</CardTitle>
              <CardDescription>Enter your assignments and deadlines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add task form */}
              <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Subject</Label>
                    <Input
                      placeholder="Math, CS..."
                      value={newTask.subject}
                      onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Deadline</Label>
                    <Input
                      placeholder="Tomorrow, In 3 days"
                      value={newTask.deadline}
                      onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                      className="h-8"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Task Description</Label>
                  <Input
                    placeholder="e.g., Complete problem set 4"
                    value={newTask.task}
                    onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                    className="h-8"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Priority:</Label>
                  {(["high", "medium", "low"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewTask({ ...newTask, priority: p })}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        newTask.priority === p
                          ? p === "high"
                            ? "bg-red-500/20 border-red-500/50 text-red-400"
                            : p === "medium"
                            ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                            : "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                          : "border-border/50 text-muted-foreground hover:border-border"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <Button size="sm" className="ml-auto h-7" onClick={addTask}>
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Task list */}
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No tasks yet.</p>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={loadDemo}>
                    Load demo tasks
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50 group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium truncate">{task.subject}</span>
                          <Badge variant={priorityVariant(task.priority) as "default" | "secondary" | "outline"} className="text-xs flex-shrink-0">
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{task.task}</p>
                        {task.deadline && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {task.deadline}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => removeTask(task.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Available Study Hours</Label>
                <Input
                  placeholder="9:00 AM to 9:00 PM"
                  value={studyHours}
                  onChange={(e) => setStudyHours(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Preferences</Label>
                <Input
                  placeholder="Include lunch, Pomodoro style..."
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  className="h-8"
                />
              </div>
            </CardContent>
          </Card>

          <Button
            variant="gradient"
            className="w-full"
            size="lg"
            onClick={generateSchedule}
            disabled={loading || tasks.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating your flow...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate My Daily Flow
              </>
            )}
          </Button>
        </div>

        {/* Right: Generated schedule */}
        <div>
          {loading && (
            <Card className="border-border/50 h-full">
              <CardContent className="p-6 space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-16 h-8 shimmer rounded flex-shrink-0" />
                    <div className="flex-1 h-8 shimmer rounded" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {schedule && !loading && (
            <Card className="border-border/50 border-cyan-500/20">
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Your Daily Flow
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {schedule.totalStudyTime} study · {schedule.breakCount} breaks
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={saveSchedule} disabled={saving || saved}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                  {saved ? "Saved!" : "Save"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                {schedule.summary && (
                  <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 mb-3">
                    💡 {schedule.summary}
                  </p>
                )}
                {schedule.schedule.map((block, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      block.type === "break" || block.type === "meal"
                        ? "border-border/30 bg-muted/20"
                        : block.priority === "high"
                        ? "border-violet-500/30 bg-violet-500/5"
                        : "border-border/50 bg-card/50"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">{blockIcon(block.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{block.task}</span>
                        {block.type === "work" && (
                          <Badge variant={priorityVariant(block.priority) as "default" | "secondary" | "outline"} className="text-xs">
                            {block.priority}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {block.time} · {block.duration}
                        {block.subject && block.type === "work" && ` · ${block.subject}`}
                      </p>
                      {block.tip && (
                        <p className="text-xs text-muted-foreground/70 mt-1 italic">
                          💡 {block.tip}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {!schedule && !loading && (
            <div className="h-full flex items-center justify-center min-h-[300px]">
              <div className="text-center text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Your AI-generated schedule will appear here</p>
                <p className="text-xs mt-1">Add tasks and click Generate</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
