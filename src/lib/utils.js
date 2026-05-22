import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid } from 'date-fns';
import { id } from 'date-fns/locale';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num, options = {}) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return new Intl.NumberFormat('id-ID', options).format(num);
}

export function formatCompact(num) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 2 }).format(num);
}

export function formatCurrency(num, currency = 'USD') {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatPercent(num, decimals = 2) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return `${Number(num).toFixed(decimals)}%`;
}

export function formatDate(dateStr, fmt = 'dd MMMM yyyy') {
  if (!dateStr) return '—';
  try {
    let date;
    if (typeof dateStr === 'number') {
      date = new Date(dateStr);
    } else if (typeof dateStr === 'string') {
      date = parseISO(dateStr);
      if (!isValid(date)) date = new Date(dateStr);
    } else {
      date = dateStr;
    }
    if (!isValid(date)) return String(dateStr);
    return format(date, fmt, { locale: id });
  } catch {
    return String(dateStr);
  }
}

export function formatDateShort(dateStr) {
  return formatDate(dateStr, 'dd MMM yyyy');
}

export function formatDateTime(dateStr) {
  return formatDate(dateStr, 'dd MMM yyyy, HH:mm');
}

export function parseMagnitude(str) {
  if (typeof str === 'number') return str;
  const match = String(str).match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

export function parseDepth(str) {
  if (typeof str === 'number') return str;
  const match = String(str).match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

export function getDepthCategory(depthKm) {
  if (depthKm < 60) return 'Dangkal';
  if (depthKm <= 300) return 'Menengah';
  return 'Dalam';
}

export function truncate(str, len = 50) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

export function generateFilename(prefix, ext) {
  const date = format(new Date(), 'yyyyMMdd');
  return `datakita_${prefix}_${date}.${ext}`;
}
