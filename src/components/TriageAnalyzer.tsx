import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  Building2,
  Clock,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  BookOpen,
  FileText,
  Copy,
  Check,
  Layers,
  ChevronDown,
} from 'lucide-react';
import {
  ComplaintRecord,
  ComplaintSource,
  TriageResult,
  SeverityLevel,
} from '../types/triage';
import { SEVERITY_LEVEL_INFO } from '../data/mockComplaints';

interface TriageAnalyzerProps {
  onAddComplaintToQueue: (newRecord: ComplaintRecord) => void;
  onOpenReference: () => void;
}

const PRESET_SCENARIOS = [
  {
    title: 'Level 4 Critical – Pediatric Insulin Near-Miss & Nurse Hostility',
    source: 'Patient Portal Message' as ComplaintSource,
    unit: 'Pediatric Inpatient Unit (Floor 4)',
    patient: 'PT-4109 (Parent)',
    text:
      'My 6-year-old daughter was admitted with severe ketoacidosis. The night floor nurse programmed her IV infusion pump and almost administered 10x the prescribed insulin dose (0.5 units/kg instead of 0.05 units/kg). I caught it because the rate on the screen showed 15 mL/hr instead of 1.5 mL/hr. When I questioned her, the nurse became argumentative and told me "I have other sick kids to attend to." Only after I paged the charge nurse did they stop the infusion. This could have killed my daughter.',
  },
  {
    title: 'Level 4 Critical – ED 7-Hour Triage Delay, Burst Appendix & Racial Bias',
    source: 'Written Grievance' as ComplaintSource,
    unit: 'Emergency Department',
    patient: 'PT-8942',
    text:
      'I arrived at the Emergency Department with severe 9/10 lower quadrant abdominal pain and vomiting. The triage nurse assumed I was "drug-seeking" before checking my vitals, openly stating "we do not give out narcotics here" in front of other patients. I was left in the hallway for 7 hours while three Caucasian patients who arrived after me with sprained wrists were escorted into exam rooms. When my appendix ruptured at 3 AM, they finally rushed me to surgery. This is systemic racial discrimination and medical negligence.',
  },
  {
    title: 'Level 3 High – 16-Day Delayed Communication of Malignant Breast Biopsy',
    source: 'Patient Portal Message' as ComplaintSource,
    unit: 'Outpatient Oncology Clinic',
    patient: 'PT-3281',
    text:
      'I had a core needle biopsy of a suspicious breast mass three weeks ago. I was told results would take 3-5 days. Every time I called, the nurse dismissed me and said "no news is good news, stop calling." Yesterday I finally checked the portal and discovered my biopsy report was signed off 16 days ago showing invasive ductal carcinoma! The oncology referral was never sent. Sixteen days of tumor progression lost because staff failed to review or communicate critical pathology.',
  },
  {
    title: 'Level 3 High – Deaf Patient Denied ASL Interpreter for Surgical Consent',
    source: 'Verbal / In-Person Feedback' as ComplaintSource,
    unit: 'Surgical Day Center',
    patient: 'PT-7104',
    text:
      'I am profoundly deaf. When I checked in for my outpatient knee arthroscopy, I requested a qualified American Sign Language (ASL) interpreter as documented in my chart weeks in advance. The admissions clerk told me "the video iPad is not working, your wife can just interpret for you." My wife is not a medical interpreter and was distraught. The surgeon spoke to me while looking away, wearing a mask, so I could not lipread. I was forced to sign surgical consent forms without fully understanding the anesthesia risks.',
  },
  {
    title: 'Level 4 Critical – PHI Breach: Psychiatric & HIV Records Faxed to External Firm',
    source: 'Regulatory Agency / Ombudsman' as ComplaintSource,
    unit: 'Health Information Management (HIM)',
    patient: 'PT-1940',
    text:
      'An external commercial real estate firm in Chicago called to report that our hospital HIM fax queue mistakenly broadcast 60+ pages containing full patient SSNs, HIV lab results, and psychiatric consultation notes for 38 patients to their open office printer due to an erroneous speed-dial digit.',
  },
  {
    title: 'Level 2 Moderate – Surprise Balance Bill $18,450 & Threatened Collections',
    source: 'Written Grievance' as ComplaintSource,
    unit: 'Patient Financial Services',
    patient: 'PT-5521',
    text:
      'I verified in advance that Metro Health Hospital and my attending surgeon were 100% in-network for my scheduled knee surgery. Last week I received a surprise bill for $18,450.00 from an out-of-network assistant surgeon whom I never met, never consented to, and was never informed about. When I called billing, the representative threatened to send my account to collections if I did not pay within 15 days.',
  },
  {
    title: 'Level 1 Low – Clinic Parking Garage Kiosk Broken',
    source: 'CAHPS / Survey Comment' as ComplaintSource,
    unit: 'Facilities & Visitor Services',
    patient: 'PT-1087',
    text:
      'The parking garage ticket machine on Level B2 was broken and would not accept credit cards. Several elderly patients were stuck in line trying to figure out how to exit. I also noticed that the directional signs to the Cancer Pavilion were obscured by construction scaffolding.',
  },
];

export const TriageAnalyzer: React.FC<TriageAnalyzerProps> = ({
  onAddComplaintToQueue,
  onOpenReference,
}) => {
  const [complaintText, setComplaintText] = useState('');
  const [source, setSource] = useState<ComplaintSource>('Patient Portal Message');
  const [unit, setUnit] = useState('Emergency Department');
  const [patientId, setPatientId] = useState('PT-' + Math.floor(1000 + Math.random() * 9000));
  const [isLoading, setIsLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [triageEngine, setTriageEngine] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSelectPreset = (preset: (typeof PRESET_SCENARIOS)[0]) => {
    setComplaintText(preset.text);
    setSource(preset.source);
    setUnit(preset.unit);
    setPatientId(preset.patient);
    setTriageResult(null);
    setSavedSuccess(false);
    setErrorMsg(null);
  };

  const handleRunTriage = async () => {
    if (!complaintText.trim()) {
      setErrorMsg('Please enter complaint text or select a realistic preset scenario.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setTriageResult(null);
    setSavedSuccess(false);

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: complaintText,
          source,
          departmentOrUnit: unit,
          patientIdentifier: patientId,
        }),
      });

      const data = await response.json();
      if (data.success && data.triage) {
        setTriageResult(data.triage);
        setTriageEngine(data.engine || 'triage-engine');
      } else {
        setErrorMsg(data.error || 'Failed to triage complaint.');
      }
    } catch (err: any) {
      console.error('Triage error:', err);
      setErrorMsg('Network error connecting to triage assistant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToQueue = () => {
    if (!triageResult) return;

    const newComplaint: ComplaintRecord = {
      id: `CMP-${Date.now()}`,
      trackingNumber: `GRV-${Math.floor(10000 + Math.random() * 90000)}`,
      patientIdentifier: patientId || 'PT-ANON',
      incidentDate: new Date().toISOString(),
      receivedDate: new Date().toISOString(),
      source,
      departmentOrUnit: unit || 'General Hospital Unit',
      rawText: complaintText,
      status: triageResult.severityLevel === 4 ? 'Clinical Investigation' : 'Triaged',
      triage: triageResult,
      internalNotes: [
        {
          id: `note-${Date.now()}`,
          author: 'Triage Officer',
          timestamp: new Date().toISOString(),
          content: `Complaint triaged as ${triageResult.severityLabel}. Routed to ${triageResult.escalationRoute}.`,
        },
      ],
    };

    onAddComplaintToQueue(newComplaint);
    setSavedSuccess(true);
  };

  const handleCopySummary = () => {
    if (!triageResult) return;
    const summaryText = `[HEALTHCARE COMPLAINT TRIAGE DOSSIER]
What Happened: ${triageResult.whatHappened}
Primary Category: ${triageResult.primaryCategory}
Secondary Categories: ${triageResult.secondaryCategories?.join(', ') || 'None'}
Severity: ${triageResult.severityLabel} (${triageResult.severityReasoning})
Risks Flagged: ${triageResult.identifiedRisks.map((r) => `${r.risk} - ${r.explanation}`).join(' | ')}
Escalation Route: ${triageResult.escalationRoute}
SLA Target: ${triageResult.slaTargetDescription} (${triageResult.slaTargetHours} hours)
Human Intervention Mandate: ${triageResult.humanIntervention.required ? 'YES' : 'NO'} (${triageResult.humanIntervention.urgency})
Assigned Oversight Roles: ${triageResult.humanIntervention.roles.join(', ')}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Workbench Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                Interactive Triage Engine
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Steps 1 &middot; 2 &middot; 5 &middot; 6 &middot; Human Oversight
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Live Healthcare Grievance Triage Workbench
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Analyze incoming patient portal messages, grievances, or clinical feedback to determine
              what happened, how serious it is, who should review it, turnaround SLA, and human oversight.
            </p>
          </div>

          <button
            onClick={onOpenReference}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all self-start sm:self-auto"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span>Triage Rules Standard</span>
          </button>
        </div>

        {/* Preset Selectors */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Load Pre-Configured Clinical Scenarios:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {PRESET_SCENARIOS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="text-left p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-teal-50/60 hover:border-teal-300 transition-all text-xs group"
              >
                <span className="font-bold text-slate-800 group-hover:text-teal-800 line-clamp-1 block">
                  {preset.title}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  {preset.unit} &middot; {preset.source}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Metadata Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Feedback Channel / Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as ComplaintSource)}
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            >
              <option value="Patient Portal Message">Patient Portal Message</option>
              <option value="Written Grievance">Written Grievance</option>
              <option value="CAHPS / Survey Comment">CAHPS / Survey Comment</option>
              <option value="Verbal / In-Person Feedback">Verbal / In-Person Feedback</option>
              <option value="Online Review / Social">Online Review / Social</option>
              <option value="Regulatory Agency / Ombudsman">
                Regulatory Agency / Ombudsman
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hospital Department / Unit
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. Emergency Department, 4-West Surgery..."
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Patient / Record Pseudonym
            </label>
            <input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="e.g. PT-8921"
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
        </div>

        {/* Text Input */}
        <div className="mt-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Patient Grievance / Narrative Text
          </label>
          <textarea
            rows={5}
            value={complaintText}
            onChange={(e) => {
              setComplaintText(e.target.value);
              setSavedSuccess(false);
            }}
            placeholder="Paste verbatim patient complaint, portal message, survey comment, or risk report here..."
            className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-3 bg-white text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setComplaintText('');
              setTriageResult(null);
              setSavedSuccess(false);
              setErrorMsg(null);
            }}
            className="text-xs text-slate-500 hover:text-slate-700 flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Input</span>
          </button>

          <button
            type="button"
            onClick={handleRunTriage}
            disabled={isLoading || !complaintText.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Triaging (Category &middot; Severity &middot; Risk &middot; Route)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Execute Complete Triage</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Triage Outcome Canvas (Visualized Steps 1, 2, 5, 6, Human Oversight) */}
      {triageResult && (
        <div className="bg-white rounded-2xl p-6 border-2 border-teal-500/40 shadow-xl space-y-6 animate-fadeIn">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-teal-500/20 text-teal-800">
                  Triage Completed
                </span>
                <span className="text-xs text-slate-500">
                  Engine: <strong className="text-slate-800">{triageEngine}</strong>
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                Triage Assessment & Escalation Dossier
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopySummary}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center space-x-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    <span>Copy Summary</span>
                  </>
                )}
              </button>

              <button
                onClick={handleAddToQueue}
                disabled={savedSuccess}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-1.5 ${
                  savedSuccess
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-teal-600 hover:bg-teal-700 text-white active:scale-95'
                }`}
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved to Grievance Queue!</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-3.5 h-3.5" />
                    <span>Add to Active Queue</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section: What Happened */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              What Happened (Factual Clinical & Operational Chronology)
            </h4>
            <p className="text-sm font-semibold text-slate-900">
              {triageResult.whatHappened}
            </p>

            {triageResult.timelineOrFacts && triageResult.timelineOrFacts.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Key Milestones & Timeline Facts:
                </span>
                <ul className="space-y-1">
                  {triageResult.timelineOrFacts.map((fact, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start space-x-2">
                      <span className="text-teal-600 font-bold">&bull;</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Step 1 & Step 2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* STEP 1: Complaint Category */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
                STEP 1: Complaint Category
              </span>
              <div className="flex items-center space-x-2 mt-2">
                <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-teal-600 text-white">
                  Primary: {triageResult.primaryCategory}
                </span>
              </div>

              {triageResult.secondaryCategories && triageResult.secondaryCategories.length > 0 && (
                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Secondary Categories Identified:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {triageResult.secondaryCategories.map((sec, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: Severity Assessment */}
            <div
              className={`p-4 rounded-xl border shadow-xs ${
                SEVERITY_LEVEL_INFO[triageResult.severityLevel].color
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  STEP 2: Severity Assessment
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-xs font-black ${
                    SEVERITY_LEVEL_INFO[triageResult.severityLevel].badge
                  }`}
                >
                  {triageResult.severityLabel}
                </span>
              </div>

              <div className="mt-2 text-xs font-bold">
                {SEVERITY_LEVEL_INFO[triageResult.severityLevel].summary}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200/60">
                <span className="text-[11px] font-bold uppercase tracking-wider block mb-1">
                  Clinical & Operational Reasoning:
                </span>
                <p className="text-xs leading-relaxed">
                  {triageResult.severityReasoning}
                </p>
              </div>
            </div>
          </div>

          {/* STEP 5: Risk Detection */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                STEP 5: Risk Detection (Identified Risks & Detailed Causality)
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {triageResult.identifiedRisks.length} flagged
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {triageResult.identifiedRisks.map((rf, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-rose-50/50 border border-rose-200 text-xs"
                >
                  <span className="font-extrabold text-rose-900 block mb-1">
                    {rf.risk}
                  </span>
                  <p className="text-slate-700 leading-snug">{rf.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 6: Escalation Recommendation & Human Intervention Mandate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* STEP 6: Escalation Recommendation */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  STEP 6: Escalation Recommendation
                </span>

                <div className="mt-1">
                  <span className="text-xs text-slate-500 block">Designated Routing Target:</span>
                  <span className="text-base font-extrabold text-indigo-950 block mt-0.5">
                    {triageResult.escalationRoute}
                  </span>
                </div>

                <div className="mt-3 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-900">
                    SLA Target: {triageResult.slaTargetDescription}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  <strong className="text-slate-800">Rationale: </strong>
                  {triageResult.escalationRationale}
                </p>
              </div>

              {triageResult.regulatoryNotes && (
                <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                  <strong className="text-slate-700">Regulatory Standard: </strong>
                  {triageResult.regulatoryNotes}
                </div>
              )}
            </div>

            {/* Human Oversight & Intervention */}
            <div
              className={`p-4 rounded-xl border shadow-xs ${
                triageResult.humanIntervention.required
                  ? 'bg-amber-50/70 border-amber-300'
                  : 'bg-emerald-50/60 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-800">
                  <UserCheck className="w-4 h-4 text-slate-700" />
                  Human Intervention Oversight
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    triageResult.humanIntervention.required
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-emerald-200 text-emerald-900'
                  }`}
                >
                  {triageResult.humanIntervention.urgency}
                </span>
              </div>

              <div className="mt-1">
                <span className="text-xs font-bold text-slate-900">
                  {triageResult.humanIntervention.required
                    ? 'Mandatory Human Clinical / Risk Sign-Off Required'
                    : 'Routine Review (Automated Closure Permitted with Supervisor Verification)'}
                </span>
                <p className="text-xs text-slate-700 mt-1">
                  {triageResult.humanIntervention.rationale}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-700 block mb-1">
                  Mandated Review Roles:
                </span>
                <div className="flex flex-wrap gap-1">
                  {triageResult.humanIntervention.roles.map((role, rIdx) => (
                    <span
                      key={rIdx}
                      className="px-2 py-0.5 bg-white text-slate-800 text-[11px] font-semibold rounded border border-slate-300"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {triageResult.recommendedActions && triageResult.recommendedActions.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">
                    Recommended Triage Actions:
                  </span>
                  <ul className="space-y-1">
                    {triageResult.recommendedActions.map((action, aIdx) => (
                      <li key={aIdx} className="text-xs text-slate-700 flex items-start space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
