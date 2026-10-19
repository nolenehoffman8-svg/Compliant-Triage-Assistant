import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileCode,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  ArrowRight,
  Database,
  RefreshCw,
  Eye,
  Check,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { ComplaintRecord, ComplaintSource } from '../types/triage';

interface UploadComplaintsDataSourceProps {
  onBatchImport: (newComplaints: ComplaintRecord[]) => void;
  onNavigateToQueue: () => void;
  onNavigateToDashboard: () => void;
}

interface RawParsedItem {
  id: number;
  text: string;
  source: string;
  departmentOrUnit: string;
  patientIdentifier: string;
  patientName?: string;
  incidentDate?: string;
  isValid: boolean;
  validationError?: string;
}

const SAMPLE_CSV_CONTENT = `complaint_text,department_unit,source_channel,patient_id,incident_date
"My 82-year-old mother was given another patient's blood pressure medication (Lisinopril 40mg instead of Amlodipine 5mg). Her blood pressure dropped dangerously low to 78/45 and she required ICU transfer. The floor nurse had bypassed the barcode medication scanner.","Floor 6 Telemetry Unit","Written Grievance","PT-1204","2026-10-18"
"The radiation therapy scheduling team cancelled my appointment 3 times this month without notice. My chemotherapy and radiation must be coordinated, and this disruption is endangering my oncologic protocol. Staff said their booking system is overloaded.","Radiation Oncology","Patient Portal Message","PT-5421","2026-10-17"
"When checking in at the outpatient surgical reception, the clerk loudly broadcast my HIV status and full home address to everyone in the packed waiting room while verifying insurance. I was completely humiliated and this is a blatant privacy breach.","Outpatient Surgery Admissions","Verbal / In-Person Feedback","PT-9932","2026-10-18"
"I received a bill for $3,400 for emergency room facility fees when I was in the waiting room for 6 hours and left before ever being seen by a provider. Billing collections is threatening my credit score.","Patient Financial Services","Written Grievance","PT-4402","2026-10-16"
"The clinic entrance automatic door sensor is broken, forcing patients in wheelchairs to wait outside in the rain until someone pushes the heavy doors. When asked, security said the work order was submitted 2 months ago.","Main Clinic Entrance / Facilities","CAHPS / Survey Comment","PT-7711","2026-10-15"
"The receptionist at the cardiology front desk was extremely polite, but the clinic waiting room was cold and the water cooler was empty for 4 hours.","Cardiology Ambulatory Clinic","CAHPS / Survey Comment","PT-3099","2026-10-17"`;

const SAMPLE_PREPACKAGED_ITEMS = [
  {
    text: "My 82-year-old mother was given another patient's blood pressure medication (Lisinopril 40mg instead of Amlodipine 5mg). Her blood pressure dropped dangerously low to 78/45 and she required ICU transfer. The floor nurse had bypassed the barcode medication scanner.",
    departmentOrUnit: 'Floor 6 Telemetry Unit',
    source: 'Written Grievance',
    patientIdentifier: 'PT-1204',
    incidentDate: '2026-10-18',
  },
  {
    text: 'The radiation therapy scheduling team cancelled my appointment 3 times this month without notice. My chemotherapy and radiation must be coordinated, and this disruption is endangering my oncologic protocol. Staff said their booking system is overloaded.',
    departmentOrUnit: 'Radiation Oncology',
    source: 'Patient Portal Message',
    patientIdentifier: 'PT-5421',
    incidentDate: '2026-10-17',
  },
  {
    text: 'When checking in at the outpatient surgical reception, the clerk loudly broadcast my HIV status and full home address to everyone in the packed waiting room while verifying insurance. I was completely humiliated and this is a blatant privacy breach.',
    departmentOrUnit: 'Outpatient Surgery Admissions',
    source: 'Verbal / In-Person Feedback',
    patientIdentifier: 'PT-9932',
    incidentDate: '2026-10-18',
  },
  {
    text: 'I received a bill for $3,400 for emergency room facility fees when I was in the waiting room for 6 hours and left before ever being seen by a provider. Billing collections is threatening my credit score.',
    departmentOrUnit: 'Patient Financial Services',
    source: 'Written Grievance',
    patientIdentifier: 'PT-4402',
    incidentDate: '2026-10-16',
  },
  {
    text: 'The clinic entrance automatic door sensor is broken, forcing patients in wheelchairs to wait outside in the rain until someone pushes the heavy doors. When asked, security said the work order was submitted 2 months ago.',
    departmentOrUnit: 'Main Clinic Entrance / Facilities',
    source: 'CAHPS / Survey Comment',
    patientIdentifier: 'PT-7711',
    incidentDate: '2026-10-15',
  },
  {
    text: 'The receptionist at the cardiology front desk was extremely polite, but the clinic waiting room was cold and the water cooler was empty for 4 hours.',
    departmentOrUnit: 'Cardiology Ambulatory Clinic',
    source: 'CAHPS / Survey Comment',
    patientIdentifier: 'PT-3099',
    incidentDate: '2026-10-17',
  },
];

export const UploadComplaintsDataSource: React.FC<UploadComplaintsDataSourceProps> = ({
  onBatchImport,
  onNavigateToQueue,
  onNavigateToDashboard,
}) => {
  const [activeMode, setActiveMode] = useState<'file' | 'paste'>('file');
  const [pasteContent, setPasteContent] = useState('');
  const [fileSelectedName, setFileSelectedName] = useState<string | null>(null);
  const [defaultSource, setDefaultSource] = useState<ComplaintSource>('Patient Portal Message');
  const [defaultUnit, setDefaultUnit] = useState('Ambulatory Care Network');
  const [isDragOver, setIsDragOver] = useState(false);
  const [parsedRows, setParsedRows] = useState<RawParsedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<{
    totalImported: number;
    criticalCount: number;
    highCount: number;
    moderateCount: number;
    lowCount: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to parse CSV text into items
  const parseCSV = (csvText: string): RawParsedItem[] => {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length === 0) return [];

    // Parse header
    const headers = lines[0].split(',').map((h) => h.replace(/["']/g, '').trim().toLowerCase());
    const textIdx = headers.findIndex((h) =>
      h.includes('complaint') || h.includes('text') || h.includes('narrative') || h.includes('comment') || h.includes('feedback')
    );
    const unitIdx = headers.findIndex((h) =>
      h.includes('unit') || h.includes('department') || h.includes('clinic') || h.includes('dept')
    );
    const sourceIdx = headers.findIndex((h) =>
      h.includes('source') || h.includes('channel') || h.includes('type')
    );
    const patientIdx = headers.findIndex((h) =>
      h.includes('patient') || h.includes('id') || h.includes('mrn') || h.includes('tracking')
    );
    const dateIdx = headers.findIndex((h) =>
      h.includes('date') || h.includes('time') || h.includes('received')
    );

    const items: RawParsedItem[] = [];

    // Regex for CSV split handling quotes
    const csvSplitRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(csvSplitRegex).map((c) => {
        let val = c.trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1).replace(/""/g, '"');
        }
        return val;
      });

      const text = textIdx !== -1 && cols[textIdx] ? cols[textIdx] : cols[0] || '';
      const unit = unitIdx !== -1 && cols[unitIdx] ? cols[unitIdx] : defaultUnit;
      const src = sourceIdx !== -1 && cols[sourceIdx] ? cols[sourceIdx] : defaultSource;
      const pid = patientIdx !== -1 && cols[patientIdx] ? cols[patientIdx] : `PT-${Math.floor(1000 + Math.random() * 9000)}`;
      const dt = dateIdx !== -1 && cols[dateIdx] ? cols[dateIdx] : new Date().toISOString().split('T')[0];

      const isValid = text.length > 5;

      items.push({
        id: i,
        text,
        departmentOrUnit: unit,
        source: src,
        patientIdentifier: pid,
        incidentDate: dt,
        isValid,
        validationError: isValid ? undefined : 'Complaint text is empty or too short (under 5 characters).',
      });
    }

    return items;
  };

  // Helper to parse JSON text
  const parseJSON = (jsonText: string): RawParsedItem[] => {
    try {
      const data = JSON.parse(jsonText);
      const arr = Array.isArray(data) ? data : [data];

      return arr.map((item: any, idx: number) => {
        const text = item.text || item.complaintText || item.complaint_text || item.narrative || item.comment || '';
        const unit = item.departmentOrUnit || item.unit || item.department || defaultUnit;
        const src = item.source || item.source_channel || defaultSource;
        const pid = item.patientIdentifier || item.patientId || item.patient_id || `PT-${Math.floor(1000 + Math.random() * 9000)}`;
        const dt = item.incidentDate || item.date || new Date().toISOString().split('T')[0];

        const isValid = typeof text === 'string' && text.trim().length > 5;

        return {
          id: idx + 1,
          text: String(text).trim(),
          departmentOrUnit: unit,
          source: src,
          patientIdentifier: pid,
          incidentDate: dt,
          isValid,
          validationError: isValid ? undefined : 'Missing valid complaint narrative string.',
        };
      });
    } catch (e: any) {
      throw new Error(`Invalid JSON syntax: ${e.message}`);
    }
  };

  // Process selected file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    setFileSelectedName(file.name);
    setErrorMsg(null);
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) {
        setErrorMsg('Uploaded file appears to be empty.');
        return;
      }

      try {
        let items: RawParsedItem[] = [];
        if (file.name.endsWith('.json')) {
          items = parseJSON(content);
        } else {
          // Default CSV / TSV
          items = parseCSV(content);
        }

        if (items.length === 0) {
          setErrorMsg('No complaint rows found in file.');
        } else {
          setParsedRows(items);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Error parsing file format.');
        setParsedRows([]);
      }
    };

    reader.onerror = () => {
      setErrorMsg('Failed to read file from disk.');
    };

    reader.readAsText(file);
  };

  // Process text pasted
  const handleProcessPastedText = () => {
    if (!pasteContent.trim()) {
      setErrorMsg('Please paste CSV or JSON content first.');
      return;
    }

    setErrorMsg(null);
    setImportSummary(null);

    try {
      let items: RawParsedItem[] = [];
      const trimmed = pasteContent.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        items = parseJSON(trimmed);
      } else {
        items = parseCSV(trimmed);
      }

      if (items.length === 0) {
        setErrorMsg('No valid complaint records found in pasted text.');
      } else {
        setParsedRows(items);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error parsing pasted text.');
      setParsedRows([]);
    }
  };

  // Load sample dataset
  const handleLoadSampleDataset = () => {
    setFileSelectedName('ambulatory_network_grievances_sample.csv');
    setErrorMsg(null);
    setImportSummary(null);
    const sampleItems: RawParsedItem[] = SAMPLE_PREPACKAGED_ITEMS.map((item, idx) => ({
      id: idx + 1,
      text: item.text,
      departmentOrUnit: item.departmentOrUnit,
      source: item.source,
      patientIdentifier: item.patientIdentifier,
      incidentDate: item.incidentDate,
      isValid: true,
    }));
    setParsedRows(sampleItems);
  };

  // Download sample CSV
  const handleDownloadSampleCSV = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'healthcare_complaints_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download sample JSON
  const handleDownloadSampleJSON = () => {
    const jsonStr = JSON.stringify(SAMPLE_PREPACKAGED_ITEMS, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'healthcare_complaints_template.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Execute Batch Triage
  const handleExecuteBatchTriage = async () => {
    const validItems = parsedRows.filter((r) => r.isValid);
    if (validItems.length === 0) {
      setErrorMsg('No valid rows available to triage.');
      return;
    }

    setIsProcessing(true);
    setProgressPercent(15);
    setErrorMsg(null);

    try {
      // Send items to server batch triage endpoint
      const response = await fetch('/api/batch-triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: validItems }),
      });

      setProgressPercent(70);

      const data = await response.json();
      if (!data.success || !data.complaints) {
        throw new Error(data.error || 'Server failed to process batch complaints.');
      }

      setProgressPercent(100);

      const triagedList: ComplaintRecord[] = data.complaints;

      // Calculate summary
      const criticalCount = triagedList.filter((c) => c.triage.severityLevel === 4).length;
      const highCount = triagedList.filter((c) => c.triage.severityLevel === 3).length;
      const moderateCount = triagedList.filter((c) => c.triage.severityLevel === 2).length;
      const lowCount = triagedList.filter((c) => c.triage.severityLevel === 1).length;

      setImportSummary({
        totalImported: triagedList.length,
        criticalCount,
        highCount,
        moderateCount,
        lowCount,
      });

      // Pass new records to application state
      onBatchImport(triagedList);
    } catch (err: any) {
      console.error('Batch import error:', err);
      setErrorMsg(err.message || 'Network error executing batch triage.');
    } finally {
      setIsProcessing(false);
    }
  };

  const validRowCount = parsedRows.filter((r) => r.isValid).length;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                Data Source Ingestion Engine
              </span>
              <span className="text-xs text-slate-500 font-mono">
                CSV &middot; TSV &middot; JSON &middot; EHR Grievance Exports
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Upload Complaints Data Source
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Import bulk patient complaints, patient portal archives, survey exports (CAHPS / Press Ganey),
              or risk incident logs for automated clinical triage and escalation mapping.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadSampleCSV}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center space-x-1.5"
              title="Download standardized CSV file structure"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>CSV Template</span>
            </button>

            <button
              onClick={handleDownloadSampleJSON}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center space-x-1.5"
              title="Download standardized JSON file structure"
            >
              <FileCode className="w-3.5 h-3.5 text-slate-600" />
              <span>JSON Template</span>
            </button>

            <button
              onClick={handleLoadSampleDataset}
              className="px-3.5 py-2 text-xs font-bold text-teal-800 bg-teal-100/80 hover:bg-teal-200 rounded-xl transition-colors flex items-center space-x-1.5 border border-teal-300"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>Load 6 Realistic Sample Cases</span>
            </button>
          </div>
        </div>

        {/* Input Format Mode Selector */}
        <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-slate-100 text-xs font-semibold">
          <button
            onClick={() => setActiveMode('file')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              activeMode === 'file'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload File (CSV, TSV, JSON)</span>
          </button>

          <button
            onClick={() => setActiveMode('paste')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              activeMode === 'paste'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Direct Text / Raw Data Paste</span>
          </button>
        </div>

        {/* File Drag & Drop Zone */}
        {activeMode === 'file' && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) processFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-4 p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
              isDragOver
                ? 'border-teal-500 bg-teal-50/70'
                : 'border-slate-300 bg-slate-50/60 hover:bg-slate-100/70 hover:border-teal-400'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.tsv,.json,.txt"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              {fileSelectedName ? fileSelectedName : 'Click to select or drag and drop your data file here'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Accepts CSV with column headers (complaint_text, department_unit, source_channel, patient_id) or JSON array of grievance records.
            </p>
            <span className="inline-block mt-3 px-3 py-1 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs">
              Browse Local Files (.csv, .json, .tsv)
            </span>
          </div>
        )}

        {/* Direct Text Paste Area */}
        {activeMode === 'paste' && (
          <div className="mt-4 space-y-3">
            <textarea
              rows={6}
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              placeholder={`Paste raw CSV with header or JSON array. Example:
complaint_text,department_unit,patient_id
"Medication dosage error in pediatric ward...",Pediatric Floor 4,PT-1092
"Wait time exceeded 6 hours in urgent care...",Urgent Care Clinic,PT-8812`}
              className="w-full text-xs font-mono rounded-xl border border-slate-300 p-3 bg-white text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleProcessPastedText}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center space-x-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Parse Pasted Content</span>
              </button>
            </div>
          </div>
        )}

        {/* Fallback Defaults Configuration */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Default Channel / Feedback Source (if column missing):
            </label>
            <select
              value={defaultSource}
              onChange={(e) => setDefaultSource(e.target.value as ComplaintSource)}
              className="w-full rounded-lg border border-slate-300 p-2 bg-white text-slate-800"
            >
              <option value="Patient Portal Message">Patient Portal Message</option>
              <option value="Written Grievance">Written Grievance</option>
              <option value="CAHPS / Survey Comment">CAHPS / Survey Comment</option>
              <option value="Verbal / In-Person Feedback">Verbal / In-Person Feedback</option>
              <option value="Online Review / Social">Online Review / Social</option>
              <option value="Regulatory Agency / Ombudsman">Regulatory Agency / Ombudsman</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Default Hospital Department (if column missing):
            </label>
            <input
              type="text"
              value={defaultUnit}
              onChange={(e) => setDefaultUnit(e.target.value)}
              placeholder="e.g. Ambulatory Care Network"
              className="w-full rounded-lg border border-slate-300 p-2 bg-white text-slate-800"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Import Success Summary Card */}
      {importSummary && (
        <div className="bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-400 shadow-md animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-950">
                  Successfully Triaged & Ingested {importSummary.totalImported} Grievances!
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Records have been classified into categories, scored for severity (Levels 1–4), risk-screened, and added to the live queue.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={onNavigateToQueue}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
              >
                <span>View in Grievance Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onNavigateToDashboard}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs rounded-xl border border-slate-300 transition-colors"
              >
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-emerald-200 text-xs">
            <div className="p-2.5 bg-white rounded-lg border border-emerald-200">
              <span className="text-[11px] font-bold text-rose-700 block">Level 4 Critical</span>
              <strong className="text-lg text-rose-900">{importSummary.criticalCount} cases</strong>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-emerald-200">
              <span className="text-[11px] font-bold text-orange-700 block">Level 3 High</span>
              <strong className="text-lg text-orange-900">{importSummary.highCount} cases</strong>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-emerald-200">
              <span className="text-[11px] font-bold text-amber-700 block">Level 2 Moderate</span>
              <strong className="text-lg text-amber-900">{importSummary.moderateCount} cases</strong>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-emerald-200">
              <span className="text-[11px] font-bold text-emerald-700 block">Level 1 Low</span>
              <strong className="text-lg text-emerald-900">{importSummary.lowCount} cases</strong>
            </div>
          </div>
        </div>
      )}

      {/* Parsed Records Table Preview & Batch Action */}
      {parsedRows.length > 0 && !importSummary && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  Data Preview
                </span>
                <span className="text-xs font-semibold text-teal-700">
                  {validRowCount} valid records ready for clinical triage
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Ingestion Verification & Field Preview
              </h3>
            </div>

            <button
              onClick={handleExecuteBatchTriage}
              disabled={isProcessing || validRowCount === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Triaging Batch ({progressPercent}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Batch Clinical Triage ({validRowCount} Cases)</span>
                </>
              )}
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3 py-2.5 text-left">#</th>
                  <th className="px-3 py-2.5 text-left">Record ID</th>
                  <th className="px-3 py-2.5 text-left">Department / Unit</th>
                  <th className="px-3 py-2.5 text-left">Feedback Channel</th>
                  <th className="px-4 py-2.5 text-left">Complaint Narrative Text</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {parsedRows.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      !row.isValid ? 'bg-rose-50/50' : ''
                    }`}
                  >
                    <td className="px-3 py-2.5 font-mono text-slate-400">{row.id}</td>
                    <td className="px-3 py-2.5 font-bold text-slate-800">{row.patientIdentifier}</td>
                    <td className="px-3 py-2.5 text-slate-600">{row.departmentOrUnit}</td>
                    <td className="px-3 py-2.5 text-slate-500">{row.source}</td>
                    <td className="px-4 py-2.5 text-slate-800 max-w-md">
                      <p className="line-clamp-2 leading-relaxed">{row.text}</p>
                      {row.validationError && (
                        <span className="text-[10px] text-rose-600 font-bold block mt-0.5">
                          {row.validationError}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {row.isValid ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3 mr-1 text-emerald-600" />
                          Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          Invalid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
