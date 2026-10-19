import React from 'react';
import { ComplaintRecord } from '../types/triage';
import { X, Printer } from 'lucide-react';
import { SEVERITY_LEVEL_INFO } from '../data/mockComplaints';

interface PrintableReportProps {
  complaint: ComplaintRecord | null;
  onClose: () => void;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ complaint, onClose }) => {
  if (!complaint) return null;

  const sev = SEVERITY_LEVEL_INFO[complaint.triage.severityLevel];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl border border-slate-300 relative my-8 print:m-0 print:p-0 print:border-none print:shadow-none">
        {/* Screen Controls */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 print:hidden">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Formal Grievance Triage Document
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Hospital Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-black text-slate-950 uppercase tracking-tight">
                METRO HEALTH SYSTEM &middot; CLINICAL GOVERNANCE
              </h1>
              <p className="text-xs font-semibold text-slate-600">
                Department of Patient Safety, Risk Management & Grievance Compliance
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pursuant to CMS CoP 42 CFR § 482.13(a)(2) & The Joint Commission Standards
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 text-xs font-black rounded-md border border-slate-900 bg-slate-100 text-slate-950">
                CONFIDENTIAL / PEER REVIEW PROTECTED
              </span>
              <p className="text-xs font-mono font-bold text-slate-900 mt-1">
                Ref: {complaint.trackingNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Patient & Incident Coordinates */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs mb-6">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Record ID</span>
            <strong className="text-slate-900">{complaint.patientIdentifier}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Hospital Unit</span>
            <strong className="text-slate-900">{complaint.departmentOrUnit}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Received Date</span>
            <strong className="text-slate-900">{new Date(complaint.receivedDate).toLocaleDateString()}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Channel / Source</span>
            <strong className="text-slate-900">{complaint.source}</strong>
          </div>
        </div>

        {/* Verbatim Grievance */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
            Verbatim Patient / Surrogate Grievance Statement:
          </h2>
          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-800 italic leading-relaxed">
            "{complaint.rawText}"
          </div>
        </div>

        {/* What Happened Factual Summary */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
            What Happened (Clinical & Operational Fact Synthesis):
          </h2>
          <p className="text-xs text-slate-800 leading-relaxed font-medium">
            {complaint.triage.whatHappened}
          </p>
          {complaint.triage.timelineOrFacts && (
            <ul className="mt-2 space-y-1 pl-4 list-disc text-xs text-slate-700">
              {complaint.triage.timelineOrFacts.map((fact, i) => (
                <li key={i}>{fact}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Triage Matrix Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
          {/* Category */}
          <div className="p-3 border border-slate-300 rounded">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              Step 1: Category Classification
            </span>
            <span className="font-extrabold text-slate-900 block">
              Primary: {complaint.triage.primaryCategory}
            </span>
            {complaint.triage.secondaryCategories?.length > 0 && (
              <span className="text-slate-600 text-[11px] block mt-1">
                Secondary: {complaint.triage.secondaryCategories.join(', ')}
              </span>
            )}
          </div>

          {/* Severity */}
          <div className="p-3 border border-slate-300 rounded">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              Step 2: Severity Assessment
            </span>
            <span className="font-extrabold text-slate-900 block">
              {complaint.triage.severityLabel}
            </span>
            <p className="text-slate-700 text-[11px] mt-1 leading-snug">
              {complaint.triage.severityReasoning}
            </p>
          </div>
        </div>

        {/* Flagged Risks */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
            Step 5: Statutory & Clinical Risk Detection:
          </h2>
          <div className="space-y-2">
            {complaint.triage.identifiedRisks.map((rf, idx) => (
              <div key={idx} className="p-2 border-l-2 border-rose-500 bg-slate-50 text-xs">
                <strong className="text-slate-900">{rf.risk}: </strong>
                <span className="text-slate-700">{rf.explanation}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Escalation Recommendation & Human Intervention */}
        <div className="p-3 bg-slate-50 rounded border border-slate-200 mb-6 text-xs space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Step 6: Escalation Recommendation
              </span>
              <span className="font-extrabold text-slate-900 text-sm">
                Routed to: {complaint.triage.escalationRoute}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                SLA Target
              </span>
              <span className="font-bold text-rose-700">
                {complaint.triage.slaTargetDescription}
              </span>
            </div>
          </div>
          <p className="text-slate-700 text-[11px]">
            <strong>Escalation Rationale: </strong>
            {complaint.triage.escalationRationale}
          </p>

          <div className="pt-2 border-t border-slate-200">
            <strong className="text-slate-900">Human Intervention Requirement: </strong>
            <span className="text-slate-800">
              {complaint.triage.humanIntervention.required
                ? `MANDATORY (${complaint.triage.humanIntervention.urgency})`
                : 'Routine'}
            </span>
            <span className="text-slate-600 block text-[11px] mt-0.5">
              Assigned Review Roles: {complaint.triage.humanIntervention.roles.join(', ')}
            </span>
          </div>
        </div>

        {/* Signatures & Certification */}
        <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs text-slate-800">
          <div>
            <div className="border-b border-slate-400 h-8 mb-1" />
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Triage Officer / Risk Manager Signature
            </span>
          </div>
          <div>
            <div className="border-b border-slate-400 h-8 mb-1" />
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Chief Medical Officer / Clinical Chair Sign-Off
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
