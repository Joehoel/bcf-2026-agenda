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
console.log(`OK: ${data.events.length} unieke events; JSON en ICS zijn consistent.`);
