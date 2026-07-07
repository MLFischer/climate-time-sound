// i18n.js — all user-facing strings in German and English.
// Usage: t('key') returns the string in the active language.

export const LANGS = ['de', 'en'];

const STR = {
  // ---- app frame ----
  app_title: { de: 'climate · time · sound', en: 'climate · time · sound' },
  app_sub: { de: 'höre, wie aus Klimadaten Musik wird', en: 'hear climate data become music' },
  mode_learn: { de: 'lernen', en: 'learn' },
  mode_studio: { de: 'studio', en: 'studio' },
  mode_paleo: { de: 'paleo', en: 'paleo' },
  play: { de: 'abspielen', en: 'play' },
  stop: { de: 'stopp', en: 'stop' },
  download_wav: { de: 'als WAV speichern', en: 'save as WAV' },
  rendering: { de: 'rendert …', en: 'rendering …' },
  share_link: { de: 'link kopieren', en: 'copy link' },
  link_copied: { de: 'link kopiert — einfach weitergeben', en: 'link copied — share it' },
  loading: { de: 'lade daten …', en: 'loading data …' },
  data_error: { de: 'daten konnten nicht geladen werden', en: 'could not load data' },

  // ---- signal path ----
  signal_data: { de: 'daten', en: 'data' },
  signal_map: { de: 'übersetzung', en: 'mapping' },
  signal_sound: { de: 'klang', en: 'sound' },

  // ---- learn mode: sections ----
  sec_data: { de: '01 · daten — eine zeitreihe wählen', en: '01 · data — choose a time series' },
  sec_map: { de: '02 · übersetzung — daten werden noten', en: '02 · mapping — data becomes notes' },
  sec_sound: { de: '03 · klang — hören & vergleichen', en: '03 · sound — listen & compare' },
  sec_experiments: { de: 'experimente — geführte hör-aufgaben', en: 'experiments — guided listening tasks' },

  dataset: { de: 'messreihe', en: 'record' },
  city_search: { de: 'weltweite suche — alle Berkeley-Earth-orte', en: 'worldwide search — all Berkeley Earth places' },
  city_search_ph: { de: 'z. b. leipzig, quito, ulan bator …', en: 'e.g. leipzig, quito, ulaanbaatar …' },
  city_search_help: {
    de: 'Über 3500 Städte weltweit — auch mittelgroße wie Leipzig oder Kassel. Kuratierte Städte liegen lokal; alle anderen werden live von Berkeley Earth geladen (Internet nötig).',
    en: 'More than 3,500 cities worldwide — including mid-sized ones like Leipzig or Kassel. Curated cities are bundled; all others load live from Berkeley Earth (internet required).'
  },
  live_loading: { de: 'lade live von Berkeley Earth …', en: 'loading live from Berkeley Earth …' },
  live_error: {
    de: 'live-daten nicht erreichbar — prüfe die internetverbindung',
    en: 'live data unreachable — check your internet connection'
  },
  dataset_global: { de: 'Erde · global (HadCRUT)', en: 'Earth · global (HadCRUT)' },
  dataset_help: {
    de: 'Eine Messreihe = ein Ort. Pro Monat ein Wert. Die Kurve zeigt die Anomalie: die Abweichung vom langjährigen Mittel — nicht das Wetter eines Tages.',
    en: 'One record = one place. One value per month. The curve shows the anomaly: the deviation from the long-term mean — not the weather of a single day.'
  },
  years: { de: 'zeitfenster', en: 'time window' },
  years_help: {
    de: 'Was du erkennst, hängt vom Ausschnitt ab: kurze Fenster zeigen Rauschen, lange Fenster zeigen den Trend.',
    en: 'What you can see depends on the window: short windows show noise, long windows reveal the trend.'
  },
  melody_source: { de: 'melodie-quelle', en: 'melody source' },
  src_anomaly: { de: 'monatswerte (anomalie)', en: 'monthly values (anomaly)' },
  src_trend: { de: 'trend (10-jahres-mittel)', en: 'trend (10-year mean)' },
  src_blend: { de: 'mischung (monat + trend)', en: 'blend (month + trend)' },
  src_help: {
    de: 'Dieselbe Reihe, drei Sichten: Monatswerte springen (Rauschen), der Trend wandert langsam (Klima). Die Mischung zeigt beides.',
    en: 'Same series, three views: monthly values jump around (noise), the trend moves slowly (climate). The blend carries both.'
  },
  sound_world: { de: 'klangwelt', en: 'sound world' },
  sw_quiet: { de: 'still · klavier & streicher', en: 'quiet · piano & strings' },
  sw_warm: { de: 'warm · downtempo', en: 'warm · downtempo' },
  sw_electronic: { de: 'elektronisch · techno', en: 'electronic · techno' },
  sw_wide: { de: 'weit · ambient', en: 'wide · ambient' },
  sw_help: {
    de: 'Die Klangwelt ändert nur den Stil — die Daten und die Übersetzungsregeln bleiben gleich. Gleiche Kurve, anderes Gewand.',
    en: 'The sound world only changes the style — the data and the mapping rules stay the same. Same curve, different clothes.'
  },
  tempo: { de: 'tempo', en: 'tempo' },
  tempo_slow: { de: 'langsam', en: 'slow' },
  tempo_mid: { de: 'mittel', en: 'medium' },
  tempo_fast: { de: 'schnell', en: 'fast' },
  tempo_help: {
    de: 'Ein Monat = ein Schlag. Das Tempo bestimmt, wie viel Zeit pro Monat vergeht — und damit, ob du Einzelwerte oder den großen Bogen hörst.',
    en: 'One month = one beat. Tempo sets how much time passes per month — and whether you hear single values or the long arc.'
  },

  tracks_title: { de: 'spuren — die zeitreihe zerlegen', en: 'tracks — decompose the series' },
  tracks_help: {
    de: 'Jede Spur ist ein Bestandteil der Zeitreihe. Schalte sie einzeln an und aus, um Trend, Saison und Rauschen auseinanderzuhören.',
    en: 'Each track is one component of the time series. Toggle them to hear trend, season and noise separately.'
  },
  trk_melody: { de: 'melodie — monatswerte', en: 'melody — monthly values' },
  trk_bass: { de: 'bass — trend', en: 'bass — trend' },
  trk_pad: { de: 'fläche — jahreszeiten', en: 'pad — seasons' },
  trk_extremes: { de: 'akzente — extreme & rekorde', en: 'accents — extremes & records' },
  trk_beat: { de: 'beat — der takt der monate', en: 'beat — the pulse of months' },

  legend_title: { de: 'live-legende · daten → musik', en: 'live legend · data → music' },
  legend_idle: {
    de: 'Drücke abspielen — hier steht dann für jeden Monat, welcher Messwert gerade welchen Ton erzeugt.',
    en: 'Press play — this line will show, for every month, which measured value is producing which note.'
  },
  legend_line: {
    de: '{ym} · anomalie {val} °C → ton {note}',
    en: '{ym} · anomaly {val} °C → note {note}'
  },
  legend_rule: {
    de: 'regel: {lo} … {hi} °C → {range} in {scale}',
    en: 'rule: {lo} … {hi} °C → {range} in {scale}'
  },
  legend_rule_range: { de: '2 oktaven', en: '2 octaves' },
  viz_monthly: { de: 'monatswerte', en: 'monthly values' },
  viz_trend: { de: '10-jahres-trend', en: '10-year trend' },

  // ---- experiments ----
  exp_intro: {
    de: 'Kleine Hör-Aufgaben mit einem Klick. Jede stellt die Regler passend ein — du musst nur hören.',
    en: 'Small listening tasks, one click each. Each sets the controls for you — all you do is listen.'
  },
  exp1_t: { de: 'trend oder rauschen?', en: 'trend or noise?' },
  exp1_s: {
    de: 'Nur der Bass spielt: das 10-Jahres-Mittel. Höre, wie er über 140 Jahre langsam steigt — das ist der Klimatrend ohne das Zappeln der Monate.',
    en: 'Only the bass plays: the 10-year mean. Hear it slowly rise across 140 years — the climate trend without the jitter of single months.'
  },
  exp2_t: { de: 'die jahreszeiten hören', en: 'hear the seasons' },
  exp2_s: {
    de: 'Nur die Fläche spielt: das mittlere Jahresprofil von Moskau. Zwölf Töne, die sich jedes Jahr wiederholen — das Klima als Atem.',
    en: 'Only the pad plays: the mean annual cycle of Moscow. Twelve notes repeating every year — climate as breathing.'
  },
  exp3_t: { de: 'früher gegen heute', en: 'then versus now' },
  exp3_s: {
    de: 'Berlin 1880–1920, dann Berlin 1980–2020. Gleicher Ort, gleiche Regeln — höre, wie die Melodie in der zweiten Fassung höher liegt und unruhiger wird.',
    en: 'Berlin 1880–1920, then Berlin 1980–2020. Same place, same rules — notice how the melody sits higher and gets busier in the second version.'
  },
  exp3_a: { de: 'A · 1880–1920', en: 'A · 1880–1920' },
  exp3_b: { de: 'B · 1980–2020', en: 'B · 1980–2020' },
  exp4_t: { de: 'rekorde zählen', en: 'count the records' },
  exp4_s: {
    de: 'Nur Akzente: jeder Schlag ist ein Rekordmonat oder Hitzesprung. Zähle, wie sie sich zum Ende hin häufen — Extreme sind nicht mehr selten.',
    en: 'Accents only: every hit is a record month or heat jump. Count how they cluster towards the end — extremes are no longer rare.'
  },
  exp5_t: { de: 'lokal gegen global', en: 'local versus global' },
  exp5_s: {
    de: 'Die globale Reihe ist glatter als jede Stadt: über die ganze Erde gemittelt verschwindet das Wetter, der Trend bleibt. Vergleiche mit deiner Stadt.',
    en: 'The global series is smoother than any city: averaged over the whole planet, weather cancels out and the trend remains. Compare with your city.'
  },
  exp6_t: { de: 'tropen gegen arktis', en: 'tropics versus arctic' },
  exp6_s: {
    de: 'Singapur schwankt kaum, Reykjavík stark — und der Norden erwärmt sich schneller (polare Verstärkung). Zwei Orte, zwei Klimacharaktere.',
    en: 'Singapore barely varies, Reykjavík swings widely — and the north warms faster (polar amplification). Two places, two climate characters.'
  },
  exp6_a: { de: 'A · Singapur', en: 'A · Singapore' },
  exp6_b: { de: 'B · Reykjavík', en: 'B · Reykjavík' },

  // ---- studio: transport & length ----
  seek_title: { de: 'position — ziehen zum vorspulen', en: 'position — drag to seek' },
  studio_len: { de: 'dauer', en: 'duration' },
  len_normal: { de: 'normal · ~4 min', en: 'normal · ~4 min' },
  len_long: { de: 'lang · ~8 min', en: 'long · ~8 min' },
  len_epic: { de: 'episch · ~17 min', en: 'epic · ~17 min' },
  len_hint: {
    de: '170 jahre dürfen dauern — mit dem regler oben spulst du jederzeit vor und zurück.',
    en: '170 years may take their time — the slider above lets you seek at any point.'
  },

  // ---- studio: endless loop ----
  loop_label: {
    de: '∞ endlosschleife — die daten wandern von stadt zu stadt',
    en: '∞ endless loop — the data travels from city to city'
  },
  loop_hint: {
    de: 'Der Stil bleibt, die Stadt wechselt: Am Ende jedes Stücks wird nahtlos die nächste Messreihe im selben Stil angehängt — Dauer-Sound für Installation, Hintergrund oder Ausstellung.',
    en: 'The style stays, the city changes: at the end of each piece the next record is chained seamlessly in the same style — continuous sound for installations, background or exhibitions.'
  },
  loop_armed: {
    de: 'schleife aktiv — wähle eine stil-karte',
    en: 'loop armed — pick a style card'
  },
  loop_now: {
    de: 'läuft: {city} · als nächstes: {next}',
    en: 'playing: {city} · up next: {next}'
  },

  // ---- studio ----
  studio_intro: {
    de: 'Zwölf fertige Stil-Partituren über die volle Messreihe 1850–2020: ein Monat = eine Sechzehntel, ~170 Jahre in gut vier Minuten. Die Daten bestimmen Melodie, Bass und Akzente — höre, wie das Stück zum Ende hin steigt. Klick = spielen.',
    en: 'Twelve finished style scores across the full record 1850–2020: one month = one sixteenth note, ~170 years in just over four minutes. The data drives melody, bass and accents — hear the piece climb towards the end. Click to play.'
  },
  studio_now: { de: 'gerade geladen', en: 'now loaded' },
  refs: { de: 'im geiste von', en: 'in the spirit of' },

  // ---- paleo ----
  paleo_intro: {
    de: 'Tiefenzeit: Hunderttausende Jahre Erdgeschichte als Mehrspur-Stück. Lege Orbitalzyklen unter Eis, CO₂ und Temperatur und höre, wie das Klima im Takt der Erdbahn atmet. Abspielrichtung: von der Vergangenheit bis heute.',
    en: 'Deep time: hundreds of thousands of years of Earth history as a multitrack piece. Layer orbital cycles beneath ice, CO₂ and temperature and hear the climate breathe in the rhythm of Earth\'s orbit. Playback runs from the past to today.'
  },
  paleo_constellations: { de: 'konstellationen — ein klick, ein thema', en: 'constellations — one click, one theme' },
  paleo_tracks: { de: 'spuren', en: 'tracks' },
  paleo_track: { de: 'spur', en: 'track' },
  paleo_off: { de: '— aus —', en: '— off —' },
  paleo_span: { de: 'zeitspanne', en: 'time span' },
  paleo_kyr: { de: 'kyr = tausend jahre', en: 'kyr = thousand years' },
  paleo_voice: { de: 'stimme', en: 'voice' },
  paleo_octave: { de: 'lage', en: 'register' },
  voice_pad: { de: 'fläche', en: 'pad' },
  voice_bass: { de: 'bass', en: 'bass' },
  voice_pluck: { de: 'pluck', en: 'pluck' },
  voice_lead: { de: 'melodie', en: 'lead' },
  voice_bell: { de: 'glocke', en: 'bell' },
  oct_low: { de: 'tief', en: 'low' },
  oct_mid: { de: 'mittel', en: 'mid' },
  oct_high: { de: 'hoch', en: 'high' },
  paleo_info_title: { de: 'was höre ich da?', en: 'what am I hearing?' },
  paleo_gain: { de: 'pegel', en: 'level' },
  paleo_offset: { de: 'versatz', en: 'shift' },
  paleo_offset_help: {
    de: 'Zeit-Versatz in Jahrtausenden: Verschiebe eine Spur gegen die anderen. Klingt die Kopplung (z. B. CO₂ ↔ Temperatur) noch stimmig? So testet man Führen und Folgen (lead–lag).',
    en: 'Time shift in millennia: slide one track against the others. Does the coupling (e.g. CO₂ ↔ temperature) still sound right? This is how you probe lead–lag relationships.'
  },
  paleo_root: { de: 'grundton', en: 'root' },
  paleo_scale: { de: 'skala', en: 'scale' },
  sc_minor: { de: 'moll', en: 'minor' },
  sc_dorian: { de: 'dorisch', en: 'dorian' },
  sc_pentMinor: { de: 'pentatonik', en: 'pentatonic' },
  sc_major: { de: 'dur', en: 'major' },
  sc_phrygian: { de: 'phrygisch', en: 'phrygian' },
  paleo_periods: {
    de: 'hörbare zyklen bei diesem tempo: ~100 kyr (exzentrizität) ≈ {p100} s · ~41 kyr (obliquität) ≈ {p41} s · ~21 kyr (präzession) ≈ {p21} s',
    en: 'audible cycles at this tempo: ~100 kyr (eccentricity) ≈ {p100} s · ~41 kyr (obliquity) ≈ {p41} s · ~21 kyr (precession) ≈ {p21} s'
  },
  paleo_today: { de: 'heute-marker: CO₂ 424 ppm am ende', en: 'today marker: CO₂ 424 ppm at the end' },
  paleo_today_help: {
    de: 'In 800.000 Jahren Eiszeit-Welt lag CO₂ zwischen ~180 und ~280 ppm. Der Schlusston am Ende des Stücks liegt so weit über allem Gehörten, wie das heutige CO₂ (424 ppm, 2024) über dieser Spanne liegt — in Jahrzehnten statt Jahrtausenden erreicht.',
    en: 'Across 800,000 years of the ice-age world, CO₂ stayed between ~180 and ~280 ppm. The closing tone sits as far above everything you just heard as today\'s CO₂ (424 ppm, 2024) sits above that range — reached in decades, not millennia.'
  },
  paleo_experiments: { de: 'hör-aufgaben — tiefenzeit', en: 'listening tasks — deep time' },
  pexp1_t: { de: 'den 100.000-jahre-takt zählen', en: 'count the 100,000-year beat' },
  pexp1_s: {
    de: 'Nur das Eisvolumen (LR04), 800.000 Jahre. Zähle die großen Wellen: etwa acht Eiszeit-Zyklen — der Takt der Exzentrizität.',
    en: 'Ice volume only (LR04), 800,000 years. Count the big waves: roughly eight glacial cycles — the beat of eccentricity.'
  },
  pexp2_t: { de: 'CO₂ & temperatur im gleichschritt', en: 'CO₂ & temperature in lockstep' },
  pexp2_s: {
    de: 'Bass = CO₂, Melodie = Antarktis-Temperatur, kein Versatz. Höre, wie eng beide gekoppelt schwingen — das ist die zentrale Kopplung des Klimasystems.',
    en: 'Bass = CO₂, melody = Antarctic temperature, no shift. Hear how tightly the two swing together — the central coupling of the climate system.'
  },
  pexp3_t: { de: 'was passiert bei +20.000 jahren versatz?', en: 'what happens at a +20,000-year shift?' },
  pexp3_s: {
    de: 'Gleiche Spuren, aber das CO₂ läuft 20 kyr versetzt: Das Zusammenspiel zerfällt hörbar. So prüft man, wie eng zwei Größen wirklich gekoppelt sind.',
    en: 'Same tracks, but CO₂ shifted by 20 kyr: the interplay audibly falls apart. This is how you test how tightly two quantities are really coupled.'
  },
  pexp4_t: { de: 'abrupt gegen langsam', en: 'abrupt versus slow' },
  pexp4_s: {
    de: 'Grönland (NGRIP), 10–60 kyr: Dansgaard-Oeschger-Sprünge innerhalb von Jahrzehnten. Vergleiche mit dem langsamen Eis-Takt aus Aufgabe 1 — Kippen klingt anders als Schwingen.',
    en: 'Greenland (NGRIP), 10–60 kyr: Dansgaard–Oeschger jumps within decades. Compare with the slow ice beat from task 1 — tipping sounds different from cycling.'
  },
  pc_sahara_t: { de: 'sahara-staub & mittelmeer', en: 'saharan dust & mediterranean' },
  pc_sahara_s: {
    de: 'Ti/Al aus ODP 967 (Ostmittelmeer): Staub aus der Sahara im Takt der Präzession — grüne Sahara, trockene Sahara, alle ~21.000 Jahre. Präzession als Fläche darunter.',
    en: 'Ti/Al from ODP 967 (E. Mediterranean): Saharan dust pulsing with precession — green Sahara, dry Sahara, every ~21,000 years. Precession as the pad beneath.'
  },
  pc_ohrid_t: { de: 'ohrid · europas ältester see', en: 'ohrid · europe\'s oldest lake' },
  pc_ohrid_s: {
    de: '1,3 Millionen Jahre Lake Ohrid (ICDP): Kalium zeigt Erosion und Gletschertakt auf dem Balkan — quer durch die Mittelpleistozäne Wende, unterlegt mit dem globalen Eis.',
    en: '1.3 million years of Lake Ohrid (ICDP): potassium tracks erosion and glacial pacing in the Balkans — across the Mid-Pleistocene Transition, with global ice beneath.'
  },

  pc_iceages_t: { de: 'eiszeiten & CO₂', en: 'ice ages & CO₂' },
  pc_iceages_s: {
    de: '800.000 Jahre: Eisvolumen (LR04) als Melodie, CO₂ als Bass, Antarktis-Temperatur als Fläche. Höre, wie alle drei gemeinsam schwingen — der ~100.000-Jahre-Takt der Eiszeiten.',
    en: '800,000 years: ice volume (LR04) as melody, CO₂ as bass, Antarctic temperature as pad. Hear all three swing together — the ~100,000-year beat of the ice ages.'
  },
  pc_milank_t: { de: 'milankovitch', en: 'milankovitch' },
  pc_milank_s: {
    de: 'Die drei Erdbahn-Zyklen übereinander: Exzentrizität (~100 kyr, tiefe Fläche), Obliquität (~41 kyr, mittlere Stimme), Präzession (~21 kyr, schnellste Stimme) — dazu das Eis, das ihnen folgt.',
    en: 'The three orbital cycles layered: eccentricity (~100 kyr, deep pad), obliquity (~41 kyr, middle voice), precession (~21 kyr, fastest voice) — plus the ice that follows them.'
  },
  pc_africa_t: { de: 'ostafrika · wiege der menschheit', en: 'east africa · cradle of humankind' },
  pc_africa_s: {
    de: '500.000 Jahre Feucht-Trocken-Wechsel am Chew Bahir (Äthiopien) — die Klimabühne der menschlichen Evolution, unterlegt mit dem globalen Eistakt.',
    en: '500,000 years of wet–dry cycles at Chew Bahir (Ethiopia) — the climate stage of human evolution, underlaid with the global ice beat.'
  },
  pc_do_t: { de: 'grönland · abrupte sprünge', en: 'greenland · abrupt jumps' },
  pc_do_s: {
    de: 'NGRIP, 10–60 kyr: die Dansgaard-Oeschger-Ereignisse. Kein sanftes Schwingen — das Klima kann innerhalb von Jahrzehnten kippen. Genau das macht abrupte Übergänge so brisant.',
    en: 'NGRIP, 10–60 kyr: the Dansgaard–Oeschger events. No gentle swinging — climate can flip within decades. That is exactly why abrupt transitions matter.'
  },
  pc_monsoon_t: { de: 'asiatischer monsun', en: 'asian monsoon' },
  pc_monsoon_s: {
    de: 'Höhlensinter aus China (Sanbao/Hulu) im ~21.000-Jahre-Takt der Präzession — der Monsun folgt dem Taumeln der Erdachse. Lege die Präzessionsspur darunter und höre die Kopplung.',
    en: 'Chinese cave records (Sanbao/Hulu) pulsing to the ~21,000-year precession beat — the monsoon follows the wobble of Earth\'s axis. Layer the precession track underneath and hear the coupling.'
  },
  pc_enso_t: { de: 'ENSO & ozean', en: 'ENSO & ocean' },
  pc_enso_s: {
    de: 'Der Leitmodus des afrikanischen Hydroklimas (PC1 aus 11 Archiven) über der Meeresoberflächentemperatur des Südostatlantiks — Fernwirkungen über Ozeanbecken hinweg.',
    en: 'The leading mode of African hydroclimate (PC1 from 11 archives) above sea-surface temperature of the SE Atlantic — teleconnections across ocean basins.'
  },

  // ---- didactic panel (bottom) ----
  did_learn_title: { de: 'warum hören?', en: 'why listen?' },
  did_learn_body: {
    de: 'Ein Diagramm zeigt alles auf einmal — Musik zwingt dich, die Zeit mitzugehen. Das Ohr erkennt Muster, Wiederholung und Beschleunigung oft schneller als das Auge. Genau darum geht es hier: Trend, Saison und Rauschen nicht nur sehen, sondern als verschiedene Bewegungen spüren. Die Übersetzung ist bewusst einfach und überprüfbar: wärmer = höher, Extreme = Akzente, ein Monat = ein Schlag.',
    en: 'A chart shows everything at once — music makes you walk through time. The ear often detects patterns, repetition and acceleration faster than the eye. That is the point here: not just seeing trend, season and noise, but feeling them as different kinds of motion. The mapping is deliberately simple and checkable: warmer = higher, extremes = accents, one month = one beat.'
  },
  did_studio_title: { de: 'gleiche daten, anderer stil', en: 'same data, different style' },
  did_studio_body: {
    de: 'Jede Partitur nutzt dieselben Übersetzungsregeln — nur Tempo, Klangfarben und Rhythmusmuster ändern sich. Dass ein Datensatz als Dub, Acid oder Kammermusik funktioniert, zeigt: Sonifikation ist eine Gestaltungsentscheidung. Die Künstlernennungen sind Klang-Referenzen („im Geiste von"), keine Nachbildung.',
    en: 'Every score uses the same mapping rules — only tempo, timbres and rhythm patterns change. That one dataset works as dub, acid or chamber music shows: sonification is a design decision. Artist names are sonic references ("in the spirit of"), not imitations.'
  },
  did_paleo_title: { de: 'von menschenzeit zu erdzeit', en: 'from human time to earth time' },
  did_paleo_body: {
    de: 'Im Lern- und Studio-Modus ist ein Schlag ein Monat. Hier ist ein Schlag ein Jahrtausend oder mehr. Die natürlichen Zyklen sind langsam und regelmäßig — die heutige Erwärmung wäre in diesem Tempo ein einzelner, steiler Schlag am Ende des Stücks. Proxy heißt: Wir messen nicht die Temperatur selbst, sondern Spuren, die sie hinterlassen hat (Isotope, Gasbläschen, Staub).',
    en: 'In learn and studio mode, one beat is one month. Here one beat is a millennium or more. The natural cycles are slow and regular — at this tempo today\'s warming would be a single steep beat at the very end of the piece. Proxy means: we do not measure temperature itself but the traces it left behind (isotopes, gas bubbles, dust).'
  },

  // ---- footer ----
  footer_sources: {
    de: 'Daten: HadCRUT (Met Office/CRU) · Berkeley Earth · NOAA Paleoclimate (LR04 Lisiecki & Raymo 2005, EPICA Bereiter 2015 / Jouzel 2007, Vostok Petit 1999, NGRIP, Sanbao Wang 2008, Laskar 2004, HSPDP/Chew Bahir u. a.). Musik & Code: MIT-Lizenz. Läuft komplett im Browser — keine Daten verlassen dein Gerät.',
    en: 'Data: HadCRUT (Met Office/CRU) · Berkeley Earth · NOAA Paleoclimate (LR04 Lisiecki & Raymo 2005, EPICA Bereiter 2015 / Jouzel 2007, Vostok Petit 1999, NGRIP, Sanbao Wang 2008, Laskar 2004, HSPDP/Chew Bahir et al.). Music & code: MIT license. Runs entirely in your browser — no data leaves your device.'
  },

  // ---- style cards (title/desc per style) ----
  sty_dub_t: { de: 'dub techno · Berlin', en: 'dub techno · Berlin' },
  sty_dub_d: { de: 'tief, dunkel, hallende akkorde — der trend als sub-bass', en: 'deep, dark, echoing chords — the trend as sub bass' },
  sty_hypnotic_t: { de: 'hypnotic minimal · Tokyo', en: 'hypnotic minimal · Tokyo' },
  sty_hypnotic_d: { de: 'ein rollendes pattern, die anomalie als endlose linie', en: 'one rolling pattern, the anomaly as an endless line' },
  sty_driving_t: { de: 'driving techno · Detroit', en: 'driving techno · Detroit' },
  sty_driving_d: { de: 'treibend & hell — hitzemonate zünden die hi-hats', en: 'driving & bright — hot months ignite the hi-hats' },
  sty_acid_t: { de: 'acid · Chicago', en: 'acid · Chicago' },
  sty_acid_d: { de: 'die 303-linie: je wärmer der monat, desto offener der filter', en: 'the 303 line: the warmer the month, the wider the filter opens' },
  sty_electro_t: { de: 'electro · New York', en: 'electro · New York' },
  sty_electro_d: { de: 'synkopierte bässe, knackige claps, datensprünge als fills', en: 'syncopated bass, crisp claps, data jumps as fills' },
  sty_industrial_t: { de: 'industrial · Birmingham', en: 'industrial · Birmingham' },
  sty_industrial_d: { de: 'verzerrte kicks — sprünge und kälteeinbrüche schlagen metallisch an', en: 'distorted kicks — jumps and cold snaps strike like metal' },
  sty_idm_t: { de: 'breakbeat / idm · Manchester', en: 'breakbeat / idm · Manchester' },
  sty_idm_d: { de: 'zerlegte beats: das rauschen der daten wird zum groove', en: 'broken beats: the noise in the data becomes the groove' },
  sty_downtempo_t: { de: 'melodic downtempo · Lissabon', en: 'melodic downtempo · Lisbon' },
  sty_downtempo_d: { de: 'warme akkorde, weicher puls — der freundlichste einstieg', en: 'warm chords, soft pulse — the friendliest entry point' },
  sty_triphop_t: { de: 'trip-hop · London', en: 'trip-hop · London' },
  sty_triphop_d: { de: 'schwerer beat, vinylknistern, moll — die stadt bei nacht', en: 'heavy beat, vinyl crackle, minor key — the city at night' },
  sty_neoclassic_t: { de: 'neoklassik · Paris', en: 'neoclassical · Paris' },
  sty_neoclassic_d: { de: 'klavier & streicher, kein beat — die daten als kammermusik', en: 'piano & strings, no beat — the data as chamber music' },
  sty_ambient_t: { de: 'deep ambient · Reykjavík', en: 'deep ambient · Reykjavík' },
  sty_ambient_d: { de: 'weite flächen, kein takt — der trend als langsames licht', en: 'wide pads, no meter — the trend as slow light' },
  sty_drone_t: { de: 'dark drone · Oslo', en: 'dark drone · Oslo' },
  sty_drone_d: { de: 'sehr tief, sehr langsam — klima als geologische kraft', en: 'very deep, very slow — climate as a geological force' },

  // ---- paleo dataset labels & descriptions ----
  pd_lr04: { de: 'LR04 · globales eisvolumen (δ¹⁸O)', en: 'LR04 · global ice volume (δ¹⁸O)' },
  pd_lr04_d: {
    de: 'Globales Eisvolumen aus benthischem δ¹⁸O (57 Ozeankerne, Lisiecki & Raymo 2005). Hoch = mehr Eis = kälter. Zeigt die Glazial-Interglazial-Zyklen.',
    en: 'Global ice volume from benthic δ¹⁸O (57 ocean cores, Lisiecki & Raymo 2005). High = more ice = colder. Shows the glacial–interglacial cycles.'
  },
  pd_epica_co2: { de: 'EPICA · CO₂', en: 'EPICA · CO₂' },
  pd_epica_co2_d: {
    de: 'Atmosphärisches CO₂ aus antarktischem Eis (EPICA Dome C, Bereiter 2015): ~180 ppm (Eiszeit) bis ~280 ppm (Warmzeit), 0–800 kyr. Heute: über 420 ppm.',
    en: 'Atmospheric CO₂ from Antarctic ice (EPICA Dome C, Bereiter 2015): ~180 ppm (glacial) to ~280 ppm (interglacial), 0–800 kyr. Today: above 420 ppm.'
  },
  pd_epica_temp: { de: 'EPICA · temperatur', en: 'EPICA · temperature' },
  pd_epica_temp_d: {
    de: 'Temperatur über der Antarktis aus Deuterium im Eis (Jouzel 2007), 0–800 kyr. Läuft eng mit dem CO₂ — höre die Kopplung.',
    en: 'Temperature over Antarctica from deuterium in ice (Jouzel 2007), 0–800 kyr. Tracks CO₂ closely — listen for the coupling.'
  },
  pd_vostok_co2: { de: 'Vostok · CO₂', en: 'Vostok · CO₂' },
  pd_vostok_co2_d: {
    de: 'CO₂ aus dem Vostok-Eiskern, Antarktis (Petit 1999) — der klassische Rekord, 0–420 kyr.',
    en: 'CO₂ from the Vostok ice core, Antarctica (Petit 1999) — the classic record, 0–420 kyr.'
  },
  pd_vostok_temp: { de: 'Vostok · temperatur', en: 'Vostok · temperature' },
  pd_vostok_temp_d: {
    de: 'Temperatur aus dem Vostok-Eiskern, Antarktis (Petit 1999), 0–420 kyr.',
    en: 'Temperature from the Vostok ice core, Antarctica (Petit 1999), 0–420 kyr.'
  },
  pd_chew_k: { de: 'Chew Bahir · kalium (Ostafrika)', en: 'Chew Bahir · potassium (East Africa)' },
  pd_chew_k_d: {
    de: 'Kalium aus dem Chew-Bahir-Bohrkern, Äthiopien (HSPDP). Proxy für Trockenheit (hoch = trocken), ~0–500 kyr — Schauplatz der menschlichen Evolution.',
    en: 'Potassium from the Chew Bahir core, Ethiopia (HSPDP). Aridity proxy (high = dry), ~0–500 kyr — the stage of human evolution.'
  },
  pd_bosumtwi: { de: 'Bosumtwi · kalium (Westafrika)', en: 'Bosumtwi · potassium (West Africa)' },
  pd_bosumtwi_d: {
    de: 'Kalium aus dem Kratersee Bosumtwi, Ghana. Proxy für den westafrikanischen Monsun (feucht/trocken), ~0–470 kyr.',
    en: 'Potassium from crater lake Bosumtwi, Ghana. Proxy for the West African monsoon (wet/dry), ~0–470 kyr.'
  },
  pd_geob1016_sst: { de: 'GeoB1016 · meeresoberfläche (SST)', en: 'GeoB1016 · sea surface (SST)' },
  pd_geob1016_sst_d: {
    de: 'Meeresoberflächentemperatur aus Alkenonen, Angola-Becken / tropischer SO-Atlantik, ~0–205 kyr, ~20–27 °C.',
    en: 'Sea-surface temperature from alkenones, Angola Basin / tropical SE Atlantic, ~0–205 kyr, ~20–27 °C.'
  },
  pd_enso_pc1: { de: 'ENSO · afrik. hydroklima (PC1)', en: 'ENSO · African hydroclimate (PC1)' },
  pd_enso_pc1_d: {
    de: 'Leitmodus (PC1) des afrikanischen Hydroklimas aus 11 Archiven (Kaboth-Bahr 2021), gekoppelt an Walker-Zirkulation / ENSO-Dynamik, 12–617 kyr.',
    en: 'Leading mode (PC1) of African hydroclimate from 11 archives (Kaboth-Bahr 2021), coupled to Walker circulation / ENSO-like dynamics, 12–617 kyr.'
  },
  pd_ngrip: { de: 'NGRIP · Grönland (δ¹⁸O)', en: 'NGRIP · Greenland (δ¹⁸O)' },
  pd_ngrip_d: {
    de: 'δ¹⁸O aus dem grönländischen NGRIP-Eiskern (GICC05). Zeigt die abrupten Dansgaard-Oeschger-Sprünge der letzten Eiszeit, ~10–60 kyr.',
    en: 'δ¹⁸O from the Greenland NGRIP ice core (GICC05). Shows the abrupt Dansgaard–Oeschger jumps of the last glacial, ~10–60 kyr.'
  },
  pd_sanbao: { de: 'Sanbao/Hulu · asiat. monsun (δ¹⁸O)', en: 'Sanbao/Hulu · Asian monsoon (δ¹⁸O)' },
  pd_sanbao_d: {
    de: 'δ¹⁸O chinesischer Höhlensinter (Wang 2008). Proxy für den ostasiatischen Sommermonsun, stark präzessionsgetaktet (~21 kyr), ~127–390 kyr.',
    en: 'δ¹⁸O of Chinese cave speleothems (Wang 2008). Proxy for the East Asian summer monsoon, strongly precession-paced (~21 kyr), ~127–390 kyr.'
  },
  pd_geob1028_nam: { de: 'GeoB1028 · SO-Atlantik (NAM1)', en: 'GeoB1028 · SE Atlantic (NAM1)' },
  pd_geob1028_nam_d: {
    de: 'NAM1-Rekord vom namibischen Kontinentalrand (Kaboth-Bahr 2021). Proxy für Auftrieb/Feuchte, ~12–413 kyr.',
    en: 'NAM1 record from the Namibian margin (Kaboth-Bahr 2021). Proxy for upwelling/moisture, ~12–413 kyr.'
  },
  pd_kl15_cati: { de: 'KL15 · Chew Bahir Ca/Ti', en: 'KL15 · Chew Bahir Ca/Ti' },
  pd_kl15_cati_d: {
    de: 'Ca/Ti aus dem Chew-Bahir-Langkern KL15. Karbonat/Detritus-Verhältnis als Feucht-Trocken-Proxy in Ostafrika, ~0–550 kyr.',
    en: 'Ca/Ti from the Chew Bahir long core KL15. Carbonate/detrital ratio as a wet–dry proxy in East Africa, ~0–550 kyr.'
  },
  pd_odp967_tial: { de: 'ODP 967 · sahara-staub (Ti/Al)', en: 'ODP 967 · Saharan dust (Ti/Al)' },
  pd_odp967_tial_d: {
    de: 'Ti/Al aus dem Ostmittelmeer (ODP 967, Grant 2022): Staub-Eintrag aus der Sahara. Hoch = trocken/staubig, tief = „grüne Sahara". Stark präzessionsgetaktet, 0–5000 kyr.',
    en: 'Ti/Al from the Eastern Mediterranean (ODP 967, Grant 2022): Saharan dust input. High = dry/dusty, low = "green Sahara". Strongly precession-paced, 0–5000 kyr.'
  },
  pd_ohrid_k: { de: 'Lake Ohrid · kalium (ICDP)', en: 'Lake Ohrid · potassium (ICDP)' },
  pd_ohrid_k_d: {
    de: 'Kalium aus dem ICDP-Kern des Ohridsees (Nordmazedonien/Albanien, Wagner 2019) — Europas ältester See. Proxy für Erosion/Glazialdynamik, ~0–1360 kyr.',
    en: 'Potassium from the ICDP core of Lake Ohrid (N. Macedonia/Albania, Wagner 2019) — Europe\'s oldest lake. Proxy for erosion/glacial dynamics, ~0–1360 kyr.'
  },
  pd_ecc: { de: 'orbital · exzentrizität (~100/405 kyr)', en: 'orbital · eccentricity (~100/405 kyr)' },
  pd_ecc_d: {
    de: 'Exzentrizität der Erdbahn (Laskar 2004) — wie elliptisch sie ist, ~100- & 405-kyr-Zyklen. Moduliert die Stärke der Präzession.',
    en: 'Eccentricity of Earth\'s orbit (Laskar 2004) — how elliptical it is, ~100 & 405 kyr cycles. Modulates the strength of precession.'
  },
  pd_obl: { de: 'orbital · obliquität (~41 kyr)', en: 'orbital · obliquity (~41 kyr)' },
  pd_obl_d: {
    de: 'Neigung der Erdachse (Laskar 2004), ~41-kyr-Zyklus. Steuert die Saisonalität, besonders in hohen Breiten.',
    en: 'Tilt of Earth\'s axis (Laskar 2004), ~41 kyr cycle. Controls seasonality, especially at high latitudes.'
  },
  pd_prec: { de: 'orbital · präzession (~21 kyr)', en: 'orbital · precession (~21 kyr)' },
  pd_prec_d: {
    de: 'Das Taumeln der Erdachse (Laskar 2004), ~19–23-kyr-Zyklen. Steuert das Timing der Jahreszeiten entlang der Bahn.',
    en: 'The wobble of Earth\'s axis (Laskar 2004), ~19–23 kyr cycles. Sets the timing of the seasons along the orbit.'
  }
};

let lang = (localStorage.getItem('cms_lang')
  || (navigator.language || 'en').slice(0, 2)) === 'de' ? 'de' : 'en';

export function getLang() { return lang; }

export function setLang(l) {
  lang = LANGS.includes(l) ? l : 'en';
  localStorage.setItem('cms_lang', lang);
}

export function t(key, vars) {
  const entry = STR[key];
  let s = entry ? (entry[lang] || entry.en) : key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace('{' + k + '}', v);
  return s;
}

// Apply translations to all elements carrying data-i18n attributes.
export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
  root.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
}
