# Die Pleistozän-Sinfonie / The Pleistocene Symphony

**DE** Keine Vertonung des Pleistozäns, sondern eine Sinfonie, deren
**Kompositionsregeln vollständig aus den Klimadaten abgeleitet** werden. Die
Daten schreiben nicht die Noten — sie schreiben die Grammatik: Form, Harmonik,
Kontrapunkt, Orchestrierung, Rhythmik, Motivik. Die Noten entstehen erst
innerhalb dieser datengesetzten Grenzen. Implementiert in
`js/symphony.js`, Hauptinhalt des Paleo-Modus.

**EN** Not a sonification of the Pleistocene but a symphony whose
**composition rules are derived entirely from the climate data**. The data do
not write the notes — they write the grammar: form, harmony, counterpoint,
orchestration, rhythm, motif work. Notes are generated only inside these
data-set boundaries. Implemented in `js/symphony.js`, the main act of the
paleo mode.

---

## Zwei Stufen / Two stages

### Stufe A · Analyse: Daten → Grammatik

| Grammatik-Ebene | Datenquelle | Regel |
|---|---|---|
| **Form** | 4-Band-DFT von LR04 (23/41/100/405 kyr, gefensterte Einzelfrequenz-Analyse) | Die Satzgrenzen werden **detektiert**: Satz II beginnt, wo die 100-kyr-Leistung die 41-kyr-Leistung erstmals einholt, Satz III, wo sie klar dominiert — die gemessene Mittelpleistozäne Wende (typisch ≈ 1100–600 ka). Die Bandaktivitäten entscheiden außerdem, welches **Leitmotiv** erklingen darf (23k → Holzbläser-Triole, 41k → Hornzelle, 100k → Basschoral, 405k → Pedalton): *die Musik enthält das Spektrum der Daten.* |
| **Modus** | LR04-Eisniveau | Helligkeitsleiter lydisch → dur → mixolydisch → dorisch → moll → phrygisch. Eine Eiszeit *klingt* anders, nicht nur tiefer. |
| **Akkordfarbe** | CO₂ | Offene Quinten (kalt/leer) → Dreiklänge → Terz- und Nonenwärme (hoch). Ohne CO₂-Archiv: hohl — Farbe braucht Messung. |
| **Dissonanzbudget** | Sahara-Staub (ODP 967) | Staubige (glaziale) Phasen erlauben Cluster, Sekunden, Tritonus — in der Harfe und im Intervallvorrat der Stimmen. |
| **Modulation** | Insolations-Proxy (Obliquität + Präzession), Ableitung | Die Wahrscheinlichkeit einer Quintenzirkel-Modulation pro Phrase folgt der Änderungsrate der Einstrahlung. |
| **Kontrapunkt** | Rollende Korrelationen (T↔CO₂; davor Eis↔Staub) | r ≥ 0.45 → **Parallelbewegung** (Terzen/Sexten) · \|r\| < 0.3 → **Imitation** · r ≤ −0.3 → **Gegenbewegung**. Das Klimanetzwerk wird als Stimmführung hörbar. |
| **Unsicherheit** | Archiv-Abdeckung | Fehlende Proxys → Solo statt Doppelung, hohle Intervalle, langer Hall. Sicherheit → Tutti, klare Akkorde, trockener. *Unsicherheit ist Instrumentation.* |
| **Dirigent** | Milanković | Er spielt nicht mit: **Präzession = Rubato**, **Obliquität = Dynamik**, **Exzentrizität = Phrasenlänge**; eine Rekurrenz-Näherung (Autokorrelation bei der dominanten Periode) setzt die Timing-Präzision. Die Proxys sind die Musiker, die Astronomie hält den Taktstock. |
| **Orchesterdichte** | Rauheit (gefensterte Variabilität der Änderungen) | Geordnete Passagen → Kammerbesetzung, komplexe → volles Orchester. Sektionen treten zudem historisch ein: Blech existiert erst, wo das CO₂-Archiv existiert. |
| **Ereignisse** | Detektiert bzw. datiert | **Terminationen** → Paukenwirbel + Tutti (in der 41k-Welt nur ein Akzent — frühe Deglaziationen waren schwach) · extreme **Grönland-Minima** → Generalpause · **D-O-Erwärmungen** → ausnotiertes Accelerando · **Toba (~74 ka)** → Cluster-Schlag · **Afrikanische Feuchtperiode (14,8–5,5 ka)** → die Holzbläser blühen. |

### Stufe B · Komposition: Noten in der Grammatik

Die Stimmen entstehen als **regelgebundene Gänge**: Intervallwahl aus dem
erlaubten Vorrat, Konturrichtung aus der Proxy-Ableitung, elastischer Anker
zum Datenregister (entfernt sich die Stimme zu weit, zieht der Anker zurück).
Motivtransformationen wählen die Daten: Erwärmung → **Umkehrung**, hohe
Variabilität → **Diminution**, Satz III → **Augmentation**. Die viertönige
Eiszelle kehrt an jedem Satzanfang wieder (zyklische Form).

**Eine Stimme bleibt wörtlich**: der Cantus firmus des Eises in den Celli.
Er ist der zeigbare Anker des Werks — ohne ihn wäre die Grammatik nicht mehr
nachprüfbar.

### Orchester / Orchestra

Celli & Bässe = Eis (Cantus firmus, invertiert: mehr Eis = tiefer) ·
Violinen = Temperatur (vor 806 ka: Solo-Violine aus invertiertem LR04 —
Rekonstruktion klingt dünner) · Hörner = 41k-Leitmotiv · Holzbläser =
23k-Triole, Lautstärke = Exzentrizität (die reale Amplitudenmodulation der
Präzession, wörtlich) · Tiefes Blech = CO₂-Akkordfarbe (tacet vor 806 ka) ·
Pauken = Terminationen · Harfe = Staub-Pointillismus.

### Dramaturgie / Dramaturgy

Vier Sätze mit **Zoom** (12 → 8 → 5 → 1,2 kyr/s — die Archive lösen zur
Gegenwart feiner auf; die Achse im Plot komprimiert sichtbar). Das Finale ist
die einzige Dur/Lydisch-Passage: das Holozän, der stabile warme Akkord, in dem
unsere Zivilisation lebt. Die **Coda** lässt das moderne CO₂ den Tonraum von
allem Gehörten verlassen — dann Stille und eine tiefe offene Frage.

### Ehrliche Vereinfachungen / Honest simplifications

Volle RQA (DET/LAM/ENTR) ist durch eine Autokorrelations-Regularität
angenähert; das Proxy-Netzwerk ist auf seine zwei tragenden Kanten reduziert
(T↔CO₂, Eis↔Staub); Laschamp ist nicht vertont (geomagnetisch, nicht
klimatisch). Alle Detektionen (MPT, Terminationen, D-O, Generalpausen) stehen
im Programmheft der App — mit den gemessenen Werten des jeweiligen Laufs.
