const BASE_URL = '/api';

// ─── Eligibility & Disclaimer ────────────────────────────────────────

export interface ApiQuestion {
  section: string;
  title: string;
  note: string | null;
  question_type: 'single' | 'multi';
  options: string[];
  correct_answer: string | string[];
  fail_message: string;
  sort_order: number;
}

export interface ApiClause {
  title: string;
  text: string;
  sort_order: number;
}

// ─── Account Details ─────────────────────────────────────────────────

export interface ApiAccountDetails {
  id: string;
  onboarding_id: string;
  project_name: string;
  isu: string;
  account_name: string;
  owner: string;
  emp_id: string;
  description: string;
  business_unit: string;
}

export interface ApiAccountDetailsPayload {
  project_name: string;
  isu: string;
  account_name: string;
  owner: string;
  emp_id: string;
  description: string;
  business_unit: string;
}

// ─── Requirement Assessment ──────────────────────────────────────────

export interface ApiRequirement {
  id: string;
  onboarding_id: string;
  solution_type: string;
  deployment_environments: string[];
  cloud_providers: string[];
  region: string;
}

export interface ApiRequirementPayload {
  solution_type: string;
  deployment_environments: string[];
  cloud_providers: string[];
  region: string;
}

// ─── Onboarding ──────────────────────────────────────────────────────

export interface ApiOnboardingListItem {
  id: string;
  name: string;
  status: string;
  current_step: number;
  created_at: string;
  updated_at: string;
}

export interface ApiOnboardingFull {
  id: string;
  name: string;
  status: string;
  current_step: number;
  created_at: string;
  updated_at: string;
  remaining_state: Record<string, unknown> | null;
  account_details: ApiAccountDetails | null;
  requirement_assessment: ApiRequirement | null;
}

export interface ApiOnboardingCreate {
  name?: string;
}

export interface ApiOnboardingUpdate {
  name?: string;
  status?: string;
  current_step?: number;
  remaining_state?: Record<string, unknown> | null;
}

// ─── API Functions ───────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API Error ${res.status}: ${errorBody}`);
  }
  return res.json();
}

// Eligibility
export const fetchEligibilityQuestions = () =>
  request<ApiQuestion[]>('/onboardings/eligibility/questions');

// Disclaimer
export const fetchDisclaimerClauses = () =>
  request<ApiClause[]>('/onboardings/disclaimer/clauses');

// Onboardings
export const fetchOnboardings = () =>
  request<ApiOnboardingListItem[]>('/onboardings');

export const createOnboarding = (data: ApiOnboardingCreate = {}) =>
  request<ApiOnboardingFull>('/onboardings', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getOnboarding = (id: string) =>
  request<ApiOnboardingFull>(`/onboardings/${id}`);

export const updateOnboarding = (id: string, data: ApiOnboardingUpdate) =>
  request<ApiOnboardingFull>(`/onboardings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteOnboarding = (id: string) =>
  request<{ ok: boolean }>(`/onboardings/${id}`, { method: 'DELETE' });

// Account Details
export const getAccountDetails = (onboardingId: string) =>
  request<ApiAccountDetails>(`/account-details/${onboardingId}`);

export const upsertAccountDetails = (onboardingId: string, data: ApiAccountDetailsPayload) =>
  request<ApiAccountDetails>(`/account-details/${onboardingId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

// Requirements
export const getRequirements = (onboardingId: string) =>
  request<ApiRequirement>(`/requirements/${onboardingId}`);

export const upsertRequirements = (onboardingId: string, data: ApiRequirementPayload) =>
  request<ApiRequirement>(`/requirements/${onboardingId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
