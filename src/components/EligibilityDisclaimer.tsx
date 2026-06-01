import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TopNav } from "./TopNav";
import { ArrowLeft, CheckCircle2, FileCheck2, ShieldAlert, XCircle } from "lucide-react";
import { fetchDisclaimerClauses, type ApiClause } from "@/lib/api";

interface Props {
  onAgree: () => void;
  onDisagree: () => void;
}

export const EligibilityDisclaimer = ({ onAgree, onDisagree }: Props) => {
  const [disagreed, setDisagreed] = useState(false);
  const [clauses, setClauses] = useState<ApiClause[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisclaimerClauses().then((data) => {
      setClauses(data);
      setLoading(false);
    });
  }, []);

  if (disagreed) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <TopNav />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-2xl w-full shadow-card border-destructive/30">
            <CardHeader className="space-y-3">
              <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                <XCircle className="h-7 w-7" />
              </div>
              <CardTitle className="text-2xl">Onboarding cannot proceed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-sm text-muted-foreground">
              <p>Agreement to the DIS Managed Cloud governance, security, and compliance terms is mandatory. Onboarding has been cancelled.</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onDisagree}><ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard</Button>
                <Button onClick={() => setDisagreed(false)}>Review Terms Again</Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <TopNav />
        <main className="flex-1 flex items-center justify-center p-6">
          <p className="text-muted-foreground">Loading disclaimer...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav />
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-6">
          <Card className="shadow-card">
            <CardHeader className="space-y-3">
              <Badge variant="outline" className="w-fit gap-1.5"><FileCheck2 className="h-3.5 w-3.5" /> Disclaimer & Acknowledgement</Badge>
              <CardTitle className="text-2xl">DIS Managed Cloud — Governance, Security & Compliance Terms</CardTitle>
              <p className="text-sm text-muted-foreground">
                You have passed the initial eligibility gate. Before proceeding to onboarding, please review and acknowledge the following operational and compliance commitments.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-warning/20 bg-warning/5 p-3 text-xs flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                <span>By selecting <strong>I Agree</strong>, you confirm that your project will adhere to each of the following policies. Any exception requires formal approval from ISM, Security, and Compliance authorities.</span>
              </div>
              <ul className="space-y-3">
                {clauses.map((c) => (
                  <li key={c.title} className="rounded-lg border bg-card p-4">
                    <div className="flex items-start gap-3">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground text-sm">{c.title}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{c.text}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button variant="outline" onClick={() => setDisagreed(true)}>
                  <XCircle className="h-4 w-4 mr-1" /> I Disagree
                </Button>
                <Button onClick={onAgree} className="gradient-primary text-primary-foreground">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> I Agree — Proceed to Onboarding
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
