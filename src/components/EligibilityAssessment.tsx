import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TopNav } from "./TopNav";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { fetchEligibilityQuestions, type ApiQuestion } from "@/lib/api";

interface Props {
  onPass: () => void;
  onCancel: () => void;
}

type Answer = string | string[] | null;

interface LocalQuestion {
  section: string;
  title: string;
  note?: string;
  type: "single" | "multi";
  options: string[];
  passIf: (a: Answer) => boolean;
  failMessage: string;
}

export const EligibilityAssessment = ({ onPass, onCancel }: Props) => {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [failed, setFailed] = useState<{ q: LocalQuestion; answer: Answer } | null>(null);
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEligibilityQuestions().then((data) => {
      const mapped: LocalQuestion[] = data.map((q) => ({
        section: q.section,
        title: q.title,
        note: q.note ?? undefined,
        type: q.question_type,
        options: q.options,
        passIf: (a: Answer) => {
          if (q.question_type === "multi") {
            const correct = Array.isArray(q.correct_answer) ? q.correct_answer : [q.correct_answer];
            return Array.isArray(a) && a.length === correct.length && correct.every((c) => a.includes(c));
          }
          return a === q.correct_answer;
        },
        failMessage: q.fail_message,
      }));
      setQuestions(mapped);
      setLoading(false);
    });
  }, []);

  if (loading || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <TopNav />
        <main className="flex-1 flex items-center justify-center p-6">
          <p className="text-muted-foreground">Loading eligibility assessment...</p>
        </main>
      </div>
    );
  }

  const q = questions[idx];
  const current = answers[q.title];
  const progress = ((idx + (current ? 1 : 0)) / questions.length) * 100;

  const setAnswer = (val: Answer) => setAnswers((p) => ({ ...p, [q.title]: val }));

  const toggleMulti = (opt: string) => {
    const arr = Array.isArray(current) ? [...current] : [];
    const i = arr.indexOf(opt);
    if (i >= 0) arr.splice(i, 1);
    else arr.push(opt);
    setAnswer(arr);
  };

  const handleNext = () => {
    if (!q.passIf(current)) {
      setFailed({ q, answer: current });
      return;
    }
    if (idx === questions.length - 1) onPass();
    else setIdx(idx + 1);
  };

  if (failed) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <TopNav />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-2xl w-full shadow-card border-destructive/30">
            <CardHeader className="space-y-3">
              <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                <XCircle className="h-7 w-7" />
              </div>
              <Badge variant="outline" className="w-fit text-destructive border-destructive/30">Eligibility Failed</Badge>
              <CardTitle className="text-2xl">Your project is not eligible for DIS Managed Cloud onboarding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm space-y-2">
                <p className="font-medium text-foreground">Reason:</p>
                <p className="text-muted-foreground">{failed.q.failMessage}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                Please review the DIS Managed Cloud onboarding criteria with your governance contact (ISM, Security, Compliance) before retrying.
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onCancel}><ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard</Button>
                <Button onClick={() => { setFailed(null); setAnswers({}); setIdx(0); }}>Restart Assessment</Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav />
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full shadow-card">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Onboarding Eligibility Assessment</Badge>
              <Badge variant="secondary">{idx + 1}/{questions.length}</Badge>
            </div>
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{q.section}</p>
            <CardTitle className="text-xl leading-snug">{q.title}</CardTitle>
            {q.note && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {q.note}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {q.type === "single" ? (
              <RadioGroup value={(current as string) ?? ""} onValueChange={setAnswer} className="space-y-2">
                {q.options.map((opt) => (
                  <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${current === opt ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                    <RadioGroupItem value={opt} />
                    <span className="text-sm font-medium">{opt}</span>
                  </label>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const checked = Array.isArray(current) && current.includes(opt);
                  return (
                    <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                      <Checkbox checked={checked} onCheckedChange={() => toggleMulti(opt)} />
                      <span className="text-sm font-medium">{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}
            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" onClick={() => (idx === 0 ? onCancel() : setIdx(idx - 1))}>
                <ArrowLeft className="h-4 w-4 mr-1" /> {idx === 0 ? "Cancel" : "Back"}
              </Button>
              <Button
                onClick={handleNext}
                disabled={current === undefined || current === null || (Array.isArray(current) && current.length === 0) || current === ""}
                className="gradient-primary text-primary-foreground"
              >
                {idx === questions.length - 1 ? (<>Submit <CheckCircle2 className="h-4 w-4 ml-1" /></>) : (<>Next <ArrowRight className="h-4 w-4 ml-1" /></>)}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
