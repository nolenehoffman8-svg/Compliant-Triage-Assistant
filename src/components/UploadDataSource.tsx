import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Download,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  RotateCcw,
  ShieldAlert,
  HelpCircle,
  FileCode,
} from 'lucide-react';
import {
  ComplaintRecord,
  ComplaintSource,
  ComplaintStatus,
} from '../types/triage';

interface UploadDataSourceProps {
  onBatchImport: (records: ComplaintRecord[]) => void;
  onNavigateToQueue: () => void;
}

interface ParsedRow {
  patientId?: string;
  patientName?: string;
  incidentDate?: string;
  department?: string;
  source?: string;
  complaintText: string;
}

// Sample hospital datasets for instant evaluation
const SAMPLE_EPIC_DATASET = `mrn,patient_name,incident_date,department,source,complaint_text
PT-5012,Robert Vance,2026-10-17,Inpatient Orthopedics,Written Grievance,"Discharged 18 hours after total hip arthroplasty with active surgical wound drainage. The discharge nurse told my wife 'just put a towel over it.' Within 48 hours I had a 103F fever and purulent drainage, requiring emergency readmission and surgical debridement for MRSA joint infection."
PT-6291,Maria Santos,2026-10-18,Cardiology Outpatient Clinic,Patient Portal Message,"My cardiologist prescribed Metoprolol 50mg BID, but the clinic electronic prescription sent to Walgreens was written for Metoprolol 200mg. I took two doses and became severely hypotensive and passed out in my kitchen."
PT-7389,David Kim,2026-10-15,Emergency Department,Verbal / In-Person Feedback,"Waited 6 hours in the ED waiting room with worsening chest tightness and shortness of breath. Triage nurse never repeated my vitals or did an EKG. When I finally asked the security guard for help, an attending walked by and noticed my cyanotic lips."
PT-8104,Latoya Jenkins,2026-10-16,Pediatric Ambulatory Care,CAHPS / Survey Comment,"The receptionist repeatedly mispronounced my child's name with mocking remarks, then told the waiting room 'these Medicaid patients always demand same-day walk-in appointments.' This was humiliating and discriminatory."
PT-9450,Thomas Wright,2026-10-17,Patient Financial Services,Written Grievance,"Received a surprise collection notice for $8,200 from an out-of-network pathologist for routine outpatient colonoscopy biopsies performed at an in-network hospital, violating the No Surprises Act."`;

const SAMPLE_CAHPS_DATASET = `mrn,patient_name,incident_date,department,source,complaint_text
PT-2291,Evelyn Moore,2026-10-14,Ambulatory Surgery Center,CAHPS / Survey Comment,"The nurse in the recovery bay was exceptionally rough when removing my peripheral IV, tearing my skin and causing severe bruising. When I winced, she rolled her eyes."
PT-3382,Lucas Gray,2026-10-15,Radiology / MRI Center,CAHPS / Survey Comment,"I am severely claustrophobic and requested mild oral sedation as arranged by my PCP. The MRI technologist refused to review my order, stating 'we have a 20-minute slot, take it or reschedule.' I had a full panic attack in the scanner."
PT-4473,Ana Morales,2026-10-16,Women's Health Pavilion,CAHPS / Survey Comment,"The Spanish interpreter on the video remote screen froze within 2 minutes. The resident physician shrugged and proceeded with the pelvic exam while trying to communicate with broken hand gestures."
PT-5564,Arthur Pendelton,2026-10-17,Outpatient Pharmacy,CAHPS / Survey Comment,"The pharmacy wait time was 2 hours and 45 minutes for a critical post-transplant immunosuppressant medication. Staff ignored the pickup line while having personal conversations."`;

export const UploadDataSource: React.FC<UploadDataSourceProps> = ({
  onBatchImport,
  onNavigateToQueue,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'paste' | 'simulation'>('file');
  const [dragActive, setDragActive] = useState(false);
  const [rawPastedText, setRawPastedText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importedSummary, setImportedSummary] = useState<{
    total: number;
    critical: number;
    high: number;
    records: ComplaintRecord[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse CSV or TSV text
  const parseDelimitedText = (text: string): ParsedRow[] => {
    const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      // Check if it's raw text complaints separated by blank lines
      if (lines.length === 1) {
        return [{ complaintText: lines[0] }];
      }
    }

    // Try parsing header
    const firstLine = lines[0];
    const isComma = firstLine.includes(',');
    const delimiter = isComma ? ',' : '\t';

    // Simple CSV row parser handling quotes
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map((r) => r.replace(/^"(.*)"$/, '$1'));
    };

    const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

    // Check if first row is actually a header
    const hasHeaderKeywords = headers.some((h) =>
      ['complaint', 'text', 'narrative', 'description', 'feedback', 'mrn', 'patient', 'department'].some((k) =>
        h.includes(k)
      )
    );

    if (!hasHeaderKeywords) {
      // Treat every non-empty line as a complaint
      return lines.map((line, idx) => ({
        patientId: `PT-${1000 + idx}`,
        department: 'General Inpatient',
        source: 'Imported Dataset',
        complaintText: line,
      }));
    }

    // Identify column indices
    const textIdx = headers.findIndex((h) =>
      h.includes('complaint') || h.includes('text') || h.includes('narrative') || h.includes('desc') || h.includes('comment')
    );
    const mrnIdx = headers.findIndex((h) => h.includes('mrn') || h.includes('patientid') || h.includes('id'));
    const nameIdx = headers.findIndex((h) => h.includes('name'));
    const deptIdx = headers.findIndex((h) => h.includes('department') || h.includes('unit') || h.includes('clinic') || h.includes('location'));
    const dateIdx = headers.findIndex((h) => h.includes('date'));
    const srcIdx = headers.findIndex((h) => h.includes('source') || h.includes('channel'));

    const rows: ParsedRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      if (cols.length === 0) continue;

      const complaintText = textIdx !== -1 && cols[textIdx] ? cols[textIdx] : cols[cols.length - 1];
      if (!complaintText || !complaintText.trim()) continue;

      rows.push({
        complaintText: complaintText.trim(),
        patientId: mrnIdx !== -1 && cols[mrnIdx] ? cols[mrnIdx] : `PT-${1000 + i}`,
        patientName: nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx] : undefined,
        department: deptIdx !== -1 && cols[deptIdx] ? cols[deptIdx] : 'General Hospital Unit',
        incidentDate: dateIdx !== -1 && cols[dateIdx] ? cols[dateIdx] : new Date().toISOString(),
        source: srcIdx !== -1 && cols[srcIdx] ? cols[srcIdx] : 'Imported Grievance File',
      });
    }

    return rows;
  };

  // Parse JSON format
  const parseJsonText = (jsonStr: string): ParsedRow[] => {
    try {
      const data = JSON.parse(jsonStr);
      const arr = Array.isArray(data) ? data : data.complaints || data.records || [data];
      return arr
        .map((item: any, i: number) => {
          const complaintText = item.complaintText || item.text || item.complaint || item.narrative || item.description || '';
          if (!complaintText) return null;
          return {
            complaintText,
            patientId: item.patientId || item.mrn || `PT-${1000 + i}`,
            patientName: item.patientName || item.name,
            department: item.department || item.unit || 'General Hospital Unit',
            incidentDate: item.incidentDate || item.date || new Date().toISOString(),
            source: item.source || 'JSON Import',
          };
        })
        .filter((r): r is ParsedRow => r !== null);
    } catch (e) {
      throw new Error('Invalid JSON format. Please ensure valid JSON array or object structure.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setErrorMessage(null);
    setImportedSummary(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      try {
        let rows: ParsedRow[] = [];
        if (file.name.endsWith('.json')) {
          rows = parseJsonText(content);
        } else {
          rows = parseDelimitedText(content);
        }

        if (rows.length === 0) {
          setErrorMessage('No valid complaint records found in this file.');
          setParsedRows([]);
        } else {
          setParsedRows(rows);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Error parsing file format.');
        setParsedRows([]);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleParsePastedText = () => {
    setErrorMessage(null);
    setImportedSummary(null);
    if (!rawPastedText.trim()) {
      setErrorMessage('Please enter or paste data into the box.');
      return;
    }

    try {
      let rows: ParsedRow[] = [];
      if (rawPastedText.trim().startsWith('[') || rawPastedText.trim().startsWith('{')) {
        rows = parseJsonText(rawPastedText);
      } else {
        rows = parseDelimitedText(rawPastedText);
      }

      if (rows.length === 0) {
        setErrorMessage('Could not extract any valid complaint narratives from the pasted text.');
        setParsedRows([]);
      } else {
        setFileName('Pasted Data Source');
        setParsedRows(rows);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error parsing pasted data.');
      setParsedRows([]);
    }
  };

  const handleLoadSampleDataset = (datasetType: 'epic' | 'cahps') => {
    const text = datasetType === 'epic' ? SAMPLE_EPIC_DATASET : SAMPLE_CAHPS_DATASET;
    setRawPastedText(text);
    setFileName(datasetType === 'epic' ? 'Epic_RLDatix_Export_Simulation.csv' : 'CAHPS_Survey_Patient_Comments.csv');
    setErrorMessage(null);
    setImportedSummary(null);

    const rows = parseDelimitedText(text);
    setParsedRows(rows);
    setActiveTab('paste');
  };

  // Trigger batch triage via API
  const handleExecuteBatchImport = async (autoTriage: boolean) => {
    if (parsedRows.length === 0) return;

    setIsProcessing(true);
    setProgressPercent(10);
    setErrorMessage(null);

    try {
      let importedRecords: ComplaintRecord[] = [];

      if (autoTriage) {
        // Send to /api/batch-triage
        const response = await fetch('/api/batch-triage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: parsedRows.map((r) => ({
              text: r.complaintText,
              patientIdentifier: r.patientId,
              patientName: r.patientName,
              departmentOrUnit: r.department,
              incidentDate: r.incidentDate,
              source: r.source,
            })),
          }),
        });

        setProgressPercent(60);
        const data = await response.json();

        if (data.success && Array.isArray(data.results)) {
          importedRecords = data.results.map((res: any, idx: number) => ({
            id: `CMP-${Date.now()}-${idx}`,
            trackingNumber: `GRV-${Math.floor(10000 + Math.random() * 90000)}`,
            patientIdentifier: res.patientIdentifier,
            patientName: res.patientName,
            incidentDate: res.incidentDate,
            receivedDate: new Date().toISOString(),
            source: (res.source as ComplaintSource) || 'Imported Dataset',
            departmentOrUnit: res.departmentOrUnit,
            rawText: res.originalText,
            status:
              res.triage.severityLevel === 4
                ? ('Clinical Investigation' as ComplaintStatus)
                : ('Triaged' as ComplaintStatus),
            triage: res.triage,
            internalNotes: [
              {
                id: `note-${Date.now()}-${idx}`,
                author: 'Automated Batch Triage Ingestion',
                timestamp: new Date().toISOString(),
                content: `Ingested from ${fileName || 'External Data Source'}. Triaged as ${res.triage.severityLabel} (${res.triage.primaryCategory}).`,
              },
            ],
          }));
        } else {
          throw new Error('Batch triage failed on the server.');
        }
      } else {
        // Import as Pending Triage with default placeholder triage
        importedRecords = parsedRows.map((r, idx) => ({
          id: `CMP-${Date.now()}-${idx}`,
          trackingNumber: `GRV-${Math.floor(10000 + Math.random() * 90000)}`,
          patientIdentifier: r.patientId || `PT-${1000 + idx}`,
          patientName: r.patientName,
          incidentDate: r.incidentDate || new Date().toISOString(),
          receivedDate: new Date().toISOString(),
          source: (r.source as ComplaintSource) || 'Imported Dataset',
          departmentOrUnit: r.department || 'General Inpatient',
          rawText: r.complaintText,
          status: 'Pending Triage' as ComplaintStatus,
          triage: {
            whatHappened: r.complaintText.substring(0, 160) + '...',
            timelineOrFacts: ['Imported via external file upload for manual triage review.'],
            primaryCategory: 'Other',
            secondaryCategories: [],
            severityLevel: 2,
            severityLabel: 'Level 2 – Moderate',
            severityReasoning: 'Pending individual triage review by hospital staff.',
            identifiedRisks: [
              {
                risk: 'Operational Risk',
                explanation: 'Incoming unprocessed patient complaint requiring triage validation.',
              },
            ],
            escalationRoute: 'Patient Experience Team',
            escalationRationale: 'Default queue assignment pending clinical assessment.',
            slaTargetHours: 72,
            slaTargetDescription: 'Standard intake review',
            humanIntervention: {
              required: true,
              urgency: 'Routine',
              roles: ['Triage Coordinator'],
              rationale: 'Imported batch item awaiting initial clinical sign-off.',
            },
            recommendedActions: ['Conduct initial review and assign to designated department.'],
          },
        }));
      }

      setProgressPercent(100);

      // Pass up to parent App state
      onBatchImport(importedRecords);

      const critical = importedRecords.filter((r) => r.triage.severityLevel === 4).length;
      const high = importedRecords.filter((r) => r.triage.severityLevel === 3).length;

      setImportedSummary({
        total: importedRecords.length,
        critical,
        high,
        records: importedRecords,
      });
    } catch (err: any) {
      console.error('Batch import error:', err);
      setErrorMessage('Failed to complete batch import: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      'mrn,patient_name,incident_date,department,source,complaint_text\n' +
      'PT-1001,Jane Doe,2026-10-18,Emergency Department,Patient Portal Message,"Doctor did not explain medication changes and discharged me without prescriptions."\n' +
      'PT-1002,John Smith,2026-10-17,Cardiology Clinic,CAHPS / Survey Comment,"Waited 3 hours past appointment time; front desk staff was dismissive."\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'hospital_complaints_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setParsedRows([]);
    setFileName(null);
    setRawPastedText('');
    setErrorMessage(null);
    setImportedSummary(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-teal-700" />
                Data Source Ingestion Engine
              </span>
              <span className="text-xs text-slate-500 font-mono">
                EHR / EMR &middot; CAHPS &middot; RLDatix &middot; CSV &middot; JSON
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Upload Complaints Data Source
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Ingest patient complaints and survey comments in bulk. Automatically extracts incident facts,
              classifies categories, scores severities (Levels 1–4), scans clinical risks, and routes
              records into the grievance command center.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Download CSV Template</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation: File Upload vs Raw Paste vs Simulation */}
        <div className="mt-6 flex border-b border-slate-200 space-x-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('file')}
            className={`pb-2.5 flex items-center space-x-1.5 transition-colors border-b-2 ${
              activeTab === 'file'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload File (CSV / TSV / JSON)</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-2.5 flex items-center space-x-1.5 transition-colors border-b-2 ${
              activeTab === 'paste'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Delimited Text</span>
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            className={`pb-2.5 flex items-center space-x-1.5 transition-colors border-b-2 ${
              activeTab === 'simulation'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Pre-Loaded Hospital Simulation Batches</span>
          </button>
        </div>

        {/* Tab 1: Drag & Drop File Upload */}
        {activeTab === 'file' && (
          <div className="mt-5 space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-teal-500 bg-teal-50/50 scale-[0.99]'
                  : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.json,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 shadow-sm border border-teal-100">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Drag and drop your complaint data file here, or{' '}
                <span className="text-teal-600 underline">browse computer</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Supports CSV, TSV, JSON, and multi-line TXT exports from Epic, Cerner, Press Ganey, or RLDatix.
              </p>
              <div className="mt-4 flex items-center justify-center space-x-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> .CSV / .TSV
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <FileCode className="w-3.5 h-3.5" /> .JSON
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> .TXT
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Raw Text Paste */}
        {activeTab === 'paste' && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Paste CSV Rows or JSON Array of Complaints:
              </label>
              <textarea
                rows={6}
                value={rawPastedText}
                onChange={(e) => setRawPastedText(e.target.value)}
                placeholder="Paste CSV rows (mrn, department, source, complaint_text) or raw lines of patient feedback..."
                className="w-full text-xs font-mono rounded-xl border border-slate-300 p-3 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-slate-500">
                Tip: Standard column headers like "complaint_text", "mrn", "department" are auto-detected.
              </span>
              <button
                type="button"
                onClick={handleParsePastedText}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Parse Pasted Data
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Pre-Loaded Simulation Batches */}
        {activeTab === 'simulation' && (
          <div className="mt-5 space-y-3">
            <p className="text-xs text-slate-600">
              Select one of the pre-built healthcare grievance datasets to test batch triage and clinical risk screening instantly:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div
                onClick={() => handleLoadSampleDataset('epic')}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50/60 hover:border-teal-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 group-hover:text-teal-800 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-teal-600" />
                    Epic / RLDatix Hospital Grievance Batch
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                    5 Cases
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  High-variance clinical cases: Post-op MRSA infection, 4x beta-blocker overdose, missed cyanotic chest pain, discriminatory remarks, and No Surprises Act balance bill.
                </p>
                <span className="mt-3 inline-flex items-center text-xs font-bold text-teal-600 group-hover:translate-x-1 transition-transform">
                  Load & Preview Dataset &rarr;
                </span>
              </div>

              <div
                onClick={() => handleLoadSampleDataset('cahps')}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50/60 hover:border-teal-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 group-hover:text-teal-800 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                    Ambulatory CAHPS Patient Experience Survey Batch
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                    4 Comments
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Outpatient comments: Rough IV removal skin tear, MRI claustrophobia sedation refusal, Spanish video interpreter failure, and 3-hour immunosuppressant wait.
                </p>
                <span className="mt-3 inline-flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                  Load & Preview Dataset &rarr;
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Parsed Records Preview & Action Panel */}
      {parsedRows.length > 0 && !importedSummary && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Ready for Ingestion
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {fileName || 'External Dataset'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Parsed {parsedRows.length} Complaint Records
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Preview Table of First Rows */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Patient / MRN</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Channel</th>
                  <th className="p-3">Complaint Narrative</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedRows.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">
                      {row.patientId || 'PT-ANON'}
                      {row.patientName && (
                        <span className="block text-[11px] text-slate-500 font-normal">
                          {row.patientName}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600 whitespace-nowrap">
                      {row.department || 'General Unit'}
                    </td>
                    <td className="p-3 text-slate-500 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                        {row.source || 'File Upload'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-800 max-w-md">
                      <p className="line-clamp-2 italic">"{row.complaintText}"</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {parsedRows.length > 5 && (
            <p className="text-xs text-slate-500 italic text-center">
              + {parsedRows.length - 5} additional complaints ready for batch processing
            </p>
          )}

          {/* Progress Bar (during batch triage) */}
          {isProcessing && (
            <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-teal-900">
                <span className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
                  Triaging batch records with Healthcare Complaint Assistant...
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-teal-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-teal-700">
                Extracting facts &middot; Classifying 10 categories &middot; Scoring Levels 1–4 &middot; Screening 8 risk dimensions &middot; Assigning SLAs
              </p>
            </div>
          )}

          {/* Execution Buttons */}
          {!isProcessing && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleExecuteBatchImport(false)}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
              >
                Import as "Pending Triage" (Manual Queue)
              </button>

              <button
                type="button"
                onClick={() => handleExecuteBatchImport(true)}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Auto-Triage All {parsedRows.length} Records with AI</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Post-Import Success Summary Card */}
      {importedSummary && (
        <div className="bg-white rounded-2xl p-6 border-2 border-emerald-500/40 shadow-xl space-y-5 animate-scaleUp">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded uppercase tracking-wider">
                Ingestion Completed
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                Successfully Ingested {importedSummary.total} Complaints into Command Center
              </h3>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Total Ingested</span>
              <span className="text-2xl font-bold text-slate-900 block mt-0.5">
                {importedSummary.total}
              </span>
              <span className="text-[11px] text-slate-500">Active in hospital queue</span>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-[11px] font-bold text-rose-700 uppercase flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                Level 4 Critical
              </span>
              <span className="text-2xl font-bold text-rose-800 block mt-0.5">
                {importedSummary.critical}
              </span>
              <span className="text-[11px] text-rose-600">&lt; 2h SLA containment</span>
            </div>

            <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200">
              <span className="text-[11px] font-bold text-orange-700 uppercase flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                Level 3 High
              </span>
              <span className="text-2xl font-bold text-orange-800 block mt-0.5">
                {importedSummary.high}
              </span>
              <span className="text-[11px] text-orange-600">Clinical & medication risks</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleReset}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Upload Another Data Source</span>
            </button>

            <button
              onClick={onNavigateToQueue}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <span>Explore Ingested Grievances in Queue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
