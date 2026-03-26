"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  Loader2,
  BookOpen,
  Sparkles,
  FileText,
  Copy,
  Save,
  CheckCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flashcard } from "@/components/flashcard";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase";

interface SummaryResult {
  title: string;
  summary: string;
  keyPoints: string[];
  flashcards: { question: string; answer: string }[];
}

export default function SummarizerPage() {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setContent(e.target?.result as string);
        if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
      };
      reader.readAsText(file);
    } else if (file.type === "application/pdf") {
      // For PDFs, show a message to paste text instead
      toast({
        title: "PDF uploaded",
        description: "Please copy and paste the text content from your PDF into the text area below, then click Summarize.",
      });
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
    } else {
      toast({ title: "Unsupported file type", description: "Please upload a PDF or text file.", variant: "destructive" });
    }
  }, [title, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "text/plain": [".txt"] },
    maxFiles: 1,
  });

  const handleSummarize = async () => {
    if (!content.trim()) {
      toast({ title: "No content", description: "Please paste your lecture notes or upload a file.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to summarize");
      setResult(data);
      setSaved(false);
    } catch (err) {
      toast({
        title: "Summarization failed",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Not logged in", variant: "destructive" }); setSaving(false); return; }

    const { error } = await supabase.from("summaries").insert({
      user_id: user.id,
      title: result.title || "Untitled",
      summary_text: result.summary,
      flashcards: result.flashcards,
    });

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      setSaved(true);
      toast({ title: "Saved!", description: "Summary saved to your history." });
    }
    setSaving(false);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `${result.title}\n\nSummary:\n${result.summary}\n\nKey Points:\n${result.keyPoints.map(p => `• ${p}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDemo = () => {
    setTitle("Introduction to Machine Learning");
    setContent(`Machine Learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. 

The main types of machine learning are:
1. Supervised Learning: The algorithm learns from labeled training data
2. Unsupervised Learning: Finding patterns in unlabeled data
3. Reinforcement Learning: Learning through reward and punishment

Key algorithms include:
- Linear Regression for predicting continuous values
- Decision Trees for classification problems
- Neural Networks for complex pattern recognition
- K-Means for clustering similar data points

Applications include image recognition, natural language processing, recommendation systems, and autonomous vehicles. The field relies heavily on statistics, linear algebra, and calculus. Feature engineering and data preprocessing are critical steps before model training.

Model evaluation metrics include accuracy, precision, recall, F1-score, and ROC-AUC. Overfitting and underfitting are common challenges that can be addressed through regularization and cross-validation techniques.`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-violet-400" />
          AI Lecture Summarizer
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload your lecture notes or PDF, and get instant summaries + flashcards
        </p>
      </div>

      {/* Input section */}
      <Card className="border-border/50">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder="e.g., Week 3 – Organic Chemistry"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-violet-500 bg-violet-500/5"
                : "border-border/50 hover:border-border hover:bg-muted/30"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium">
              {isDragActive ? "Drop your file here..." : "Drop a PDF or TXT file here"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or paste your notes</span>
            </div>
          </div>

          <Textarea
            placeholder="Paste your lecture notes, textbook excerpt, or any study material here..."
            className="min-h-[180px] resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="flex flex-wrap gap-3">
            <Button
              variant="gradient"
              onClick={handleSummarize}
              disabled={loading || !content.trim()}
              className="flex-1 sm:flex-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Summarize with AI
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleDemo} disabled={loading}>
              <FileText className="w-4 h-4 mr-2" />
              Load Demo
            </Button>
            {content && (
              <Button variant="ghost" size="icon" onClick={() => { setContent(""); setTitle(""); }}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading skeleton */}
      {loading && (
        <Card className="border-border/50">
          <CardContent className="p-6 space-y-4">
            <div className="h-4 shimmer rounded w-1/3" />
            <div className="space-y-2">
              <div className="h-3 shimmer rounded" />
              <div className="h-3 shimmer rounded w-5/6" />
              <div className="h-3 shimmer rounded w-4/6" />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 shimmer rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && !loading && (
        <Card className="border-border/50 border-violet-500/20">
          <CardHeader className="flex flex-row items-start justify-between pb-3 flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                {result.title}
              </CardTitle>
              <CardDescription className="mt-1">
                {result.keyPoints.length} key points · {result.flashcards.length} flashcards
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleSave} disabled={saving || saved}>
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <CheckCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saved ? "Saved!" : "Save"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="keypoints">Key Points</TabsTrigger>
                <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-4">
                <div className="bg-muted/30 rounded-lg p-4 leading-relaxed text-sm">
                  {result.summary}
                </div>
              </TabsContent>

              <TabsContent value="keypoints" className="mt-4">
                <ul className="space-y-3">
                  {result.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Badge
                        variant="secondary"
                        className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {i + 1}
                      </Badge>
                      <span className="text-sm leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="flashcards" className="mt-4">
                <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                  <span>👆</span> Click each card to flip between question and answer
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.flashcards.map((card, i) => (
                    <Flashcard
                      key={i}
                      question={card.question}
                      answer={card.answer}
                      index={i}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
