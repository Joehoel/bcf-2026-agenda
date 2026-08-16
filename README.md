# Vakantie & Big Church Festival 2026 — gedeelde agenda

De agenda wordt beheerd in `data/calendar.json`. De build maakt daaruit de website en `calendar.ics` voor iPhone-abonnementen.

## Lokaal

```bash
npm run build
npm run check
python3 -m http.server 8000 -d docs
```

Open daarna <http://localhost:8000>.

## Wijzigen

1. Pas `data/calendar.json` aan.
2. Voer `npm run build && npm run check` uit.
3. Commit en push naar `main`; GitHub Actions publiceert GitHub Pages.

De exacte campinglocatie, verzamelplek en enkele reistijden staan bewust als voorlopig gemarkeerd totdat de groep ze bevestigt.
