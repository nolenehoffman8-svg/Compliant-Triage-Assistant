import React from 'react';
import {
  ShieldAlert,
  Activity,
  Layers,
  FileText,
  BookOpen,
  PlusCircle,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { ComplaintRecord } from '../types/triage';

interface HeaderProps {
  activeTab: 'dashboard' | 'triage' | 'queue';
  setActiveTab: (tab: 'dashboard' | 'triage' | 'queue') => void;
  complaints: ComplaintRecord[];
  onOpenNewTriage: () => void;
  onOpenReference: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  complaints,
  onOpenNewTriage,
  onOpenReference,
}) => {
  const criticalCount = complaints.filter(
    (c) => c.triage.severityLevel === 4 && c.status !== 'Resolved'
  ).length;

  const humanInterventionNeeded = complaints.filter(
    (c) => c.triage.humanIntervention.required && c.status !== 'Resolved'
  ).length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Clinical System Branding */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-900/30">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  Complaint Triage Assistant
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full">
                  Healthcare Clinical Triage
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Patient Safety &middot; CMS Grievance Compliance &middot; Human Oversight
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Dashboard Canvas</span>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'queue'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Grievance Queue</span>
              <span className="ml-1 px-1.5 py-0.2 bg-slate-700 text-slate-200 text-[10px] rounded-full">
                {complaints.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('triage')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'triage'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>New Triage Workbench</span>
            </button>
          </nav>

          {/* Quick Action Buttons & Critical Banner */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {criticalCount > 0 && (
              <div
                onClick={() => setActiveTab('queue')}
                className="cursor-pointer flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium animate-pulse"
                title={`${criticalCount} active Level 4 Critical grievances require immediate escalation`}
              >
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                <span className="hidden sm:inline">Critical Alerts:</span>
                <span className="font-bold text-rose-200">{criticalCount}</span>
              </div>
            )}

            <button
              onClick={onOpenReference}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/40"
              title="CMS & Triage Regulatory Standards Reference"
            >
              <BookOpen className="h-4 w-4" />
            </button>

            <button
              onClick={onOpenNewTriage}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Triage Complaint</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-1 px-2 rounded ${
              activeTab === 'dashboard' ? 'text-teal-400 font-bold' : 'text-slate-400'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`py-1 px-2 rounded ${
              activeTab === 'queue' ? 'text-teal-400 font-bold' : 'text-slate-400'
            }`}
          >
            Grievances ({complaints.length})
          </button>
          <button
            onClick={() => setActiveTab('triage')}
            className={`py-1 px-2 rounded ${
              activeTab === 'triage' ? 'text-teal-400 font-bold' : 'text-slate-400'
            }`}
          >
            Triage Assistant
          </button>
        </div>
      </div>
    </header>
  );
};
