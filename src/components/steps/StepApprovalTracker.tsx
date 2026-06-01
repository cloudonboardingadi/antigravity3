import { useState, useEffect } from "react";
import { type ApprovalItem } from "@/types/onboarding";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, Clock, CheckCircle2, XCircle, Eye, Lock, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  data: ApprovalItem[];
  solutionType: string;
  onChange: (data: ApprovalItem[]) => void;
}

const generateApprovals = (solutionType: string): ApprovalItem[] => {
  const base: ApprovalItem[] = [
    { id: "a1", type: "gps", title: "GPS - Cloud Infrastructure", status: "pending", approver: "Rajesh Kumar", submittedDate: "2026-04-10", lastReminder: null, reminderCount: 0, comments: [] },
    { id: "a2", type: "gps", title: "GPS - SSL Certificate", status: "pending", approver: "Priya Singh", submittedDate: "2026-04-12", lastReminder: null, reminderCount: 0, comments: [] },
    { id: "a3", type: "gps", title: "GPS - Monitoring & Logging", status: "pending", approver: "Amit Patel", submittedDate: "2026-04-11", lastReminder: null, reminderCount: 0, comments: [] },
    { id: "a5", type: "other", title: "Architecture Approval - ISM", status: "in-review", approver: "Vikram Desai", submittedDate: "2026-04-09", lastReminder: "2026-04-13", reminderCount: 2, comments: ["Need clarification on DMZ config.", "Updated diagram shared."] },
    { id: "a8", type: "other", title: "GPS Sign-off - Delivery Head", status: "pending", approver: "Anita Rao", submittedDate: "2026-04-12", lastReminder: null, reminderCount: 0, comments: [] },
  ];
  if (solutionType === "generative-ai") {
    base.push(
      { id: "a6", type: "other", title: "Legal Approval", status: "pending", approver: "Legal Team", submittedDate: "2026-04-13", lastReminder: null, reminderCount: 0, comments: [] },
      { id: "a7", type: "other", title: "Data Privacy Approval", status: "pending", approver: "Privacy Office", submittedDate: "2026-04-13", lastReminder: null, reminderCount: 0, comments: [] },
    );
  }
  return base;
};

const statusConfig: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
  pending: { icon: <Clock className="h-3 w-3" />, className: "bg-warning/10 text-warning border-warning/20", label: "Pending" },
  "in-review": { icon: <Eye className="h-3 w-3" />, className: "bg-info/10 text-info border-info/20", label: "In Review" },
  approved: { icon: <CheckCircle2 className="h-3 w-3" />, className: "bg-success/10 text-success border-success/20", label: "Approved" },
  rejected: { icon: <XCircle className="h-3 w-3" />, className: "bg-destructive/10 text-destructive border-destructive/20", label: "Rejected" },
};

export const StepApprovalTracker = ({ data, solutionType, onChange }: Props) => {
  const [activeTab, setActiveTab] = useState("other");

  useEffect(() => {
    if (data.length === 0) {
      onChange(generateApprovals(solutionType));
    }
  }, []);

  const governanceItems = data.filter((a) => a.type === "other");
  const gpsItems = data.filter((a) => a.type === "gps");
  const governanceCleared =
    governanceItems.length > 0 && governanceItems.every((a) => a.status === "approved");
  const gpsCleared = gpsItems.length > 0 && gpsItems.every((a) => a.status === "approved");

  const stage: "governance" | "gps" | "complete" = !governanceCleared
    ? "governance"
    : !gpsCleared
    ? "gps"
    : "complete";

  const sendReminder = (id: string) => {
    onChange(
      data.map((a) =>
        a.id === id
          ? { ...a, lastReminder: new Date().toISOString().split("T")[0], reminderCount: a.reminderCount + 1 }
          : a
      )
    );
    toast({ title: "Reminder Sent", description: `Reminder ${data.find((a) => a.id === id)!.reminderCount + 1} sent to the approver.` });
  };

  const filterByType = (type: string) => data.filter((a) => a.type === type);

  const isPendingLong = (item: ApprovalItem) => {
    if (item.status === "approved" || item.status === "rejected") return false;
    const submitted = new Date(item.submittedDate);
    const diff = (Date.now() - submitted.getTime()) / (1000 * 60 * 60);
    return diff > 48;
  };

  const StageNode = ({
    label,
    state,
    sub,
  }: {
    label: string;
    state: "done" | "active" | "locked";
    sub: string;
  }) => {
    const styles =
      state === "done"
        ? "bg-success/10 border-success/30 text-success"
        : state === "active"
        ? "bg-info/10 border-info/30 text-info"
        : "bg-muted border-border text-muted-foreground";
    const Icon = state === "done" ? CheckCircle2 : state === "active" ? Eye : Lock;
    return (
      <div className={`flex-1 border rounded-lg px-4 py-3 ${styles}`}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
          <Icon className="h-4 w-4" />
          {label}
        </div>
        <p className="text-xs mt-1 opacity-80">{sub}</p>
      </div>
    );
  };

  const govDone = stage !== "governance";
  const gpsDone = stage === "complete";

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 border rounded-lg p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Note:</strong> Governance Approvals (architecture, legal, privacy) must be cleared first. Once all Governance items are approved, GPS approvals are initiated automatically. RFC tracking happens after Service ID provisioning.
      </div>

      {/* Workflow visibility */}
      <div className="border rounded-lg p-4 bg-card">
        <h3 className="text-sm font-semibold mb-3">Approval Workflow Progress</h3>
        <div className="flex items-stretch gap-2">
          <StageNode
            label="1. Governance Approval"
            state={govDone ? "done" : "active"}
            sub={`${governanceItems.filter((a) => a.status === "approved").length}/${governanceItems.length} approved`}
          />
          <div className="flex items-center"><ArrowRight className="h-4 w-4 text-muted-foreground" /></div>
          <StageNode
            label="2. GPS Approval"
            state={gpsDone ? "done" : govDone ? "active" : "locked"}
            sub={
              govDone
                ? `${gpsItems.filter((a) => a.status === "approved").length}/${gpsItems.length} approved`
                : "Locked until Governance cleared"
            }
          />
          <div className="flex items-center"><ArrowRight className="h-4 w-4 text-muted-foreground" /></div>
          <StageNode
            label="3. Ready for Service ID"
            state={stage === "complete" ? "done" : "locked"}
            sub={stage === "complete" ? "All approvals cleared" : "Pending approvals"}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="other">Governance Approval ({filterByType("other").length})</TabsTrigger>
          <TabsTrigger value="gps">
            {!governanceCleared && <Lock className="h-3 w-3 mr-1" />}
            GPS ({filterByType("gps").length})
            {!governanceCleared && (
              <Badge variant="outline" className="ml-2 text-[10px] bg-muted">Preview</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {["other", "gps"].map((type) => (
          <TabsContent key={type} value={type} className="space-y-3">
            {type === "gps" && !governanceCleared && (
              <div className="border border-warning/30 rounded-lg p-4 bg-warning/5 flex items-start gap-3">
                <Lock className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">GPS approvals are in preview (not yet initiated)</p>
                  <p className="text-muted-foreground mt-0.5">
                    These items will be submitted automatically once all Governance Approvals are cleared.
                    You can review the upcoming GPS items below; reminders are disabled until initiation.
                  </p>
                </div>
              </div>
            )}
            {filterByType(type).length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No approvals in this category.</p>
            ) : (
              filterByType(type).map((item) => {
                const sc = statusConfig[item.status];
                const overdue = isPendingLong(item);
                const gpsLocked = type === "gps" && !governanceCleared;
                return (
                  <div key={item.id} className={`border rounded-lg p-4 transition-shadow hover:shadow-card-hover ${overdue ? "border-warning/50 bg-warning/5" : ""} ${gpsLocked ? "opacity-70" : ""}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{item.title}</span>
                          {gpsLocked ? (
                            <Badge className="bg-muted text-muted-foreground border-border">
                              <Lock className="h-3 w-3" /> <span className="ml-1">Awaiting Governance</span>
                            </Badge>
                          ) : (
                            <Badge className={sc.className}>
                              {sc.icon} <span className="ml-1">{sc.label}</span>
                            </Badge>
                          )}
                          {overdue && <Badge variant="destructive" className="text-[10px]">Overdue &gt;48h</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground space-x-4">
                          <span>Approver: {item.approver}</span>
                          <span>{gpsLocked ? "Will submit after Governance" : `Submitted: ${item.submittedDate}`}</span>
                          {item.lastReminder && <span>Last Reminder: {item.lastReminder}</span>}
                        </div>
                      </div>
                      {item.status !== "approved" && item.status !== "rejected" && !gpsLocked && (
                        <Button variant="outline" size="sm" onClick={() => sendReminder(item.id)}>
                          <Bell className="h-4 w-4 mr-1" />
                          Reminder {item.reminderCount + 1}
                        </Button>
                      )}
                      {gpsLocked && (
                        <Button variant="outline" size="sm" disabled>
                          <Lock className="h-4 w-4 mr-1" /> Locked
                        </Button>
                      )}
                    </div>
                    {item.comments.length > 0 && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> Comments
                        </span>
                        {item.comments.map((c, i) => (
                          <p key={i} className="text-sm bg-muted rounded px-3 py-2">{c}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
