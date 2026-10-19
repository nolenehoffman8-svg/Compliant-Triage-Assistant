import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// Shared Gemini client setup following guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Comprehensive Healthcare Complaint Triage Rule Fallback Engine
function fallbackTriage(rawText: string): any {
  const text = rawText.toLowerCase();

  // Clinical & Safety Signals
  const isMedication = /medication|dosage|wrong dose|allergic|overdose|prescription|pill|drug reaction|anaphylaxis|morphine|insulin/i.test(text);
  const isImmediateHarm = /died|death|critical|stroke|cardiac arrest|seizure|bleeding uncontrollably|paralyzed|unresponsive|ventilator|icu|code blue|emergency/i.test(text);
  const isDiscrimination = /racist|racism|racial|discriminated|bias|lgbtq|trans|spanish|language|interpreter refused|asl|deaf|handicap|wheelchair denied|disability/i.test(text);
  const isPrivacy = /hipaa|privacy|records exposed|confidentiality|wrong patient record|faxed to stranger|unauthorized access|medical records released/i.test(text);
  const isBilling = /bill|invoice|charge|overcharge|insurance denied|copay|financial counselor|collections|surprise bill|12,000|\$|out of network/i.test(text);
  const isTech = /portal|mychart|login|app crashed|password reset|website down|telehealth disconnected|video link failed/i.test(text);
  const isWait = /waited 4 hours|wait time|sitting in waiting room|delayed 3 hours|emergency wait|waiting for doctor/i.test(text);
  const isScheduling = /cancel appointment|reschedule|no appointments available|months to see|booking error|clinic closed/i.test(text);
  const isConduct = /rude|yelled|dismissive|condescending|ignored me|attitude|hostile|unprofessional|snapped|refused to listen/i.test(text);

  let primaryCategory = 'Communication';
  const secondaryCategories: string[] = [];

  if (isImmediateHarm || (isMedication && /wrong|severe|harm/i.test(text))) {
    primaryCategory = 'Patient Safety';
  } else if (isPrivacy) {
    primaryCategory = 'Privacy or Security';
  } else if (isMedication || /surgery|infection|biopsy|diagnosis|treatment|misdiagnos|doctor missed/i.test(text)) {
    primaryCategory = 'Clinical Care';
  } else if (isBilling) {
    primaryCategory = 'Billing';
  } else if (isTech) {
    primaryCategory = 'Technology / Patient Portal';
  } else if (isWait) {
    primaryCategory = 'Wait Time';
  } else if (isScheduling) {
    primaryCategory = 'Scheduling';
  } else if (isConduct) {
    primaryCategory = 'Staff Conduct';
  }

  // Populate secondary
  if (isConduct && primaryCategory !== 'Staff Conduct') secondaryCategories.push('Staff Conduct');
  if (isCommunication(text) && primaryCategory !== 'Communication') secondaryCategories.push('Communication');
  if (isWait && primaryCategory !== 'Wait Time') secondaryCategories.push('Wait Time');
  if (isScheduling && primaryCategory !== 'Scheduling') secondaryCategories.push('Scheduling');

  // Severity Level
  let severityLevel = 2;
  let severityLabel = 'Level 2 – Moderate';
  let severityReasoning = 'Repeated service failures or significant patient frustration noted.';

  if (isImmediateHarm || (isMedication && /wrong|harm|reaction/i.test(text)) || isDiscrimination || (isPrivacy && /mass|unauthorized/i.test(text))) {
    severityLevel = 4;
    severityLabel = 'Level 4 – Critical';
    severityReasoning = isImmediateHarm
      ? 'Immediate patient safety risk or life-threatening clinical event reported requiring emergency clinical escalation.'
      : isDiscrimination
      ? 'Formal discrimination / equity allegation with serious regulatory compliance and civil rights liability exposure.'
      : 'Severe medication adverse event or gross privacy breach identified with acute risk exposure.';
  } else if (isMedication || /biopsy|delayed diagnosis|wound infection|post-op complication|fall|sepsis/i.test(text) || isPrivacy) {
    severityLevel = 3;
    severityLabel = 'Level 3 – High';
    severityReasoning = 'Potential patient harm, medication-related concern, or heightened clinical accessibility breakdown identified.';
  } else if (/parking|vending|cafeteria|room cold|routine suggestion|minor wait|greeting/i.test(text)) {
    severityLevel = 1;
    severityLabel = 'Level 1 – Low';
    severityReasoning = 'Minor operational inconvenience or general routine feedback without clinical harm or safety risks.';
  }

  // Risks
  const identifiedRisks: Array<{ risk: string; explanation: string }> = [];
  if (severityLevel >= 3 || isImmediateHarm || isMedication) {
    identifiedRisks.push({
      risk: 'Patient Safety Risk',
      explanation: 'Report indicates clinical vulnerability, potential adverse drug event, or compromised patient well-being.',
    });
    identifiedRisks.push({
      risk: 'Clinical Risk',
      explanation: 'Care delivery, diagnosis timeliness, or treatment protocol execution questioned by patient or surrogate.',
    });
  }
  if (isPrivacy) {
    identifiedRisks.push({
      risk: 'Privacy Risk',
      explanation: 'Potential violation of HIPAA Privacy Rule or unauthorized disclosure of protected health information (PHI).',
    });
    identifiedRisks.push({
      risk: 'Compliance Risk',
      explanation: 'Statutory HIPAA notification deadlines and state health information privacy regulations apply.',
    });
  }
  if (isDiscrimination) {
    identifiedRisks.push({
      risk: 'Equity Risk',
      explanation: 'Allegation of disparate treatment or civil rights violation (ACA Section 1557 / Title VI).',
    });
    identifiedRisks.push({
      risk: 'Compliance Risk',
      explanation: 'Mandatory civil rights review and regulatory compliance notification requirements.',
    });
  }
  if (isBilling) {
    identifiedRisks.push({
      risk: 'Operational Risk',
      explanation: 'Revenue cycle billing discrepancy, potential surprise balance billing, or dispute over covered services.',
    });
  }
  if (text.includes('asl') || text.includes('interpreter') || text.includes('wheelchair') || text.includes('ramp')) {
    identifiedRisks.push({
      risk: 'Accessibility Risk',
      explanation: 'Physical or auxiliary aid access barrier potentially infringing Americans with Disabilities Act (ADA) requirements.',
    });
  }
  if (severityLevel >= 3 || text.includes('attorney') || text.includes('lawyer') || text.includes('news') || text.includes('media') || text.includes('review')) {
    identifiedRisks.push({
      risk: 'Reputational Risk',
      explanation: 'Potential external escalation to regulatory bodies (CMS, Joint Commission, State Health Dept) or public media.',
    });
  }
  if (identifiedRisks.length === 0) {
    identifiedRisks.push({
      risk: 'Operational Risk',
      explanation: 'Day-to-day clinic workflow, patient throughput, or administrative touchpoint friction.',
    });
  }

  // Escalation Routing
  let escalationRoute = 'Patient Experience Team';
  let escalationRationale = 'Standard grievance triage and customer experience resolution protocol.';
  let slaTargetHours = 72;
  let slaTargetDescription = '3 business days standard review';

  if (severityLevel === 4) {
    if (isDiscrimination || isPrivacy) {
      escalationRoute = isPrivacy ? 'Compliance Office' : 'Risk Management';
      escalationRationale = 'Urgent institutional review needed due to legal liability and regulatory notification mandates.';
    } else {
      escalationRoute = 'Risk Management';
      escalationRationale = 'Critical safety or acute clinical incident requiring immediate sentinel event evaluation and executive alert.';
    }
    slaTargetHours = 2;
    slaTargetDescription = 'Immediate clinical/legal containment within 2 hours; written CMS grievance response initiated';
  } else if (severityLevel === 3) {
    if (isMedication || primaryCategory === 'Clinical Care') {
      escalationRoute = 'Physician Leadership';
      escalationRationale = 'Requires attending physician or medical director peer-review of clinical decision making.';
    } else if (primaryCategory === 'Staff Conduct') {
      escalationRoute = 'Nursing Leadership';
      escalationRationale = 'Staff supervision, clinical bedside manner, and nursing leadership accountability review.';
    } else if (text.includes('wheelchair') || text.includes('asl') || text.includes('interpreter')) {
      escalationRoute = 'Accessibility Coordinator';
      escalationRationale = 'Coordination of auxiliary aids and immediate remediation of disability accommodation.';
    } else {
      escalationRoute = 'Quality Improvement Team';
      escalationRationale = 'Systemic process improvement and clinical root cause tracking.';
    }
    slaTargetHours = 24;
    slaTargetDescription = 'Urgent turnaround within 24-48 hours';
  } else if (primaryCategory === 'Billing') {
    escalationRoute = 'Revenue Cycle / Billing';
    escalationRationale = 'Audit billing ledger, re-verify claim codes, and contact patient financial counselor.';
    slaTargetHours = 96;
    slaTargetDescription = '4-5 business days financial audit';
  } else if (primaryCategory === 'Technology / Patient Portal') {
    escalationRoute = 'Information Technology';
    escalationRationale = 'Technical troubleshooting of patient portal credentials, API sync, or telehealth audio-video bridge.';
    slaTargetHours = 48;
    slaTargetDescription = '48 hours technical ticket';
  } else if (severityLevel === 1) {
    escalationRoute = 'Patient Experience Team';
    slaTargetHours = 168;
    slaTargetDescription = '7-14 days routine feedback loop';
  }

  const humanIntervention = {
    required: severityLevel >= 3 || isDiscrimination || isPrivacy,
    urgency: severityLevel === 4 ? 'Immediate Mandate' : severityLevel === 3 ? 'Prompt' : 'Routine',
    roles: severityLevel === 4 
      ? ['Risk Manager', 'Chief Medical Officer', 'Legal Counsel']
      : severityLevel === 3
      ? ['Department Nurse Manager', 'Clinical Quality Specialist', 'Patient Advocate']
      : ['Patient Experience Specialist'],
    rationale: severityLevel >= 3 
      ? 'High severity and regulatory liabilities forbid automated closure; requires licensed professional peer review.'
      : 'Standard communication template may be drafted but requires routine staff verification before patient outreach.',
  };

  const whatHappened = rawText.length > 180 ? rawText.substring(0, 180) + '...' : rawText;

  return {
    whatHappened,
    timelineOrFacts: [
      'Patient or representative submitted complaint via institutional channel.',
      `Incident involves ${primaryCategory.toLowerCase()} issues impacting patient perception of care.`,
      `Severity assessed as ${severityLabel} based on risk screening.`,
    ],
    primaryCategory,
    secondaryCategories,
    severityLevel,
    severityLabel,
    severityReasoning,
    identifiedRisks,
    escalationRoute,
    escalationRationale,
    slaTargetHours,
    slaTargetDescription,
    humanIntervention,
    recommendedActions: [
      `Dispatch formal notification to ${escalationRoute}.`,
      'Log into hospital risk & patient safety grievance tracking repository.',
      severityLevel >= 3 ? 'Initiate chart review and preserve electronic health record audit log.' : 'Send acknowledgment letter/portal response to patient within statutory SLA.',
    ],
    regulatoryNotes: severityLevel >= 3 
      ? 'CMS Condition of Participation 42 CFR § 482.13(a)(2): Hospital must provide formal written response with findings.' 
      : 'Standard Joint Commission patient rights communication standard.',
  };
}

function isCommunication(text: string): boolean {
  return /rude|condescending|did not explain|no one told me|yelled|unfriendly|attitude/i.test(text);
}

// POST /api/triage - Healthcare Triage with Gemini 3.8 Flash
app.post('/api/triage', async (req: Request, res: Response) => {
  const { text, source, departmentOrUnit, patientIdentifier } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Complaint text is required.' });
  }

  // Attempt Gemini AI structured triage
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are a clinical Healthcare Complaint Triage Assistant for an accredited health system.
Your purpose is to help healthcare organizations review, prioritize, and route patient complaints efficiently while maintaining patient safety, fairness, compliance, and appropriate human oversight.
You will receive patient complaints, patient portal messages, survey comments, grievance reports, online reviews, or feedback submissions.

Your role is NOT to resolve complaints. Your role is to triage complaints and determine:
* What happened (concise summary and key facts/timeline)
* How serious it is (Severity Assessment: Level 1 Low, Level 2 Moderate, Level 3 High, Level 4 Critical with detailed reasoning)
* Who should review it (Escalation route to designated department)
* How quickly it should be addressed (SLA Target in hours and description)
* Whether human intervention is required (Human oversight mandates, roles, and rationale)

Please follow these exact clinical triage rules:

STEP 1: Complaint Category
Classify into ONE primary category from:
- Communication
- Scheduling
- Wait Time
- Technology / Patient Portal
- Billing
- Clinical Care
- Patient Safety
- Privacy or Security
- Staff Conduct
- Other
Identify any secondary categories present.

STEP 2: Severity Assessment
Assign a severity level:
- LEVEL 1 – Low (Minor inconvenience, Routine dissatisfaction, General suggestion)
- LEVEL 2 – Moderate (Repeated service failures, Significant frustration, Communication breakdown)
- LEVEL 3 – High (Potential patient harm, Medication-related concern, Serious accessibility issue, Escalated complaint)
- LEVEL 4 – Critical (Immediate patient safety risk, Potential legal exposure, Serious privacy violation, Discrimination allegation)
Provide clear, objective clinical/administrative reasoning.

STEP 5: Risk Detection
Identify applicable risks from:
- Patient Safety Risk
- Clinical Risk
- Compliance Risk
- Privacy Risk
- Accessibility Risk
- Equity Risk
- Reputational Risk
- Operational Risk
For EACH flagged risk, provide a precise 1-2 sentence explanation of why it was flagged.

STEP 6: Escalation Recommendation
Recommend ONE primary department to ROUTE TO from:
- Patient Experience Team
- Nursing Leadership
- Physician Leadership
- Quality Improvement Team
- Compliance Office
- Information Technology
- Revenue Cycle / Billing
- Accessibility Coordinator
- Risk Management
- Executive Review
Provide escalation rationale, SLA hours (e.g., Level 4: 2 hours, Level 3: 24 hours, Level 2: 72 hours, Level 1: 168 hours), and human intervention requirements.

Complaint to Triage:
"""${text}"""
Source: ${source || 'Patient Portal Message'}
Department/Unit: ${departmentOrUnit || 'Unspecified Clinic'}
Patient ID: ${patientIdentifier || 'Anonymous'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an authoritative, objective hospital complaint triage specialist. Output ONLY valid JSON conforming to the requested schema. Do not include markdown code block ticks.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              whatHappened: {
                type: Type.STRING,
                description: 'Objective, succinct summary of what occurred without biased speculation.',
              },
              timelineOrFacts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Key facts or chronological milestones extracted from the complaint.',
              },
              primaryCategory: {
                type: Type.STRING,
                description: 'Primary category strictly matching one of the 10 defined categories.',
              },
              secondaryCategories: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Secondary categories matching the 10 defined categories.',
              },
              severityLevel: {
                type: Type.INTEGER,
                description: 'Integer 1, 2, 3, or 4.',
              },
              severityLabel: {
                type: Type.STRING,
                description: 'e.g. Level 1 – Low, Level 2 – Moderate, Level 3 – High, or Level 4 – Critical.',
              },
              severityReasoning: {
                type: Type.STRING,
                description: 'Clinical and operational rationale for why this severity was assigned.',
              },
              identifiedRisks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    risk: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  },
                  required: ['risk', 'explanation'],
                },
                description: 'Risks flagged with explicit explanations.',
              },
              escalationRoute: {
                type: Type.STRING,
                description: 'Target routing department strictly from the allowed 10 departments.',
              },
              escalationRationale: {
                type: Type.STRING,
                description: 'Reason why this department is designated to review this incident.',
              },
              slaTargetHours: {
                type: Type.INTEGER,
                description: 'Hours to complete initial clinical/administrative review.',
              },
              slaTargetDescription: {
                type: Type.STRING,
                description: 'Human-friendly SLA target description, e.g. Immediate 2 hours.',
              },
              humanIntervention: {
                type: Type.OBJECT,
                properties: {
                  required: { type: Type.BOOLEAN },
                  urgency: { type: Type.STRING, description: 'Routine, Prompt, or Immediate Mandate' },
                  roles: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Specific clinical or compliance roles that must review.',
                  },
                  rationale: { type: Type.STRING },
                },
                required: ['required', 'urgency', 'roles', 'rationale'],
              },
              recommendedActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-4 concrete next steps for the triage investigator.',
              },
              regulatoryNotes: {
                type: Type.STRING,
                description: 'CMS, Joint Commission, or HIPAA regulatory guidelines applicable.',
              },
            },
            required: [
              'whatHappened',
              'timelineOrFacts',
              'primaryCategory',
              'secondaryCategories',
              'severityLevel',
              'severityLabel',
              'severityReasoning',
              'identifiedRisks',
              'escalationRoute',
              'escalationRationale',
              'slaTargetHours',
              'slaTargetDescription',
              'humanIntervention',
              'recommendedActions',
            ],
          },
        },
      });

      const responseText = response.text?.trim() || '';
      const parsed = JSON.parse(responseText);
      return res.json({ success: true, triage: parsed, engine: 'gemini-3.8-flash' });
    } catch (aiErr) {
      console.error('Gemini triage execution error, falling back to clinical rules engine:', aiErr);
      const fallback = fallbackTriage(text);
      return res.json({ success: true, triage: fallback, engine: 'clinical-rules-fallback' });
    }
  }

  // Fallback when no API key configured
  const fallback = fallbackTriage(text);
  return res.json({ success: true, triage: fallback, engine: 'clinical-rules-fallback' });
});

// POST /api/batch-triage - Process multiple complaints in batch
app.post('/api/batch-triage', async (req: Request, res: Response) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Valid array of complaint items required.' });
  }

  const processed = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const text = item.text || item.complaintText || item.narrative || '';
    if (!text || typeof text !== 'string' || !text.trim()) continue;

    // Use fast clinical triage engine for batch stability
    const triage = fallbackTriage(text);
    const trackingNumber = item.trackingNumber || `GRV-${Math.floor(10000 + Math.random() * 90000)}`;
    const patientIdentifier = item.patientIdentifier || item.patientId || `PT-${Math.floor(1000 + Math.random() * 9000)}`;
    const source = item.source || 'Imported Batch File';
    const departmentOrUnit = item.departmentOrUnit || item.unit || 'Ambulatory / Hospital General';
    const incidentDate = item.incidentDate || new Date().toISOString();

    processed.push({
      id: `CMP-${Date.now()}-${i}`,
      trackingNumber,
      patientIdentifier,
      patientName: item.patientName || undefined,
      incidentDate,
      receivedDate: new Date().toISOString(),
      source,
      departmentOrUnit,
      rawText: text,
      status: triage.severityLevel === 4 ? 'Clinical Investigation' : 'Triaged',
      triage,
      internalNotes: [
        {
          id: `note-${Date.now()}-${i}`,
          author: 'Data Source Batch Importer',
          timestamp: new Date().toISOString(),
          content: `Imported via bulk data source. Triaged as ${triage.severityLabel} routed to ${triage.escalationRoute}.`,
        },
      ],
    });
  }

  return res.json({
    success: true,
    count: processed.length,
    complaints: processed,
  });
});

// Production / Dev Vite Serving
async function startServer() {
  const port = process.env.PORT || 3000;

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, () => {
    console.log(`Complaint Triage Assistant Server active on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
