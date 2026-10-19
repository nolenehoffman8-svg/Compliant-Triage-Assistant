import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  UserCheck,
  Building2,
  TrendingUp,
  Activity,
  ArrowRight,
  Sparkles,
  Scale,
  FileCheck,
  HeartPulse,
} from 'lucide-react';
import {
  ComplaintRecord,
  SeverityLevel,
  RiskType,
  PrimaryCategory,
  EscalationRoute,
} from '../types/triage';
import { SEVERITY_LEVEL_INFO } from '../data/mockComplaints';

interface DashboardOverviewProps {
  complaints: ComplaintRecord[];
  onSelectComplaint: (complaint: ComplaintRecord) => void;
  onNavigateToQueueWithFilter: (filter: {
    severity?: SeverityLevel;
    category?: PrimaryCategory;
    risk?: RiskType;
    route?: EscalationRoute;
  }) => void;
  onStartNewTriage: () => void;
}

const ALL_RISKS: RiskType[] = [
  'Patient Safety Risk',
  'Clinical Risk',
  'Compliance Risk',
  'Privacy Risk',
  'Accessibility Risk',
  'Equity Risk',
  'Reputational Risk',
  'Operational Risk',
];

const ALL_CATEGORIES: PrimaryCategory[] = [
  'Patient Safety',
  'Clinical Care',
  'Privacy or Security',
  'Staff Conduct',
  'Communication',
  'Billing',
  'Technology / Patient Portal',
  'Wait Time',
  'Scheduling',
  'Other',
];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  complaints,
  onSelectComplaint,
  onNavigateToQueueWithFilter,
  onStartNewTriage,
}) => {
  // Aggregate Metrics
  const total = complaints.length;
  const criticalCount = complaints.filter((c) => c.triage.severityLevel === 4).length;
  const highCount = complaints.filter((c) => c.triage.severityLevel === 3).length;
  const moderateCount = complaints.filter((c) => c.triage.severityLevel === 2).length;
  const lowCount = complaints.filter((c) => c.triage.severityLevel === 1).length;

  const humanInterventionRequiredCount = complaints.filter(
    (c) => c.triage.humanIntervention.required
  ).length;

  const patientSafetyRiskCount = complaints.filter((c) =>
    c.triage.identifiedRisks.some((r) => r.risk === 'Patient Safety Risk')
  ).length;

  const clinicalRiskCount = complaints.filter((c) =>
    c.triage.identifiedRisks.some((r) => r.risk === 'Clinical Risk')
  ).length;

  // Category counts
  const categoryCounts = ALL_CATEGORIES.map((cat) => {
    const count = complaints.filter((c) => c.triage.primaryCategory === cat).length;
    return { category: cat, count, percent: total > 0 ? (count / total) * 100 : 0 };
  }).sort((a, b) => b.count - a.count);

  // Risk counts
  const riskCounts = ALL_RISKS.map((risk) => {
    const matching = complaints.filter((c) =>
      c.triage.identifiedRisks.some((r) => r.risk === risk)
    );
    return {
      risk,
      count: matching.length,
      criticalWeighted: matching.filter((c) => c.triage.severityLevel >= 3).length,
      percent: total > 0 ? (matching.length / total) * 100 : 0,
    };
  }).sort((a, b) => b.count - a.count);

  // Route breakdown
  const routeCounts: { [key in EscalationRoute]?: number } = {};
  complaints.forEach((c) => {
    const route = c.triage.escalationRoute;
    routeCounts[route] = (routeCounts[route] || 0) + 1;
  });

  const sortedRoutes = Object.entries(routeCounts).sort(
    (a, b) => (b[1] as number) - (a[1] as number)
  );

  // Urgent pending complaints
  const urgentGrievances = complaints
    .filter((c) => c.triage.severityLevel >= 3 && c.status !== 'Resolved')
    .slice(0, 4);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner / Triage Control Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-6 border border-teal-800/40 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                Active Clinical Triage Canvas
              </span>
              <span className="text-xs text-slate-400">
                CMS CoP 42 CFR § 482.13 Standard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Patient Grievance & Complaint Command Center
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl">
              Real-time classification, severity scoring (Levels 1–4), multi-dimensional clinical risk
              screening, and regulatory escalation routing with mandatory human oversight safeguards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={onStartNewTriage}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all active:scale-95 flex items-center space-x-2"
            >
              <Activity className="w-4 h-4" />
              <span>Triage Incoming Complaint</span>
            </button>
            <button
              onClick={() => onNavigateToQueueWithFilter({})}
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-white font-medium text-xs sm:text-sm rounded-xl border border-slate-700 transition-all flex items-center space-x-2"
            >
              <span>Explore All {total} Cases</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Triaged */}
        <div
          onClick={() => onNavigateToQueueWithFilter({})}
          className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Grievances
            </span>
            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-teal-50 text-slate-600 group-hover:text-teal-600 transition-colors">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{total}</span>
            <span className="text-xs text-slate-500">logged</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across all hospital divisions</p>
        </div>

        {/* Level 4 Critical */}
        <div
          onClick={() => onNavigateToQueueWithFilter({ severity: 4 })}
          className={`rounded-xl p-4 border shadow-xs transition-all cursor-pointer group ${
            criticalCount > 0
              ? 'bg-rose-50/70 border-rose-200 hover:border-rose-400 hover:shadow-md'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
              Level 4 Critical
            </span>
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600 animate-pulse">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-700">
              {criticalCount}
            </span>
            <span className="text-xs text-rose-700/80 font-medium">&lt; 2h SLA</span>
          </div>
          <p className="text-[11px] text-rose-700/80 mt-1">
            Immediate patient safety or legal risk
          </p>
        </div>

        {/* Level 3 High */}
        <div
          onClick={() => onNavigateToQueueWithFilter({ severity: 3 })}
          className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:border-orange-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider">
              Level 3 High
            </span>
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-orange-800">{highCount}</span>
            <span className="text-xs text-orange-600 font-medium">24–48h SLA</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Potential clinical harm & medication</p>
        </div>

        {/* Clinical / Safety Risk Flags */}
        <div
          onClick={() => onNavigateToQueueWithFilter({ risk: 'Patient Safety Risk' })}
          className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-800 uppercase tracking-wider">
              Safety / Clinical
            </span>
            <div className="p-2 bg-cyan-100 rounded-lg text-cyan-700">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-cyan-900">
              {patientSafetyRiskCount + clinicalRiskCount}
            </span>
            <span className="text-xs text-cyan-600 font-medium">flags</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {patientSafetyRiskCount} safety &middot; {clinicalRiskCount} clinical
          </p>
        </div>

        {/* Mandatory Human Oversight */}
        <div
          onClick={() => onNavigateToQueueWithFilter({})}
          className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
              Human Oversight
            </span>
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-indigo-900">
              {humanInterventionRequiredCount}
            </span>
            <span className="text-xs text-indigo-600 font-medium">mandated</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Cannot be auto-closed by AI</p>
        </div>
      </div>

      {/* Main Grid: Severity Distribution & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Severity Assessment Distribution (Thermometer/Tiers) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-teal-600" />
                  STEP 2: Severity Distribution
                </h3>
                <p className="text-xs text-slate-500">
                  Four-tier clinical & risk severity taxonomy
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {/* Level 4 */}
              <div
                onClick={() => onNavigateToQueueWithFilter({ severity: 4 })}
                className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-rose-600 text-white">
                      LEVEL 4
                    </span>
                    <span className="text-xs font-bold text-rose-900">Critical</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-rose-800">
                      {criticalCount} ({total > 0 ? Math.round((criticalCount / total) * 100) : 0}%)
                    </span>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-200/70 px-1.5 py-0.5 rounded">
                      &lt; 2h SLA
                    </span>
                  </div>
                </div>
                <div className="mt-2 w-full bg-rose-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${total > 0 ? (criticalCount / total) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-[11px] text-rose-800/80 mt-1.5">
                  Immediate safety risk, potential legal exposure, serious privacy violation, discrimination allegation.
                </p>
              </div>

              {/* Level 3 */}
              <div
                onClick={() => onNavigateToQueueWithFilter({ severity: 3 })}
                className="p-3 rounded-xl border border-orange-200 bg-orange-50/50 hover:bg-orange-100/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-orange-600 text-white">
                      LEVEL 3
                    </span>
                    <span className="text-xs font-bold text-orange-900">High</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-orange-800">
                      {highCount} ({total > 0 ? Math.round((highCount / total) * 100) : 0}%)
                    </span>
                    <span className="text-[10px] font-bold text-orange-700 bg-orange-200/70 px-1.5 py-0.5 rounded">
                      24–48h SLA
                    </span>
                  </div>
                </div>
                <div className="mt-2 w-full bg-orange-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${total > 0 ? (highCount / total) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-[11px] text-orange-800/80 mt-1.5">
                  Potential patient harm, medication concern, serious accessibility issue, escalated complaint.
                </p>
              </div>

              {/* Level 2 */}
              <div
                onClick={() => onNavigateToQueueWithFilter({ severity: 2 })}
                className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-600 text-white">
                      LEVEL 2
                    </span>
                    <span className="text-xs font-bold text-amber-900">Moderate</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-amber-800">
                      {moderateCount} ({total > 0 ? Math.round((moderateCount / total) * 100) : 0}%)
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-200/70 px-1.5 py-0.5 rounded">
                      3–5 Days
                    </span>
                  </div>
                </div>
                <div className="mt-2 w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${total > 0 ? (moderateCount / total) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-[11px] text-amber-800/80 mt-1.5">
                  Repeated service failures, significant frustration, communication breakdown.
                </p>
              </div>

              {/* Level 1 */}
              <div
                onClick={() => onNavigateToQueueWithFilter({ severity: 1 })}
                className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-600 text-white">
                      LEVEL 1
                    </span>
                    <span className="text-xs font-bold text-emerald-900">Low</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-emerald-800">
                      {lowCount} ({total > 0 ? Math.round((lowCount / total) * 100) : 0}%)
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-200/70 px-1.5 py-0.5 rounded">
                      7–14 Days
                    </span>
                  </div>
                </div>
                <div className="mt-2 w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${total > 0 ? (lowCount / total) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-[11px] text-emerald-800/80 mt-1.5">
                  Minor inconvenience, routine dissatisfaction, general suggestion.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 1: Category Breakdown Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                  STEP 1: Primary Complaint Categories
                </h3>
                <p className="text-xs text-slate-500">
                  Classified into the 10 standardized institutional categories
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {categoryCounts.map((item) => (
                <div
                  key={item.category}
                  onClick={() => onNavigateToQueueWithFilter({ category: item.category })}
                  className="group cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">
                      {item.category}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500 font-mono text-[11px]">
                        {Math.round(item.percent)}%
                      </span>
                      <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 font-bold rounded-md text-[10px]">
                        {item.count}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.category === 'Patient Safety'
                          ? 'bg-rose-500'
                          : item.category === 'Clinical Care'
                          ? 'bg-orange-500'
                          : item.category === 'Privacy or Security'
                          ? 'bg-indigo-500'
                          : item.category === 'Staff Conduct'
                          ? 'bg-amber-500'
                          : 'bg-teal-500'
                      }`}
                      style={{ width: `${Math.max(item.percent, 3)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Step 5 Risk Detection Heatmap & Step 6 Routing Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step 5: Risk Detection Heatmap */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                STEP 5: Risk Detection Heatmap
              </h3>
              <p className="text-xs text-slate-500">
                8 statutory and clinical risk dimensions flagged with causality
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
            {riskCounts.map((r) => {
              const isHighConcern = r.count > 0 && r.criticalWeighted > 0;
              return (
                <div
                  key={r.risk}
                  onClick={() => onNavigateToQueueWithFilter({ risk: r.risk })}
                  className={`p-3 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
                    isHighConcern
                      ? 'bg-rose-50/50 border-rose-200 hover:border-rose-400'
                      : r.count > 0
                      ? 'bg-slate-50 border-slate-200 hover:border-teal-400'
                      : 'bg-slate-50/40 border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-teal-700">
                      {r.risk}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isHighConcern
                          ? 'bg-rose-200 text-rose-800'
                          : r.count > 0
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {r.count} {r.count === 1 ? 'case' : 'cases'}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{r.criticalWeighted} high/critical</span>
                    <span className="font-mono text-[10px]">{Math.round(r.percent)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 6: Escalation Recommendation Matrix */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  STEP 6: Escalation Recommendation Routing
                </h3>
                <p className="text-xs text-slate-500">
                  Target department routing workload distribution
                </p>
              </div>
            </div>

            <div className="space-y-2.5 mt-3">
              {sortedRoutes.map(([route, count]) => {
                const isRiskOrExec =
                  route === 'Risk Management' || route === 'Executive Review';
                return (
                  <div
                    key={route}
                    onClick={() =>
                      onNavigateToQueueWithFilter({ route: route as EscalationRoute })
                    }
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isRiskOrExec
                            ? 'bg-rose-500 ring-2 ring-rose-200'
                            : 'bg-teal-500'
                        }`}
                      />
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-teal-700">
                        {route}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={`h-full rounded-full ${
                            isRiskOrExec ? 'bg-rose-500' : 'bg-teal-600'
                          }`}
                          style={{
                            width: `${total > 0 ? ((count as number) / total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md min-w-[28px] text-center">
                        {count as number}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Critical Grievance Spotlight Feed */}
      {urgentGrievances.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Active High & Critical Priority Spotlight
              </h3>
            </div>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Immediate Clinical / Legal Containment Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {urgentGrievances.map((c) => {
              const sev = SEVERITY_LEVEL_INFO[c.triage.severityLevel];
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectComplaint(c)}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${sev.badge}`}
                      >
                        {sev.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {c.trackingNumber}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded">
                      {c.triage.slaTargetDescription}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-teal-700">
                    {c.triage.whatHappened}
                  </h4>

                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                    "{c.rawText}"
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200 text-[11px]">
                    <span className="text-slate-600 font-medium">
                      Route: <strong className="text-slate-900">{c.triage.escalationRoute}</strong>
                    </span>
                    <span className="text-teal-600 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center">
                      Review Dossier &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
