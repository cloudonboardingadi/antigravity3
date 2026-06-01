import { useEffect, useRef, useState } from "react";
import { STEPS, type OnboardingState, type RequirementAssessment } from "@/types/onboarding";
import { StepIndicator } from "./StepIndicator";
import { TopNav } from "./TopNav";
import { StepAccountDetails } from "./steps/StepAccountDetails";
import { StepRequirementAssessment } from "./steps/StepRequirementAssessment";
import { StepCloudResources } from "./steps/StepCloudResources";
import { StepArchitectureOverview } from "./steps/StepArchitectureOverview";
import { StepRecommendations } from "./steps/StepRecommendations";
import { StepApprovalTracker } from "./steps/StepApprovalTracker";
import { StepServiceIdCreation } from "./steps/StepServiceIdCreation";
import { StepRfcTracking } from "./steps/StepRfcTracking";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, LayoutDashboard, Loader2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createOnboarding, updateOnboarding, upsertAccountDetails, upsertRequirements, type ApiOnboardingFull } from "@/lib/api";

const initialState: OnboardingState = {
  currentStep: 1,
  accountDetails: {
    projectName: "", isu: "", accountName: "", owner: "", empId: "", description: "", businessUnit: "",
  },
  requirementAssessment: {
    solutionType: "", deploymentEnvironments: [], cloudProviders: [], region: "",
  },
  cloudResources: [],
  architectureOverview: {
    uploadedDiagram: null, generatedFromBucket: false, securityViolations: [], revisedDiagram: null, analysisComplete: false,
  },
  recommendations: [],
  approvals: [],
  serviceId: {
    serviceId: "", status: "not-started", disTeamAssigned: "", createdDate: null,
  },
  rfcs: [],
};

interface Props {
  initialTemplate?: Partial<OnboardingState> | null;
  existing?: ApiOnboardingFull | null;
  onBackToDashboard?: () => void;
}

const TOTAL = STEPS.length;

export const OnboardingWizard = ({ initialTemplate, existing, onBackToDashboard }: Props) => {
  const [state, setState] = useState<OnboardingState>(() => {
    if (existing) {
      const acct = existing.account_details;
      const req = existing.requirement_assessment;
      const remaining = (existing.remaining_state ?? {}) as Partial<OnboardingState>;
      return {
        ...initialState,
        currentStep: existing.current_step,
        accountDetails: acct ? {
          projectName: acct.project_name,
          isu: acct.isu,
          accountName: acct.account_name,
          owner: acct.owner,
          empId: acct.emp_id,
          description: acct.description,
          businessUnit: acct.business_unit,
        } : initialState.accountDetails,
        requirementAssessment: req ? {
          solutionType: (req.solution_type || '') as RequirementAssessment['solutionType'],
          deploymentEnvironments: req.deployment_environments ?? [],
          cloudProviders: req.cloud_providers ?? [],
          region: req.region ?? '',
        } : initialState.requirementAssessment,
        cloudResources: remaining.cloudResources ?? initialState.cloudResources,
        architectureOverview: remaining.architectureOverview ?? initialState.architectureOverview,
        recommendations: remaining.recommendations ?? initialState.recommendations,
        approvals: remaining.approvals ?? initialState.approvals,
        serviceId: remaining.serviceId ?? initialState.serviceId,
        rfcs: remaining.rfcs ?? initialState.rfcs,
      };
    }
    return { ...initialState, ...initialTemplate, currentStep: 1 };
  });

  const idRef = useRef<string>(existing?.id ?? '');
  const createdRef = useRef<string>(existing?.created_at ?? new Date().toISOString());
  const [ready, setReady] = useState(!!existing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!existing) {
      const name = initialTemplate?.accountDetails?.projectName || 'Untitled Onboarding';
      createOnboarding({ name }).then((data) => {
        idRef.current = data.id;
        createdRef.current = data.created_at;
        setReady(true);
      });
    }
  }, []);

  /** Build the remaining_state blob for steps 3-8 */
  const buildRemainingState = (s: OnboardingState) => {
    const { cloudResources, architectureOverview, recommendations, approvals, serviceId, rfcs } = s;
    return { cloudResources, architectureOverview, recommendations, approvals, serviceId, rfcs };
  };

  /** Save only the data relevant to the current step */
  const saveCurrentStep = async (s: OnboardingState, targetStep?: number): Promise<void> => {
    if (!idRef.current) return;

    const stepToSave = targetStep ?? s.currentStep;
    const remainingState = buildRemainingState(s);

    if (s.currentStep === 1) {
      // Step 1 — Account Details: update onboarding + upsert account details
      await Promise.all([
        updateOnboarding(idRef.current, {
          name: s.accountDetails.projectName?.trim() || 'Untitled Onboarding',
          current_step: stepToSave,
          remaining_state: remainingState,
        }),
        upsertAccountDetails(idRef.current, {
          project_name: s.accountDetails.projectName,
          isu: s.accountDetails.isu,
          account_name: s.accountDetails.accountName,
          owner: s.accountDetails.owner,
          emp_id: s.accountDetails.empId,
          description: s.accountDetails.description,
          business_unit: s.accountDetails.businessUnit,
        }),
      ]);
    } else if (s.currentStep === 2) {
      // Step 2 — Requirement Assessment: update onboarding + upsert requirements
      await Promise.all([
        updateOnboarding(idRef.current, {
          name: s.accountDetails.projectName?.trim() || 'Untitled Onboarding',
          current_step: stepToSave,
          remaining_state: remainingState,
        }),
        upsertRequirements(idRef.current, {
          solution_type: s.requirementAssessment.solutionType,
          deployment_environments: s.requirementAssessment.deploymentEnvironments,
          cloud_providers: s.requirementAssessment.cloudProviders,
          region: s.requirementAssessment.region,
        }),
      ]);
    } else {
      // Steps 3-8 — only update the onboarding remaining_state blob
      await updateOnboarding(idRef.current, {
        name: s.accountDetails.projectName?.trim() || 'Untitled Onboarding',
        current_step: stepToSave,
        remaining_state: remainingState,
      });
    }
  };

  const updateState = <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const goNext = async () => {
    if (state.currentStep >= TOTAL || saving) return;
    setSaving(true);
    try {
      await saveCurrentStep(state, state.currentStep + 1);
      setState((p) => ({ ...p, currentStep: p.currentStep + 1 }));
    } catch {
      toast({ title: "Save Failed", description: "Could not save progress. Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const goPrev = () => state.currentStep > 1 && setState((p) => ({ ...p, currentStep: p.currentStep - 1 }));
  const goToStep = (step: number) => setState((p) => ({ ...p, currentStep: step }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveCurrentStep(state);
      toast({ title: "Progress Saved", description: "Onboarding saved to the server." });
    } catch {
      toast({ title: "Save Failed", description: "Could not save progress.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 1: return <StepAccountDetails data={state.accountDetails} onChange={(d) => updateState("accountDetails", d)} />;
      case 2: return <StepRequirementAssessment data={state.requirementAssessment} onChange={(d) => updateState("requirementAssessment", d)} />;
      case 3: return <StepCloudResources data={state.cloudResources} providers={state.requirementAssessment.cloudProviders} onChange={(d) => updateState("cloudResources", d)} />;
      case 4: return <StepArchitectureOverview data={state.architectureOverview} onChange={(d) => updateState("architectureOverview", d)} />;
      case 5: return <StepRecommendations data={state.recommendations} solutionType={state.requirementAssessment.solutionType} onChange={(d) => updateState("recommendations", d)} />;
      case 6: return <StepApprovalTracker data={state.approvals} solutionType={state.requirementAssessment.solutionType} onChange={(d) => updateState("approvals", d)} />;
      case 7: return <StepServiceIdCreation data={state.serviceId} onChange={(d) => updateState("serviceId", d)} />;
      case 8: return <StepRfcTracking data={state.rfcs} serviceIdReady={state.serviceId.status === "completed"} onChange={(d) => updateState("rfcs", d)} />;
      default: return null;
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <TopNav />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Initializing onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <div className="flex-1 flex flex-col">
        <div className="border-b bg-card px-6 py-4">
          <StepIndicator steps={STEPS} currentStep={state.currentStep} onStepClick={goToStep} />
        </div>
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground">{STEPS[state.currentStep - 1].title}</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Step {state.currentStep} of {TOTAL} — {STEPS[state.currentStep - 1].description}
              </p>
            </div>
            <div className="bg-card rounded-lg border shadow-card p-6">{renderStep()}</div>
          </div>
        </div>
        <div className="border-t bg-card px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              {onBackToDashboard && (
                <Button variant="ghost" onClick={onBackToDashboard}>
                  <LayoutDashboard className="h-4 w-4 mr-1" /> Dashboard
                </Button>
              )}
              <Button variant="outline" onClick={goPrev} disabled={state.currentStep === 1 || saving}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
            </div>
            <Button variant="ghost" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Save Draft
            </Button>
            {state.currentStep < TOTAL ? (
              <Button onClick={goNext} disabled={saving} className="gradient-primary text-primary-foreground">
                {saving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...</> : <>Next <ChevronRight className="h-4 w-4 ml-1" /></>}
              </Button>
            ) : (
              <Button onClick={() => toast({ title: "Onboarding Submitted", description: "All RFCs tracked. Dashboard updated." })} className="gradient-accent text-accent-foreground">
                Finish
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
