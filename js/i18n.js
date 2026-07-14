// i18n.js — all user-facing strings in German and English.
// Usage: t('key') returns the string in the active language.

export const LANGS = ['de', 'en'];

const STR = {
  // ---- app frame ----
  app_title: { de: 'climate · time · sound', en: 'climate · time · sound' },
  app_sub: { de: 'höre, wie aus Klimadaten Musik wird', en: 'hear climate data become music' },
  theme_toggle: { de: 'hell/dunkel umschalten', en: 'toggle light/dark' },
  mode_learn: { de: 'lernen', en: 'learn' },
  mode_studio: { de: 'studio', en: 'studio' },
  mode_classic: { de: 'classic', en: 'classic' },
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
  viz_played: { de: 'gespielter ton', en: 'played note' },
  stage_link_hint: {
    de: 'lesehilfe · so hängen daten und musik zusammen: graue linie = monatswerte · rote linie = 10-jahres-trend (bass) · helle striche = der ton, der wirklich klingt · weißer faden am zeiger = ring (messwert) wird zu punkt (ton) — der moment der übersetzung · rotes halo = ein extrem erklingt · zarte helligkeitsstufen im hintergrund = satz-intensität 1–5 aus der quantil-dramaturgie, ihre grenzen tragen kadenzen (linien).',
    en: 'how to read it · how data and music connect: grey line = monthly values · red line = 10-year trend (bass) · pale dashes = the note that actually sounds · white thread at the playhead = ring (measurement) becomes dot (note) — the moment of translation · red halo = an extreme is sounding · faint brightness bands = section intensity 1–5 from the quantile dramaturgy, their boundaries carry cadences (lines).'
  },

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
  len_snippet: { de: '30 s · 2000–2020', en: '30 s · 2000–2020' },
  len_normal: { de: '~4 min', en: '~4 min' },
  len_long: { de: '~8 min', en: '~8 min' },
  len_epic: { de: 'episch · ~17 min', en: 'epic · ~17 min' },
  len_hint: {
    de: '170 Jahre dürfen dauern — mit dem Regler oben spulst du jederzeit vor und zurück.',
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
    de: 'Zwölf fertige Stil-Partituren über die volle Messreihe 1850–2020: ein Monat = eine Sechzehntel, ~170 Jahre in gut vier Minuten. Die Daten bestimmen Melodie, Bass und Akzente, die Quantil-Dramaturgie die Form: ruhig gerankte Segmente dünnen aus, intensive füllen sich, starke Abfälle werden Breakdowns (die Kick setzt aus). Höre, wie das Stück zum Ende hin steigt. Klick = spielen.',
    en: 'Twelve finished style scores across the full record 1850–2020: one month = one sixteenth note, ~170 years in just over four minutes. The data drives melody, bass and accents; the quantile dramaturgy drives the form: low-ranked segments thin out, intense ones fill up, sharp drops become breakdowns (the kick rests). Hear the piece climb towards the end. Click to play.'
  },
  studio_now: { de: 'gerade geladen', en: 'now loaded' },
  refs: { de: 'im geiste von', en: 'in the spirit of' },

  // ---- studio classic ----
  classic_intro: {
    de: 'Sechs Partituren „im Geiste von" großen Komponist:innen — jede in ihrer Stadt: Bach in Leipzig, Mozart in Wien, Beethoven in Bonn … Die Form macht die Quantil-Dramaturgie: 8-Jahres-Segmente werden nach ihrem Klimazustands-Mittel gerankt (→ Intensität 1–5: solo/pp bis tutti/f) und nach ihrer Varianz (→ Charakter: cantabile · mosso · agitato). Jedes Segment hat eigene Regeln, Übergänge tragen Kadenzen nach Sprunghöhe, ★ markiert die Klimax. Die Live-Legende zeigt das aktuelle Segment, der Plot seine Grenzen.',
    en: 'Six scores "in the spirit of" great composers — each in their city: Bach in Leipzig, Mozart in Vienna, Beethoven in Bonn … The form comes from the quantile dramaturgy: 8-year segments are ranked by their mean climate state (→ intensity 1–5: solo/pp to tutti/f) and by their variability (→ character: cantabile · mosso · agitato). Each segment has its own rules, transitions carry cadences weighted by the jump, ★ marks the climax. The live legend names the current segment, the plot shows its boundaries.'
  },
  did_classic_title: { de: 'form aus daten', en: 'form from data' },
  did_classic_body: {
    de: 'Klassische Musik lebt von Gliederung: Sätze, Phrasen, Kadenzen. Hier übernimmt das Klima die Rolle des Komponisten-Plans — ruhige, kalte Jahrzehnte werden Solo-Passagen, warme werden Tutti, unruhige werden Agitato. Die Namen sind Klang-Referenzen („im Geiste von"), keine Nachbildung: Es sind synthetische Stücke, deren Grammatik sich an historischen Stilen orientiert. Der Vergleich mit dem Studio zeigt die Kernidee des Projekts: gleiche Daten, andere Gestaltung.',
    en: 'Classical music lives on structure: movements, phrases, cadences. Here the climate takes over the role of the composer\'s plan — calm, cold decades become solo passages, warm ones tutti, restless ones agitato. The names are sonic references ("in the spirit of"), not reconstructions: these are synthetic pieces whose grammar leans on historical styles. Comparing with the studio shows the project\'s core idea: same data, different design.'
  },
  cl_bach_t: { de: 'kanon · nach J. S. Bach · Leipzig', en: 'canon · after J. S. Bach · Leipzig' },
  cl_bach_d: { de: 'achtel-motorik & ein kanon: das klima imitiert sich selbst', en: 'motoric eighths & a canon: the climate imitates itself' },
  cl_bach_map: {
    de: 'Jeder Monat ist ein Ton der Cembalo-Motorik (Toccata-Puls, ~7 Töne/s). Die zweite Stimme ist ein **Kanon**: dieselbe Datenmelodie, acht Monate später, eine Quinte tiefer — das Klima imitiert sich selbst. Darunter schreitet ein Continuo aus tiefen Cembalo-Vierteln (Grundton/Quinte). Agitato schiebt Durchgangsnoten ein, hohe Intensität eine dritte Stimme in der Oktave; im Solo-Segment steht die Linie allein wie in einer Partita.',
    en: 'Every month is one tone of the harpsichord motor (toccata pulse, ~7 notes/s). The second voice is a **canon**: the same data melody, eight months later, a fifth below — the climate imitates itself. Beneath, a continuo of low harpsichord quarters walks root/fifth. Agitato inserts passing notes, high intensity adds a third voice at the octave; in solo segments the line stands alone, partita-like.'
  },
  cl_bach_why: {
    de: 'Bachs Sprache ist Kontrapunkt: unabhängige Stimmen, die sich streng aufeinander beziehen, über einer laufenden Motorik. Ein Kanon aus Klimadaten ist die ehrlichste Form davon — die zweite Stimme erfindet nichts, sie IST die erste, nur versetzt. Leipzig, die Stadt des Thomaskantors, liefert die Messreihe.',
    en: 'Bach\'s language is counterpoint: independent voices in strict relation above a running motor. A canon made of climate data is its most honest form — the second voice invents nothing, it IS the first, merely shifted. Leipzig, the Thomaskantor\'s city, provides the record.'
  },
  cl_mozart_t: { de: 'alberti · nach W. A. Mozart · Wien', en: 'alberti · after W. A. Mozart · Vienna' },
  cl_mozart_d: { de: 'dur, elegante phrasen, alberti-bass — anmut über den daten', en: 'major key, elegant phrases, alberti bass — grace over the data' },
  cl_mozart_map: {
    de: 'Als einziges Stück in **Dur**. Die Melodie singt in hoher Lage — ein Ton pro vier Monate (Viertelmittel), mit auflösenden Vorhalten an den Phrasenenden: die klassische Geste der Eleganz. Die Monatsdaten selbst trägt der **Alberti-Bass** (Grundton–Quinte–Terz–Quinte als flirrende Sechzehntel). Niedrige Intensität dünnt zur Basslinie aus, hohe fügt Streicher hinzu; cantabile halbiert die Figuration.',
    en: 'The only piece in a **major key**. The melody sings high — one tone per four months (quarter means), with resolving appoggiaturas at phrase ends: the classical gesture of elegance. The month-by-month data lives in the **Alberti bass** (root–fifth–third–fifth as shimmering sixteenths). Low intensity thins to a bass line, high adds strings; cantabile halves the figuration.'
  },
  cl_mozart_why: {
    de: 'Mozart heißt: singende Melodie über durchsichtiger Begleitung, Ordnung mit Charme. Der Alberti-Bass ist seine bekannteste Begleitfigur, der aufgelöste Vorhalt seine typischste Wendung. Dass die Daten in Dur plötzlich freundlich klingen, ist selbst eine Lektion: Die Skala ist eine Gestaltungsentscheidung, nicht die Wahrheit der Daten. Wien war seine Wahlheimat.',
    en: 'Mozart means: a singing melody above transparent accompaniment, order with charm. The Alberti bass is his best-known figure, the resolved appoggiatura his most typical turn. That the data suddenly sounds friendly in major is itself a lesson: the scale is a design decision, not the truth of the data. Vienna was his chosen home.'
  },
  cl_beethoven_t: { de: 'motiv · nach L. v. Beethoven · Bonn', en: 'motif · after L. v. Beethoven · Bonn' },
  cl_beethoven_d: { de: 'sforzato auf extremen, das motiv in tiefen oktaven', en: 'sforzato on extremes, the motif stated in low octaves' },
  cl_beethoven_map: {
    de: 'Hitzemonate und Rekorde schlagen als **Sforzato** an: doppelt so laut, mit Oktavverdopplung — die Extreme der Daten werden zu dramatischen Akzenten. Zu Beginn jedes Abschnitts stellt der Bass das **Motiv** vor: die Kontur der ersten vier Monate, wuchtig in tiefen Oktaven. Agitato-Abschnitte bekommen Streicher-Tremolo, Dekadenwechsel donnern als Akkord.',
    en: 'Hot months and records strike as **sforzato**: twice as loud, with octave doubling — the data\'s extremes become dramatic accents. At the start of each section the bass states the **motif**: the contour of its first four months, weighty in low octaves. Agitato sections get string tremolo, decade turns thunder as chords.'
  },
  cl_beethoven_why: {
    de: 'Beethoven ist Entwicklung aus einem Kern: Ein knappes Motiv wird behauptet, wiederholt, durchgesetzt — und Dynamik ist bei ihm Argument, nicht Schmuck. Dass hier die Daten selbst das Motiv jedes Abschnitts liefern und ihre Extreme die Sforzati setzen, überträgt genau diese Logik. Bonn ist seine Geburtsstadt.',
    en: 'Beethoven is development from a kernel: a terse motif asserted, repeated, driven through — and dynamics are argument, not ornament. Here the data itself supplies each section\'s motif and its extremes place the sforzati, carrying over exactly that logic. Bonn is his birthplace.'
  },
  cl_chopin_t: { de: 'nocturne · nach F. Chopin · Warschau', en: 'nocturne · after F. Chopin · Warsaw' },
  cl_chopin_d: { de: 'arpeggien, rubato aus der varianz, verzierungen auf rekorden', en: 'arpeggios, rubato from variability, ornaments on records' },
  cl_chopin_map: {
    de: 'Die linke Hand rollt einen **Arpeggio-Bogen** über zwei Oktaven (den Akkord des Klimazustands, ein Ton je zwei Monate), die rechte singt einen langen Ton pro acht Monate — echtes Nocturne-Tempo. Das **Rubato** ist datengesteuert: je höher die dekadische Varianz, desto freier schwankt das Timing (agitato verdoppelt es). Rekordmonate bekommen im Agitato eine fünftönige Verzierungskaskade.',
    en: 'The left hand rolls an **arpeggio arc** across two octaves (the climate-state chord, one tone per two months) while the right sings one long tone per eight months — true nocturne pace. The **rubato** is data-driven: the higher the decadal variability, the freer the timing sways (agitato doubles it). Record months receive a five-note ornamental cascade in agitato.'
  },
  cl_chopin_why: {
    de: 'Ein Chopin-Nocturne ist gesungene Nacht: weite Bassbögen, darüber eine Stimme, die sich Zeit nimmt. Rubato — das Dehnen und Raffen der Zeit — ist seine Signatur; hier bekommt es zum ersten Mal eine messbare Ursache: die Unruhe des Klimas selbst. Warschau ist die Stadt seiner Jugend.',
    en: 'A Chopin nocturne is night, sung: wide bass arcs beneath a voice that takes its time. Rubato — stretching and gathering time — is his signature; here, for once, it has a measurable cause: the restlessness of the climate itself. Warsaw is the city of his youth.'
  },
  cl_satie_t: { de: 'gymnopédie · nach E. Satie · Paris', en: 'gymnopédie · after E. Satie · Paris' },
  cl_satie_d: { de: 'schwebender dreiertakt, viel raum — die ruhigste lesart', en: 'floating triple meter, lots of space — the calmest reading' },
  cl_satie_map: {
    de: 'Ein schwebender Dreiertakt von gut zwei Sekunden (18 Monate = ein Takt): Bass auf der Eins, zwei weiche Klavierakkorde danach — das Gymnopédie-Muster. Die Melodie setzt einen Ton pro Takt (das 1,5-Jahres-Mittel), dorisch, ohne Eile; agitato erlaubt einen zweiten. Nach starken Intensitätsabfällen hält das Stück einen Atemzug inne. Fast nichts passiert — genau dadurch hört man den langen Wandel.',
    en: 'A floating triple meter of a good two seconds (18 months = one bar): bass on one, two soft piano chords after — the gymnopédie pattern. The melody places one tone per bar (the 1.5-year mean), dorian, unhurried; agitato allows a second. After strong intensity drops the piece pauses for a breath. Almost nothing happens — which is exactly why the long change becomes audible.'
  },
  cl_satie_why: {
    de: 'Satie erfand Musik als Möbel: Wiederholung ohne Drama, Schönheit ohne Anspruch auf Aufmerksamkeit. Für eine Reihe, deren Botschaft im langsamen Driften liegt, ist das die vielleicht ehrlichste Form — nichts lenkt vom Trend ab. Paris, Montmartre, sein Revier.',
    en: 'Satie invented furniture music: repetition without drama, beauty without demanding attention. For a series whose message lies in slow drift this may be the most honest form — nothing distracts from the trend. Paris, Montmartre, his territory.'
  },
  cl_glass_t: { de: 'minimal · nach Glass & Reich · New York', en: 'minimal · after Glass & Reich · New York' },
  cl_glass_d: { de: 'additive 16tel-zellen — agitato macht aus 6 tönen 7', en: 'additive 16th cells — agitato turns 6 notes into 7' },
  cl_glass_map: {
    de: 'Eine Sechzehntel-Zelle aus sechs Tönen kreist über dem Akkord des Klimazustands; ihre Lage folgt dem Jahresmittel der Daten. Zwei Regeln tragen den Stil: **additiv** (agitato macht aus sechs Tönen sieben — der Takt kippt ins Ungerade, wie bei Glass) und **Phasing** (ab mittlerer Intensität läuft eine zweite Stimme einen Monat versetzt — wie bei Reich). Hohe Intensität fügt Bass-Oktaven, Streicher und Glocken auf Hitzemonaten hinzu.',
    en: 'A sixteenth-note cell of six tones circles above the climate-state chord; its register follows the yearly mean of the data. Two rules carry the style: **additive** (agitato turns six tones into seven — the meter tips odd, as with Glass) and **phasing** (from mid intensity a second voice runs one month behind — as with Reich). High intensity adds bass octaves, strings and bells on hot months.'
  },
  cl_glass_why: {
    de: 'Minimal Music (Glass, Reich) baut Größe aus kleinsten Zellen und lässt Wandel als Prozess hörbar werden — genau die Erfahrung, um die es hier geht: Man bemerkt die Veränderung erst, wenn sie schon geschehen ist. Die additive Technik (6→7) ist Glass\' Markenzeichen; New York das Labor beider.',
    en: 'Minimal music (Glass, Reich) builds scale from the smallest cells and makes change audible as process — precisely the experience at stake here: you notice the change only once it has already happened. The additive technique (6→7) is Glass\' trademark; New York the laboratory of both.'
  },

  // ---- paleo ----
  paleo_intro: {
    de: 'Tiefenzeit: Hunderttausende Jahre Erdgeschichte, hörbar gemacht. Wähl unten eine Klangart, dann eine Konstellation — und höre, wie das Klima im Takt der Erdbahn atmet. Abspielrichtung: von der Vergangenheit bis heute.',
    en: 'Deep time: hundreds of thousands of years of Earth history, made audible. Pick a sound approach below, then a constellation — and hear the climate breathe in the rhythm of Earth\'s orbit. Playback runs from the past to today.'
  },
  paleo_approach: { de: 'klangart', en: 'sound approach' },
  appr_struktur: { de: 'struktur', en: 'layered' },
  appr_elektro: { de: 'elektro', en: 'electronic' },
  appr_classic: { de: 'klassik', en: 'classical' },
  appr_struktur_hint: {
    de: 'Struktur: alle gewählten Reihen gleichzeitig als übereinandergelegte Tonspuren — der klassische Mehrspur-Modus des Labs. Feinabstimmung (Spuren, Tonart, Versatz) unten unter „Feinabstimmung".',
    en: 'Layered: all chosen series at once as stacked voices — the lab\'s classic multitrack mode. Fine-tuning (tracks, key, lead–lag) below under "advanced".'
  },
  appr_elektro_hint: {
    de: 'Elektro: die Leitreihe der Konstellation wird zu einem elektronischen Stück — dieselben Regeln wie im Studio (wärmer = höher, Extreme = Akzente), plus Quantil-Dramaturgie (Segmente, Breakdowns). Ein Klick, ein Groove.',
    en: 'Electronic: the constellation\'s lead series becomes an electronic piece — the same rules as the studio (warmer = higher, extremes = accents) plus the quantile dramaturgy (segments, breakdowns). One click, one groove.'
  },
  appr_classic_hint: {
    de: 'Klassik: die Leitreihe als Kammermusik (Klavier & Streicher, im Geiste Saties) — ruhig, weit, mit datengetriebener Form. Ideal, um eine einzelne Tiefenzeit-Kurve zu „lesen".',
    en: 'Classical: the lead series as chamber music (piano & strings, in the spirit of Satie) — calm, spacious, with data-driven form. Ideal for "reading" a single deep-time curve.'
  },
  paleo_advanced: { de: 'feinabstimmung — spuren, tonart, versatz', en: 'advanced — tracks, key, lead–lag' },
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

  // ---- style info modal ----
  modal_map_title: { de: 'übersetzung — so entsteht dieser stil', en: 'mapping — how this style is built' },
  modal_why_title: { de: 'warum trifft das den stil?', en: 'why does this hit the style?' },
  modal_common_title: { de: 'grundregeln (in allen stilen gleich)', en: 'ground rules (identical in every style)' },
  sty_common: {
    de: 'Melodie = Monatswerte (wärmer = höher, 2 Oktaven) · Bass = 10-Jahres-Trend · Fläche = Jahreszeiten · Akzente = Extreme, Rekorde, Sprünge · Klima-Varianz = Ghost-Notes & Verzierungen. Form: Die Quantil-Dramaturgie rankt 8-Jahres-Segmente nach Klimazustands-Mittel (→ Intensität 1–5) und Varianz (→ cantabile/mosso/agitato) — jedes Segment hat eigene Regeln, Übergänge tragen Kadenzen, ★ ist die Klimax. Alles davon ist im Plot sichtbar (Lesehilfe unter der Legende) — jeder Klang hat eine zeigbare Daten-Ursache.',
    en: 'Melody = monthly values (warmer = higher, 2 octaves) · bass = 10-year trend · pad = seasons · accents = extremes, records, jumps · climate variability = ghost notes & ornaments. Form: the quantile dramaturgy ranks 8-year segments by mean climate state (→ intensity 1–5) and by variability (→ cantabile/mosso/agitato) — each segment has its own rules, transitions carry cadences, ★ is the climax. All of it is visible in the plot (reading guide below the legend) — every sound has a data cause you can point at.'
  },
  sty_dub_map: {
    de: 'Auf der Offbeat-Sechzehntel jedes Beats schlägt ein Moll-Akkord-Stab an, gebaut aus der Anomalie des jeweiligen Monats — in warmen Dekaden mit Septime. Er läuft in ein langes, dunkles Dub-Delay (punktierte Achtel, hohe Rückkopplung). Darunter: runder Sub-Bass auf dem Trend, fast stumme Hi-Hats, Sidechain-Pumpen auf jeder Kick.',
    en: 'On the offbeat sixteenth of every beat a minor chord stab strikes, built from that month\'s anomaly — with a seventh in warm decades. It feeds a long, dark dub delay (dotted eighth, high feedback). Beneath: round sub bass on the trend, nearly silent hi-hats, sidechain pumping on every kick.'
  },
  sty_dub_why: {
    de: 'Dub Techno (Basic Channel, Deepchord) ist definiert durch hallende Offbeat-Akkorde über tiefem, weichem Bass und viel Raum — Ereignisse verschwimmen zu Fahnen. Gemessen ist dies der dunkelste Beat-Stil der Engine, mit rundem, tiefem Fundament: genau die Basic-Channel-Signatur. Dass die Akkorde vom Klima wandern, ersetzt die Dub-typischen Mixpult-Fahrten.',
    en: 'Dub techno (Basic Channel, Deepchord) is defined by echoing offbeat chords over deep, soft bass and lots of space — events blur into tails. Measured, this is the engine\'s darkest beat style, with a round, deep foundation: precisely the Basic Channel signature. The chords drifting with the climate replaces the genre\'s classic mixing-desk rides.'
  },
  sty_hypnotic_map: {
    de: 'Jede Monats-Sechzehntel ist ein Pluck: abwechselnd der Anomalie-Ton und seine Quinte — ein rollendes, nie endendes Pattern. Die Pentatonik hält jede Kombination konsonant, 16tel-Hats mit Akzentmuster rollen mit, der Bass setzt nur jeden zweiten Beat.',
    en: 'Every month-sixteenth is a pluck: alternating the anomaly note and its fifth — one rolling, never-ending pattern. The pentatonic scale keeps every combination consonant, accented 16th hats roll along, the bass lands only every other beat.'
  },
  sty_hypnotic_why: {
    de: 'Hypnotic/Minimal (Donato Dozzy, Plastikman) wiederholt kleinste Zellen, bis Zeitgefühl kippt — Trance durch Mikrovariation statt Wechsel. Hier liefert die Datenrate selbst das Pattern: Das Klima variiert die Zelle jeden Monat minimal, nie identisch, nie brechend. Mono-nah und fokussiert, wie es der Stil verlangt.',
    en: 'Hypnotic/minimal (Donato Dozzy, Plastikman) repeats tiny cells until the sense of time tips — trance through micro-variation instead of change. Here the data rate itself is the pattern: the climate varies the cell slightly every month, never identical, never breaking. Near-mono and focused, exactly as the style demands.'
  },
  sty_driving_map: {
    de: 'Akkord-Stabs aus der Anomalie alle zwei Beats, dazu rollende 16tel-Hats, Offbeat-Open-Hat und Claps auf 2 und 4 — die hellste Drum-Garnitur der Engine. Hitzemonate zünden zusätzliche Acid-Sechzehntel eine Oktave höher; Rekorde schicken Riser und Ride. Starkes Sidechain-Pumpen (0.45).',
    en: 'Chord stabs from the anomaly every two beats, plus rolling 16th hats, offbeat open hat and claps on 2 and 4 — the engine\'s brightest drum kit. Hot months ignite extra acid sixteenths an octave up; records send risers and rides. Strong sidechain pumping (0.45).'
  },
  sty_driving_why: {
    de: 'Driving Techno (Jeff Mills, Robert Hood) ist Vorwärtsbewegung: hell, hart, funktional. Gemessen einer der hellsten Stile bei mono-fokussiertem Bild — die Detroit-Ästhetik aus Reduktion und Druck. Dass die Hitze der Daten die Hi-Hats dichter macht, übersetzt Erwärmung direkt in Drive.',
    en: 'Driving techno (Jeff Mills, Robert Hood) is forward motion: bright, hard, functional. Measured among the brightest styles with a mono-focused image — the Detroit aesthetic of reduction and pressure. Heat in the data thickening the hi-hats translates warming directly into drive.'
  },
  sty_acid_map: {
    de: 'Die 303-Linie: Jeder Monat ist eine Sechzehntel der Säure-Sequenz. Die zentrale Regel: **Filter-Cutoff = Anomalie** — je wärmer der Monat, desto weiter öffnet der resonante Filter. Slides verbinden Monate (häufiger bei hoher Klima-Varianz), Akzente bei Hitzemonaten und Rekorden. Phrygisch für die nötige Schärfe.',
    en: 'The 303 line: every month is one sixteenth of the acid sequence. The central rule: **filter cutoff = anomaly** — the warmer the month, the wider the resonant filter opens. Slides connect months (more often in high climate variability), accents on hot months and records. Phrygian for the required bite.'
  },
  sty_acid_why: {
    de: 'Acid (Phuture, DJ Pierre) ist durch genau ein Instrument definiert: die gleitende, resonante TB-303-Linie, deren Filter „spricht". Hier spricht buchstäblich das Klima den Filter — die Erwärmung ist als Öffnen des Klangs über 170 Jahre zu hören. Kompakter Beat, wenig Raum, alles Fokus auf der Linie: die Chicago-Formel.',
    en: 'Acid (Phuture, DJ Pierre) is defined by exactly one instrument: the sliding, resonant TB-303 line whose filter "speaks". Here the climate literally speaks the filter — warming is audible as the sound opening up across 170 years. Compact beat, little space, all focus on the line: the Chicago formula.'
  },
  sty_electro_map: {
    de: 'Synkopierte Figur statt Four-to-the-floor-Melodik: Plucks und Sub-Bass auf der 1. und 4. Sechzehntel jedes Beats (die 4. eine Oktave tiefer), Claps auf 2 und 4, knackige Hats. Datensprünge werden zu Fills, die Varianz würfelt Ghost-Hats dazwischen.',
    en: 'Syncopated figure instead of four-to-the-floor melody: plucks and sub bass on the 1st and 4th sixteenth of each beat (the 4th an octave down), claps on 2 and 4, crisp hats. Data jumps become fills, variability rolls ghost hats in between.'
  },
  sty_electro_why: {
    de: 'Electro (Drexciya, Bambaataa) lebt vom synkopierten Maschinenfunk-Bass — der Groove sitzt zwischen den Zählzeiten. Die punktierte Figur entsteht hier direkt aus dem Monatsraster (Monat 1 und 4 jedes Beats). Gemessen der hellste, knackigste Stil der Engine, Bass federnd statt drückend: die Electro-Balance.',
    en: 'Electro (Drexciya, Bambaataa) lives on syncopated machine-funk bass — the groove sits between the counts. The dotted figure here emerges directly from the month grid (months 1 and 4 of each beat). Measured the engine\'s brightest, crispest style, bass bouncing rather than pressing: the electro balance.'
  },
  sty_industrial_map: {
    de: 'Verzerrte Kick (Waveshaper), metallische Snare auf jedem zweiten Beat, Noise-Hats auf den Zwischenzählzeiten — und ein schlanker, zurückgenommener Sub, damit die Härte vorn steht. Die Anomalie schlägt alle zwei Beats als FM-Glocke an; Sprünge und Kälteeinbrüche krachen als Metall-Snares dazwischen. Phrygisch, engstes Stereobild.',
    en: 'Distorted kick (waveshaper), metallic snare on every other beat, noise hats on the off-counts — and a lean, restrained sub so the hardness stays up front. The anomaly strikes as an FM bell every two beats; jumps and cold snaps crash in as metal snares. Phrygian, narrowest stereo image.'
  },
  sty_industrial_why: {
    de: 'Birmingham-Industrial (Surgeon, Perc, Ancient Methods) ist hart, monochrom, klaustrophobisch — Klang als Material, nicht als Melodie. Gemessen das engste Stereobild der Engine, mit lauter, rauer Mitte. Dass ausgerechnet die Extreme der Klimadaten die metallischen Schläge setzen, gibt der Härte einen Grund.',
    en: 'Birmingham industrial (Surgeon, Perc, Ancient Methods) is hard, monochrome, claustrophobic — sound as material, not melody. Measured the engine\'s narrowest stereo image, with a loud, rough midrange. That it is precisely the data\'s extremes that place the metallic hits gives the hardness its reason.'
  },
  sty_idm_map: {
    de: 'Der Beat ist zerlegt: Snare-Positionen werden (seed-deterministisch) um die Zählzeiten gewürfelt, Hats erscheinen probabilistisch, Plucks auf dem Achtelraster springen zufällig um eine Oktave. Datensprünge lösen Hat-Rolls aus; die Ghost-Dichte folgt der Klima-Varianz. Dorisch, viel Delay.',
    en: 'The beat is dismantled: snare positions are rolled (seed-deterministically) around the counts, hats appear probabilistically, plucks on the eighth grid jump a random octave. Data jumps trigger hat rolls; ghost density follows climate variability. Dorian, plenty of delay.'
  },
  sty_idm_why: {
    de: 'IDM/Breakbeat (Aphex Twin, Autechre) bricht den Beat und erhebt kontrollierten Zufall zur Methode. Der Trick hier: Der Zufall ist ein deterministischer Seed — dasselbe Stück bei jedem Abspielen, wie eine auskomponierte Partitur, die nur chaotisch klingt. Je unruhiger das Klima, desto zerklüfteter der Groove.',
    en: 'IDM/breakbeat (Aphex Twin, Autechre) breaks the beat and elevates controlled randomness to a method. The trick here: the randomness is a deterministic seed — the same piece on every play, like a through-composed score that merely sounds chaotic. The more restless the climate, the more fractured the groove.'
  },
  sty_downtempo_map: {
    de: 'Ein warmer Pluck pro Beat aus dem Mittel seiner vier Monate — die Mittelung glättet das Rauschen zu singbaren Linien. Alle vier Beats eine Akkordfläche aus dem Trend, Shaker-Sechzehntel, weiche Claps, dezenter Swing. In warmen Dekaden werden die Akkorde voller.',
    en: 'One warm pluck per beat from the mean of its four months — the averaging smooths noise into singable lines. Every four beats a chord pad from the trend, shaker sixteenths, soft claps, gentle swing. In warm decades the chords grow fuller.'
  },
  sty_downtempo_why: {
    de: 'Melodic Downtempo (Bonobo, Four Tet, Ben Böhmer) ist warm, melodisch und entspannt treibend — Musik, die trägt statt drängt. Gemessen ausgewogen zwischen warmem Bass und sanften Höhen, mittleres Tempo. Der freundlichste Einstieg ins Projekt — deshalb übernimmt die Monats-Mittelung hier die Rolle des Songwritings.',
    en: 'Melodic downtempo (Bonobo, Four Tet, Ben Böhmer) is warm, melodic and gently driving — music that carries rather than pushes. Measured balanced between warm bass and soft highs, mid tempo. The friendliest entry into the project — which is why month-averaging takes on the songwriting here.'
  },
  sty_triphop_map: {
    de: 'Schwerer, geswingter Beat (Swing 0.13): Kick mit gewürfelten Ghost-Schlägen, Snare auf 2 und 4, sehr lauter Sub auf dem Trend. Durchgehendes Vinyl-Knistern als Textur. Die Melodie setzt nur alle zwei Beats — ein dunkler Pluck aus dem Monatsmittel, in Moll.',
    en: 'Heavy, swung beat (swing 0.13): kick with rolled ghost hits, snare on 2 and 4, very loud sub on the trend. Continuous vinyl crackle as texture. The melody lands only every two beats — a dark pluck from the month mean, in minor.'
  },
  sty_triphop_why: {
    de: 'Trip-Hop (Massive Attack, Portishead) ist langsam, schwer und nokturn — Bristol bei Regen. Gemessen mit dem schwersten Fundament der langsamen Stile; Swing und Knistern liefern die Patina, die das Genre von cleanem Downtempo trennt. Die Klimakurve wird hier zur Basslast, die man körperlich spürt.',
    en: 'Trip-hop (Massive Attack, Portishead) is slow, heavy and nocturnal — Bristol in the rain. Measured with the heaviest foundation of the slow styles; swing and crackle provide the patina that separates the genre from clean downtempo. The climate curve becomes bass weight you feel physically.'
  },
  sty_neoclassic_map: {
    de: 'Kein Beat. Ein Klavierton pro Notengruppe (aus dem Monatsmittel), in warmen Dekaden eine zweite Stimme in der Quinte. Streicherflächen aus dem Jahreszeitenprofil, ein Sub-Pedalton zu jedem Jahresbeginn, Glocken bei Rekorden, Dekaden-Kadenzen — alles in großem Hall.',
    en: 'No beat. One piano note per group (from the month mean), a second voice at the fifth in warm decades. String pads from the seasonal profile, a sub pedal tone at every year\'s start, bells on records, decade cadences — all in generous reverb.'
  },
  sty_neoclassic_why: {
    de: 'Neoklassik (Nils Frahm, Max Richter) ist intime, reduzierte Klaviermusik mit Raum — Emotion aus Zurückhaltung. Gemessen der leiseste und intimste Stil, mit dem geringsten Bassanteil der ganzen Engine. Die Daten werden Kammermusik: Man hört die Erwärmung als langsames Aufhellen einer Klavierstimme.',
    en: 'Neoclassical (Nils Frahm, Max Richter) is intimate, reduced piano music with space — emotion through restraint. Measured the quietest, most intimate style, with the lowest bass share in the whole engine. The data becomes chamber music: you hear warming as the slow brightening of a piano voice.'
  },
  sty_ambient_map: {
    de: 'Kein Takt: überlappende Flächen aus Monatsgruppen, im Stereofeld verteilt. Schimmer-Glocken erscheinen umso häufiger, je höher der Klimazustand; Rekorde setzen helle Glockentöne, Dekaden ferne Anker. Sehr langer Hall (5,5 s), langsames Delay — die Zeit verliert ihre Kanten.',
    en: 'No meter: overlapping pads from month groups, spread across the stereo field. Shimmer bells appear more often as the climate state rises; records place bright bell tones, decades distant anchors. Very long reverb (5.5 s), slow delay — time loses its edges.'
  },
  sty_ambient_why: {
    de: 'Ambient (Eno, Stars of the Lid, GAS) ist Klangfeld statt Ereignis — Musik als Wetter. Gemessen das breiteste Stereobild der Engine, beatlos, wie es das Genre verlangt. Der Wandel erscheint nicht als Rhythmus, sondern als Licht: Die Fläche wird über 170 Jahre unmerklich heller und dichter.',
    en: 'Ambient (Eno, Stars of the Lid, GAS) is a sound field instead of events — music as weather. Measured the engine\'s widest stereo image, beatless, as the genre demands. Change appears not as rhythm but as light: the field grows imperceptibly brighter and denser across 170 years.'
  },
  sty_drone_map: {
    de: 'Lange, tiefe Drone-Schichten aus Monatsgruppen, phrygisch, eine Oktave unter allem anderen. Die zentrale Regel: **Helligkeit der Drone = Klimazustand** — der Filter öffnet sich über 170 Jahre kaum merklich, aber unaufhaltsam. Kälteeinbrüche reißen Sub-Abgründe, Dekaden schlagen als ferne Glocken an, Rekorde schimmern. Längster Hall der Engine (6,5 s).',
    en: 'Long, deep drone layers from month groups, phrygian, an octave below everything else. The central rule: **drone brightness = climate state** — the filter opens across 170 years barely perceptibly, but unstoppably. Cold snaps tear sub chasms, decades strike as distant bells, records shimmer. The engine\'s longest reverb (6.5 s).'
  },
  sty_drone_why: {
    de: 'Drone (Tim Hecker, Thomas Köner, Basinski) behandelt Klang als geologische Kraft: Veränderung ist Textur, nicht Melodie. Gemessen der dunkelste Stil überhaupt — seine Helligkeit verdoppelt sich dennoch von 1850 bis 2020: der Klimazustand öffnet den Klang. Genau deshalb ist er das Eröffnungsstück: Man hört nicht Ereignisse, sondern den Zustand selbst — und wie er sich unumkehrbar verschiebt.',
    en: 'Drone (Tim Hecker, Thomas Köner, Basinski) treats sound as a geological force: change is texture, not melody. Measured the darkest style of all — yet its brightness doubles from 1850 to 2020: the climate state opens the sound. That is exactly why it is the opening piece: you hear not events but the state itself — and how it shifts irreversibly.'
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
