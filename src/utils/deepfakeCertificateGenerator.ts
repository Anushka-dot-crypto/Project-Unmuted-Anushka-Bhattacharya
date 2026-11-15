import { jsPDF } from 'jspdf';
import { DeepfakeAnalysisResult, CropFlagInfo } from '../types';

interface CertificateParams {
  fileName: string;
  analysis: DeepfakeAnalysisResult;
  cropFlag?: CropFlagInfo;
  caseId?: string;
}

export function generateDeepfakeCertificatePdf({
  fileName,
  analysis,
  cropFlag,
  caseId = 'UNMUTED-DF-VERIFIED',
}: CertificateParams) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header Bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Emblem / title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PROJECT UNMUTED • FORENSIC MEDIA AUDIT DIVISION', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(
    'ELECTRONIC RECORD EXAMINATION CERTIFICATE | SECTION 63 BSA 2023 / SEC 65B IEA',
    margin,
    18
  );

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `AUDIT REF: ${caseId} | TIMESTAMP: ${analysis.analyzedAt || new Date().toISOString()}`,
    margin,
    24
  );

  y = 36;

  // Verdict Banner Box
  const isAuthentic = analysis.verdict === 'AUTHENTIC_GENUINE';
  const isManipulated =
    analysis.verdict === 'POTENTIAL_MANIPULATION' ||
    analysis.verdict === 'SYNTHETIC_AI_GENERATED' ||
    analysis.verdict === 'FACE_SWAP_MANIPULATION';

  if (isAuthentic) {
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(16, 185, 129); // emerald-500
  } else if (isManipulated) {
    doc.setFillColor(254, 242, 242); // rose-50
    doc.setDrawColor(244, 63, 94); // rose-500
  } else {
    doc.setFillColor(255, 251, 235); // amber-50
    doc.setDrawColor(245, 158, 11); // amber-500
  }

  doc.setLineWidth(0.8);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  if (isAuthentic) {
    doc.setTextColor(6, 95, 70);
    doc.text('EXAMINATION VERDICT: AUTHENTIC OPTICAL CAMERA RECORD (VERIFIED)', margin + 5, y + 7);
  } else if (isManipulated) {
    doc.setTextColor(159, 18, 57);
    doc.text(`EXAMINATION VERDICT: ${analysis.verdict.replace(/_/g, ' ')}`, margin + 5, y + 7);
  } else {
    doc.setTextColor(146, 64, 14);
    doc.text('EXAMINATION VERDICT: INCONCLUSIVE / RESOLUTION DEGRADED', margin + 5, y + 7);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Confidence: ${analysis.confidenceScore}%  |  Authenticity Score: ${analysis.authenticityScore}%  |  Deepfake Risk: ${analysis.deepfakeRiskLevel}  |  Calibration: ${analysis.calibrationMode || 'BALANCED'}`,
    margin + 5,
    y + 14
  );
  doc.text(`Target File: ${fileName}`, margin + 5, y + 20);

  y += 30;

  // Findings Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('EXECUTIVE FORENSIC SUMMARY', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const splitSummary = doc.splitTextToSize(analysis.detailedFindings, contentWidth);
  doc.text(splitSummary, margin, y);
  y += splitSummary.length * 4 + 4;

  // 5 Forensic Categories Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('MULTI-DIMENSIONAL FORENSIC MATRIX', margin, y);
  y += 5;

  const categories = Object.values(analysis.categories || {});
  categories.forEach((cat) => {
    if (y > pageHeight - 35) {
      doc.addPage();
      y = margin;
    }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${cat.label} [Status: ${cat.status} | Anomaly Score: ${cat.score}/100]`, margin + 3, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const catFinding = doc.splitTextToSize(`Finding: ${cat.finding} | Evidence: ${cat.evidence}`, contentWidth - 8);
    doc.text(catFinding[0] || '', margin + 3, y + 10);

    y += 16;
  });

  y += 2;

  // Benchmark Dataset Correlations
  if (analysis.datasetCorrelations && analysis.datasetCorrelations.length > 0) {
    if (y > pageHeight - 35) {
      doc.addPage();
      y = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('BENCHMARK TRAINING & REFERENCE DATASET MATCHES', margin, y);
    y += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    analysis.datasetCorrelations.forEach((ds) => {
      doc.text(`• ${ds}`, margin + 3, y);
      y += 4;
    });
    y += 2;
  }

  // Detected Indicators / Positive Signals
  if (isAuthentic && analysis.positiveAuthenticitySignals?.length) {
    if (y > pageHeight - 35) {
      doc.addPage();
      y = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(6, 95, 70);
    doc.text('POSITIVE OPTICAL AUTHENTICITY SIGNALS', margin, y);
    y += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    analysis.positiveAuthenticitySignals.forEach((sig) => {
      doc.text(`✓ ${sig}`, margin + 3, y);
      y += 4;
    });
    y += 2;
  } else if (analysis.indicators?.length) {
    if (y > pageHeight - 35) {
      doc.addPage();
      y = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(159, 18, 57);
    doc.text('PRIMARY ANOMALY & MANIPULATION CUES DETECTED', margin, y);
    y += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    analysis.indicators.forEach((ind) => {
      doc.text(`• ${ind}`, margin + 3, y);
      y += 4;
    });
    y += 2;
  }

  // Crop Advisory note if applicable
  if (cropFlag?.isOverCropped || analysis.cropWarning) {
    if (y > pageHeight - 35) {
      doc.addPage();
      y = margin;
    }

    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentWidth, 12, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(146, 64, 14);
    doc.text('EVIDENTIARY ADVISORY (CROP FRAMING NOTICE)', margin + 3, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(
      analysis.cropWarning ||
        `Media was cropped (${cropFlag?.cropAreaPercent || 'low'}% area retained). Ensure uncropped original is preserved in vault.`,
      margin + 3,
      y + 8.5
    );

    y += 15;
  }

  // Legal Admissibility & Escalation
  if (y > pageHeight - 40) {
    doc.addPage();
    y = margin;
  }

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('LEGAL NOTICE (SECTION 63 BHARATIYA SAKSHYA ADHINIYAM / SEC 65B IEA)', margin + 3, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'This audit report forms supportive technical corroboration under Section 63 BSA. For FIR filing, preserve raw media in UNMUTED vault.',
    margin + 3,
    y + 9
  );
  doc.text(
    'Emergency Escalation: National Cyber Crime Helpline 1930 | Portal: cybercrime.gov.in | StopNCII Hash Registry: StopNCII.org',
    margin + 3,
    y + 13.5
  );

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Project UNMUTED Cyber Safety Engine • Page ${p} of ${totalPages} • Cryptographic Certificate Valid`,
      margin,
      pageHeight - 6
    );
  }

  const safeFileName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`UNMUTED_Deepfake_Audit_${safeFileName}.pdf`);
}
