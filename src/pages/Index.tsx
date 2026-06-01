import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { EligibilityAssessment } from "@/components/EligibilityAssessment";
import { EligibilityDisclaimer } from "@/components/EligibilityDisclaimer";
import { type PopularOnboardingTemplate } from "@/data/onboardingTemplates";
import { getOnboarding, type ApiOnboardingFull } from "@/lib/api";

type Mode = "dashboard" | "eligibility" | "disclaimer" | "wizard";

const Index = () => {
  const [mode, setMode] = useState<Mode>("dashboard");
  const [template, setTemplate] = useState<PopularOnboardingTemplate | null>(null);
  const [existing, setExisting] = useState<ApiOnboardingFull | null>(null);

  const backToDashboard = () => setMode("dashboard");

  const handleResume = (id: string) => {
    getOnboarding(id).then((data) => {
      setExisting(data);
      setMode("wizard");
    });
  };

  if (mode === "dashboard") {
    return (
      <Dashboard
        onStartBlank={() => { setTemplate(null); setExisting(null); setMode("eligibility"); }}
        onUseTemplate={(t) => { setTemplate(t); setExisting(null); setMode("eligibility"); }}
        onResume={handleResume}
      />
    );
  }

  if (mode === "eligibility") {
    return (
      <EligibilityAssessment
        onPass={() => setMode("disclaimer")}
        onCancel={backToDashboard}
      />
    );
  }

  if (mode === "disclaimer") {
    return (
      <EligibilityDisclaimer
        onAgree={() => setMode("wizard")}
        onDisagree={backToDashboard}
      />
    );
  }

  return (
    <OnboardingWizard
      initialTemplate={template?.state}
      existing={existing}
      onBackToDashboard={backToDashboard}
    />
  );
};

export default Index;
