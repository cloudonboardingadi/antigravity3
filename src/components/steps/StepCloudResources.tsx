import { useState } from "react";
import { type CloudResourceBucket, type CloudResource, AWS_SERVICES, AZURE_SERVICES, GCP_SERVICES, ONPREM_SERVICES } from "@/types/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, DollarSign, Bot, Send, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  data: CloudResourceBucket[];
  providers: string[];
  onChange: (data: CloudResourceBucket[]) => void;
}

const getServicesForProvider = (provider: string): string[] => {
  switch (provider) {
    case "AWS": return AWS_SERVICES;
    case "Azure": return AZURE_SERVICES;
    case "GCP": return GCP_SERVICES;
    case "On-Prem": return ONPREM_SERVICES;
    default: return [];
  }
};

export const StepCloudResources = ({ data, providers, onChange }: Props) => {
  const [activeTab, setActiveTab] = useState(providers[0] || "AWS");
  const [architectPrompt, setArchitectPrompt] = useState("Need a secure, production-ready application landing zone with compute, storage, network access, monitoring, and backup controls.");
  const [assistantMessages, setAssistantMessages] = useState<string[]>([
    "Share the workload details and I will recommend a provider-specific resource bucket you can approve into the workflow.",
  ]);
  const [suggestedResources, setSuggestedResources] = useState<Record<string, CloudResource[]>>({});

  const getBucket = (provider: string): CloudResourceBucket => {
    return data.find((b) => b.provider === provider) || { provider, resources: [] };
  };

  const updateBucket = (provider: string, resources: CloudResource[]) => {
    const existing = data.filter((b) => b.provider !== provider);
    onChange([...existing, { provider, resources }]);
  };

  const addResource = (provider: string) => {
    const bucket = getBucket(provider);
    const services = getServicesForProvider(provider);
    const newResource: CloudResource = {
      id: crypto.randomUUID(),
      service: services[0] || "",
      count: 1,
      configDetails: "",
    };
    updateBucket(provider, [...bucket.resources, newResource]);
  };

  const removeResource = (provider: string, id: string) => {
    const bucket = getBucket(provider);
    updateBucket(provider, bucket.resources.filter((r) => r.id !== id));
  };

  const updateResource = (provider: string, id: string, field: keyof CloudResource, value: string | number) => {
    const bucket = getBucket(provider);
    updateBucket(
      provider,
      bucket.resources.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const buildRecommendedResources = (provider: string, prompt: string): CloudResource[] => {
    const normalized = prompt.toLowerCase();
    const isAiWorkload = normalized.includes("ai") || normalized.includes("llm") || normalized.includes("model") || normalized.includes("chat");
    const isDataWorkload = normalized.includes("data") || normalized.includes("analytics") || normalized.includes("report");
    const makeId = () => crypto.randomUUID();

    if (provider === "Azure") {
      return isAiWorkload
        ? [
            { id: makeId(), service: "Azure OpenAI", count: 1, configDetails: "Private endpoint, content filtering, token quota, diagnostic logging" },
            { id: makeId(), service: "App Service", count: 2, configDetails: "Premium v3 plan for UI and API orchestration with autoscale" },
            { id: makeId(), service: "Blob Storage", count: 1, configDetails: "Encrypted document staging, lifecycle policy, private access" },
            { id: makeId(), service: "Azure Cache", count: 1, configDetails: "Standard Redis cache for session and prompt response caching" },
          ]
        : [
            { id: makeId(), service: "AKS", count: 1, configDetails: "System and workload node pools, private cluster, autoscaling" },
            { id: makeId(), service: "Azure SQL", count: 1, configDetails: "Business Critical tier, geo-backup, private endpoint" },
            { id: makeId(), service: "Blob Storage", count: 2, configDetails: "Application assets and backup containers with encryption" },
            { id: makeId(), service: "Service Bus", count: 2, configDetails: "Standard queues for asynchronous integration and retry handling" },
          ];
    }

    if (provider === "GCP") {
      return isDataWorkload
        ? [
            { id: makeId(), service: "BigQuery", count: 1, configDetails: "Partitioned datasets, IAM controls, audit logs, cost guardrails" },
            { id: makeId(), service: "Cloud Storage", count: 2, configDetails: "Raw and curated data buckets with CMEK and lifecycle policy" },
            { id: makeId(), service: "Cloud Functions", count: 3, configDetails: "Event-driven ingestion, validation, and notification functions" },
            { id: makeId(), service: "Pub/Sub", count: 2, configDetails: "Ingestion topic and processing subscription with dead-letter topic" },
          ]
        : [
            { id: makeId(), service: "GKE", count: 1, configDetails: "Private cluster, regional node pools, horizontal pod autoscaling" },
            { id: makeId(), service: "Cloud SQL", count: 1, configDetails: "PostgreSQL HA instance, automated backup, private IP" },
            { id: makeId(), service: "Cloud Storage", count: 1, configDetails: "Encrypted object storage for static assets and exports" },
            { id: makeId(), service: "Cloud CDN", count: 1, configDetails: "Global HTTPS caching layer for public application traffic" },
          ];
    }

    if (provider === "On-Prem") {
      return [
        { id: makeId(), service: "VMware VMs", count: 4, configDetails: "2 app, 1 database, 1 utility VM with HA cluster placement" },
        { id: makeId(), service: "Storage Arrays", count: 1, configDetails: "Encrypted SAN volume with snapshot and backup policy" },
        { id: makeId(), service: "Load Balancers", count: 1, configDetails: "L7 virtual server with TLS offload and health probes" },
        { id: makeId(), service: "Firewalls", count: 1, configDetails: "App-to-DB, VPN, and monitoring rules with quarterly review" },
      ];
    }

    return [
      { id: makeId(), service: "EKS", count: 1, configDetails: "Private cluster, three managed nodes, cluster autoscaler, IRSA enabled" },
      { id: makeId(), service: "RDS", count: 1, configDetails: "PostgreSQL Multi-AZ, encrypted storage, automated backups" },
      { id: makeId(), service: "S3", count: 2, configDetails: "Application documents and backup buckets with KMS encryption" },
      { id: makeId(), service: "CloudFront", count: 1, configDetails: "HTTPS CDN distribution with WAF and origin access controls" },
      { id: makeId(), service: "SQS", count: 2, configDetails: "Async processing queue and dead-letter queue" },
    ];
  };

  const askSolutionArchitect = (provider: string) => {
    const recommendations = buildRecommendedResources(provider, architectPrompt);
    setSuggestedResources((prev) => ({ ...prev, [provider]: recommendations }));
    setAssistantMessages((prev) => [
      ...prev,
      `Request: ${architectPrompt}`,
      `Recommended ${recommendations.length} ${provider} resources with compute, data, network, and operations coverage. Review and approve to populate the bucket.`,
    ]);
  };

  const approveSuggestedResources = (provider: string) => {
    const resources = suggestedResources[provider] || [];
    updateBucket(provider, resources);
    toast({ title: "Resource Bucket Populated", description: `${resources.length} AI Solution Architect recommendations added for ${provider}.` });
  };

  const handleEstimateCost = () => {
    toast({
      title: "Cost Estimation",
      description: "Estimated monthly cost: $2,450. This calls individual service provider cost APIs for detailed analysis.",
    });
  };

  if (providers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Please select at least one Cloud Provider in the previous step.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {providers.map((p) => (
            <TabsTrigger key={p} value={p}>{p}</TabsTrigger>
          ))}
        </TabsList>

        {providers.map((provider) => {
          const bucket = getBucket(provider);
          const services = getServicesForProvider(provider);
          const recommendations = suggestedResources[provider] || [];
          return (
            <TabsContent key={provider} value={provider} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-4">
                <div className="border rounded-lg bg-muted/30 p-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <Bot className="h-4 w-4 text-primary" /> AI Solution Architect
                    </div>
                    <Badge variant="outline" className="gap-1"><Sparkles className="h-3 w-3" /> Recommendation Mode</Badge>
                  </div>
                  <div className="rounded-md border bg-background p-3 space-y-2 max-h-32 overflow-auto">
                    {assistantMessages.slice(-3).map((message, index) => (
                      <p key={`${message}-${index}`} className="text-xs text-muted-foreground">{message}</p>
                    ))}
                  </div>
                  <Textarea value={architectPrompt} onChange={(event) => setArchitectPrompt(event.target.value)} rows={3} />
                  <Button variant="outline" onClick={() => askSolutionArchitect(provider)} className="w-full">
                    <Send className="h-4 w-4" /> Recommend {provider} Resources
                  </Button>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">Suggested Bucket</p>
                      <p className="text-xs text-muted-foreground">Approve the recommendation or continue manual filling below.</p>
                    </div>
                    <Button size="sm" disabled={recommendations.length === 0} onClick={() => approveSuggestedResources(provider)}>
                      <CheckCircle2 className="h-4 w-4" /> Approve Bucket
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recommendations.length === 0 ? (
                      <div className="sm:col-span-2 text-sm text-muted-foreground border border-dashed rounded-md p-4 text-center">
                        Ask the AI Solution Architect to generate a provider-specific cloud resource list.
                      </div>
                    ) : recommendations.map((item) => (
                      <div key={item.id} className="rounded-md border bg-background p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm text-foreground">{item.service}</p>
                          <Badge variant="secondary">x{item.count}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{item.configDetails}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant="outline">{bucket.resources.length} resource(s) configured</Badge>
                <Button variant="outline" size="sm" onClick={() => addResource(provider)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Resource
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[200px]">Service</TableHead>
                      <TableHead className="w-[100px]">Count</TableHead>
                      <TableHead>Configuration Details</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bucket.resources.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No resources added. Click "Add Resource" to begin.
                        </TableCell>
                      </TableRow>
                    ) : (
                      bucket.resources.map((res) => (
                        <TableRow key={res.id}>
                          <TableCell>
                            <Select value={res.service} onValueChange={(v) => updateResource(provider, res.id, "service", v)}>
                              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {services.map((s) => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input type="number" min={1} value={res.count} onChange={(e) => updateResource(provider, res.id, "count", parseInt(e.target.value) || 1)} className="w-20" />
                          </TableCell>
                          <TableCell>
                            <Input placeholder="e.g., t3.large, 2 vCPU, 8GB RAM" value={res.configDetails} onChange={(e) => updateResource(provider, res.id, "configDetails", e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeResource(provider, res.id)} className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleEstimateCost} className="gradient-primary text-primary-foreground">
          <DollarSign className="h-4 w-4 mr-1" /> Estimate Cost
        </Button>
      </div>
    </div>
  );
};
