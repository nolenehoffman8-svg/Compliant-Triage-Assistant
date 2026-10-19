import { ComplaintRecord } from '../types/triage';

export const INITIAL_COMPLAINTS: ComplaintRecord[] = [
  {
    id: 'CMP-2026-001',
    trackingNumber: 'GRV-98214',
    patientIdentifier: 'PT-4109',
    patientName: 'Elena Rostova (Guardian)',
    incidentDate: '2026-10-18T14:30:00Z',
    receivedDate: '2026-10-18T18:15:00Z',
    source: 'Patient Portal Message',
    departmentOrUnit: 'Pediatric Inpatient Unit (Floor 4)',
    rawText:
      'My 6-year-old daughter was admitted with severe ketoacidosis. The night floor nurse programmed her IV infusion pump and almost administered 10x the prescribed insulin dose (0.5 units/kg instead of 0.05 units/kg). I caught it because the rate on the screen showed 15 mL/hr instead of 1.5 mL/hr. When I questioned her, the nurse became argumentative and told me "I have other sick kids to attend to." Only after I paged the charge nurse did they stop the infusion. This could have killed my daughter.',
    status: 'Clinical Investigation',
    assignedTo: 'Dr. Sarah Vance (Chief Medical Officer)',
    triage: {
      whatHappened:
        'A ten-fold pediatric IV insulin infusion programming error was caught at bedside by the parent. The administering nurse responded dismissively until the charge nurse intervened to halt the infusion.',
      timelineOrFacts: [
        'Pediatric patient with DKA admitted to Floor 4.',
        'IV infusion programmed at 10x prescribed rate (15 mL/hr vs 1.5 mL/hr).',
        'Bedside caregiver alerted staff; administering nurse initially resisted.',
        'Charge nurse intervened and halted infusion prior to catastrophic hypoglycemia.',
      ],
      primaryCategory: 'Patient Safety',
      secondaryCategories: ['Clinical Care', 'Staff Conduct', 'Communication'],
      severityLevel: 4,
      severityLabel: 'Level 4 – Critical',
      severityReasoning:
        'Immediate patient safety risk and near-miss sentinel event involving high-alert medication (insulin) in a pediatric patient with potential for fatal hypoglycemic brain injury.',
      identifiedRisks: [
        {
          risk: 'Patient Safety Risk',
          explanation:
            'Near-miss 10x dosing error involving high-alert IV medication (insulin) in an acute pediatric patient.',
        },
        {
          risk: 'Clinical Risk',
          explanation:
            'Failure of smart infusion pump dose error reduction system (DERS) protocols and independent double-check mandate.',
        },
        {
          risk: 'Reputational Risk',
          explanation:
            'High potential for regulatory reportability (State Department of Health / Joint Commission Sentinel Event) and legal liability.',
        },
      ],
      escalationRoute: 'Risk Management',
      escalationRationale:
        'Requires immediate sentinel event triage, risk containment, preservation of smart pump log telemetry, and executive notification.',
      slaTargetHours: 2,
      slaTargetDescription: 'Immediate containment within 2 hours; CMS 24h notification protocol',
      humanIntervention: {
        required: true,
        urgency: 'Immediate Mandate',
        roles: ['Risk Manager', 'Chief Medical Officer', 'Pediatric Nursing Director', 'Patient Safety Officer'],
        rationale:
          'High-alert medication near-miss under CMS CoP requires immediate bedside chart impoundment, smart pump telemetry extraction, and root-cause analysis (RCA).',
      },
      recommendedActions: [
        'Quarantine and extract audit telemetry from the smart infusion pump.',
        'Conduct immediate peer-review interview with administering RN and charge RN.',
        'Schedule bedside meeting with family by Patient Advocate and CMO within 4 hours.',
        'Initiate Sentinel Event evaluation and convene Pharmacy & Therapeutics review committee.',
      ],
      regulatoryNotes:
        'Joint Commission Sentinel Event Policy; CMS 42 CFR § 482.13(a)(2) grievance notification timelines.',
    },
    internalNotes: [
      {
        id: 'note-1',
        author: 'E. Jackson (Triage Specialist)',
        timestamp: '2026-10-18T18:25:00Z',
        content: 'Flagged as Level 4 Critical. Telemetry impoundment requested from Clinical Engineering.',
      },
    ],
  },
  {
    id: 'CMP-2026-002',
    trackingNumber: 'GRV-98215',
    patientIdentifier: 'PT-8942',
    patientName: 'Marcus T. Bennett',
    incidentDate: '2026-10-17T21:00:00Z',
    receivedDate: '2026-10-18T09:00:00Z',
    source: 'Written Grievance',
    departmentOrUnit: 'Emergency Department',
    rawText:
      'I arrived at the Emergency Department with severe 9/10 lower quadrant abdominal pain and vomiting. The triage nurse assumed I was "drug-seeking" before checking my vitals, openly stating "we do not give out narcotics here" in front of other patients. I was left in the hallway for 7 hours while three Caucasian patients who arrived after me with sprained wrists were escorted into exam rooms. When my appendix ruptured at 3 AM, they finally rushed me to surgery. This is systemic racial discrimination and medical negligence.',
    status: 'Escalated',
    assignedTo: 'Elena Vasquez (Director of Equity & Compliance)',
    triage: {
      whatHappened:
        'Patient presented with acute abdomen symptoms; alleges discriminatory drug-seeking stereotyping by ED triage staff resulting in a 7-hour unmonitored delay culminating in a ruptured appendix and emergency surgery.',
      timelineOrFacts: [
        'Patient presented with 9/10 abdominal pain and vomiting.',
        'Inappropriate verbal accusation of drug-seeking made in earshot of public lobby.',
        'Patient unmonitored in waiting area for 7 hours despite acute surgical abdomen.',
        'Ruptured appendicitis confirmed intraoperatively during 3 AM emergency laparoscopy.',
      ],
      primaryCategory: 'Patient Safety',
      secondaryCategories: ['Staff Conduct', 'Clinical Care', 'Communication'],
      severityLevel: 4,
      severityLabel: 'Level 4 – Critical',
      severityReasoning:
        'Actual physical patient harm (appendix rupture during prolonged triage delay) coupled with severe discrimination allegations under Title VI / Section 1557 and Joint Commission Health Equity standards.',
      identifiedRisks: [
        {
          risk: 'Equity Risk',
          explanation:
            'Allegation of disparate treatment based on race impacting clinical emergency triage and pain management.',
        },
        {
          risk: 'Clinical Risk',
          explanation:
            'Severe diagnostic delay of acute surgical abdomen leading to rupture, peritonitis, and extended morbidity.',
        },
        {
          risk: 'Compliance Risk',
          explanation:
            'Potential violations of EMTALA (failure to provide timely medical screening exam) and ACA Section 1557 nondiscrimination mandates.',
        },
        {
          risk: 'Reputational Risk',
          explanation:
            'High exposure to Office for Civil Rights (OCR) complaints, medical malpractice litigation, and media coverage.',
        },
      ],
      escalationRoute: 'Risk Management',
      escalationRationale:
        'Immediate cross-escalation between Legal/Risk Management, ED Medical Director, and Chief Diversity/Equity Officer due to clinical harm and civil rights exposure.',
      slaTargetHours: 2,
      slaTargetDescription: 'Immediate 2-hour executive notification; written CMS acknowledgment within 24h',
      humanIntervention: {
        required: true,
        urgency: 'Immediate Mandate',
        roles: ['Chief Medical Officer', 'Hospital Legal Counsel', 'Director of Patient Relations', 'ED Medical Director'],
        rationale:
          'Combination of acute surgical harm during triage wait and formal civil rights complaint requires formal legal audit and prompt executive oversight.',
      },
      recommendedActions: [
        'Retrieve electronic health record access logs and ED triage timestamp records.',
        'Review security camera footage and interview triage nursing personnel on duty.',
        'File mandatory notification with Risk Management liability underwriters.',
        'Draft personalized written formal CMS grievance acknowledgment.',
      ],
      regulatoryNotes:
        'EMTALA 42 U.S.C. § 1395dd; ACA Section 1557 (Nondiscrimination); Joint Commission Health Equity Standards.',
    },
  },
  {
    id: 'CMP-2026-003',
    trackingNumber: 'GRV-98216',
    patientIdentifier: 'PT-3281',
    patientName: 'Sophia Lin',
    incidentDate: '2026-10-15T11:00:00Z',
    receivedDate: '2026-10-17T14:20:00Z',
    source: 'Patient Portal Message',
    departmentOrUnit: 'Outpatient Oncology Clinic',
    rawText:
      'I had a core needle biopsy of a suspicious breast mass three weeks ago. I was told results would take 3-5 days. Every time I called, the nurse dismissed me and said "no news is good news, stop calling." Yesterday I finally checked the portal and discovered my biopsy report was signed off 16 days ago showing invasive ductal carcinoma! The oncology referral was never sent. Sixteen days of tumor progression lost because staff failed to review or communicate critical pathology.',
    status: 'Under Review',
    assignedTo: 'Dr. Robert Chen (Oncology Chair)',
    triage: {
      whatHappened:
        'Critical diagnostic pathology indicating invasive malignancy was finalized but left uncommunicated for 16 days due to closed loop failure and dismissive nursing communication.',
      timelineOrFacts: [
        'Core needle biopsy performed three weeks prior.',
        'Pathology finalized 16 days ago confirming invasive ductal carcinoma.',
        'Patient repeatedly contacted clinic but was dismissed by nursing staff without EHR verification.',
        'Subspecialty oncology referral was never triggered.',
      ],
      primaryCategory: 'Clinical Care',
      secondaryCategories: ['Communication', 'Staff Conduct', 'Technology / Patient Portal'],
      severityLevel: 3,
      severityLabel: 'Level 3 – High',
      severityReasoning:
        'Delayed communication of actionable cancer diagnosis with potential adverse impact on oncologic staging, prognosis, and treatment initiation.',
      identifiedRisks: [
        {
          risk: 'Clinical Risk',
          explanation:
            'Critical diagnostic breakdown in test result management causing unacceptable delay in oncology staging and therapeutics.',
        },
        {
          risk: 'Patient Safety Risk',
          explanation:
            'Failure of closed-loop communication system for abnormal ambulatory diagnostic test results.',
        },
        {
          risk: 'Reputational Risk',
          explanation:
            'High liability regarding standard of care for test result tracking and patient notification protocols.',
        },
      ],
      escalationRoute: 'Physician Leadership',
      escalationRationale:
        'Requires immediate intervention by Outpatient Medical Director and Oncology Chair to schedule expedited multidisciplinary staging and patient navigation.',
      slaTargetHours: 24,
      slaTargetDescription: 'Urgent turnaround within 24 hours',
      humanIntervention: {
        required: true,
        urgency: 'Prompt',
        roles: ['Oncology Medical Director', 'Nurse Manager', 'Lead Patient Navigator'],
        rationale:
          'Clinical harm mitigation required: immediate physician-to-patient call, urgent tumor board presentation, and oncology appointment scheduling.',
      },
      recommendedActions: [
        'Direct attending surgical oncologist to contact patient by phone today.',
        'Expedite breast MRI and medical oncology consult within 48 hours.',
        'Audit clinic EMR inbox management and test-result routing workflows.',
        'Conduct remedial coaching with clinic triage nursing staff on test result queries.',
      ],
      regulatoryNotes:
        'Joint Commission National Patient Safety Goal 02.03.01 (Report critical results of tests and diagnostic procedures on a timely basis).',
    },
  },
  {
    id: 'CMP-2026-004',
    trackingNumber: 'GRV-98217',
    patientIdentifier: 'PT-7104',
    patientName: 'David K. Miller',
    incidentDate: '2026-10-16T08:30:00Z',
    receivedDate: '2026-10-17T10:15:00Z',
    source: 'Verbal / In-Person Feedback',
    departmentOrUnit: 'Surgical Day Center',
    rawText:
      'I am profoundly deaf. When I checked in for my outpatient knee arthroscopy, I requested a qualified American Sign Language (ASL) interpreter as documented in my chart weeks in advance. The admissions clerk told me "the video iPad is not working, your wife can just interpret for you." My wife is not a medical interpreter and was distraught. The surgeon spoke to me while looking away, wearing a mask, so I could not lipread. I was forced to sign surgical consent forms without fully understanding the anesthesia risks.',
    status: 'Clinical Investigation',
    assignedTo: 'Rachel Adams (Hospital Accessibility Coordinator)',
    triage: {
      whatHappened:
        'Profoundly deaf patient was denied qualified ASL interpreter services for surgical consent and preoperative briefing; staff inappropriately pressured a family member to interpret.',
      timelineOrFacts: [
        'Advance request for ASL interpreter was documented in chart prior to admission.',
        'Video Remote Interpreting (VRI) device was non-functional; no backup summoned.',
        'Staff improperly relied on non-credentialed family member (spouse).',
        'Informed surgical and anesthesia consent executed without effective communication.',
      ],
      primaryCategory: 'Communication',
      secondaryCategories: ['Clinical Care', 'Staff Conduct', 'Other'],
      severityLevel: 3,
      severityLabel: 'Level 3 – High',
      severityReasoning:
        'Serious statutory accessibility violation directly compromising the legal validity of informed surgical consent and patient safety.',
      identifiedRisks: [
        {
          risk: 'Accessibility Risk',
          explanation:
            'Failure to provide auxiliary aids and qualified language services for effective communication under ADA Title III.',
        },
        {
          risk: 'Compliance Risk',
          explanation:
            'Violation of HHS Section 1557 rules prohibiting reliance on adult family members except in life-threatening emergencies.',
        },
        {
          risk: 'Clinical Risk',
          explanation:
            'Informed consent potentially invalid due to communication barrier during anesthesia and surgical risk disclosure.',
        },
      ],
      escalationRoute: 'Accessibility Coordinator',
      escalationRationale:
        'Mandatory oversight by ADA/Civil Rights Compliance Coordinator to remediate auxiliary aid deficiencies and audit consent validity.',
      slaTargetHours: 24,
      slaTargetDescription: '24-48 hours urgent response and language access corrective action',
      humanIntervention: {
        required: true,
        urgency: 'Prompt',
        roles: ['Hospital Accessibility Coordinator', 'Director of Risk Management', 'Surgical Center Nurse Manager'],
        rationale:
          'Informed consent integrity must be clinically and legally evaluated, with formal staff retraining on language access law.',
      },
      recommendedActions: [
        'Review surgical consent documentation with Hospital Legal / Risk Counsel.',
        'Inspect and re-certify all ambulatory VRI hardware and network connectivity.',
        'Issue formal apology letter from Chief Patient Officer with guaranteed live interpreter for follow-up.',
        'Audit clinic staff compliance with Language Access Plan.',
      ],
      regulatoryNotes:
        'Americans with Disabilities Act (ADA) 28 CFR § 36.303; Affordable Care Act Section 1557 Language Access Mandate.',
    },
  },
  {
    id: 'CMP-2026-005',
    trackingNumber: 'GRV-98218',
    patientIdentifier: 'PT-1940',
    patientName: 'Anonymous Staff Disclosure',
    incidentDate: '2026-10-18T16:00:00Z',
    receivedDate: '2026-10-18T17:45:00Z',
    source: 'Regulatory Agency / Ombudsman',
    departmentOrUnit: 'Health Information Management (HIM)',
    rawText:
      'An external legal vendor called our office reporting that our HIM fax queue mistakenly broadcast an unencrypted batch of 38 behavioral health and HIV lab records to a commercial real estate firm in Chicago. The sender mistyped the speed-dial number. The recipient reported that 60+ pages containing full patient SSNs, diagnoses, and psychiatric consultation notes were sitting on an open office printer for several hours.',
    status: 'Clinical Investigation',
    assignedTo: 'Brian Cole (Chief Privacy & Compliance Officer)',
    triage: {
      whatHappened:
        'Misdirected fax transmission compromised protected health information (PHI) and sensitive psychiatric/HIV lab records for 38 patients to an unauthorized commercial entity.',
      timelineOrFacts: [
        'Batch fax sent with incorrect speed-dial digits.',
        'Included 38 patient files with full names, SSNs, HIV lab results, and psychiatric notes.',
        'Third-party commercial real estate office in Chicago received files on unmonitored printer.',
        'Vendor contacted hospital to report unauthorized receipt.',
      ],
      primaryCategory: 'Privacy or Security',
      secondaryCategories: ['Technology / Patient Portal', 'Other'],
      severityLevel: 4,
      severityLabel: 'Level 4 – Critical',
      severityReasoning:
        'Major HIPAA Privacy & Security breach involving highly sensitive special-category PHI (HIV status and mental health records) impacting 38 individuals with statutory breach notification triggers.',
      identifiedRisks: [
        {
          risk: 'Privacy Risk',
          explanation:
            'Unauthorized disclosure of sensitive protected health information (PHI) including statutory HIV and behavioral health records.',
        },
        {
          risk: 'Compliance Risk',
          explanation:
            'Statutory HIPAA Breach Notification Rule requirements (HHS OCR reporting and mandatory individual breach letters).',
        },
        {
          risk: 'Reputational Risk',
          explanation:
            'Public reporting on HHS OCR Breach Portal ("Wall of Shame") and potential state attorney general enforcement.',
        },
      ],
      escalationRoute: 'Compliance Office',
      escalationRationale:
        'Direct escalation to Chief Privacy Officer for containment, digital destruction verification, and four-factor risk assessment.',
      slaTargetHours: 2,
      slaTargetDescription: 'Immediate containment within 2 hours; statutory 60-day notification timeline clock starts',
      humanIntervention: {
        required: true,
        urgency: 'Immediate Mandate',
        roles: ['Chief Privacy Officer', 'Hospital General Counsel', 'Information Security Officer'],
        rationale:
          'Legal statutory breach determination, execution of affidavit of destruction from recipient, and drafting of regulatory breach notices.',
      },
      recommendedActions: [
        'Secure signed written affidavit of document destruction from the third-party recipient immediately.',
        'Conduct four-factor HIPAA probability of compromise risk assessment.',
        'Disable unverified speed-dial entries across enterprise fax systems.',
        'Prepare individual breach notification letters pursuant to 45 CFR § 164.404.',
      ],
      regulatoryNotes:
        'HIPAA Privacy & Security Rules (45 CFR Part 164); State Medical Privacy Laws; HHS OCR Breach Notification Mandate.',
    },
  },
  {
    id: 'CMP-2026-006',
    trackingNumber: 'GRV-98219',
    patientIdentifier: 'PT-5521',
    patientName: 'Jonathan Hayes',
    incidentDate: '2026-10-10T12:00:00Z',
    receivedDate: '2026-10-16T15:30:00Z',
    source: 'Written Grievance',
    departmentOrUnit: 'Patient Financial Services',
    rawText:
      'I verified in advance that Metro Health Hospital and my attending orthopedic surgeon were 100% in-network for my scheduled knee replacement. Last week I received a surprise bill for $18,450.00 from an out-of-network assistant surgeon and an out-of-network neuromonitoring technician whom I never met, never consented to, and was never informed would be in the room. When I called billing, the representative threatened to send my account to collections if I did not pay within 15 days.',
    status: 'Under Review',
    assignedTo: 'Maria Santos (Revenue Cycle Director)',
    triage: {
      whatHappened:
        'Patient received an unexpected $18,450 out-of-network balance bill for an assistant surgeon and monitoring tech during an in-network scheduled surgery; billing staff aggressively threatened collections.',
      timelineOrFacts: [
        'Patient completed prior authorization and verified in-network hospital & primary surgeon.',
        'Assistant surgeon and neuromonitoring billed balance out-of-network ($18,450).',
        'No prior written No Surprises Act disclosure or consent waiver provided.',
        'Customer service representative inappropriately threatened collection action within 15 days.',
      ],
      primaryCategory: 'Billing',
      secondaryCategories: ['Staff Conduct', 'Communication'],
      severityLevel: 2,
      severityLabel: 'Level 2 – Moderate',
      severityReasoning:
        'Significant financial distress and unfair collection threat, potential violation of federal No Surprises Act balance billing regulations.',
      identifiedRisks: [
        {
          risk: 'Compliance Risk',
          explanation:
            'Potential violation of federal No Surprises Act (NSA) prohibiting balance billing for out-of-network ancillary providers at in-network facilities.',
        },
        {
          risk: 'Operational Risk',
          explanation:
            'Breakdown in billing customer service scripts and premature collections escalation.',
        },
        {
          risk: 'Reputational Risk',
          explanation:
            'Consumer protection complaints to state insurance commissioner or CFPB regarding aggressive debt collection.',
        },
      ],
      escalationRoute: 'Revenue Cycle / Billing',
      escalationRationale:
        'Audit claim coding against No Surprises Act mandates, hold collection activity immediately, and re-adjudicate with payer.',
      slaTargetHours: 72,
      slaTargetDescription: '3-4 business days billing audit & financial counselor review',
      humanIntervention: {
        required: true,
        urgency: 'Prompt',
        roles: ['Revenue Cycle Manager', 'Patient Financial Counselor', 'Compliance Auditor'],
        rationale:
          'Balance billing disputes under NSA require manual claim audit and explicit removal of collection holds.',
      },
      recommendedActions: [
        'Place immediate 60-day billing hold on patient account to freeze collections.',
        'Audit claim against No Surprises Act provider directory and ancillary network contracts.',
        'Instruct contracted anesthesia and neuromonitoring groups to submit for IDR (Independent Dispute Resolution).',
        'Contact patient via telephone with revised in-network cost-share explanation.',
      ],
      regulatoryNotes:
        'Consolidated Appropriations Act of 2021 (No Surprises Act - 45 CFR Part 149); Fair Debt Collection Practices Act (FDCPA).',
    },
  },
  {
    id: 'CMP-2026-007',
    trackingNumber: 'GRV-98220',
    patientIdentifier: 'PT-9033',
    patientName: 'Amina Al-Mansoor',
    incidentDate: '2026-10-15T09:00:00Z',
    receivedDate: '2026-10-16T11:00:00Z',
    source: 'Patient Portal Message',
    departmentOrUnit: 'Health Informatics / IT Support',
    rawText:
      'The patient portal has been rejecting my login for 5 days with an "invalid security token" error. I am an insulin-dependent diabetic and was unable to send my refill request to my endocrinologist. When I called the IT helpdesk, the automated message said "call volume is high" and hung up. I ended up having to ration my insulin for two days and felt dizzy and nauseous.',
    status: 'Under Review',
    assignedTo: 'Kevin Patel (Clinical IT Operations)',
    triage: {
      whatHappened:
        'Persistent 5-day patient portal authentication glitch and unresponsive helpdesk prevented insulin refill, leading the patient to ration insulin with mild clinical symptoms.',
      timelineOrFacts: [
        'Patient portal token validation failure locked patient out for 5 consecutive days.',
        'IT helpdesk auto-disconnected incoming calls without queuing.',
        'Patient rationed insulin resulting in reported dizziness and nausea.',
        'Medication continuity compromised due to IT portal downtime.',
      ],
      primaryCategory: 'Technology / Patient Portal',
      secondaryCategories: ['Clinical Care', 'Wait Time'],
      severityLevel: 3,
      severityLabel: 'Level 3 – High',
      severityReasoning:
        'Technical outage led directly to medication non-adherence and acute symptom onset in an insulin-dependent diabetic patient.',
      identifiedRisks: [
        {
          risk: 'Clinical Risk',
          explanation:
            'Interruption of maintenance insulin therapy creating risk of diabetic ketoacidosis (DKA).',
        },
        {
          risk: 'Operational Risk',
          explanation:
            'Helpdesk telephony failure dropping calls rather than routing to clinical triage backup.',
        },
        {
          risk: 'Patient Safety Risk',
          explanation:
            'Digital health barrier directly jeopardizing medication continuity for high-risk chronic disease patient.',
        },
      ],
      escalationRoute: 'Information Technology',
      escalationRationale:
        'Joint escalation to IT Systems Engineering for token authentication fix and Clinical Pharmacy for emergency insulin refill.',
      slaTargetHours: 24,
      slaTargetDescription: '24-hour urgent technical resolution and immediate clinical contact',
      humanIntervention: {
        required: true,
        urgency: 'Prompt',
        roles: ['IT Customer Experience Lead', 'Clinic Triage Nurse', 'Endocrinology Clinical Pharmacist'],
        rationale:
          'Requires urgent clinical pharmacist outreach to authorize emergency 30-day prescription refill before technical troubleshooting.',
      },
      recommendedActions: [
        'Have clinic triage nurse immediately phone patient and transmit emergency insulin refill to pharmacy.',
        'Reset portal OAuth/session tokens and verify mobile app authentication.',
        'Adjust IT helpdesk telephony overflow routing so calls failover to ambulatory answering service.',
      ],
      regulatoryNotes:
        'ONC Health IT Certification Criteria; Joint Commission Environment of Care Standards.',
    },
  },
  {
    id: 'CMP-2026-008',
    trackingNumber: 'GRV-98221',
    patientIdentifier: 'PT-6612',
    patientName: 'Gregory Barnes',
    incidentDate: '2026-10-17T13:00:00Z',
    receivedDate: '2026-10-17T16:30:00Z',
    source: 'CAHPS / Survey Comment',
    departmentOrUnit: 'Ambulatory Multi-Specialty Clinic',
    rawText:
      'I was scheduled for an 8:30 AM fasting ultrasound and lab draw. Nobody called my name until 1:15 PM. Five hours sitting on hard wooden chairs without water or food while diabetic. When I inquired at the desk, the receptionist rolled her eyes and told me "if you don\'t like the wait, you can go somewhere else." When I finally went back, the ultrasound tech apologized and said they were double-booked with 4 add-ons.',
    status: 'Pending Triage',
    triage: {
      whatHappened:
        'Fasting diabetic patient experienced an unmonitored 5-hour wait for scheduled morning ultrasound due to overbooking, accompanied by unprofessional dismissive remarks from front desk staff.',
      timelineOrFacts: [
        'Patient scheduled for 8:30 AM fasting diagnostic study.',
        'Waited over 4.5 hours in public waiting area without clinical check-in or hydration guidance.',
        'Front desk staff demonstrated hostile, unprofessional attitude.',
        'Overbooking of 4 clinical add-ons identified as operational root cause.',
      ],
      primaryCategory: 'Wait Time',
      secondaryCategories: ['Staff Conduct', 'Scheduling', 'Communication'],
      severityLevel: 2,
      severityLabel: 'Level 2 – Moderate',
      severityReasoning:
        'Excessive wait time exceeding 4 hours for a fasting patient with chronic metabolic condition, exacerbated by disrespectful front desk conduct.',
      identifiedRisks: [
        {
          risk: 'Operational Risk',
          explanation:
            'Flawed template scheduling allowing unscheduled add-ons to overwhelm imaging capacity.',
        },
        {
          risk: 'Patient Safety Risk',
          explanation:
            'Prolonged unmonitored fasting state in diabetic patient posing hypoglycemic risk.',
        },
        {
          risk: 'Reputational Risk',
          explanation:
            'Negative CAHPS patient experience survey scores impacting outpatient quality ratings and hospital reputation.',
        },
      ],
      escalationRoute: 'Nursing Leadership',
      escalationRationale:
        'Clinic practice manager and nursing leadership must address front desk customer service standards and template scheduling overbooking.',
      slaTargetHours: 72,
      slaTargetDescription: '72 hours clinic leadership review & service recovery',
      humanIntervention: {
        required: true,
        urgency: 'Routine',
        roles: ['Clinic Operations Manager', 'Patient Experience Specialist'],
        rationale:
          'Service recovery phone call and review of front desk staff professionalism standards.',
      },
      recommendedActions: [
        'Perform service recovery phone call to apologize and address fasting protocol guidelines.',
        'Review radiology schedule templates with practice manager to cap double-booked add-ons.',
        'Conduct customer service coaching session with front-desk staff member.',
      ],
      regulatoryNotes:
        'CMS Outpatient CAHPS Quality Reporting Metric; Joint Commission Patient Rights Standards.',
    },
  },
  {
    id: 'CMP-2026-009',
    trackingNumber: 'GRV-98222',
    patientIdentifier: 'PT-1087',
    patientName: 'Hannah Meyer',
    incidentDate: '2026-10-16T14:00:00Z',
    receivedDate: '2026-10-17T09:30:00Z',
    source: 'CAHPS / Survey Comment',
    departmentOrUnit: 'Facilities & Visitor Services',
    rawText:
      'The parking garage ticket machine on Level B2 was broken and wouldn\'t accept credit cards. Several elderly patients were stuck in line trying to figure out how to exit. I also noticed that the directional signs to the Cancer Pavilion were obscured by construction scaffolding.',
    status: 'Resolved',
    assignedTo: 'Facilities Coordinator',
    triage: {
      whatHappened:
        'Broken parking ticket payment kiosk on Level B2 caused exit delays, and construction scaffolding obscured hospital wayfinding signage to Cancer Pavilion.',
      timelineOrFacts: [
        'Parking payment machine failure created queue at exit gate.',
        'Wayfinding signs partially obscured by temporary construction barriers.',
        'No clinical or patient safety harm occurred.',
      ],
      primaryCategory: 'Other',
      secondaryCategories: ['Communication'],
      severityLevel: 1,
      severityLabel: 'Level 1 – Low',
      severityReasoning:
        'Minor operational inconvenience and routine facilities feedback with zero patient harm or safety risk.',
      identifiedRisks: [
        {
          risk: 'Operational Risk',
          explanation:
            'Facility equipment maintenance failure and temporary wayfinding disruption in parking structures.',
        },
      ],
      escalationRoute: 'Patient Experience Team',
      escalationRationale:
        'Standard operational routing to Parking & Facilities Liaison for routine equipment maintenance and signage adjustment.',
      slaTargetHours: 168,
      slaTargetDescription: '7-14 business days routine feedback loop',
      humanIntervention: {
        required: false,
        urgency: 'Routine',
        roles: ['Facilities Work Order Specialist'],
        rationale:
          'Routine operational work order; does not require clinical or executive oversight.',
      },
      recommendedActions: [
        'Dispatched work order to Parking Services to service Level B2 kiosk validator.',
        'Installed temporary high-contrast sandwich board signs for Cancer Pavilion wayfinding.',
        'Sent appreciation email to visitor for constructive facility feedback.',
      ],
      regulatoryNotes: 'Routine hospital operations & guest services standard maintenance.',
    },
  },
];

export const CATEGORY_DEFINITIONS = [
  { name: 'Patient Safety', desc: 'Adverse clinical events, near-misses, falls, medication errors, infection control.' },
  { name: 'Clinical Care', desc: 'Diagnostic accuracy, treatment delay, clinical competence, surgery, discharge planning.' },
  { name: 'Privacy or Security', desc: 'HIPAA breaches, unauthorized disclosure of PHI, physical security, cyber concerns.' },
  { name: 'Staff Conduct', desc: 'Disrespect, hostility, bedside manner, dismissiveness, unprofessional behavior.' },
  { name: 'Communication', desc: 'Language barriers, lack of explanations, informed consent, conflicting instructions.' },
  { name: 'Billing', desc: 'Surprise bills, out-of-network charges, collections disputes, insurance authorization.' },
  { name: 'Technology / Patient Portal', desc: 'Portal outages, telehealth drops, EHR syncing, mobile login failures.' },
  { name: 'Wait Time', desc: 'ED boarding, clinic delays, unmonitored waiting, prolonged fasting intervals.' },
  { name: 'Scheduling', desc: 'Cancelled appointments, provider unavailability, booking errors, long referral lag.' },
  { name: 'Other', desc: 'Facilities, parking, dietary, noise, environmental comfort, general feedback.' },
];

export const SEVERITY_LEVEL_INFO = {
  1: {
    label: 'Level 1 – Low',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    border: 'border-emerald-500',
    summary: 'Minor inconvenience, routine dissatisfaction, general suggestion.',
    sla: '7–14 Days',
  },
  2: {
    label: 'Level 2 – Moderate',
    color: 'bg-amber-50 text-amber-900 border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    border: 'border-amber-500',
    summary: 'Repeated service failures, significant frustration, communication breakdown.',
    sla: '3–5 Days',
  },
  3: {
    label: 'Level 3 – High',
    color: 'bg-orange-50 text-orange-900 border-orange-200',
    badge: 'bg-orange-100 text-orange-800',
    border: 'border-orange-500',
    summary: 'Potential patient harm, medication concern, serious accessibility issue, escalated complaint.',
    sla: '24–48 Hours',
  },
  4: {
    label: 'Level 4 – Critical',
    color: 'bg-rose-50 text-rose-900 border-rose-200',
    badge: 'bg-rose-100 text-rose-800',
    border: 'border-rose-500',
    summary: 'Immediate patient safety risk, potential legal exposure, serious privacy violation, discrimination allegation.',
    sla: 'Immediate (< 2 Hours)',
  },
};
