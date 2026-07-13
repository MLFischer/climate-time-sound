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
| **classic** | Six scores "in the spirit of" great composers, each in their city: canon after **Bach · Leipzig**, Alberti bass after **Mozart · Vienna**, sforzato motifs after **Beethoven · Bonn**, rubato nocturne after **Chopin · Warsaw**, gymnopédie after **Satie · Paris**, additive minimal after **Glass/Reich · New York**. Quantiles of climate state and variability divide every piece into sections (solo · duo · agitato · tutti) joined by cadences — data-driven musical form, visible as fine lines in the plot. | Sechs Partituren „im Geiste von" großen Komponisten, je in ihrer Stadt: Kanon nach **Bach · Leipzig**, Alberti-Bass nach **Mozart · Wien**, Sforzato-Motive nach **Beethoven · Bonn**, Rubato-Nocturne nach **Chopin · Warschau**, Gymnopédie nach **Satie · Paris**, additive Minimal Music nach **Glass/Reich · New York**. Quantile von Klimazustand und Varianz gliedern jedes Stück in Abschnitte (solo · duo · agitato · tutti) mit Kadenzen — datengetriebene Form, im Plot als feine Linien sichtbar. |
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
6. **Climate state (macro)** — the variance-expanded trend drives register,
   loudness, brightness and harmony (warm decades get richer chords): the
   piece audibly fills up as the state rises.
7. **Decadal variability** — the rolling spread of the anomaly drives
   rhythmic complexity: ghost notes, syncopation, fills and ornaments.
8. **Decade cadence** — every 1860, 1870, … sets a deep anchor tone and a
   small fill, giving the large-scale form audible chapters.

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

The twelve full-record pieces (1850–2020) were verified by rendering their
**cold opening (1850s)** and **hot ending (2010s)** offline (Web Audio,
identical engine) and measuring the audio: **bright** = high-frequency
emphasis, **width** = stereo side/mid ratio. Two findings:

1. The styles order as their genres predict (electro brightest, drone darkest,
   ambient widest, industrial/acid narrowest, neoclassical most intimate).
2. **The dramaturgy is measurable**: brightness rises from the cold start to
   the hot end in *every* style — the climate-state rules audibly fill the
   pieces up.

| style | bright 1850s → 2010s | width | character |
|-------|:--------------------:|------:|-----------|
| electro | 0.21 → **0.32** | 0.10 | brightest, crisp, syncopated |
| hypnotic minimal | 0.14 → 0.29 | 0.11 | rolling 16ths, focused |
| driving techno | 0.22 → 0.22 | 0.09 | bright throughout, relentless |
| industrial | 0.16 → 0.21 | **0.06** | hard, narrowest image |
| acid | 0.16 → 0.21 | 0.07 | resonant 303, filter = anomaly |
| melodic downtempo | 0.07 → 0.19 | 0.10 | warm, balanced |
| breakbeat / idm | 0.13 → 0.17 | 0.10 | broken, mid-dark |
| neoclassical | 0.10 → 0.17 | 0.27 | intimate, lowest bass share |
| ambient | 0.09 → 0.18 | **0.37** | widest, beatless |
| dub techno | 0.07 → 0.15 | 0.11 | darkest beat style |
| trip-hop | 0.11 → 0.15 | 0.10 | heaviest slow foundation |
| dark drone | **0.04 → 0.08** | 0.33 | darkest overall — brightness doubles |

Guaranteed clip-free: a final tanh stage caps the master at 1.0 with true-peak
headroom (worst measured peak 0.965 across all styles and both windows).

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
