import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/calendar.json'), 'utf8'));
const out = path.join(root, 'docs');
fs.mkdirSync(out, { recursive: true });

const esc = value => String(value ?? '')
  .replaceAll('\\', '\\\\')
  .replaceAll('\n', '\\n')
  .replaceAll(',', '\\,')
  .replaceAll(';', '\\;');

const fold = line => {
  const chunks = [];
  let current = '';
  for (const char of line) {
    if (Buffer.byteLength(current + char, 'utf8') > 73) {
      chunks.push(current);
      current = ` ${char}`;
    } else current += char;
  }
  chunks.push(current);
  return chunks.join('\r\n');
};

const stamp = data.calendar.lastUpdated.replaceAll('-', '') + 'T120000Z';
const eventLines = data.events.flatMap(event => {
  const lines = [
    'BEGIN:VEVENT',
    `UID:${event.id}@bcf-2026-agenda`,
    `DTSTAMP:${stamp}`,
    `SUMMARY:${esc(event.title)}`
  ];
  if (event.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${event.startDate.replaceAll('-', '')}`);
    lines.push(`DTEND;VALUE=DATE:${event.endDate.replaceAll('-', '')}`);
  } else {
    const fmt = value => value.replaceAll('-', '').replaceAll(':', '');
    const stz = event.startTimezone || event.timezone;
    const etz = event.endTimezone || event.timezone;
    lines.push(`DTSTART;TZID=${stz}:${fmt(event.start)}`);
    lines.push(`DTEND;TZID=${etz}:${fmt(event.end)}`);
  }
  if (event.location) lines.push(`LOCATION:${esc(event.location)}`);
  if (event.description) lines.push(`DESCRIPTION:${esc(event.description)}`);
  if (event.status) lines.push(`STATUS:${event.status.toUpperCase()}`);
  lines.push('END:VEVENT');
  return lines;
});

const ics = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//BCF 2026 groep//Vakantieagenda//NL',
  'CALSCALE:GREGORIAN',
  'METHOD:PUBLISH',
  `X-WR-CALNAME:${esc(data.calendar.name)}`,
  `X-WR-CALDESC:${esc(data.calendar.description)}`,
  `X-WR-TIMEZONE:${data.calendar.timezone}`,
  ...eventLines,
  'END:VCALENDAR',
  ''
].map(fold).join('\r\n');

fs.writeFileSync(path.join(out, 'calendar.ics'), ics);
fs.copyFileSync(path.join(root, 'data/calendar.json'), path.join(out, 'calendar.json'));
fs.copyFileSync(path.join(root, 'site/index.html'), path.join(out, 'index.html'));
fs.copyFileSync(path.join(root, 'site/styles.css'), path.join(out, 'styles.css'));
console.log(`Built ${data.events.length} events into docs/calendar.ics`);
