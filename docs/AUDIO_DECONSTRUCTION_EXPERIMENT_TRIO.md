# Audio Deconstruction Experiment Trio

Status: `READY_FOR_SYNTHETIC_EXECUTION / HYPOTHESIS`

Tre isolerade experimentpaket har skapats. De delar inte fixturedata, intern state eller resultattolkning. Varje pipeline producerar en egen JSON-rapport och kan godkännas, underkännas eller ersättas utan att de andra experimentens status ändras.

## EXP-HARMONIC-RECOVERY-001

Blind återvinning av fundamental och harmonisk kropp. Rekonstruktionsscore hålls separat från parameteråtervinning.

## EXP-LOWBAND-COLLISION-001

Kick–bas-kollisioner med bass-only-negativkontroll. Utvärderar precision, recall, F1, timingfel och falska kandidater.

## EXP-STEREO-TOMOGRAPHY-001

Spatial dekomposition med Mid/Side, closure-test och delayestimering. Rapporterar spatiala komponenter före instrumentsemantik.

## Gemensam evidensgräns

- Syntetiska fixtures är ground truth för testbädden, inte bevis för real musik.
- Varje analyssteg får observed signal; ground truth används endast av evaluatorn.
- `PASS` betyder att den deklarerade syntetiska fixturematrisen passerar kandidatgaten.
- Ingen pipeline får promoveras till `MEASURED_FACT` på realaudio utan separat källmaterial, mätprotokoll och mänsklig adjudikering.
- Misslyckade fixtures och ersatta trösklar ska bevaras.
