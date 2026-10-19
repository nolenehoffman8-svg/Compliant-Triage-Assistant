import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  Clock,
  UserCheck,
  ChevronRight,
  FileText,
  RotateCcw,
  ArrowUpDown,
  CheckCircle2,
} from 'lucide-react';
import {
  ComplaintRecord,
  SeverityLevel,
  PrimaryCategory,
  RiskType,
  EscalationRoute,
  ComplaintStatus,
} from '../types/triage';
import { SEVERITY_LEVEL_INFO } from '../data/mockComplaints';

interface TriageQueueProps {
  complaints: ComplaintRecord[];
  onSelectComplaint: (complaint: ComplaintRecord) => void;
  onUpdateStatus: (complaintId: string, newStatus: ComplaintStatus) => void;
  initialFilter?: {
    severity?: SeverityLevel;
    category?: PrimaryCategory;
    risk?: RiskType;
    route?: EscalationRoute;
  };
}

export const TriageQueue: React.FC<TriageQueueProps> = ({
  complaints,
  onSelectComplaint,
  onUpdateStatus,
  initialFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | 'ALL'>(
    initialFilter?.severity || 'ALL'
  );
  const [selectedCategory, setSelectedCategory] = useState<PrimaryCategory | 'ALL'>(
    initialFilter?.category || 'ALL'
  );
  const [selectedRisk, setSelectedRisk] = useState<RiskType | 'ALL'>(
    initialFilter?.risk || 'ALL'
  );
  const [selectedRoute, setSelectedRoute] = useState<EscalationRoute | 'ALL'>(
    initialFilter?.route || 'ALL'
  );
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus | 'ALL'>('ALL');
  const [onlyHumanIntervention, setOnlyHumanIntervention] = useState(false);
  const [sortBy, setSortBy] = useState<'severity' | 'date'>('severity');

  // Filter logic
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText =
          c.rawText.toLowerCase().includes(q) ||
          c.trackingNumber.toLowerCase().includes(q) ||
          c.patientIdentifier.toLowerCase().includes(q) ||
          c.departmentOrUnit.toLowerCase().includes(q) ||
          c.triage.whatHappened.toLowerCase().includes(q) ||
          (c.patientName && c.patientName.toLowerCase().includes(q));
        if (!matchesText) return false;
      }

      // Severity
      if (selectedSeverity !== 'ALL' && c.triage.severityLevel !== selectedSeverity) {
        return false;
      }

      // Category
      if (selectedCategory !== 'ALL' && c.triage.primaryCategory !== selectedCategory) {
        return false;
      }

      // Risk
      if (
        selectedRisk !== 'ALL' &&
        !c.triage.identifiedRisks.some((r) => r.risk === selectedRisk)
      ) {
        return false;
      }

      // Route
      if (selectedRoute !== 'ALL' && c.triage.escalationRoute !== selectedRoute) {
        return false;
      }

      // Status
      if (selectedStatus !== 'ALL' && c.status !== selectedStatus) {
        return false;
      }

      // Human Intervention
      if (onlyHumanIntervention && !c.triage.humanIntervention.required) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'severity') {
        return b.triage.severityLevel - a.triage.severityLevel;
      } else {
        return new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime();
      }
    });
  }, [
    complaints,
    searchQuery,
    selectedSeverity,
    selectedCategory,
    selectedRisk,
    selectedRoute,
    selectedStatus,
    onlyHumanIntervention,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSeverity('ALL');
    setSelectedCategory('ALL');
    setSelectedRisk('ALL');
    setSelectedRoute('ALL');
    setSelectedStatus('ALL');
    setOnlyHumanIntervention(false);
  };

  const isFiltering =
    searchQuery !== '' ||
    selectedSeverity !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    selectedRisk !== 'ALL' ||
    selectedRoute !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    onlyHumanIntervention;

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Search & Filter Header Panel */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Grievance & Triage Case Queue
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filteredComplaints.length} of {complaints.length} total hospital grievances
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSortBy(sortBy === 'severity' ? 'date' : 'severity')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Sort: {sortBy === 'severity' ? 'Severity (Critical First)' : 'Date'}</span>
            </button>

            {isFiltering && (
              <button
                onClick={handleResetFilters}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across tracking numbers, clinical narratives, patient names, units, or findings..."
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filter Pills / Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-100">
          {/* Severity */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Severity Level
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) =>
                setSelectedSeverity(
                  e.target.value === 'ALL' ? 'ALL' : (Number(e.target.value) as SeverityLevel)
                )
              }
              className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800 focus:ring-1 focus:ring-teal-500 outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="4">Level 4 – Critical</option>
              <option value="3">Level 3 – High</option>
              <option value="2">Level 2 – Moderate</option>
              <option value="1">Level 1 – Low</option>
            </select>
          </div>

          {/* Primary Category */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value as PrimaryCategory | 'ALL')
              }
              className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800 focus:ring-1 focus:ring-teal-500 outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Patient Safety">Patient Safety</option>
              <option value="Clinical Care">Clinical Care</option>
              <option value="Privacy or Security">Privacy or Security</option>
              <option value="Staff Conduct">Staff Conduct</option>
              <option value="Communication">Communication</option>
              <option value="Billing">Billing</option>
              <option value="Technology / Patient Portal">Technology / Patient Portal</option>
              <option value="Wait Time">Wait Time</option>
              <option value="Scheduling">Scheduling</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Risk Flag */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Flagged Risk
            </label>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value as RiskType | 'ALL')}
              className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800 focus:ring-1 focus:ring-teal-500 outline-none"
            >
              <option value="ALL">All Risks</option>
              <option value="Patient Safety Risk">Patient Safety Risk</option>
              <option value="Clinical Risk">Clinical Risk</option>
              <option value="Compliance Risk">Compliance Risk</option>
              <option value="Privacy Risk">Privacy Risk</option>
              <option value="Accessibility Risk">Accessibility Risk</option>
              <option value="Equity Risk">Equity Risk</option>
              <option value="Reputational Risk">Reputational Risk</option>
              <option value="Operational Risk">Operational Risk</option>
            </select>
          </div>

          {/* Escalation Route */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Route Department
            </label>
            <select
              value={selectedRoute}
              onChange={(e) =>
                setSelectedRoute(e.target.value as EscalationRoute | 'ALL')
              }
              className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800 focus:ring-1 focus:ring-teal-500 outline-none"
            >
              <option value="ALL">All Departments</option>
              <option value="Risk Management">Risk Management</option>
              <option value="Physician Leadership">Physician Leadership</option>
              <option value="Nursing Leadership">Nursing Leadership</option>
              <option value="Quality Improvement Team">Quality Improvement</option>
              <option value="Compliance Office">Compliance Office</option>
              <option value="Revenue Cycle / Billing">Revenue Cycle / Billing</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Accessibility Coordinator">Accessibility Coordinator</option>
              <option value="Patient Experience Team">Patient Experience Team</option>
              <option value="Executive Review">Executive Review</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as ComplaintStatus | 'ALL')
              }
              className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800 focus:ring-1 focus:ring-teal-500 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending Triage">Pending Triage</option>
              <option value="Triaged">Triaged</option>
              <option value="Under Review">Under Review</option>
              <option value="Clinical Investigation">Clinical Investigation</option>
              <option value="Escalated">Escalated</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Human Intervention Checkbox */}
          <div className="flex flex-col justify-end">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={onlyHumanIntervention}
                onChange={(e) => setOnlyHumanIntervention(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
              <span className="text-[11px] leading-tight">Human Oversight Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Grievance Case List */}
      <div className="space-y-3">
        {filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              No matching complaints found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search terms, severity levels, or risk filter selections.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          filteredComplaints.map((c) => {
            const sev = SEVERITY_LEVEL_INFO[c.triage.severityLevel];
            return (
              <div
                key={c.id}
                onClick={() => onSelectComplaint(c)}
                className={`bg-white rounded-xl p-4 sm:p-5 border transition-all cursor-pointer group shadow-xs hover:shadow-md ${
                  c.triage.severityLevel === 4
                    ? 'border-l-4 border-l-rose-600 border-slate-200 hover:border-slate-300'
                    : c.triage.severityLevel === 3
                    ? 'border-l-4 border-l-orange-500 border-slate-200 hover:border-slate-300'
                    : c.triage.severityLevel === 2
                    ? 'border-l-4 border-l-amber-500 border-slate-200 hover:border-slate-300'
                    : 'border-l-4 border-l-emerald-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Left Column: Metadata & Badges */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Severity Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-black ${sev.badge}`}
                      >
                        {sev.label}
                      </span>

                      {/* Primary Category Pill */}
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-100 text-teal-900 border border-teal-200">
                        {c.triage.primaryCategory}
                      </span>

                      {/* Tracking ID */}
                      <span className="text-xs font-mono font-bold text-slate-700">
                        {c.trackingNumber}
                      </span>

                      {/* Unit */}
                      <span className="text-xs text-slate-500 hidden sm:inline">
                        &middot; {c.departmentOrUnit}
                      </span>

                      {/* Source */}
                      <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {c.source}
                      </span>
                    </div>

                    {/* What Happened Summary */}
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {c.triage.whatHappened}
                    </h3>

                    {/* Verbatim quote snippet */}
                    <p className="text-xs text-slate-500 line-clamp-1 italic">
                      "{c.rawText}"
                    </p>

                    {/* Risk Tag Badges */}
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {c.triage.identifiedRisks.map((rf, rIdx) => (
                        <span
                          key={rIdx}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-800 border border-rose-200"
                        >
                          {rf.risk}
                        </span>
                      ))}

                      {c.triage.humanIntervention.required && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-amber-700" />
                          Human Sign-Off Needed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Routing, SLA & Status Controls */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-row lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100 gap-2 shrink-0"
                  >
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Route To:</span>
                      <span className="text-xs font-bold text-slate-900 block">
                        {c.triage.escalationRoute}
                      </span>
                      <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 inline-block mt-0.5">
                        {c.triage.slaTargetDescription}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={c.status}
                        onChange={(e) =>
                          onUpdateStatus(c.id, e.target.value as ComplaintStatus)
                        }
                        className={`text-[11px] font-semibold rounded-lg px-2 py-1 border transition-colors outline-none cursor-pointer ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : c.status === 'Clinical Investigation'
                            ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
                            : c.status === 'Escalated'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="Pending Triage">Pending Triage</option>
                        <option value="Triaged">Triaged</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Clinical Investigation">Clinical Investigation</option>
                        <option value="Escalated">Escalated</option>
                        <option value="Resolved">Resolved</option>
                      </select>

                      <button
                        onClick={() => onSelectComplaint(c)}
                        className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                        title="View Full Triage Dossier"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
