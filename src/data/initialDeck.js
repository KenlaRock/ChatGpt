export const DEFAULT_DECK = {
  id: "northstar-release",
  name: "North Star Rising — Strategi",
  version: 1,
  slides: [
    {
      id: "hero",
      kicker: "KALL SIGNAL / KALL PRECISION",
      title: "North Star Rising — Releaseplan & Social Media-plan",
      subtitle:
        "En redigerbar deck där ni kan justera text, block och bilder utan att ändra kod.",
      blocks: [
        {
          id: "hero-text",
          type: "text",
          props: {
            heading: "Mål (hårt)",
            body: "Igenkänning + mystik. Förväntan. Max tryck första 48 timmar.",
          },
        },
        {
          id: "hero-check",
          type: "checklist",
          props: {
            heading: "Produktionsrutin",
            items: [
              "Bygg en liten copybank med 10–20 rader.",
              "Planera 7 dagar i förväg i schemaläggare.",
              "Sätt tydlig huvud-CTA för releasedagen.",
            ],
          },
        },
        {
          id: "hero-image",
          type: "image",
          props: {
            heading: "Nyckelbild",
            imageId: null,
            caption: "Välj en bild i media-biblioteket.",
          },
        },
      ],
    },
    {
      id: "rules",
      kicker: "REGLER SOM INTE FÅR BRYTAS",
      title: "Estetik, text och disciplin",
      subtitle: "Om ett inlägg inte följer detta: kasta det.",
      blocks: [
        {
          id: "rules-quote",
          type: "quote",
          props: {
            text: "Vi förklarar inte — vi visar.",
            subtext: "Militär minimalism slår brus.",
          },
        },
        {
          id: "rules-text",
          type: "text",
          props: {
            heading: "Copybank",
            body: "THE SIGNAL IS LIVE. / COLD PROTOCOL ACTIVE / NO HEAT. NO MERCY.",
          },
        },
      ],
    },
    {
      id: "timeline",
      kicker: "3 VECKOR RUNT RELEASEN",
      title: "Tidslinje som går att följa utan att tappa kyla",
      subtitle: "Hög igenkänning + konsekvent tempo.",
      blocks: [
        {
          id: "timeline-week-1",
          type: "timeline",
          props: {
            week: "VECKA -2",
            purpose: "Identitet",
            items: ["Reveal av logotyp", "8-10s reel", "Story-poll med snutt"],
            microcopy: "A NEW SIGNAL EMERGES",
          },
        },
        {
          id: "timeline-week-2",
          type: "timeline",
          props: {
            week: "RELEASEDAG",
            purpose: "Max tryck (48h)",
            items: ["Starkaste klippet först", "Pinned reel", "Story x3 med länk"],
            microcopy: "OUT NOW",
          },
        },
      ],
    },
    {
      id: "final",
      kicker: "SLUTKOMMANDO",
      title: "Publicera som en maskin",
      subtitle: "Om det känns repetitivt för dig är det lagom för publiken.",
      blocks: [
        {
          id: "final-quote",
          type: "quote",
          props: {
            text: "Repetition + timing > variation utan riktning.",
            subtext: "Bygg signal, inte brus.",
          },
        },
      ],
    },
  ],
};
