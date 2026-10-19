import React from 'react';
import {
  X,
  BookOpen,
  ShieldAlert,
  Scale,
  Building2,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { CATEGORY_DEFINITIONS, SEVERITY_LEVEL_INFO } from '../data/mockComplaints';

interface RegulatoryReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegulatoryReferenceModal: React.FC<RegulatoryReferenceModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-100 rounded-xl text-teal-800">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Healthcare Complaint Triage & Grievance Standards Handbook
              </h2>
              <p className="text-xs text-slate-500">
                CMS 42 CFR § 482.13 &middot; The Joint Commission &middot; Patient Safety & Compliance Guidelines
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-slate-800 text-xs sm:text-sm">
          {/* Core Mandate & Non-Resolution Principle */}
          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200">
            <h3 className="font-bold text-teal-950 uppercase tracking-wider text-xs flex items-center gap-1.5 mb-1">
              <ShieldAlert className="w-4 h-4 text-teal-700" />
              Role Boundary: Triage vs. Resolution
            </h3>
            <p className="text-teal-900 text-xs leading-relaxed">
              The role of this assistant is <strong>NOT to resolve complaints</strong>. The assistant is strictly
              engineered to perform authoritative clinical and administrative triage:
              <br />
              <strong className="text-teal-950">1. What happened</strong> &middot;{' '}
              <strong className="text-teal-950">2. How serious it is</strong> &middot;{' '}
              <strong className="text-teal-950">3. Who should review it</strong> &middot;{' '}
              <strong className="text-teal-950">4. How quickly it should be addressed</strong> &middot;{' '}
              <strong className="text-teal-950">5. Whether human intervention is required</strong>.
            </p>
          </div>

          {/* CMS Distinction: Grievance vs Complaint */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-2">
              CMS 42 CFR § 482.13: "Complaint" vs "Grievance" Regulatory Distinction
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">
                  Standard Complaint (Staff-Resolved)
                </span>
                <p className="text-slate-600">
                  A minor issue or dissatisfaction that can be resolved promptly (typically within 24–48
                  hours) by staff present at the time of the event (e.g., room temperature, cold food,
                  minor wait times).
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-rose-900 block mb-1">
                  Formal Grievance (Governing Body Mandate)
                </span>
                <p className="text-slate-600">
                  Any formal written expression of dissatisfaction, OR any verbal complaint regarding
                  patient care, clinical competence, patient safety, HIPAA privacy, discrimination, or
                  billing dispute. <strong>Requires formal written resolution letter</strong> from the
                  governing body or designee within statutory timeframes (typically 7–30 days).
                </p>
              </div>
            </div>
          </div>

          {/* STEP 1: Categories */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              STEP 1: 10 Standard Complaint Categories
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {CATEGORY_DEFINITIONS.map((c) => (
                <div key={c.name} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block">{c.name}</span>
                  <span className="text-slate-600 text-[11px]">{c.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 2: Severity Levels */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-2 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-600" />
              STEP 2: Severity Assessment (Four Tiers)
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/70">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-900">LEVEL 4 – Critical (&lt; 2h SLA)</span>
                  <span className="text-[10px] font-bold bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded">
                    Immediate Mandate
                  </span>
                </div>
                <p className="text-rose-800 mt-1">
                  Immediate patient safety risk, potential legal exposure, serious privacy violation (HIPAA mass breach), discrimination allegation.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-orange-200 bg-orange-50/70">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-900">LEVEL 3 – High (24–48h SLA)</span>
                  <span className="text-[10px] font-bold bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded">
                    Prompt Review
                  </span>
                </div>
                <p className="text-orange-800 mt-1">
                  Potential patient harm, medication-related concern, serious accessibility issue (ADA interpreter denial), escalated formal grievance.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/70">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">LEVEL 2 – Moderate (3–5 Days SLA)</span>
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">
                    Routine Review
                  </span>
                </div>
                <p className="text-amber-800 mt-1">
                  Repeated service failures, significant patient frustration, communication breakdown, billing disputes without immediate harm.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/70">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900">LEVEL 1 – Low (7–14 Days SLA)</span>
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded">
                    General Feedback
                  </span>
                </div>
                <p className="text-emerald-800 mt-1">
                  Minor inconvenience, routine dissatisfaction, parking or cafeteria suggestions, room comfort.
                </p>
              </div>
            </div>
          </div>

          {/* STEP 5: Risk Detection */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              STEP 5: 8 Applicable Risk Dimensions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">Patient Safety Risk:</strong>
                <span className="text-slate-600 text-[11px]">Physical safety, falls, elopement, adverse drug events, sentinel alerts.</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">Clinical Risk:</strong>
                <span className="text-slate-600 text-[11px]">Diagnostic delay, missed results, surgical complications, bedside competence.</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">Compliance Risk:</strong>
                <span className="text-slate-600 text-[11px]">EMTALA, CMS Conditions of Participation, state reporting, fraud/abuse.</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">Privacy Risk:</strong>
                <span className="text-slate-600 text-[11px]">HIPAA violations, unauthorized PHI disclosure, cyber security compromises.</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">Accessibility Risk:</strong>
                <span className="text-slate-600 text-[11px]">ADA violations, failure to provide qualified ASL or language interpreters.</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">Equity Risk:</strong>
                <span className="text-slate-600 text-[11px]">Racial, ethnic, gender, religious bias or disparate treatment allegations (Title VI/ACA 1557).</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">Reputational Risk:</strong>
                <span className="text-slate-600 text-[11px]">Public media exposure, social virality, rating agency downgrades.</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">Operational Risk:</strong>
                <span className="text-slate-600 text-[11px]">Scheduling bottlenecks, front-desk staffing, throughput, IT downtime.</span>
              </div>
            </div>
          </div>

          {/* STEP 6: Routing Destinations */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              STEP 6: Designated Escalation Routing Departments
            </h3>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <p className="text-slate-700 leading-relaxed">
                Patient complaints are routed to one of 10 primary authorities:
                <br />
                &bull; <strong>Patient Experience Team:</strong> General dissatisfaction, routine feedback, service recovery.
                <br />
                &bull; <strong>Nursing Leadership:</strong> Inpatient floor care, nursing bedside conduct, shift handoffs.
                <br />
                &bull; <strong>Physician Leadership:</strong> Attending physician care, clinical diagnoses, surgical outcomes.
                <br />
                &bull; <strong>Quality Improvement Team:</strong> Systemic clinical processes, infection prevention, care pathways.
                <br />
                &bull; <strong>Compliance Office:</strong> HIPAA breaches, regulatory inquiries, code of conduct investigations.
                <br />
                &bull; <strong>Information Technology:</strong> Patient portal errors, telehealth disconnections, electronic records.
                <br />
                &bull; <strong>Revenue Cycle / Billing:</strong> Surprise bills, No Surprises Act disputes, collection pauses.
                <br />
                &bull; <strong>Accessibility Coordinator:</strong> ADA compliance, auxiliary aids, sign language interpretation.
                <br />
                &bull; <strong>Risk Management:</strong> Sentinel events, severe patient harm, malpractice risk containment.
                <br />
                &bull; <strong>Executive Review:</strong> Board-level grievances, CMO/CEO alerts, civil rights escalations.
              </p>
            </div>
          </div>

          {/* Human-in-the-Loop Safeguard */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-300">
            <h3 className="font-bold text-amber-950 uppercase tracking-wider text-xs flex items-center gap-1.5 mb-1">
              <UserCheck className="w-4 h-4 text-amber-800" />
              Human-in-the-Loop Oversight Safeguard
            </h3>
            <p className="text-amber-900 text-xs leading-relaxed">
              In accordance with healthcare clinical governance standards, <strong>AI triage assists but never replaces
              licensed human judgment</strong>. Any complaint flagged as Level 3 or Level 4, or involving discrimination,
              HIPAA breach, or clinical harm, strictly forbids automated dismissal and requires human review by a credentialed
              clinical, risk, or compliance professional.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors"
          >
            Close Reference Guide
          </button>
        </div>
      </div>
    </div>
  );
};
