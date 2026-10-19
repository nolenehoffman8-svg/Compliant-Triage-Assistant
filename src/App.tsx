/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { TriageAnalyzer } from './components/TriageAnalyzer';
import { TriageQueue } from './components/TriageQueue';
import { TriageDossierModal } from './components/TriageDossierModal';
import { RegulatoryReferenceModal } from './components/RegulatoryReferenceModal';
import { PrintableReport } from './components/PrintableReport';
import { INITIAL_COMPLAINTS, SEVERITY_LEVEL_INFO } from './data/mockComplaints';
import {
  ComplaintRecord,
  ComplaintStatus,
  SeverityLevel,
  PrimaryCategory,
  RiskType,
  EscalationRoute,
} from './types/triage';

export default function App() {
  const [complaints, setComplaints] = useState<ComplaintRecord[]>(INITIAL_COMPLAINTS);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'triage' | 'queue'>('dashboard');
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintRecord | null>(null);
  const [printableComplaint, setPrintableComplaint] = useState<ComplaintRecord | null>(null);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Queue drill-down filter state passed from Dashboard clicks
  const [queueFilter, setQueueFilter] = useState<{
    severity?: SeverityLevel;
    category?: PrimaryCategory;
    risk?: RiskType;
    route?: EscalationRoute;
  }>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleAddComplaintToQueue = (newRecord: ComplaintRecord) => {
    setComplaints((prev) => [newRecord, ...prev]);
    showToast(`Added ${newRecord.trackingNumber} to Triage Queue`);
  };

  const handleUpdateStatus = (complaintId: string, newStatus: ComplaintStatus) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === complaintId ? { ...c, status: newStatus } : c))
    );
    if (selectedComplaint && selectedComplaint.id === complaintId) {
      setSelectedComplaint((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    showToast(`Status updated to "${newStatus}"`);
  };

  const handleAddNote = (complaintId: string, content: string, author: string) => {
    const newNote = {
      id: `note-${Date.now()}`,
      author,
      timestamp: new Date().toISOString(),
      content,
    };

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const notes = c.internalNotes ? [...c.internalNotes, newNote] : [newNote];
          return { ...c, internalNotes: notes };
        }
        return c;
      })
    );

    if (selectedComplaint && selectedComplaint.id === complaintId) {
      setSelectedComplaint((prev) =>
        prev
          ? {
              ...prev,
              internalNotes: prev.internalNotes ? [...prev.internalNotes, newNote] : [newNote],
            }
          : null
      );
    }
    showToast('Clinical investigation note recorded');
  };

  const handleOverrideSeverity = (
    complaintId: string,
    newSeverity: SeverityLevel,
    reason: string,
    user: string
  ) => {
    const overrideEntry = {
      timestamp: new Date().toISOString(),
      user,
      previousSeverity: 2 as SeverityLevel,
      newSeverity,
      reason,
    };

    const newLabel =
      newSeverity === 4
        ? ('Level 4 – Critical' as const)
        : newSeverity === 3
        ? ('Level 3 – High' as const)
        : newSeverity === 2
        ? ('Level 2 – Moderate' as const)
        : ('Level 1 – Low' as const);

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          overrideEntry.previousSeverity = c.triage.severityLevel;
          const updatedTriage = {
            ...c.triage,
            severityLevel: newSeverity,
            severityLabel: newLabel,
            severityReasoning: `[HUMAN CLINICAL OVERRIDE by ${user}]: ${reason} (Original assessment: ${c.triage.severityReasoning})`,
            humanIntervention: {
              ...c.triage.humanIntervention,
              required: newSeverity >= 3,
              urgency: newSeverity === 4 ? ('Immediate Mandate' as const) : newSeverity === 3 ? ('Prompt' as const) : ('Routine' as const),
            },
          };
          const history = c.overrideHistory ? [...c.overrideHistory, overrideEntry] : [overrideEntry];
          return {
            ...c,
            triage: updatedTriage,
            overrideHistory: history,
          };
        }
        return c;
      })
    );

    if (selectedComplaint && selectedComplaint.id === complaintId) {
      setSelectedComplaint((prev) => {
        if (!prev) return null;
        overrideEntry.previousSeverity = prev.triage.severityLevel;
        return {
          ...prev,
          triage: {
            ...prev.triage,
            severityLevel: newSeverity,
            severityLabel: newLabel,
            severityReasoning: `[HUMAN CLINICAL OVERRIDE by ${user}]: ${reason}`,
          },
          overrideHistory: prev.overrideHistory
            ? [...prev.overrideHistory, overrideEntry]
            : [overrideEntry],
        };
      });
    }

    showToast(`Severity overridden to Level ${newSeverity} (${user})`);
  };

  const handleNavigateToQueueWithFilter = (filter: {
    severity?: SeverityLevel;
    category?: PrimaryCategory;
    risk?: RiskType;
    route?: EscalationRoute;
  }) => {
    setQueueFilter(filter);
    setActiveTab('queue');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-teal-500 selection:text-white">
      {/* Top Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        complaints={complaints}
        onOpenNewTriage={() => setActiveTab('triage')}
        onOpenReference={() => setIsReferenceModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            complaints={complaints}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
            onNavigateToQueueWithFilter={handleNavigateToQueueWithFilter}
            onStartNewTriage={() => setActiveTab('triage')}
          />
        )}

        {activeTab === 'triage' && (
          <TriageAnalyzer
            onAddComplaintToQueue={handleAddComplaintToQueue}
            onOpenReference={() => setIsReferenceModalOpen(true)}
          />
        )}

        {activeTab === 'queue' && (
          <TriageQueue
            complaints={complaints}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
            onUpdateStatus={handleUpdateStatus}
            initialFilter={queueFilter}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Complaint Triage Assistant &middot; Accredited Hospital Clinical Governance Standard
          </span>
          <span className="text-[11px] text-slate-400">
            Complies with CMS 42 CFR § 482.13 Grievance Regulations &middot; Human-in-the-Loop Safeguards Active
          </span>
        </div>
      </footer>

      {/* Case Dossier Detail Modal */}
      <TriageDossierModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onUpdateStatus={handleUpdateStatus}
        onAddNote={handleAddNote}
        onOverrideSeverity={handleOverrideSeverity}
        onPrint={(c) => setPrintableComplaint(c)}
      />

      {/* Regulatory Standards Handbook Modal */}
      <RegulatoryReferenceModal
        isOpen={isReferenceModalOpen}
        onClose={() => setIsReferenceModalOpen(false)}
      />

      {/* Printable Report / Export View */}
      <PrintableReport
        complaint={printableComplaint}
        onClose={() => setPrintableComplaint(null)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xl border border-slate-700 animate-slideUp flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
