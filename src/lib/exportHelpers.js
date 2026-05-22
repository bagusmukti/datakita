import Papa from 'papaparse';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { generateFilename, formatDate } from './utils';

export function exportCSV(data, datasetId, includeMetadata = true) {
  if (!data || data.length === 0) return;

  let exportData = [...data];

  if (includeMetadata) {
    const meta = {
      Sumber: getSourceLabel(datasetId),
      'Diekspor dari': 'DataKita — Dashboard Data Publik Indonesia',
      'Tanggal Ekspor': formatDate(new Date(), 'dd MMMM yyyy HH:mm'),
      'Politeknik Elektronika Negeri Surabaya': '',
    };
    const metaRows = Object.entries(meta).map(([k, v]) => ({ [k]: v }));
    exportData = [...metaRows, {}, ...exportData];
  }

  const csv = Papa.unparse(exportData);
  const bom = '﻿';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = generateFilename(datasetId, 'csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportPDF(chartElementId, tableData, datasetId, title, includeChart = true) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  pdf.setFillColor(30, 39, 97);
  pdf.rect(0, 0, pageWidth, 50, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text('DataKita', margin, 22);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text('Dashboard Data Publik Indonesia', margin, 32);
  pdf.setFontSize(9);
  pdf.text('Politeknik Elektronika Negeri Surabaya', margin, 42);

  pdf.setTextColor(30, 39, 97);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text(title, margin, 68);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(107, 114, 128);
  pdf.text(`Sumber: ${getSourceLabel(datasetId)}`, margin, 76);
  pdf.text(`Diekspor: ${formatDate(new Date(), 'dd MMMM yyyy, HH:mm')}`, margin, 82);

  if (includeChart && chartElementId) {
    const chartEl = document.getElementById(chartElementId);
    if (chartEl) {
      try {
        const canvas = await html2canvas(chartEl, { scale: 2, useCORS: true, logging: false });
        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * contentWidth) / canvas.width;
        const yStart = 92;
        if (yStart + imgHeight > pageHeight - margin) {
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, Math.min(imgHeight, pageHeight - margin * 2));
        } else {
          pdf.addImage(imgData, 'PNG', margin, yStart, contentWidth, imgHeight);
        }
        pdf.addPage();
      } catch {
        pdf.addPage();
      }
    } else {
      pdf.addPage();
    }
  } else {
    pdf.addPage();
  }

  if (tableData && tableData.length > 0) {
    const headers = Object.keys(tableData[0]);
    const colWidth = Math.min(contentWidth / headers.length, 45);
    let y = margin + 10;

    pdf.setFillColor(245, 245, 240);
    pdf.rect(margin, y - 5, contentWidth, 8, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(30, 39, 97);

    headers.forEach((h, i) => {
      pdf.text(String(h).slice(0, 14), margin + i * colWidth, y);
    });
    y += 6;

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(26, 26, 26);

    tableData.slice(0, 40).forEach((row, ri) => {
      if (y > pageHeight - margin) {
        pdf.addPage();
        y = margin + 10;
      }
      if (ri % 2 === 0) {
        pdf.setFillColor(250, 250, 247);
        pdf.rect(margin, y - 4, contentWidth, 6, 'F');
      }
      headers.forEach((h, i) => {
        pdf.text(String(row[h] ?? '—').slice(0, 14), margin + i * colWidth, y);
      });
      y += 6;
    });
  }

  pdf.save(generateFilename(datasetId, 'pdf'));
}

function getSourceLabel(datasetId) {
  const labels = {
    bmkg: 'BMKG — Badan Meteorologi, Klimatologi, dan Geofisika',
    worldbank: 'World Bank — Open Data',
    disease: 'disease.sh — COVID-19 API',
  };
  return labels[datasetId] || datasetId;
}
