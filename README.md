# climate · time · sound

**Live: <https://mlfischer.github.io/climate-time-sound/>**

**EN** — A bilingual (English/German) teaching tool for **music, climate and
time series**. It turns real climate records into music, live in the browser:
warmer = higher pitch, extremes = accents, one month = one beat. No server, no
installation, no build step — a static web page that runs anywhere and scales
to any number of users.

**DE** — Ein zweisprachiges (Deutsch/Englisch) Lehrtool für **Musik, Klima und
Zeitreihen**. Es übersetzt echte Klimadaten live im Browser in Musik: wärmer =
höher, Extreme = Akzente, ein Monat = ein Schlag. Kein Server, keine
Installation, kein Build-Step — eine statische Webseite, die überall läuft und
beliebig skaliert.

---

## The three modes / Die drei Modi

| mode | EN | DE |
|------|----|----|
| **learn** | Guided signal path *data → mapping → sound*: choose a record — 22 bundled cities, the global HadCRUT series, or **any of 3,500+ Berkeley Earth places via worldwide search** (loaded live, e.g. Leipzig) — decompose it into tracks (melody = monthly values, bass = trend, pad = seasons, accents = extremes), and run six one-click listening experiments. A live legend shows, for every month, which value produces which note. | Geführter Signalweg *daten → übersetzung → klang*: Messreihe wählen — 22 gebündelte Städte, die globale HadCRUT-Reihe oder **über 3500 Berkeley-Earth-Orte per Weltsuche** (live geladen, z. B. Leipzig) — in Spuren zerlegen (Melodie = Monatswerte, Bass = Trend, Fläche = Saison, Akzente = Extreme), sechs Ein-Klick-Hörexperimente. Die Live-Legende zeigt für jeden Monat, welcher Wert welchen Ton erzeugt. |
| **studio** | Twelve finished style scores — dub techno (Berlin), acid (Chicago), trip-hop (London), neoclassical (Paris), deep ambient (Reykjavík) … Each card is a complete piece driven by the same mapping rules. **Endless loop mode** chains city after city gaplessly in the chosen style — continuous sound for installations. | Zwölf fertige Stil-Partituren — Dub Techno (Berlin), Acid (Chicago), Trip-Hop (London), Neoklassik (Paris), Deep Ambient (Reykjavík) … Jede Karte ist ein komplettes Stück nach denselben Übersetzungsregeln. Der **Endlosschleifen-Modus** hängt Stadt an Stadt nahtlos im gewählten Stil — Dauer-Sound für Installationen. |
| **paleo** | Deep time as a multitrack piece: 18 real records — LR04, EPICA CO₂/temperature, Vostok, NGRIP, Saharan dust (ODP 967), Lake Ohrid, Milankovitch cycles (Laskar 2004), African lake records … Eight curated constellations, four freely assignable tracks with level and **time-shift (lead–lag)**, key/scale choice, audible cycle lengths, a **"today" CO₂ marker** and four deep-time listening tasks. | Tiefenzeit als Mehrspur-Stück: 18 echte Reihen — LR04, EPICA-CO₂/Temperatur, Vostok, NGRIP, Sahara-Staub (ODP 967), Ohridsee, Milankovitch-Zyklen (Laskar 2004), afrikanische Seesedimente … Acht kuratierte Konstellationen, vier frei belegbare Spuren mit Pegel und **Zeit-Versatz (Lead–Lag)**, Tonart/Skala, hörbare Zykluslängen, ein **„Heute"-CO₂-Marker** und vier Tiefenzeit-Höraufgaben. |

Everything can be **exported as WAV** (rendered offline in the browser) and
**shared as a link** (all settings live in the URL).
Alles lässt sich **als WAV exportieren** (offline im Browser gerendert) und
**als Link teilen** (alle Einstellungen stecken in der URL).

## Quick start / Schnellstart

The app is a static site; it only needs any file server (ES modules and
`fetch` require http://, not file://):

```bash
cd climate-music-web
python3 -m http.server 8080        # or any static server
# open http://localhost:8080
```

Hosting: push the folder to GitHub Pages / Netlify / any web space — done.
Hosting: den Ordner auf GitHub Pages / Netlify / beliebigen Webspace legen — fertig.

## Why this technology / Warum diese Technologie

The previous version was an R/Shiny app with server-side WAV synthesis. That
architecture cannot serve a mass audience: every listener needs a running R
process, sound arrives only after a render round-trip, and free Shiny hosting
is capped. This version moves everything to the **Web Audio API**:

- real-time synthesis and instant feedback (toggle a track *while* it plays),
- zero hosting cost, unlimited users, works offline once loaded,
- reproducible: the same settings always render the identical piece,
- R remains what it is best at — data preparation
  ([tools/export_data.R](tools/export_data.R) regenerates all JSON in `data/`).

Die Vorversion war eine R/Shiny-App mit serverseitiger WAV-Synthese — für ein
Massenpublikum ungeeignet (ein R-Prozess pro Person, Rendern statt Echtzeit,
gedeckeltes Gratis-Hosting). Diese Fassung verlagert alles in die **Web Audio
API**: Echtzeit-Klang, sofortiges Feedback, null Hosting-Kosten, offline-fähig,
reproduzierbar. R bleibt, was es am besten kann: Datenaufbereitung.

## The mapping / Die Übersetzung

Deliberately simple and checkable — the rules are shown live in the app:

1. **Melody** — monthly anomaly, mapped onto two octaves of a musical scale
   (2 %–98 % quantiles of the window → note range). Warmer = higher.
2. **Bass** — the 10-year mean (the climate trend), one low note per beat.
3. **Pad** — the mean annual cycle (seasons); for the global record: the two
   hemispheres, panned left/right.
4. **Accents** — record months, heat runs, jumps and cold snaps become risers,
   cymbals, fills or bells depending on style.
5. **Time** — one month = one beat; in paleo mode one step = 1–5 millennia.

Styles change *only* tempo, timbre, rhythm patterns and effects — never the
data or the rules. That is the central teaching point: sonification is a
design decision on top of honest data.

## Structure / Struktur

```
climate-music-web/
├── index.html          # single page, three modes
├── css/style.css       # dark, reduced aesthetic (monochrome + signal red)
├── js/
│   ├── i18n.js         # every string in DE + EN
│   ├── data.js         # loading + material building (trend, season, flags)
│   ├── engine.js       # Web Audio: voices, drums, fx, ducking, WAV export
│   ├── score.js        # mapping rules + 12 style scores + paleo builder
│   ├── viz.js          # canvas: data score with playhead
│   └── app.js          # UI wiring, experiments, share links
├── data/               # pre-exported JSON (global, 22 cities, 16 paleo series)
├── tools/export_data.R # regenerates data/ from the R project + Berkeley Earth
└── docs/TEACHING.md    # classroom guide (DE/EN): lesson ideas per level
```

## Measured sound structure / Gemessene Klangstruktur

Following the original style analysis of the R project, the twelve styles were
verified by rendering each score offline (Web Audio, identical engine) and
measuring the audio: **bass** = share of low-frequency energy (<≈140 Hz),
**bright** = high-frequency emphasis, **width** = stereo side/mid ratio.
The styles order exactly as the genres predict:

| style | bass | bright | width | character |
|-------|-----:|-------:|------:|-----------|
| driving techno | 0.84 | 0.172 | 0.09 | brightest, rolling hats |
| electro | 0.82 | 0.159 | 0.10 | crisp, syncopated |
| hypnotic minimal | 0.84 | 0.152 | 0.10 | rolling 16ths, focused |
| industrial | 0.84 | 0.148 | 0.06 | hard, narrowest image |
| acid | 0.83 | 0.117 | 0.07 | resonant 303 line |
| melodic downtempo | 0.85 | 0.080 | 0.10 | warm, balanced |
| trip-hop | 0.89 | 0.069 | 0.10 | heaviest sub weight |
| dub techno | 0.82 | 0.067 | 0.11 | darkest beat style |
| breakbeat / idm | 0.86 | 0.068 | 0.09 | broken, mid-dark |
| deep ambient | 0.66 | 0.076 | **0.32** | widest, beatless |
| dark drone | 0.83 | **0.029** | 0.26 | darkest overall |
| neoclassical | **0.55** | 0.075 | 0.25 | intimate, quietest |

No clipping (peak ≤ 0.96), loudness consistent across styles. Reproduce in the
browser console: render any score with `OfflineAudioContext` via
`js/engine.js → renderWav()`.

## Data & credits / Daten & Quellen

HadCRUT 4.6 (Met Office Hadley Centre / CRU) · Berkeley Earth city records
(22 bundled; all others fetched live in the browser from
`data.berkeleyearth.org`) · NOAA Paleoclimate: LR04 (Lisiecki & Raymo 2005),
EPICA CO₂ (Bereiter et al. 2015), EPICA temperature (Jouzel et al. 2007),
Vostok (Petit et al. 1999), NGRIP (GICC05), Sanbao/Hulu (Wang et al. 2008),
orbital parameters (Laskar 2004), Chew Bahir / HSPDP, Lake Bosumtwi, GeoB
cores, ENSO PC1 (Kaboth-Bahr et al. 2021), Saharan dust ODP 967 Ti/Al (Grant
et al. 2022), Lake Ohrid ICDP potassium (Wagner et al. 2019). The datasets
remain the property of their providers.

Code and texts: MIT. Artist names in the studio are sonic references
("in the spirit of"), not endorsements.
