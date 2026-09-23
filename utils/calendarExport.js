import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

function pad(value) {
  return String(value).padStart(2, '0');
}

function toIcsDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 1);
    fallback.setHours(9, 0, 0, 0);
    return toIcsDate(fallback);
  }
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;
}

export function buildIcsCalendar({ title = 'NexuLex AI', dates = [] } = {}) {
  const events = (dates || []).map((item, index) => {
    const stamp = toIcsDate(item.date || Date.now() + 86400000);
    const summary = String(item.badge || item.label || item.note || title).replace(/\n/g, ' ');
    const description = String(item.note || item.label || '').replace(/\n/g, ' ');
    return [
      'BEGIN:VEVENT',
      `UID:nexulex-${index}-${stamp}@nexulex.ai`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${stamp}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      'END:VEVENT',
    ].join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NexuLex AI//Contract Reminders//EN',
    `X-WR-CALNAME:${title}`,
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
}

export async function shareIcsCalendar({ title, dates, filename = 'nexulex-reminders.ics' }) {
  const ics = buildIcsCalendar({ title, dates });
  const base = FileSystem.cacheDirectory || FileSystem.documentDirectory;
  const uri = `${base}${filename}`;
  await FileSystem.writeAsStringAsync(uri, ics, { encoding: FileSystem.EncodingType?.UTF8 || 'utf8' });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'text/calendar',
      dialogTitle: title,
      UTI: 'public.calendar-event',
    });
    return true;
  }
  return false;
}
