# Quantil-Dramaturgie / Quantile dramaturgy

**DE** Das Konzept hinter der inneren Gliederung aller Stücke (implementiert in
`js/score.js → buildSegmentPlan`, voll ausgespielt im Modus *studio classic*).

**EN** The concept behind the internal structure of every piece (implemented in
`js/score.js → buildSegmentPlan`, fully expressed in *studio classic*).

## Idee / Idea

Musikalische Form entsteht nicht aus dem Kalender, sondern aus **Rängen**:
Die Reihe wird in 8-Jahres-Segmente geteilt; jedes Segment wird zweimal in
eine Reihenfolge gebracht —

Musical form is derived not from the calendar but from **ranks**: the record
is split into 8-year segments; each segment is placed in two orderings —

1. **Mittelwertsreihenfolge** (ordering by mean climate state): das Rang-Quintil
   ergibt die **Intensität I1–I5** — Besetzung, Register, Grunddynamik
   (I1 = solo/pp … I5 = tutti/f). / The rank quintile yields **intensity
   I1–I5** — instrumentation, register, base dynamics.
2. **Variabilitätsreihenfolge** (ordering by decadal variability): das
   Rang-Terzil ergibt den **Charakter** — *cantabile* (lange Werte, legato,
   keine Ornamente) · *mosso* (normal) · *agitato* (Ornamente, dichtere
   Figuration, doppeltes Rubato). / The rank tercile yields the **character**.

Jedes Segment bekommt so ein (I, C)-Paar und damit **eigene Regeln**. / Each
segment receives an (I, C) pair and with it its **own rules**.

## Übergänge & Anker / Transitions & anchors

- **Kadenzen**: Jeder Segmentwechsel trägt eine V–I-Kadenz im tiefen Klavier;
  ihr Gewicht wächst mit |ΔI| (großer Sprung = große Kadenz). / Every segment
  change carries a V–I cadence in the low piano; its weight grows with |ΔI|.
- **Crescendo/Diminuendo**: Segmente betreten ihre Dynamikstufe über eine
  Twährige Rampe von der Vorstufe aus. / Segments enter their dynamic level
  via a two-year ramp from the previous one.
- **Atempause**: Nach starken Abfällen (ΔI ≤ −2) schweigt die Melodie einen
  Takt. / After strong drops the melody rests for a bar.
- **★ Klimax & Stillpunkt**: höchste bzw. niedrigste Rangsumme (rM + rV) —
  bei steigendem Trend liegt die Klimax fast immer spät im Stück, aber nicht
  zwingend am Ende: Die Daten entscheiden. / Highest and lowest rank sum;
  with a rising trend the climax falls late, but the data decides.

## Warum Ränge statt Rohwerte? / Why ranks instead of raw values?

Rohwert-Schwellen machen bei einem steigenden Trend das letzte Drittel
uniform „laut". Ränge verteilen die fünf Stufen **garantiert gleichmäßig**
über das Stück: Auch in der warmen Gegenwart gibt es relative Ruhepunkte
(Reprisen), auch im kalten Beginn relative Höhepunkte — Form mit Kontrast,
und trotzdem vollständig aus den Daten begründet.

Raw-value thresholds make the final third uniformly "loud" under a rising
trend. Ranks distribute the five levels **evenly by construction**: the warm
present keeps relative resting points (reprises), the cold beginning keeps
relative peaks — form with contrast, yet fully grounded in the data.

## Sichtbarkeit / Visibility

Segmentgrenzen erscheinen als feine Linien im Plot; die Live-Legende nennt
das aktuelle Segment (z. B. `★ 5/5 · agitato`). / Segment boundaries appear
as fine lines in the plot; the live legend names the current segment.

## Pacing-Prinzip im Classic-Modus / Pacing principle in classic mode

Die **schnelle Schicht** eines Idioms (Bachs Motorik, Alberti-Figuren,
Nocturne-Arpeggien, Minimal-Zellen) trägt die Monatsdaten — schnelle Figuration
ist in diesen Stilen authentisch. Die **Melodie** bewegt sich auf
Gruppenmitteln im Idiom-Tempo: Mozart ~0,5 s, Beethoven ~0,24 s, Chopin ~0,94 s,
Satie ein Ton pro 2,3-s-Takt. Instrumente sind klassisch (Klavier, Cembalo,
Streicher); der Bass ist ein tiefes Klavier/Cembalo — nie ein Synth-Sub.

The **fast layer** of an idiom (Bach's motor, Alberti figures, nocturne
arpeggios, minimal cells) carries the monthly data — fast figuration is
authentic in these styles. The **melody** moves on group means at the idiom's
pace. Instruments are classical; the bass is a low piano/harpsichord — never
a synth sub.
