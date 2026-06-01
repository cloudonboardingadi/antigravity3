import { useEffect, useState } from "react";
import { ArrowRight, Bot, Cloud, Layers, Plus, ShieldCheck, Sparkles, Trash2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopNav } from "@/components/TopNav";
import { popularOnboardingTemplates, type PopularOnboardingTemplate } from "@/data/onboardingTemplates";
import { type OnboardingStatus } from "@/lib/onboardingStorage";
import { fetchOnboardings, deleteOnboarding as apiDeleteOnboarding, type ApiOnboardingListItem } from "@/lib/api";
import { STEPS } from "@/types/onboarding";

interface Props {
  onStartBlank: () => void;
  onUseTemplate: (template: PopularOnboardingTemplate) => void;
  onResume: (id: string) => void;
}

const statusStyles: Record<OnboardingStatus, string> = {
  Draft: "bg-muted text-muted-foreground",
  "In Approval": "bg-info/10 text-info border-info/20",
  Provisioning: "bg-warning/10 text-warning border-warning/20",
  "RFC Pending": "bg-warning/10 text-warning border-warning/20",
  Complete: "bg-success/10 text-success border-success/20",
};

export const Dashboard = ({ onStartBlank, onUseTemplate, onResume }: Props) => {
  const [items, setItems] = useState<ApiOnboardingListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = () => {
    fetchOnboardings()
      .then((data) => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadItems(); }, []);

  const remove = (id: string) => {
    apiDeleteOnboarding(id).then(() => loadItems());
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 items-stretch">
          <div className="rounded-lg border bg-card p-6 shadow-card space-y-5">
            <Badge variant="outline" className="w-fit gap-1.5"><Cloud className="h-3.5 w-3.5" /> CloudOps Workspace</Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-normal text-foreground">DIS Cloud Onboarding</h1>
              <p className="text-muted-foreground max-w-2xl">
                Start a new onboarding from scratch, reuse a popular pattern, or resume one you previously started. Workflow: account → requirements → resources → architecture → recommendations → approvals → service ID → RFCs.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={onStartBlank} className="gradient-primary text-primary-foreground">
                <Plus className="h-4 w-4" /> New Onboarding
              </Button>
              <Button variant="outline" onClick={() => onUseTemplate(popularOnboardingTemplates[0])}>
                <Sparkles className="h-4 w-4" /> Use Popular GenAI Pattern
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            {[
              { label: "My onboardings", value: String(items.length), icon: Layers },
              { label: "AI assistants", value: "Resources + RFC", icon: Bot },
              { label: "Workflow", value: `${STEPS.length} steps`, icon: ShieldCheck },
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="font-semibold text-foreground">{item.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* My Onboardings */}
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">My Onboardings</h2>
              <p className="text-sm text-muted-foreground">Resume an in-progress onboarding or review completed ones. Status updates as you progress through each step.</p>
            </div>
          </div>
          {items.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No onboardings yet. Start a new one or use a popular template below.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((it) => {
                const stepLabel = STEPS[it.current_step - 1]?.title ?? "—";
                return (
                  <Card key={it.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                    <CardHeader className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base leading-snug">{it.name}</CardTitle>
                        <Badge className={statusStyles[it.status as OnboardingStatus]}>{it.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3 w-3" /> Updated {new Date(it.updated_at).toLocaleString()}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Current step: <span className="text-foreground font-medium">{stepLabel}</span> ({it.current_step}/{STEPS.length})</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 justify-between" onClick={() => onResume(it.id)}>
                          {it.status === "Complete" ? "View" : "Resume"} <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => remove(it.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Templates */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Popular onboarding patterns</h2>
            <p className="text-sm text-muted-foreground">Pick a proven template to prefill account, requirements, and cloud resources.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {popularOnboardingTemplates.map((template) => (
              <Card key={template.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardHeader className="space-y-3">
                  <Badge variant="secondary" className="w-fit">{template.category}</Badge>
                  <CardTitle className="text-lg leading-snug">{template.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground min-h-20">{template.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
                  </div>
                  <Button variant="outline" className="w-full justify-between" onClick={() => onUseTemplate(template)}>
                    Use this template <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
