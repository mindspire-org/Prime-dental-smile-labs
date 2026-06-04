import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { shadeFields } from "./shade";

const PRIMARY = "#4f46e5";
const PRIMARY_LIGHT = "#eef2ff";
const SLATE_800 = "#1e293b";
const SLATE_600 = "#475569";
const SLATE_400 = "#94a3b8";
const SLATE_200 = "#e2e8f0";
const SLATE_100 = "#f1f5f9";
const WHITE = "#ffffff";

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
}

function setFillColor(doc: jsPDF, hex: string) {
  const [r, g, b] = hexToRgb(hex);
  doc.setFillColor(r, g, b);
}

function setTextColor(doc: jsPDF, hex: string) {
  const [r, g, b] = hexToRgb(hex);
  doc.setTextColor(r, g, b);
}

function drawRoundedRect(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  doc.roundedRect(x, y, w, h, r, r, "F");
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Submitted: { bg: "#ecfeff", text: "#0891b2" },
  "Awaiting Information": { bg: "#fffbeb", text: "#b45309" },
  "In Production": { bg: "#eff6ff", text: "#1d4ed8" },
  Dispatched: { bg: "#f0fdf4", text: "#15803d" },
  Completed: { bg: "#f8fafc", text: "#475569" },
  "Design Stage": { bg: "#f5f3ff", text: "#6d28d9" },
  "Quality Control": { bg: "#fff7ed", text: "#c2410c" },
};

export function generateCasePdf(caseData: any, filename?: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 16;
  let y = 12;

  // === HEADER BANNER ===
  setFillColor(doc, PRIMARY);
  doc.rect(0, 0, pageW, 28, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("Prime Dental Smile Labs", margin, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("UK Dental Laboratory · Case Report", margin, 18);

  doc.setFontSize(8);
  doc.setTextColor(200, 200, 255);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    pageW - margin,
    12,
    { align: "right" }
  );

  y = 34;

  // === CASE REFERENCE HEADER ===
  setFillColor(doc, PRIMARY_LIGHT);
  drawRoundedRect(doc, margin, y, pageW - margin * 2, 22, 3);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setTextColor(doc, PRIMARY);
  doc.text("CASE REFERENCE", margin + 4, y + 6);

  doc.setFontSize(20);
  setTextColor(doc, SLATE_800);
  doc.text(caseData.caseNumber || "—", margin + 4, y + 15);

  // Status badge
  const status = caseData.status || "Submitted";
  const stCol = STATUS_COLORS[status] ?? { bg: SLATE_100, text: SLATE_600 };
  const statusW = doc.getTextWidth(status) + 10;
  const badgeX = pageW - margin - statusW;
  setFillColor(doc, stCol.bg);
  drawRoundedRect(doc, badgeX, y + 6, statusW, 8, 2);
  doc.setFontSize(9);
  setTextColor(doc, stCol.text);
  doc.text(status, badgeX + 5, y + 11.5);

  y += 28;

  // === PATIENT & CLIENT INFO ===
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "plain",
    body: [
      [
        { content: "Patient Ref", styles: { fontStyle: "bold", fontSize: 8, textColor: PRIMARY } },
        { content: caseData.patientRef || "—", styles: { fontSize: 9, textColor: SLATE_800 } },
        { content: "Dentist", styles: { fontStyle: "bold", fontSize: 8, textColor: PRIMARY } },
        { content: caseData.dentist?.name || "—", styles: { fontSize: 9, textColor: SLATE_800 } },
      ],
      [
        { content: "Patient Gender", styles: { fontStyle: "bold", fontSize: 8, textColor: PRIMARY } },
        { content: caseData.patientGender || "—", styles: { fontSize: 9, textColor: SLATE_800 } },
        { content: "Dentist Email", styles: { fontStyle: "bold", fontSize: 8, textColor: PRIMARY } },
        { content: caseData.dentist?.email || "—", styles: { fontSize: 9, textColor: SLATE_800 } },
      ],
      [
        { content: "Patient Age", styles: { fontStyle: "bold", fontSize: 8, textColor: PRIMARY } },
        { content: caseData.patientAge ? String(caseData.patientAge) : "—", styles: { fontSize: 9, textColor: SLATE_800 } },
        { content: "Clinic", styles: { fontStyle: "bold", fontSize: 8, textColor: PRIMARY } },
        { content: caseData.clinic?.name || "—", styles: { fontSize: 9, textColor: SLATE_800 } },
      ],
      [
        { content: "Clinic Ref", styles: { fontStyle: "bold", fontSize: 8, textColor: PRIMARY } },
        { content: caseData.clinicReference || "—", styles: { fontSize: 9, textColor: SLATE_800 } },
        { content: "Submitted", styles: { fontStyle: "bold", fontSize: 8, textColor: PRIMARY } },
        { content: caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString("en-GB") : "—", styles: { fontSize: 9, textColor: SLATE_800 } },
      ],
    ],
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 32 },
      3: { cellWidth: "auto" },
    },
    styles: {
      cellPadding: { top: 2.5, right: 3, bottom: 2.5, left: 3 },
      lineColor: SLATE_200,
      lineWidth: 0.2,
    },
    didDrawPage: () => {},
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // Helper for section headers
  function sectionHeader(doc: jsPDF, title: string, yPos: number) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    setTextColor(doc, SLATE_800);
    doc.text(title, margin, yPos);
    setFillColor(doc, PRIMARY);
    doc.rect(margin, yPos + 2, 20, 1.2, "F");
    return yPos + 7;
  }

  // === PRESCRIPTION SUMMARY ===
  if (y > 250) {
    doc.addPage();
    y = 15;
  }
  y = sectionHeader(doc, "Prescription Summary", y);

  const teeth = caseData.teeth ? Object.keys(caseData.teeth).join(", ") : "—";
  const shadeRows = shadeFields(caseData.shade);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [["Field", "Value"]],
    headStyles: {
      fillColor: hexToRgb(PRIMARY),
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
      cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
    },
    body: [
      ["Services", caseData.services?.join(", ") || "Not specified"],
      ["Material", caseData.material || "—"],
      ...(shadeRows.length ? shadeRows : [["Shade", "—"] as [string, string]]),
      ["Teeth", teeth],
      ["Urgency", caseData.urgency || "Standard"],
      ["Requested Completion", caseData.requestedCompletion ? new Date(caseData.requestedCompletion).toLocaleDateString("en-GB") : "—"],
      ["Notes", caseData.notes || "—"],
    ],
    columnStyles: {
      0: { cellWidth: 50, fontStyle: "bold", textColor: SLATE_600, fontSize: 9 },
      1: { fontSize: 9, textColor: SLATE_800 },
    },
    styles: {
      cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
      lineColor: SLATE_200,
      lineWidth: 0.2,
    },
    alternateRowStyles: { fillColor: hexToRgb("#f8fafc") },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // === IMPLANT DETAILS ===
  if (caseData.implant && caseData.implant.brand) {
    if (y > 250) {
      doc.addPage();
      y = 15;
    }
    y = sectionHeader(doc, "Implant Details", y);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      head: [["Field", "Value"]],
      headStyles: {
        fillColor: hexToRgb(PRIMARY),
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
        cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
      },
      body: [
        ["Brand", caseData.implant.brand || "—"],
        ["System", caseData.implant.system || "—"],
        ["Platform", caseData.implant.platform || "—"],
        ["Connection", caseData.implant.connection || "—"],
        ["Retention", caseData.implant.retention || "—"],
      ],
      columnStyles: {
        0: { cellWidth: 50, fontStyle: "bold", textColor: SLATE_600, fontSize: 9 },
        1: { fontSize: 9, textColor: SLATE_800 },
      },
      styles: {
        cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
        lineColor: SLATE_200,
        lineWidth: 0.2,
      },
      alternateRowStyles: { fillColor: hexToRgb("#f8fafc") },
    });

    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // === SHIPPING ===
  if (caseData.shipping) {
    if (y > 250) {
      doc.addPage();
      y = 15;
    }
    y = sectionHeader(doc, "Shipping Details", y);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      head: [["Field", "Value"]],
      headStyles: {
        fillColor: hexToRgb(PRIMARY),
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
        cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
      },
      body: [
        ["Method", caseData.shipping.method || "—"],
        ["Address", caseData.shipping.address || "—"],
        ["Instructions", caseData.shipping.instructions || "—"],
      ],
      columnStyles: {
        0: { cellWidth: 50, fontStyle: "bold", textColor: SLATE_600, fontSize: 9 },
        1: { fontSize: 9, textColor: SLATE_800 },
      },
      styles: {
        cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
        lineColor: SLATE_200,
        lineWidth: 0.2,
      },
      alternateRowStyles: { fillColor: hexToRgb("#f8fafc") },
    });

    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // === STATUS TIMELINE ===
  const STEPS = [
    "Submitted",
    "File Review",
    "Awaiting Information",
    "Design Stage",
    "Dentist Approval",
    "In Production",
    "Finishing",
    "Quality Control",
    "Ready for Dispatch",
    "Dispatched",
    "Completed",
  ];
  const active = Math.max(STEPS.indexOf(caseData.status), 0);

  if (y > 230) {
    doc.addPage();
    y = 15;
  }
  y = sectionHeader(doc, "Status Timeline", y);

  const stepRows = STEPS.map((s, i) => {
    const done = i < active;
    const current = i === active;
    const icon = done ? "✓" : current ? "●" : "○";
    const label = done ? "Completed" : current ? "Current" : "Pending";
    return [icon, s, label];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "plain",
    body: stepRows,
    columnStyles: {
      0: { cellWidth: 10, halign: "center", fontSize: 10 },
      1: { fontSize: 9, textColor: SLATE_800 },
      2: { cellWidth: 30, halign: "right", fontSize: 8 },
    },
    styles: {
      cellPadding: { top: 2.5, right: 3, bottom: 2.5, left: 3 },
      lineColor: SLATE_200,
      lineWidth: 0.15,
    },
    didParseCell: (data) => {
      if (data.column.index === 0) {
        const rowIdx = data.row.index;
        if (rowIdx < active) {
          data.cell.styles.textColor = PRIMARY;
          data.cell.styles.fontStyle = "bold";
        } else if (rowIdx === active) {
          data.cell.styles.textColor = PRIMARY;
          data.cell.styles.fontStyle = "bold";
        } else {
          data.cell.styles.textColor = SLATE_400;
        }
      }
      if (data.column.index === 1) {
        const rowIdx = data.row.index;
        if (rowIdx === active) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.textColor = PRIMARY;
        } else if (rowIdx < active) {
          data.cell.styles.textColor = SLATE_600;
        } else {
          data.cell.styles.textColor = SLATE_400;
        }
      }
      if (data.column.index === 2) {
        const rowIdx = data.row.index;
        if (rowIdx === active) {
          data.cell.styles.textColor = PRIMARY;
          data.cell.styles.fontStyle = "bold";
        } else if (rowIdx < active) {
          data.cell.styles.textColor = SLATE_400;
        } else {
          data.cell.styles.textColor = SLATE_400;
        }
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // === STATUS HISTORY ===
  if (caseData.statusHistory && caseData.statusHistory.length > 0) {
    if (y > 230) {
      doc.addPage();
      y = 15;
    }
    y = sectionHeader(doc, "Status History", y);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      head: [["Date", "Status", "Note"]],
      headStyles: {
        fillColor: hexToRgb(PRIMARY),
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
        cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
      },
      body: caseData.statusHistory.map((h: any) => [
        h.createdAt ? new Date(h.createdAt).toLocaleDateString("en-GB") : "—",
        h.status,
        h.note || "—",
      ]),
      columnStyles: {
        0: { cellWidth: 30, fontSize: 9, textColor: SLATE_600 },
        1: { cellWidth: 50, fontSize: 9, fontStyle: "bold", textColor: SLATE_800 },
        2: { fontSize: 9, textColor: SLATE_800 },
      },
      styles: {
        cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
        lineColor: SLATE_200,
        lineWidth: 0.2,
      },
      alternateRowStyles: { fillColor: hexToRgb("#f8fafc") },
    });

    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // === FILES ===
  if (caseData.files && caseData.files.length > 0) {
    if (y > 230) {
      doc.addPage();
      y = 15;
    }
    y = sectionHeader(doc, "Attached Files", y);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      head: [["File Name", "Size"]],
      headStyles: {
        fillColor: hexToRgb(PRIMARY),
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
        cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
      },
      body: caseData.files.map((f: any) => [
        f.originalName || f.name || "—",
        f.size ? `${(f.size / 1024).toFixed(0)} KB` : "—",
      ]),
      columnStyles: {
        0: { fontSize: 9, textColor: SLATE_800 },
        1: { cellWidth: 30, fontSize: 9, textColor: SLATE_600, halign: "right" },
      },
      styles: {
        cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
        lineColor: SLATE_200,
        lineWidth: 0.2,
      },
      alternateRowStyles: { fillColor: hexToRgb("#f8fafc") },
    });

    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // === FOOTER ===
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    setFillColor(doc, SLATE_100);
    doc.rect(0, doc.internal.pageSize.getHeight() - 10, pageW, 10, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setTextColor(doc, SLATE_400);
    doc.text(
      "Prime Dental Smile Labs · Confidential Case Report",
      margin,
      doc.internal.pageSize.getHeight() - 4
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageW - margin,
      doc.internal.pageSize.getHeight() - 4,
      { align: "right" }
    );
  }

  doc.save(filename || `${caseData.caseNumber || "case"}.pdf`);
}
