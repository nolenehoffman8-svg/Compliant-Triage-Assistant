import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  Building2,
  Clock,
  UserCheck,
  CheckCircle2,
  Printer,
  Copy,
  Check,
  Edit3,
  MessageSquare,
  Scale,
  Calendar,
  FileText,
  User,
  History,
} from 'lucide-react';
import {
  ComplaintRecord,
  ComplaintStatus,
  SeverityLevel,
} from '../types/triage';
import { SEVERITY_LEVEL_INFO } from '../data/mockComplaints';

interface TriageDossierModalProps {
  complaint: ComplaintRecord | null;
  onClose: () => void;
  onUpdateStatus: (complaintId: string, newStatus: ComplaintStatus) => void;
  onAddNote: (complaintId: string, noteContent: string, author: string) => void;
  onOverrideSeverity: (
    complaintId: string,
    newSeverity: SeverityLevel,
    reason: string,
    user: string
  ) => void;
  onPrint: (complaint: ComplaintRecord) => void;
}

export const TriageDossierModal: React.FC<TriageDossierModalProps> = ({
  complaint,
  onClose,
  onUpdateStatus,
  onAddNote,
  onOverrideSeverity,
  onPrint,
}) => {
  if (!complaint) return null;

  const [newNoteText, setNewNoteText] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Dr. Sarah Vance (CMO)');
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [overrideSeverity, setOverrideSeverity] = useState<SeverityLevel>(
    complaint.triage.severityLevel
  );
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideUser, setOverrideUser] = useState('Dr. Sarah Vance (CMO)');
  const [copied, setCopied] = useState(false);

  // Completed checklist items state for human oversight
  const [checklist, setChecklist] = useState<{ [key: number]: boolean }>({});

  const toggleChecklist = (idx: number) => {
    setChecklist((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote(complaint.id, newNoteText.trim(), noteAuthor);
    setNewNoteText('');
  };

  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) return;
    onOverrideSeverity(
      complaint.id,
      overrideSeverity,
      overrideReason.trim(),
      overrideUser
    );
    setShowOverrideForm(false);
    setOverrideReason('');
  };

  const handleCopySummary = () => {
    const summaryText = `[CMS COMPLAINT TRIAGE REPORT]
Tracking Number: ${complaint.trackingNumber}
Patient ID: ${complaint.patientIdentifier} (${complaint.patientName || 'Anonymous'})
Unit: ${complaint.departmentOrUnit} | Channel: ${complaint.source}
What Happened: ${complaint.triage.whatHappened}
Primary Category: ${complaint.triage.primaryCategory}
Severity: ${complaint.triage.severityLabel}
Severity Reasoning: ${complaint.triage.severityReasoning}
Flagged Risks: ${complaint.triage.identifiedRisks.map((r) => `${r.risk} (${r.explanation})`).join('; ')}
Escalation Route: ${complaint.triage.escalationRoute}
SLA Target: ${complaint.triage.slaTargetDescription} (${complaint.triage.slaTargetHours} hours)
Human Oversight Mandate: ${complaint.triage.humanIntervention.required ? 'MANDATORY' : 'ROUTINE'} (${complaint.triage.humanIntervention.urgency})
Oversight Team: ${complaint.triage.humanIntervention.roles.join(', ')}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sev = SEVERITY_LEVEL_INFO[complaint.triage.severityLevel];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col animate-scaleUp">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${sev.badge}`}>
              {sev.label}
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {complaint.trackingNumber}
                </span>
                <span className="text-xs text-slate-500">
                  ({complaint.patientIdentifier})
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {complaint.departmentOrUnit} &middot; Received:{' '}
                {new Date(complaint.receivedDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopySummary}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Copy Case Brief"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onPrint(complaint)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Print CMS Grievance Dossier"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1 text-slate-800">
          {/* Status & Quick Action Bar */}
          <div className="flex flex-wrap items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200 gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700">Grievance Status:</span>
              <select
                value={complaint.status}
                onChange={(e) =>
                  onUpdateStatus(complaint.id, e.target.value as ComplaintStatus)
                }
                className="text-xs font-bold rounded-lg px-2.5 py-1.5 border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="Pending Triage">Pending Triage</option>
                <option value="Triaged">Triaged</option>
                <option value="Under Review">Under Review</option>
                <option value="Clinical Investigation">Clinical Investigation</option>
                <option value="Escalated">Escalated</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="text-slate-500">
                Channel: <strong className="text-slate-800">{complaint.source}</strong>
              </span>
              <button
                onClick={() => setShowOverrideForm(!showOverrideForm)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-semibold flex items-center space-x-1"
              >
                <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                <span>Clinical Severity Override</span>
              </button>
            </div>
          </div>

          {/* Severity Override Form */}
          {showOverrideForm && (
            <form
              onSubmit={handleSaveOverride}
              className="p-4 rounded-xl bg-amber-50/70 border border-amber-300 space-y-3 animate-fadeIn"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-700" />
                  Physician / Risk Director Severity Override
                </span>
                <button
                  type="button"
                  onClick={() => setShowOverrideForm(false)}
                  className="text-amber-800 hover:text-amber-950 text-xs"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Severity Tier
                  </label>
                  <select
                    value={overrideSeverity}
                    onChange={(e) =>
                      setOverrideSeverity(Number(e.target.value) as SeverityLevel)
                    }
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800"
                  >
                    <option value={4}>Level 4 – Critical</option>
                    <option value={3}>Level 3 – High</option>
                    <option value={2}>Level 2 – Moderate</option>
                    <option value={1}>Level 1 – Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Authorizing Human Reviewer
                  </label>
                  <input
                    type="text"
                    value={overrideUser}
                    onChange={(e) => setOverrideUser(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Clinical Rationale for Override (Mandatory Audit Trail)
                </label>
                <textarea
                  rows={2}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Document why clinical context elevates or de-escalates severity..."
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800"
                  required
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm"
              >
                Log Human Severity Override
              </button>
            </form>
          )}

          {/* Override History (if any) */}
          {complaint.overrideHistory && complaint.overrideHistory.length > 0 && (
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <History className="w-3.5 h-3.5 text-slate-500" />
                Human Override Audit Trail:
              </span>
              {complaint.overrideHistory.map((oh, idx) => (
                <p key={idx} className="text-slate-600 text-[11px]">
                  Changed from Level {oh.previousSeverity} to Level {oh.newSeverity} by{' '}
                  <strong className="text-slate-800">{oh.user}</strong> on{' '}
                  {new Date(oh.timestamp).toLocaleString()}: "{oh.reason}"
                </p>
              ))}
            </div>
          )}

          {/* Original Patient Narrative */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Verbatim Patient Complaint / Narrative
            </span>
            <blockquote className="text-xs sm:text-sm text-slate-800 italic leading-relaxed pl-3 border-l-2 border-teal-500">
              "{complaint.rawText}"
            </blockquote>
          </div>

          {/* What Happened & Timeline */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
              What Happened (Factual Synthesis)
            </span>
            <p className="text-xs sm:text-sm font-semibold text-slate-900">
              {complaint.triage.whatHappened}
            </p>

            {complaint.triage.timelineOrFacts && (
              <ul className="mt-3 space-y-1 pt-2 border-t border-slate-100">
                {complaint.triage.timelineOrFacts.map((fact, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start space-x-2">
                    <span className="text-teal-600 font-bold">&bull;</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Step 1 & Step 2 Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                STEP 1: Complaint Category
              </span>
              <div className="mt-2">
                <span className="text-xs font-semibold text-slate-500 block">Primary Category:</span>
                <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-teal-600 text-white inline-block mt-1">
                  {complaint.triage.primaryCategory}
                </span>
              </div>

              {complaint.triage.secondaryCategories?.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs font-semibold text-slate-500 block mb-1">
                    Secondary Categories:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {complaint.triage.secondaryCategories.map((sec, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2 */}
            <div className={`p-4 rounded-xl border ${sev.color}`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  STEP 2: Severity Assessment
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-black ${sev.badge}`}>
                  {complaint.triage.severityLabel}
                </span>
              </div>
              <p className="text-xs font-semibold mt-2">{sev.summary}</p>
              <div className="mt-2 pt-2 border-t border-slate-200/60">
                <span className="text-[11px] font-bold block uppercase tracking-wider mb-0.5">
                  Severity Reasoning:
                </span>
                <p className="text-xs leading-relaxed">{complaint.triage.severityReasoning}</p>
              </div>
            </div>
          </div>

          {/* STEP 5: Risk Detection */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              STEP 5: Flagged Risks & Causality Explanations
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {complaint.triage.identifiedRisks.map((rf, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-rose-50/60 border border-rose-200 text-xs"
                >
                  <span className="font-extrabold text-rose-900 block mb-1">{rf.risk}</span>
                  <p className="text-slate-700">{rf.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 6: Escalation Recommendation & Human Intervention Mandate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 6 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  STEP 6: Escalation Recommendation
                </span>

                <div>
                  <span className="text-xs text-slate-500 block">Route To:</span>
                  <span className="text-base font-extrabold text-indigo-950 block">
                    {complaint.triage.escalationRoute}
                  </span>
                </div>

                <div className="mt-2 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-900">
                    SLA: {complaint.triage.slaTargetDescription}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2">
                  <strong className="text-slate-800">Rationale: </strong>
                  {complaint.triage.escalationRationale}
                </p>
              </div>

              {complaint.triage.regulatoryNotes && (
                <div className="mt-3 p-2 bg-slate-50 rounded text-[11px] text-slate-600 border border-slate-200">
                  <strong className="text-slate-700">Regulatory Framework: </strong>
                  {complaint.triage.regulatoryNotes}
                </div>
              )}
            </div>

            {/* Human Intervention & Action Plan */}
            <div
              className={`p-4 rounded-xl border ${
                complaint.triage.humanIntervention.required
                  ? 'bg-amber-50/70 border-amber-300'
                  : 'bg-emerald-50/70 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-900">
                  <UserCheck className="w-4 h-4" />
                  Human Intervention Mandate
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    complaint.triage.humanIntervention.required
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-emerald-200 text-emerald-900'
                  }`}
                >
                  {complaint.triage.humanIntervention.urgency}
                </span>
              </div>

              <p className="text-xs text-slate-700 mt-1">
                {complaint.triage.humanIntervention.rationale}
              </p>

              <div className="mt-2">
                <span className="text-[11px] font-bold text-slate-800 block mb-1">
                  Designated Review Roles:
                </span>
                <div className="flex flex-wrap gap-1">
                  {complaint.triage.humanIntervention.roles.map((role, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-800 border border-slate-300"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interactive Human Oversight Checklist */}
              <div className="mt-3 pt-2 border-t border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-800 block mb-1">
                  Human Oversight Investigation Tasks:
                </span>
                <div className="space-y-1.5">
                  {complaint.triage.recommendedActions.map((action, idx) => {
                    const isDone = !!checklist[idx];
                    return (
                      <label
                        key={idx}
                        className={`flex items-start space-x-2 text-xs p-1.5 rounded cursor-pointer transition-colors ${
                          isDone ? 'bg-emerald-100/60 line-through text-slate-500' : 'hover:bg-white/60 text-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggleChecklist(idx)}
                          className="w-3.5 h-3.5 mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>{action}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Internal Notes & Clinical Log Thread */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <MessageSquare className="w-4 h-4 text-teal-600" />
              Internal Grievance & Quality Review Log
            </span>

            {/* Note items */}
            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
              {complaint.internalNotes && complaint.internalNotes.length > 0 ? (
                complaint.internalNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <strong className="text-slate-800">{note.author}</strong>
                      <span>{new Date(note.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-700">{note.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No notes logged yet.</p>
              )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleSaveNote} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteAuthor}
                  onChange={(e) => setNoteAuthor(e.target.value)}
                  placeholder="Reviewer Name/Role"
                  className="w-1/3 text-xs rounded-lg border border-slate-300 p-2 bg-white"
                  required
                />
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Add clinical or risk investigation note..."
                  className="w-2/3 text-xs rounded-lg border border-slate-300 p-2 bg-white"
                  required
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shrink-0"
                >
                  Add Note
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
