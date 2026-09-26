/**
 * @file pdfGenerator.ts
 * @description Generates a polished A4 customer order summary.
 * This is a demo order document, not an official GST/tax invoice.
 */

import jsPDF from 'jspdf';
import { Order } from '../types';
import { formatCurrency } from './taxCalculator';
import { SITE_CONTACT } from '../data/siteConfig';

const PAGE = { width: 210, height: 297, margin: 16, contentWidth: 178 };
const COLORS = {
  ink: '#0f172a',
  muted: '#64748b',
  line: '#e2e8f0',
  panel: '#f8fafc',
  gold: '#d4a72c',
  green: '#047857',
  white: '#ffffff',
};

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function setColor(doc: jsPDF, kind: 'text' | 'fill' | 'draw', hex: string) {
  const [r, g, b] = hexToRgb(hex);
  if (kind === 'text') doc.setTextColor(r, g, b);
  if (kind === 'fill') doc.setFillColor(r, g, b);
  if (kind === 'draw') doc.setDrawColor(r, g, b);
}

function money(doc: jsPDF, value: number, x: number, y: number, align: 'left' | 'right' = 'right') {
  doc.text(formatCurrency(value), x, y, { align });
}

function wrap(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth) as string[];
}

export function generateInvoicePDF(order: Order): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let pageNumber = 1;
  let y = 0;

  const drawFooter = () => {
    setColor(doc, 'draw', COLORS.line);
    doc.line(PAGE.margin, PAGE.height - 17, PAGE.width - PAGE.margin, PAGE.height - 17);
    setColor(doc, 'text', COLORS.muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`${SITE_CONTACT.email}  •  ${SITE_CONTACT.phoneDisplay}`, PAGE.margin, PAGE.height - 10);
    doc.text(`Page ${pageNumber}`, PAGE.width - PAGE.margin, PAGE.height - 10, { align: 'right' });
  };

  const drawHeader = (continued = false) => {
    setColor(doc, 'fill', COLORS.ink);
    doc.rect(0, 0, PAGE.width, 31, 'F');
    setColor(doc, 'text', COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(19);
    doc.text('AUTO SPOT HUB', PAGE.margin, 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(continued ? 'CUSTOMER ORDER SUMMARY • CONTINUED' : 'CUSTOMER ORDER SUMMARY', PAGE.margin, 23);
    setColor(doc, 'text', COLORS.gold);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('DEMO DOCUMENT • NOT A TAX INVOICE', PAGE.width - PAGE.margin, 15, { align: 'right' });
    setColor(doc, 'text', '#cbd5e1');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('Luxury vehicle marketplace portfolio project', PAGE.width - PAGE.margin, 23, { align: 'right' });
    y = 41;
  };

  const ensureSpace = (height: number) => {
    if (y + height > PAGE.height - 24) {
      drawFooter();
      doc.addPage();
      pageNumber += 1;
      drawHeader(true);
    }
  };

  const section = (title: string, subtitle?: string) => {
    ensureSpace(16);
    setColor(doc, 'fill', COLORS.panel);
    doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, 9, 2, 2, 'F');
    setColor(doc, 'text', COLORS.ink);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(title.toUpperCase(), PAGE.margin + 4, y + 5.8);
    if (subtitle) {
      setColor(doc, 'text', COLORS.muted);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(subtitle, PAGE.width - PAGE.margin - 4, y + 5.8, { align: 'right' });
    }
    y += 14;
  };

  drawHeader();

  // Metadata ribbon
  setColor(doc, 'draw', COLORS.line);
  doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, 18, 2, 2);
  doc.setFontSize(7.2);
  setColor(doc, 'text', COLORS.muted);
  doc.text('ORDER ID', PAGE.margin + 4, y + 6);
  doc.text('TRACKING', PAGE.margin + 63, y + 6);
  doc.text('ORDER DATE', PAGE.margin + 122, y + 6);
  setColor(doc, 'text', COLORS.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(order.id, PAGE.margin + 4, y + 12);
  doc.text(order.trackingNumber, PAGE.margin + 63, y + 12);
  doc.text(order.date, PAGE.margin + 122, y + 12);
  y += 25;

  section('Customer & delivery details');
  const leftX = PAGE.margin + 3;
  const rightX = 111;
  setColor(doc, 'text', COLORS.muted);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text('CUSTOMER', leftX, y);
  doc.text('CONTACT', rightX, y);
  y += 5;
  setColor(doc, 'text', COLORS.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(order.address.fullName, leftX, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(order.address.phone, rightX, y);
  y += 5;
  setColor(doc, 'text', COLORS.muted);
  doc.text(order.address.address, leftX, y, { maxWidth: 82 });
  doc.text(order.address.email, rightX, y, { maxWidth: 75 });
  y += 5;
  doc.text(`${order.address.city}, ${order.address.state} • ${order.address.pincode}`, leftX, y);
  y += 11;

  section('Vehicles purchased');
  const cols = { sr: 19, vehicle: 35, category: 112, price: 190 };
  setColor(doc, 'fill', COLORS.ink);
  doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, 9, 1.5, 1.5, 'F');
  setColor(doc, 'text', COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('#', cols.sr, y + 5.8);
  doc.text('VEHICLE', cols.vehicle, y + 5.8);
  doc.text('CATEGORY / FUEL', cols.category, y + 5.8);
  doc.text('BASE PRICE', cols.price, y + 5.8, { align: 'right' });
  y += 9;

  order.items.forEach((item, index) => {
    const vehicle = `${item.car.make} ${item.car.model}`;
    const vehicleLines = wrap(doc, vehicle, 70);
    const category = `${item.car.category} / ${item.car.specs.fuelType}`;
    const categoryLines = wrap(doc, category, 55);
    const rowH = Math.max(11, vehicleLines.length * 4.2, categoryLines.length * 4.2) + 2;
    ensureSpace(rowH + 3);
    if (index % 2 === 0) {
      setColor(doc, 'fill', '#fbfdff');
      doc.rect(PAGE.margin, y, PAGE.contentWidth, rowH, 'F');
    }
    setColor(doc, 'text', COLORS.ink);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.text(String(index + 1), cols.sr, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.text(vehicleLines, cols.vehicle, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.text(categoryLines, cols.category, y + 5.5);
    doc.setFont('helvetica', 'bold');
    money(doc, item.car.price, cols.price, y + 6);
    setColor(doc, 'draw', COLORS.line);
    doc.line(PAGE.margin, y + rowH, PAGE.width - PAGE.margin, y + rowH);
    y += rowH;
  });

  y += 7;
  section('Illustrative price & tax summary', 'portfolio demo model');
  const rows = [
    ['Vehicle subtotal', order.taxBreakdown.basePrice],
    ['GST (illustrative)', order.taxBreakdown.gst],
    ['Road tax & RTO (illustrative)', order.taxBreakdown.roadTax],
    ['Insurance (illustrative)', order.taxBreakdown.insurance],
    ['Registration charges', order.taxBreakdown.registration],
    ['TCS', order.taxBreakdown.tcs],
    ['FASTag', order.taxBreakdown.fastTag],
    ['Extended warranty', order.taxBreakdown.extendedWarranty],
  ];
  rows.forEach(([label, value], index) => {
    ensureSpace(6);
    setColor(doc, 'text', index === rows.length - 1 ? COLORS.ink : COLORS.muted);
    doc.setFont('helvetica', index === rows.length - 1 ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.text(String(label), 20, y);
    setColor(doc, 'text', COLORS.ink);
    money(doc, Number(value), 190, y);
    y += 5.5;
  });
  y += 1;
  setColor(doc, 'draw', COLORS.ink);
  doc.setLineWidth(0.5);
  doc.line(PAGE.margin, y, PAGE.width - PAGE.margin, y);
  y += 8;
  setColor(doc, 'fill', '#fff8e1');
  doc.roundedRect(PAGE.margin, y - 4, PAGE.contentWidth, 14, 2, 2, 'F');
  setColor(doc, 'text', COLORS.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL ORDER VALUE', 20, y + 4);
  setColor(doc, 'text', COLORS.gold);
  money(doc, order.taxBreakdown.grandTotal, 190, y + 4);
  y += 18;

  section('Payment & delivery');
  setColor(doc, 'text', COLORS.muted);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text('PAYMENT METHOD', leftX, y);
  doc.text('ORDER STATUS', rightX, y);
  y += 5;
  setColor(doc, 'text', COLORS.ink);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(order.paymentMethod, leftX, y);
  doc.text(order.status, rightX, y);
  y += 6;
  setColor(doc, 'text', COLORS.muted);
  doc.setFontSize(7.2);
  doc.text('ESTIMATED DELIVERY', leftX, y);
  y += 5;
  setColor(doc, 'text', COLORS.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(order.estimatedDeliveryDate, leftX, y);
  y += 12;

  section('Document verification status');
  const documentRows = [
    ['Identity proof', order.documentVerification?.identityProof],
    ['Address proof', order.documentVerification?.addressProof],
    ['PAN / Form 60/61', order.documentVerification?.panOrForm60],
    ['Customer confirmation', order.documentVerification?.customerConsent],
  ];
  documentRows.forEach(([label, verified]) => {
    ensureSpace(7);
    setColor(doc, 'text', COLORS.ink);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(String(label), 20, y);
    setColor(doc, 'text', verified ? COLORS.green : '#b91c1c');
    doc.setFont('helvetica', 'bold');
    doc.text(verified ? 'READY FOR SHOWROOM VERIFICATION' : 'PENDING', 190, y, { align: 'right' });
    y += 5.5;
  });
  y += 7;

  setColor(doc, 'fill', COLORS.panel);
  const note = "Important: This portfolio PDF is a computer-generated order summary, not an official GST/tax invoice, payment receipt, registration certificate, or government document. Tax, RTO, insurance and registration figures shown here use the project's illustrative demo model and must be replaced with verified transaction-specific values for production use.";
  const noteLines = wrap(doc, note, PAGE.contentWidth - 10);
  const noteH = noteLines.length * 4 + 10;
  ensureSpace(noteH + 5);
  doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, noteH, 2, 2, 'F');
  setColor(doc, 'text', COLORS.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.1);
  doc.text(noteLines, PAGE.margin + 5, y + 6);
  y += noteH + 8;

  setColor(doc, 'text', COLORS.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('AUTO SPOT HUB', PAGE.margin, y);
  setColor(doc, 'text', COLORS.muted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`${SITE_CONTACT.phoneDisplay} • ${SITE_CONTACT.email}`, PAGE.margin, y + 5);
  doc.text('Thank you for choosing Auto Spot Hub.', PAGE.width - PAGE.margin, y, { align: 'right' });
  drawFooter();

  doc.save(`AutoSpotHub_Order_Summary_${order.id}.pdf`);
}
