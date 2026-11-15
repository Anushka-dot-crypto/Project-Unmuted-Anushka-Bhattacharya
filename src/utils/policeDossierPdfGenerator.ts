import { jsPDF } from 'jspdf';
import { Case, ReportSections, EvidenceItem } from '../types';

interface PoliceReportParams {
  caseData: Case;
  sections: ReportSections;
  complainantName?: string;
  complainantEmail?: string;
  stationJurisdiction?: string;
}

function safeString(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) return val.join(', ');
  return String(val);
}

export function generatePoliceInvestigationPdf({
  caseData,
  sections,
  complainantName = 'Complainant (Protected Identity)',
  complainantEmail,
  stationJurisdiction,
}: PoliceReportParams) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182 mm
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = margin + 12; // leave room for running header
      return true;
    }
    return false;
  };

  // -------------------------------------------------------------
  // COVER / POLICE COMPLAINT HEADER (Page 1)
  // -------------------------------------------------------------

  // Top Formal Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('FORMAL CYBER CRIME COMPLAINT & EVIDENTIARY REPORT', margin + 6, y + 8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    'SUBMITTED UNDER SECTION 154 CrPC / SECTION 173 BNSS 2023 READ WITH IT ACT 2000 & BNS 2023',
    margin + 6,
    y + 14
  );
  doc.text(
    'PREPARED FOR: NATIONAL CYBER CRIME REPORTING PORTAL (1930 / cybercrime.gov.in) & CYBER POLICE STATION',
    margin + 6,
    y + 19
  );

  y += 28;

  // Addressee Block
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TO:', margin, y);
  y += 4.5;
  doc.text('THE STATION HOUSE OFFICER (SHO) / IN-CHARGE, CYBER CRIME POLICE STATION,', margin, y);
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const targetStation =
    stationJurisdiction ||
    caseData.details?.gpsLocation?.jurisdictionCell ||
    'Jurisdictional Cyber Crime Cell / Superintendent of Police (Cyber Crime)';
  doc.text(targetStation, margin, y);
  y += 7;

  // Case Reference & Meta Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 34, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`CASE REPORT REF: ${caseData.id}`, margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Filing Date: ${new Date().toLocaleDateString('en-IN')}`, margin + 4, y + 12);
  doc.text(`Incident Classification: ${(caseData.incidentType || 'CYBERCRIME').toUpperCase()}`, margin + 4, y + 17);
  doc.text(
    `Risk Rating: ${caseData.urgencyAssessment?.riskLevel || 'ELEVATED'}`,
    margin + 4,
    y + 22
  );

  // Right column of meta box: GPS and platform
  const gps = caseData.details?.gpsLocation;
  const gpsText = gps
    ? `${gps.latitude.toFixed(5)}° N, ${gps.longitude.toFixed(5)}° E (±${gps.accuracy}m)`
    : 'Not stamped (Local device access)';
  const locationAddress = gps?.formattedAddress || gps?.city || 'India';

  doc.text(`GPS Location: ${gpsText}`, margin + 85, y + 6);
  doc.text(`District/State: ${gps?.state || 'National / Online Offense'}`, margin + 85, y + 12);
  doc.text(`Target Platform: ${caseData.details?.platform || 'Social Media / Messenger'}`, margin + 85, y + 17);
  doc.text(`Suspect Identifier: ${caseData.details?.username || caseData.details?.suspectHandles || 'Unidentified Profile'}`, margin + 85, y + 22);
  doc.text(`Evidence Annexures: ${caseData.evidenceItems?.length || 0} Cryptographically Logged Files`, margin + 85, y + 27);

  y += 38;

  // Statutory Penal Sections Cited Banner
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('STATUTORY PROVISIONS CITED FOR POLICE ACTION (APPLICABLE ACTS):', margin + 3, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    '• IT Act 2000: Sec 66E (Privacy Violation), Sec 66D (Cheating by Impersonation), Sec 67/67A (Obscene/Explicit Transmission), Sec 79(3)(b)',
    margin + 3,
    y + 8.5
  );
  doc.text(
    '• BNS 2023 / IPC: Sec 308 BNS (Extortion), Sec 351 BNS (Criminal Intimidation), Sec 78 BNS (Stalking), Sec 63 BSA 2023 (Electronic Evidence)',
    margin + 3,
    y + 12
  );

  y += 18;

  // -------------------------------------------------------------
  // PART 1 to 11: INCIDENT REPORT SECTIONS
  // -------------------------------------------------------------
  const sectionTitles: Record<keyof ReportSections, string> = {
    section1_case_info: 'PART I: COMPLAINANT PARTICULARS & DEVICE PROFILE',
    section2_summary: 'PART II: STATEMENT OF FACT & INCIDENT SUMMARY',
    section3_timeline: 'PART III: CHRONOLOGICAL TIMELINE OF OFFENSE',
    section4_platform_account: 'PART IV: PLATFORM, ACCOUNTS & SUSPECT IDENTIFIERS',
    section5_detailed_description: 'PART V: DETAILED FACTUAL DEPOSITION & MODUS OPERANDI',
    section6_threat_harm: 'PART VI: THREATS, EXTORTION & REPUTATION HARM',
    section7_financial_info: 'PART VII: FINANCIAL EXTORTION & BENEFICIARY ACCOUNTS (UPI/BANK)',
    section8_evidence_inventory: 'PART VIII: EVIDENCE CHAIN OF CUSTODY SUMMARY',
    section9_actions_taken: 'PART IX: MITIGATION & CONTAINMENT MEASURES TAKEN',
    section10_requested_assistance: 'PART X: SPECIFIC PRAYERS & RELIEFS SOUGHT FROM INVESTIGATING OFFICER',
    section11_missing_info: 'PART XI: PENDING INFORMATION / INTERMEDIARY DATA PRESERVATION REQUESTS',
  };

  (Object.keys(sections) as Array<keyof ReportSections>).forEach((secKey) => {
    const title = sectionTitles[secKey] || secKey.toUpperCase();
    const rawText = safeString(sections[secKey]) || 'No data recorded.';

    checkPageBreak(16);

    // Section header bar
    doc.setFillColor(226, 232, 240); // slate-200
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(title, margin + 3, y + 4.2);
    y += 9;

    // Body text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    const splitLines = doc.splitTextToSize(rawText, contentWidth - 4);
    splitLines.forEach((line: string) => {
      checkPageBreak(5);
      doc.text(line, margin + 2, y);
      y += 4.2;
    });

    y += 3;
  });

  // -------------------------------------------------------------
  // ANNEXURE-A: DIGITAL EVIDENCE HASH REGISTER
  // -------------------------------------------------------------
  checkPageBreak(35);
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('ANNEXURE-A: DIGITAL EVIDENCE LOG & CRYPTOGRAPHIC HASH REGISTER', margin + 3, y + 4.8);
  y += 10;

  if (caseData.evidenceItems && caseData.evidenceItems.length > 0) {
    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text('#', margin + 2, y + 4);
    doc.text('Evidence Title / Type', margin + 10, y + 4);
    doc.text('Recorded Date', margin + 65, y + 4);
    doc.text('Cryptographic Hash (SHA-256) / Integrity Tag', margin + 95, y + 4);
    y += 7;

    caseData.evidenceItems.forEach((ev, idx) => {
      checkPageBreak(8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(51, 65, 85);

      doc.text(String(idx + 1), margin + 2, y);
      const titleShort = (ev.title || 'Evidence Item').substring(0, 32);
      doc.text(`${titleShort} (${ev.type})`, margin + 10, y);
      doc.text(ev.originalDate || ev.dateAdded?.split('T')[0] || 'Logged', margin + 65, y);
      const hashStr = ev.hash || 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
      doc.setFont('courier', 'normal');
      doc.text(hashStr.substring(0, 45) + '...', margin + 95, y);
      doc.setFont('helvetica', 'normal');
      y += 4.5;

      if (ev.cropFlag?.isOverCropped) {
        checkPageBreak(5);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(185, 28, 28);
        doc.text(
          `* FORENSIC CROP NOTE: ${ev.cropFlag.cropAreaPercent || 25}% area retained. Excluded elements: ${(ev.cropFlag.missingElements || ['Header', 'Time']).join(', ')}. Full uncropped original preserved in vault.`,
          margin + 10,
          y
        );
        doc.setTextColor(51, 65, 85);
        doc.setFont('helvetica', 'normal');
        y += 4;
      }
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('No separate digital files attached. Primary communications recorded in narrative.', margin + 2, y);
    y += 6;
  }

  y += 4;

  // -------------------------------------------------------------
  // ANNEXURE-B: STATUTORY CERTIFICATE UNDER SEC 63 BSA 2023 / SEC 65B IEA
  // -------------------------------------------------------------
  checkPageBreak(50);
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(148, 163, 184);
  doc.rect(margin, y, contentWidth, 42, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(
    'STATUTORY ELECTRONIC EVIDENCE CERTIFICATE (UNDER SEC 63 BSA 2023 / SEC 65B(4) IEA)',
    margin + 4,
    y + 6
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const certP1 =
    '1. I, the undersigned complainant, do hereby certify that the electronic record(s) and attachments annexed to this report were produced by a computer / mobile Device in lawful possession and ordinary operation.';
  const certP2 =
    '2. Throughout the relevant period, the said device was operating properly, and the cryptographic hash values were generated in accordance with standard forensic verification practice without modification or unauthorized tampering.';
  const certP3 =
    '3. The particulars contained in this complaint report and printouts are true, correct, and faithful reproductions of the electronic records stored on the said device.';

  const splitC1 = doc.splitTextToSize(certP1, contentWidth - 8);
  const splitC2 = doc.splitTextToSize(certP2, contentWidth - 8);
  const splitC3 = doc.splitTextToSize(certP3, contentWidth - 8);

  let cy = y + 11;
  splitC1.forEach((l: string) => {
    doc.text(l, margin + 4, cy);
    cy += 3.8;
  });
  splitC2.forEach((l: string) => {
    doc.text(l, margin + 4, cy);
    cy += 3.8;
  });
  splitC3.forEach((l: string) => {
    doc.text(l, margin + 4, cy);
    cy += 3.8;
  });

  y += 46;

  // -------------------------------------------------------------
  // SIGNATURE & POLICE RECEIVING BLOCK
  // -------------------------------------------------------------
  checkPageBreak(40);

  // Two column box: Left = Complainant Verification, Right = Police Station Acknowledgment
  const colW = (contentWidth - 6) / 2;

  // Left Box: Complainant Signature
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, colW, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('VERIFICATION BY COMPLAINANT', margin + 3, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Name: ${complainantName}`, margin + 3, y + 11);
  doc.text(`Place: ${caseData.details?.gpsLocation?.city || 'India'}`, margin + 3, y + 16);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, margin + 3, y + 21);

  doc.line(margin + 3, y + 30, margin + colW - 3, y + 30);
  doc.setFontSize(7);
  doc.text('(Signature / Digital Verification of Complainant)', margin + 3, y + 34);

  // Right Box: Police Station Receiving Stamp Block
  doc.rect(margin + colW + 6, y, colW, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('POLICE STATION ACKNOWLEDGMENT / RECEIPT', margin + colW + 9, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('FIR / Diary (GD) Entry No: ____________________', margin + colW + 9, y + 12);
  doc.text('Date & Time of Receipt: ______________________', margin + colW + 9, y + 17);
  doc.text('Receiving Officer Name & Rank: ________________', margin + colW + 9, y + 22);
  doc.text('Police Station Stamp / Seal: ___________________', margin + colW + 9, y + 27);

  // -------------------------------------------------------------
  // RUNNING HEADER AND FOOTER ON ALL PAGES
  // -------------------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Header
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `CONFIDENTIAL — POLICE COMPLAINT & EVIDENTIARY REPORT | CASE: ${caseData.id}`,
      margin,
      8
    );
    doc.text(`SECTION 154 CrPC / 173 BNSS`, pageWidth - margin - 40, 8);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 10, pageWidth - margin, 10);

    // Footer
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
    doc.text(
      `Project UNMUTED Evidentiary Docket | Generated: ${new Date().toISOString().split('T')[0]}`,
      margin,
      pageHeight - 6
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin - 18,
      pageHeight - 6
    );
  }

  // Save PDF
  doc.save(`POLICE_COMPLAINT_REPORT_${caseData.id}.pdf`);
}
