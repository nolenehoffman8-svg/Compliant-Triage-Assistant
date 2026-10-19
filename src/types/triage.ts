/**
 * Healthcare Complaint Triage Assistant Type Definitions
 * Following CMS Grievance Guidelines & Clinical Risk Assessment
 */

export type PrimaryCategory =
  | 'Communication'
  | 'Scheduling'
  | 'Wait Time'
  | 'Technology / Patient Portal'
  | 'Billing'
  | 'Clinical Care'
  | 'Patient Safety'
  | 'Privacy or Security'
  | 'Staff Conduct'
  | 'Other';

export type SeverityLevel = 1 | 2 | 3 | 4;

export type RiskType =
  | 'Patient Safety Risk'
  | 'Clinical Risk'
  | 'Compliance Risk'
  | 'Privacy Risk'
  | 'Accessibility Risk'
  | 'Equity Risk'
  | 'Reputational Risk'
  | 'Operational Risk';

export type EscalationRoute =
  | 'Patient Experience Team'
  | 'Nursing Leadership'
  | 'Physician Leadership'
  | 'Quality Improvement Team'
  | 'Compliance Office'
  | 'Information Technology'
  | 'Revenue Cycle / Billing'
  | 'Accessibility Coordinator'
  | 'Risk Management'
  | 'Executive Review';

export type ComplaintSource =
  | 'Patient Portal Message'
  | 'Written Grievance'
  | 'CAHPS / Survey Comment'
  | 'Verbal / In-Person Feedback'
  | 'Online Review / Social'
  | 'Regulatory Agency / Ombudsman';

export type ComplaintStatus =
  | 'Pending Triage'
  | 'Triaged'
  | 'Under Review'
  | 'Clinical Investigation'
  | 'Escalated'
  | 'Resolved';

export interface RiskFlag {
  risk: RiskType;
  explanation: string;
}

export interface HumanInterventionRequirement {
  required: boolean;
  urgency: 'Routine' | 'Prompt' | 'Immediate Mandate';
  roles: string[];
  rationale: string;
}

export interface TriageResult {
  whatHappened: string;
  timelineOrFacts: string[];
  primaryCategory: PrimaryCategory;
  secondaryCategories: PrimaryCategory[];
  severityLevel: SeverityLevel;
  severityLabel: 'Level 1 – Low' | 'Level 2 – Moderate' | 'Level 3 – High' | 'Level 4 – Critical';
  severityReasoning: string;
  identifiedRisks: RiskFlag[];
  escalationRoute: EscalationRoute;
  escalationRationale: string;
  slaTargetHours: number;
  slaTargetDescription: string;
  humanIntervention: HumanInterventionRequirement;
  recommendedActions: string[];
  regulatoryNotes?: string;
}

export interface ComplaintRecord {
  id: string;
  trackingNumber: string;
  patientIdentifier: string; // e.g. PT-8029 (De-identified/Pseudonymized)
  patientName?: string;
  incidentDate: string;
  receivedDate: string;
  source: ComplaintSource;
  departmentOrUnit: string;
  rawText: string;
  status: ComplaintStatus;
  triage: TriageResult;
  assignedTo?: string;
  internalNotes?: Array<{
    id: string;
    author: string;
    timestamp: string;
    content: string;
  }>;
  overrideHistory?: Array<{
    timestamp: string;
    user: string;
    previousSeverity: SeverityLevel;
    newSeverity: SeverityLevel;
    reason: string;
  }>;
}

export interface TriageFilterState {
  searchQuery: string;
  severityLevels: SeverityLevel[];
  primaryCategories: PrimaryCategory[];
  risks: RiskType[];
  escalationRoutes: EscalationRoute[];
  statuses: ComplaintStatus[];
  onlyHumanInterventionRequired: boolean;
}
