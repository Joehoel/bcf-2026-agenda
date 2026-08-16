import fs from 'node:fs';
const data = JSON.parse(fs.readFileSync(new URL('../data/calendar.json', import.meta.url), 'utf8'));
const ids = new Set();
for (const e of data.events) {
  if (!e.id || !e.title) throw new Error('Event mist id of titel');
  if (ids.has(e.id)) throw new Error(`Dubbel event-id: ${e.id}`);
  ids.add(e.id);
  if (e.allDay) {
    if (!e.startDate || !e.endDate || e.startDate >= e.endDate) throw new Error(`Ongeldige datum: ${e.id}`);
  } else {
    if (!e.start || !e.end || !(e.timezone || e.startTimezone) || !(e.timezone || e.endTimezone)) throw new Error(`Ongeldige tijd: ${e.id}`);
  }
}
const ics = fs.readFileSync(new URL('../docs/calendar.ics', import.meta.url), 'utf8');
for (const id of ids) if (!ics.includes(`UID:${id}@bcf-2026-agenda`)) throw new Error(`Event ontbreekt in ICS: ${id}`);
if ((ics.match(/BEGIN:VEVENT/g) || []).length !== data.events.length) throw new Error('Aantal ICS-events klopt niet');
if ((ics.match(/BEGIN:VTIMEZONE/g) || []).length !== 3) throw new Error('Tijdzones ontbreken in ICS');
for (const line of ics.split('\r\n')) {
  if (Buffer.byteLength(line, 'utf8') > 75) throw new Error(`ICS-regel langer dan 75 bytes: ${line}`);
}
if (!ics.endsWith('\r\n')) throw new Error('ICS moet eindigen met CRLF');

const html = fs.readFileSync(new URL('../docs/index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../docs/styles.css', import.meta.url), 'utf8');
if ((html.match(/data-event-id=/g) || []).length !== data.events.length) throw new Error('HTML bevat niet alle agenda-events');
for (const event of data.events) {
  if (!html.includes(`data-event-id="${event.id}"`)) throw new Error(`Event ontbreekt in HTML: ${event.id}`);
}
if ((html.match(/class="open-item"/g) || []).length !== data.openItems.length) throw new Error('HTML bevat niet alle openstaande punten');
if (html.includes("fetch('calendar.json')")) throw new Error('HTML mag niet afhankelijk zijn van client-side JSON-rendering');
if (!css.includes('--apple-blue: #0071e3') || !css.includes('--apple-gray: #f5f5f7')) throw new Error('Apple-design tokens ontbreken');
if (!css.includes('-apple-system')) throw new Error('Apple system-font stack ontbreekt');
const workflow = fs.readFileSync(new URL('../.github/workflows/pages.yml', import.meta.url), 'utf8');
if (!workflow.includes('contents: write')) throw new Error('Pages-workflow kan gegenereerde HTML niet terugschrijven');
if (!workflow.includes('git add docs')) throw new Error('Pages-workflow synchroniseert docs niet met de agenda');
console.log(`OK: ${data.events.length} unieke events; JSON, ICS en HTML zijn consistent.`);
