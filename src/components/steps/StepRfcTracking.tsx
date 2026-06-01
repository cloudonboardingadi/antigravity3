import { useState, useRef, useEffect } from "react";
import type { RfcItem } from "@/types/onboarding";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Send, Sparkles, Copy, CheckCircle2, Plus, FileText, ShieldAlert, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  data: RfcItem[];
  serviceIdReady: boolean;
  onChange: (data: RfcItem[]) => void;
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  rfc?: RfcItem;
}

const seedRfcs = (): RfcItem[] => [
  {
    id: "rfc-seed-1",
    title: "RFC – Active Directory Group Creation",
    category: "Identity & Access Management",
    changeType: "Standard",
    impactedServices: "Azure AD, Cloud Subscription RBAC",
    changeWindow: "Business hours – next 3 days",
    riskLevel: "Low",
    rollbackPlan: "Delete created AD groups; remove RBAC bindings.",
    implementationSteps: "1) Create SG-Cloud-<Project>-Admin/Contributor/Reader\n2) Add owners and members per RACI\n3) Assign RBAC roles on subscription/resource group\n4) Validate access for one user per role",
    status: "submitted",
    submittedDate: "2026-04-15",
    source: "auto",
  },
  {
    id: "rfc-seed-2",
    title: "RFC – Firewall / NSG Rule Update",
    category: "Network Security",
    changeType: "Normal",
    impactedServices: "App Subnet, DB Subnet, External APIs",
    changeWindow: "Saturday 22:00 – 23:00 IST",
    riskLevel: "Medium",
    rollbackPlan: "Revert NSG rule via stored backup JSON.",
    implementationSteps: "1) Backup existing NSG rules\n2) Apply new inbound/outbound rules per architecture\n3) Validate connectivity from app to DB and external APIs\n4) Monitor flow logs for 30 minutes",
    status: "draft",
    submittedDate: null,
    source: "auto",
  },
];

const buildRfcFromPrompt = (prompt: string): RfcItem => {
  const p = prompt.toLowerCase();
  let title = "RFC – Custom Change Request";
  let category = "General Cloud Change";
  let changeType: RfcItem["changeType"] = "Normal";
  let impacted = "To be specified";
  let risk: RfcItem["riskLevel"] = "Medium";
  let steps = "1) Plan change\n2) Take backup / snapshot\n3) Apply change in maintenance window\n4) Validate and monitor";
  let rollback = "Revert to previous configuration using backup/snapshot.";

  if (p.includes("firewall") || p.includes("nsg") || p.includes("port")) {
    title = "RFC – Firewall / NSG Rule Update";
    category = "Network Security";
    impacted = "Application Subnet, Destination Subnet/Endpoint";
    risk = "Medium";
    steps = "1) Backup existing NSG/SG rules\n2) Add requested inbound/outbound rule\n3) Validate end-to-end connectivity\n4) Monitor flow logs";
    rollback = "Restore previous NSG/SG ruleset from backup.";
  } else if (p.includes("ad") || p.includes("group") || p.includes("rbac") || p.includes("access")) {
    title = "RFC – AD Group / RBAC Access Change";
    category = "Identity & Access Management";
    changeType = "Standard";
    impacted = "Azure AD, Cloud RBAC bindings";
    risk = "Low";
    steps = "1) Identify users and target group/role\n2) Add/remove members\n3) Validate access\n4) Update access register";
    rollback = "Remove added members or restore previous role bindings.";
  } else if (p.includes("scale") || p.includes("resize") || p.includes("vm size")) {
    title = "RFC – Compute Scale / Resize";
    category = "Compute Capacity Change";
    impacted = "VM Scale Set / Node Pool";
    risk = "Medium";
    steps = "1) Snapshot current configuration\n2) Update SKU / scale count\n3) Drain & restart nodes safely\n4) Verify application health";
    rollback = "Revert SKU/count to previous configuration.";
  } else if (p.includes("certificate") || p.includes("ssl") || p.includes("tls")) {
    title = "RFC – SSL/TLS Certificate Renewal";
    category = "Security – Certificate Management";
    changeType = "Standard";
    impacted = "Public endpoint, Load Balancer / App Gateway";
    risk = "Low";
    steps = "1) Procure renewed certificate\n2) Upload to key vault / LB\n3) Bind to listener\n4) Validate HTTPS handshake";
    rollback = "Re-bind previous certificate version.";
  } else if (p.includes("emergency") || p.includes("outage") || p.includes("p1")) {
    changeType = "Emergency";
    risk = "High";
  }

  return {
    id: "rfc_" + Math.random().toString(36).slice(2, 8),
    title,
    category,
    changeType,
    impactedServices: impacted,
    changeWindow: "Next available maintenance window",
    riskLevel: risk,
    rollbackPlan: rollback,
    implementationSteps: steps,
    status: "draft",
    submittedDate: null,
    source: "chat",
  };
};

const statusBadge = (s: RfcItem["status"]) => {
  const map: Record<RfcItem["status"], string> = {
    draft: "bg-muted text-muted-foreground",
    submitted: "bg-info/10 text-info border-info/20",
    approved: "bg-warning/10 text-warning border-warning/20",
    implemented: "bg-success/10 text-success border-success/20",
    closed: "bg-success/10 text-success border-success/20",
  };
  return map[s];
};

export const StepRfcTracking = ({ data, serviceIdReady, onChange }: Props) => {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your RFC Assistant. Describe the change you want to raise (e.g. *open port 443 from app subnet to DB*, *add 3 users to Contributor role*, *renew SSL for api.company.com*) and I'll draft the full RFC.",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.length === 0 && serviceIdReady) onChange(seedRfcs());
  }, [serviceIdReady]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (!serviceIdReady) {
    return (
      <div className="text-center py-12 space-y-3">
        <ShieldAlert className="h-10 w-10 mx-auto text-muted-foreground" />
        <p className="text-foreground font-medium">Service ID not yet provisioned</p>
        <p className="text-sm text-muted-foreground">Complete Step 7 (Service ID Creation) to start raising and tracking RFCs.</p>
      </div>
    );
  }

  const send = () => {
    if (!input.trim()) return;
    const userMsg: ChatMsg = { role: "user", content: input };
    const rfc = buildRfcFromPrompt(input);
    const reply: ChatMsg = {
      role: "assistant",
      content: `Here's a draft RFC based on your request. Review the parameters and click **Add to RFC list** to track it.`,
      rfc,
    };
    setMessages((m) => [...m, userMsg, reply]);
    setInput("");
  };

  const addRfc = (rfc: RfcItem) => {
    onChange([...data, rfc]);
    toast({ title: "RFC added", description: `${rfc.title} has been added to your tracking list.` });
  };

  const updateStatus = (id: string, status: RfcItem["status"]) => {
    onChange(
      data.map((r) =>
        r.id === id
          ? { ...r, status, submittedDate: r.submittedDate ?? (status !== "draft" ? new Date().toISOString().split("T")[0] : null) }
          : r
      )
    );
  };

  const copyRfc = (rfc: RfcItem) => {
    const text = `RFC: ${rfc.title}
Category: ${rfc.category}
Change Type: ${rfc.changeType}
Impacted Services: ${rfc.impactedServices}
Change Window: ${rfc.changeWindow}
Risk: ${rfc.riskLevel}
Rollback Plan: ${rfc.rollbackPlan}
Implementation Steps:
${rfc.implementationSteps}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied for RFC portal", description: rfc.title });
  };

  const allDone = data.length > 0 && data.every((r) => r.status === "implemented" || r.status === "closed");

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 border rounded-lg p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Post-provisioning RFCs:</strong> Service ID is created. Raise required RFCs (AD groups, firewall, certificates, scaling, etc.) and track them to closure. Onboarding is considered <strong>complete</strong> only after every RFC is implemented.
      </div>

      {allDone && (
        <div className="bg-success/10 border border-success/30 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <div>
            <p className="font-semibold text-success">Onboarding Complete</p>
            <p className="text-sm text-muted-foreground">All RFCs are implemented. The project is fully onboarded to DIS Cloud.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
        {/* RFC list */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" /> RFC Tracking ({data.length})
            </CardTitle>
            <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Live</Badge>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[520px] overflow-auto">
            {data.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No RFCs yet. Use the assistant to draft one.</p>
            )}
            {data.map((rfc) => (
              <div key={rfc.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{rfc.title}</span>
                      <Badge className={statusBadge(rfc.status)}>{rfc.status.toUpperCase()}</Badge>
                      <Badge variant="outline" className="text-[10px]">{rfc.changeType}</Badge>
                      <Badge variant="outline" className="text-[10px]">Risk: {rfc.riskLevel}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{rfc.category} · Impacts: {rfc.impactedServices}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => copyRfc(rfc)}><Copy className="h-3.5 w-3.5" /></Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {rfc.status === "draft" && <Button size="sm" variant="outline" onClick={() => updateStatus(rfc.id, "submitted")}>Submit</Button>}
                  {rfc.status === "submitted" && <Button size="sm" variant="outline" onClick={() => updateStatus(rfc.id, "approved")}>Mark Approved</Button>}
                  {rfc.status === "approved" && <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => updateStatus(rfc.id, "implemented")}>Mark Implemented</Button>}
                  {rfc.status === "implemented" && <Button size="sm" variant="outline" onClick={() => updateStatus(rfc.id, "closed")}>Close</Button>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Chat assistant */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" /> RFC Assistant <Badge variant="secondary" className="gap-1"><Sparkles className="h-3 w-3" /> AI</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 flex-1">
            <div ref={scrollRef} className="border rounded-lg p-3 space-y-3 h-[380px] overflow-auto bg-muted/20">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border"}`}>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    {m.rfc && (
                      <div className="mt-3 border-t pt-3 space-y-2 text-foreground">
                        <p className="font-semibold text-sm">{m.rfc.title}</p>
                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                          <span className="text-muted-foreground">Category</span><span>{m.rfc.category}</span>
                          <span className="text-muted-foreground">Change Type</span><span>{m.rfc.changeType}</span>
                          <span className="text-muted-foreground">Risk</span><span>{m.rfc.riskLevel}</span>
                          <span className="text-muted-foreground">Window</span><span>{m.rfc.changeWindow}</span>
                          <span className="text-muted-foreground">Impacts</span><span>{m.rfc.impactedServices}</span>
                        </div>
                        <div className="text-[11px]">
                          <p className="text-muted-foreground">Implementation</p>
                          <pre className="whitespace-pre-wrap font-sans">{m.rfc.implementationSteps}</pre>
                        </div>
                        <div className="text-[11px]">
                          <p className="text-muted-foreground">Rollback</p>
                          <p>{m.rfc.rollbackPlan}</p>
                        </div>
                        <Button size="sm" className="w-full gradient-primary text-primary-foreground" onClick={() => addRfc(m.rfc!)}>
                          <Plus className="h-3.5 w-3.5 mr-1" /> Add to RFC list
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. open 443 from app subnet to db, renew ssl, add user to contributor"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <Button onClick={send} className="gradient-primary text-primary-foreground"><Send className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
