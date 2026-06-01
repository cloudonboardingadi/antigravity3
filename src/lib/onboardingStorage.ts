import type { OnboardingState } from "@/types/onboarding";

export type OnboardingStatus = "Draft" | "In Approval" | "Provisioning" | "RFC Pending" | "Complete";

export interface SavedOnboarding {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  status: OnboardingStatus;
  state: OnboardingState;
}

export const computeStatus = (s: OnboardingState): OnboardingStatus => {
  const allRfcsClosed = s.rfcs.length > 0 && s.rfcs.every((r) => r.status === "implemented" || r.status === "closed");
  if (s.serviceId.status === "completed" && allRfcsClosed) return "Complete";
  if (s.serviceId.status === "completed") return "RFC Pending";
  if (s.serviceId.status !== "not-started") return "Provisioning";
  if (s.approvals.length > 0) return "In Approval";
  return "Draft";
};
