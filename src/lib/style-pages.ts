export interface StyleSection {
  heading: string;
  body: string;
}

export interface StylePageLang {
  title: string;
  subtitle: string;
  seoTitle: string;
  seoDescription: string;
  sections: StyleSection[];
}

export type StyleCategory = "engagement-rings" | "wedding-bands" | "fine-jewelry" | "grillz";

export interface StylePage {
  slug: string;
  category: StyleCategory;
  heroImage: string;
  heroImageAlt: { en: string; fr: string };
  relatedBlogSlugs: string[];
  en: StylePageLang;
  fr: StylePageLang;
}

export const CATEGORY_LABEL: Record<StyleCategory, { en: string; fr: string }> = {
  "engagement-rings": { en: "Engagement Rings", fr: "Bagues de fiançailles" },
  "wedding-bands": { en: "Wedding Bands", fr: "Alliances" },
  "fine-jewelry": { en: "Fine Jewelry", fr: "Bijoux fins" },
  grillz: { en: "Grillz", fr: "Grillz" },
};

export const stylePages: StylePage[] = [
  {
    slug: "solitaire",
    category: "engagement-rings",
    heroImage: "/rings/ring-solitaire-rose-gold.jpg",
    heroImageAlt: { en: "A rose gold solitaire engagement ring with a round diamond", fr: "Une bague de fiançailles solitaire en or rose avec un diamant rond" },
    relatedBlogSlugs: ["guide-styles-bagues-fiancailles", "or-blanc-or-rose-ou-platine-quel-metal-choisir"],
    en: {
      title: "Solitaire Engagement Rings",
      subtitle: "One diamond, no distractions. The most timeless setting in fine jewelry, built entirely to showcase your stone.",
      seoTitle: "Custom Solitaire Engagement Ring — Montreal",
      seoDescription: "Design a custom solitaire engagement ring in Montreal. A single diamond, expertly set, with nothing competing with its brilliance.",
      sections: [
        { heading: "Why the solitaire never goes out of style", body: "A solitaire setting holds one diamond and nothing else — no halo, no pavé, no distraction. That simplicity is exactly why it has remained the most requested engagement ring style for over a century: it puts the stone itself, not the setting, at the center of attention." },
        { heading: "Prong count changes the look more than you'd think", body: "A 4-prong setting shows more of the diamond and creates a slightly more modern, angular silhouette. A 6-prong setting offers more security for the stone and a rounder, more classic look. Both hold a diamond safely — the choice is purely aesthetic, and worth seeing rendered in CAD before deciding." },
        { heading: "Your stone quality matters more here", body: "Without a halo or pavé band to add sparkle or visually boost size, a solitaire puts the diamond's own cut, clarity, and color entirely on display. We generally recommend prioritizing cut quality above all else for a solitaire — an excellent cut will outshine a larger, poorly cut stone every time." },
        { heading: "Band and metal options", body: "A thin, classic band keeps the focus entirely on the stone. A cathedral-style setting raises the diamond slightly and adds architectural presence. Available in platinum, white, yellow, or rose gold — each changes the overall tone of the piece significantly, worth discussing at your consultation." },
      ],
    },
    fr: {
      title: "Bagues de fiançailles solitaire",
      subtitle: "Un diamant, aucune distraction. Le sertissage le plus intemporel de la joaillerie fine, conçu entièrement pour mettre votre pierre en valeur.",
      seoTitle: "Bague de fiançailles solitaire sur mesure — Montréal",
      seoDescription: "Concevez une bague de fiançailles solitaire sur mesure à Montréal. Un seul diamant, serti avec expertise, sans rien pour rivaliser avec sa brillance.",
      sections: [
        { heading: "Pourquoi le solitaire ne se démode jamais", body: "Un sertissage solitaire retient un seul diamant et rien d'autre — pas de halo, pas de pavé, aucune distraction. Cette simplicité explique pourquoi il reste le style de bague de fiançailles le plus demandé depuis plus d'un siècle : il place la pierre elle-même, pas le sertissage, au centre de l'attention." },
        { heading: "Le nombre de griffes change le look plus qu'on ne le pense", body: "Un sertissage à 4 griffes montre davantage le diamant et crée une silhouette légèrement plus moderne et angulaire. Un sertissage à 6 griffes offre plus de sécurité pour la pierre et un look plus rond et classique. Les deux tiennent le diamant en sécurité — le choix est purement esthétique, et vaut la peine d'être vu en rendu CAD avant de décider." },
        { heading: "La qualité de votre pierre compte davantage ici", body: "Sans halo ni bande pavée pour ajouter du scintillement ou augmenter visuellement la taille, un solitaire met entièrement en valeur la taille, la pureté et la couleur du diamant. Nous recommandons de prioriser la qualité de la taille avant tout pour un solitaire — une taille excellente surpassera toujours une pierre plus grosse mais mal taillée." },
        { heading: "Options d'anneau et de métal", body: "Un anneau fin et classique garde toute l'attention sur la pierre. Un sertissage de style cathédrale surélève légèrement le diamant et ajoute une présence architecturale. Disponible en platine, or blanc, jaune ou rose — chacun change significativement le ton général de la pièce, à discuter lors de votre consultation." },
      ],
    },
  },
  {
    slug: "pave",
    category: "engagement-rings",
    heroImage: "/rings/ring-cushion-pave.jpg",
    heroImageAlt: { en: "A pavé engagement ring band set edge-to-edge with diamonds", fr: "Un anneau de bague de fiançailles pavé serti de diamants bord à bord" },
    relatedBlogSlugs: ["guide-styles-bagues-fiancailles", "diamant-naturel-vs-laboratoire-lequel-choisir"],
    en: {
      title: "Pavé Engagement Rings",
      subtitle: "A band paved edge-to-edge in tiny diamonds, so the entire ring catches light — not just the center stone.",
      seoTitle: "Custom Pavé Engagement Ring — Montreal",
      seoDescription: "Design a custom pavé engagement ring in Montreal. Diamonds set edge-to-edge along the band for maximum sparkle from every angle.",
      sections: [
        { heading: "What makes a setting 'pavé'", body: "Small diamonds are set so closely together across the band's surface that very little metal shows between them — the French word means 'paved,' and the effect really does look like a band paved in light." },
        { heading: "It amplifies your center stone", body: "The sparkle running down the band draws the eye toward the center diamond rather than competing with it, making the whole hand read as more luminous without needing a larger — and pricier — center stone." },
        { heading: "A practical note on upkeep", body: "Because pavé diamonds are small and numerous, a snagged prong is more likely over years of daily wear than on a plain band. We recommend an annual check-up, easy to build into your care routine." },
        { heading: "Pairing with your center stone shape", body: "Pavé works beautifully with virtually every center stone shape — round, oval, emerald, cushion — since its role is to support the center stone, not compete with it." },
      ],
    },
    fr: {
      title: "Bagues de fiançailles pavé",
      subtitle: "Un anneau pavé de minuscules diamants d'un bout à l'autre, pour que toute la bague capte la lumière — pas seulement la pierre centrale.",
      seoTitle: "Bague de fiançailles pavé sur mesure — Montréal",
      seoDescription: "Concevez une bague de fiançailles pavé sur mesure à Montréal. Diamants sertis bord à bord le long de l'anneau pour un scintillement maximal sous tous les angles.",
      sections: [
        { heading: "Ce qui rend un sertissage « pavé »", body: "De petits diamants sont sertis si près les uns des autres sur la surface de l'anneau que très peu de métal se voit entre eux — le mot vient du français « pavé », et l'effet ressemble vraiment à un anneau pavé de lumière." },
        { heading: "Il amplifie votre pierre centrale", body: "Le scintillement le long de l'anneau attire l'œil vers le diamant central plutôt que de rivaliser avec lui, rendant toute la main plus lumineuse sans avoir besoin d'une pierre centrale plus grosse — et plus coûteuse." },
        { heading: "Une note pratique sur l'entretien", body: "Comme les diamants pavés sont petits et nombreux, une griffe accrochée est plus probable après des années de port quotidien que sur un anneau uni. Nous recommandons une vérification annuelle, facile à intégrer à votre routine d'entretien." },
        { heading: "S'associer avec la forme de votre pierre centrale", body: "Le pavé s'associe magnifiquement à presque toutes les formes de pierre centrale — rond, ovale, émeraude, coussin — puisque son rôle est de soutenir la pierre centrale, pas de rivaliser avec elle." },
      ],
    },
  },
  {
    slug: "halo",
    category: "engagement-rings",
    heroImage: "/rings/ring-halo-cushion.jpg",
    heroImageAlt: { en: "A halo engagement ring with a cushion-cut center stone surrounded by diamonds", fr: "Une bague de fiançailles halo avec une pierre centrale taille coussin entourée de diamants" },
    relatedBlogSlugs: ["guide-styles-bagues-fiancailles"],
    en: {
      title: "Halo Engagement Rings",
      subtitle: "A circle of smaller diamonds surrounding your center stone — more sparkle, more visual size, same budget.",
      seoTitle: "Custom Halo Engagement Ring — Montreal",
      seoDescription: "Design a custom halo engagement ring in Montreal. A ring of diamonds framing your center stone for more brilliance and visual size.",
      sections: [
        { heading: "The halo effect, explained", body: "A ring of smaller diamonds surrounds the center stone, framing it and making it appear noticeably larger than its actual carat weight — often the single most effective way to maximize apparent size on a fixed budget." },
        { heading: "Classic vs. hidden halo", body: "A classic halo sits visibly around the stone; a hidden halo tucks the same ring of diamonds just beneath the center stone, visible only from certain angles — a subtler, more modern take on the same effect." },
        { heading: "Halo shape follows center stone shape", body: "A round halo suits round and cushion centers; an oval or pear halo elongates and echoes the center stone's silhouette — matching the two shapes correctly is one of the details we refine in CAD before production." },
        { heading: "Why it's a strong budget play", body: "Because a halo adds visual size without adding carat weight to the — much pricier — center stone, it's one of the most efficient ways to make a modest center diamond look substantial." },
      ],
    },
    fr: {
      title: "Bagues de fiançailles halo",
      subtitle: "Un cercle de petits diamants entourant votre pierre centrale — plus de scintillement, plus de taille visuelle, même budget.",
      seoTitle: "Bague de fiançailles halo sur mesure — Montréal",
      seoDescription: "Concevez une bague de fiançailles halo sur mesure à Montréal. Un cercle de diamants encadrant votre pierre centrale pour plus de brillance et de taille visuelle.",
      sections: [
        { heading: "L'effet halo, expliqué", body: "Un cercle de petits diamants entoure la pierre centrale, l'encadrant et la faisant paraître nettement plus grosse que son poids réel en carats — souvent la façon la plus efficace de maximiser la taille apparente pour un budget fixe." },
        { heading: "Halo classique vs halo caché", body: "Un halo classique se voit clairement autour de la pierre ; un halo caché place le même cercle de diamants juste sous la pierre centrale, visible seulement sous certains angles — une version plus subtile et moderne du même effet." },
        { heading: "La forme du halo suit la forme de la pierre centrale", body: "Un halo rond convient aux pierres centrales rondes et coussin ; un halo ovale ou poire allonge et fait écho à la silhouette de la pierre centrale — bien assortir les deux formes est l'un des détails que nous peaufinons en CAD avant la production." },
        { heading: "Pourquoi c'est un excellent choix budgétaire", body: "Comme un halo ajoute de la taille visuelle sans ajouter de poids en carats à la pierre centrale — bien plus coûteuse —, c'est l'une des façons les plus efficaces de faire paraître substantiel un diamant central modeste." },
      ],
    },
  },
  {
    slug: "trois-pierres",
    category: "engagement-rings",
    heroImage: "/rings/ring-three-stone-oval.jpg",
    heroImageAlt: { en: "A three-stone engagement ring with oval diamonds", fr: "Une bague de fiançailles trois-pierres avec des diamants ovales" },
    relatedBlogSlugs: ["guide-styles-bagues-fiancailles"],
    en: {
      title: "Three-Stone Engagement Rings",
      subtitle: "Past, present, and future — three stones set side by side, each one carrying its own meaning.",
      seoTitle: "Custom Three-Stone Engagement Ring — Montreal",
      seoDescription: "Design a custom three-stone engagement ring in Montreal. A center stone flanked by two side stones, rich with symbolism.",
      sections: [
        { heading: "The symbolism behind the design", body: "The three stones are traditionally read as your past, present, and future together — a meaning that resonates with couples who want their ring to say something beyond 'engaged.'" },
        { heading: "Center stone vs. side stones", body: "The center stone is typically the largest, with two smaller side stones — round, trapezoid, or half-moon cuts are the most common choices, chosen to complement rather than match the center shape exactly." },
        { heading: "Color options for the side stones", body: "Matching diamonds keep the look classic and monochrome; colored side stones — sapphire, morganite — add a personal, non-traditional touch while keeping the same symbolic three-stone structure." },
        { heading: "A design that scales with your budget", body: "Side stone size and quality can flex independently from the center stone, giving real flexibility to allocate budget where it matters most to you." },
      ],
    },
    fr: {
      title: "Bagues de fiançailles trois-pierres",
      subtitle: "Passé, présent et avenir — trois pierres serties côte à côte, chacune portant sa propre signification.",
      seoTitle: "Bague de fiançailles trois-pierres sur mesure — Montréal",
      seoDescription: "Concevez une bague de fiançailles trois-pierres sur mesure à Montréal. Une pierre centrale flanquée de deux pierres latérales, riche en symbolisme.",
      sections: [
        { heading: "Le symbolisme derrière le design", body: "Les trois pierres sont traditionnellement lues comme votre passé, présent et avenir ensemble — une signification qui résonne avec les couples qui veulent que leur bague dise plus que « fiancés »." },
        { heading: "Pierre centrale vs pierres latérales", body: "La pierre centrale est généralement la plus grosse, avec deux pierres latérales plus petites — les tailles rondes, trapèze ou demi-lune sont les choix les plus courants, sélectionnés pour compléter plutôt que reproduire exactement la forme centrale." },
        { heading: "Options de couleur pour les pierres latérales", body: "Des diamants assortis gardent le look classique et monochrome ; des pierres latérales colorées — saphir, morganite — ajoutent une touche personnelle et non traditionnelle tout en gardant la même structure symbolique à trois pierres." },
        { heading: "Un design qui s'ajuste à votre budget", body: "La taille et la qualité des pierres latérales peuvent varier indépendamment de la pierre centrale, offrant une vraie flexibilité pour allouer le budget là où ça compte le plus pour vous." },
      ],
    },
  },
  {
    slug: "toi-et-moi",
    category: "engagement-rings",
    heroImage: "/rings/ring-toi-et-moi.jpg",
    heroImageAlt: { en: "A toi et moi engagement ring with two side-by-side gemstones", fr: "Une bague de fiançailles toi et moi avec deux pierres côte à côte" },
    relatedBlogSlugs: ["tendance-bagues-toi-et-moi", "guide-styles-bagues-fiancailles"],
    en: {
      title: "Toi et Moi Engagement Rings",
      subtitle: "Two stones, one meaning: you and me. A design with real history, having a genuine moment again.",
      seoTitle: "Custom Toi et Moi Engagement Ring — Montreal",
      seoDescription: "Design a custom toi et moi engagement ring in Montreal. Two stones set side by side, symbolizing two people coming together.",
      sections: [
        { heading: "A design with real history", body: "Popularized by Napoleon's 1796 proposal to Joséphine — a sapphire and a diamond set side by side — the toi et moi ring has outlasted trends for over two centuries because the symbolism is so direct." },
        { heading: "Choosing your two stones", body: "Sapphire and diamond remains the classic pairing, but two diamonds in different cuts, or each partner's birthstone, are equally popular ways to personalize the meaning further." },
        { heading: "Bypass vs. shared-prong settings", body: "A bypass band curves so the stones sit close without touching, for a fluid look. A shared-prong setting places them directly adjacent for a more unified silhouette." },
        { heading: "Who this style suits", body: "Toi et moi works particularly well for couples who want their ring to say something specific about them as a pair, not just signal 'engaged' — it rewards intentional stone choices over defaulting to the largest diamond available." },
      ],
    },
    fr: {
      title: "Bagues de fiançailles toi et moi",
      subtitle: "Deux pierres, une signification : toi et moi. Un design avec une vraie histoire, qui connaît un vrai regain de popularité.",
      seoTitle: "Bague de fiançailles toi et moi sur mesure — Montréal",
      seoDescription: "Concevez une bague de fiançailles toi et moi sur mesure à Montréal. Deux pierres serties côte à côte, symbolisant deux personnes qui se réunissent.",
      sections: [
        { heading: "Un design avec une vraie histoire", body: "Popularisée par la demande en mariage de Napoléon à Joséphine en 1796 — un saphir et un diamant sertis côte à côte —, la bague toi et moi a survécu aux tendances depuis plus de deux siècles parce que le symbolisme est si direct." },
        { heading: "Choisir vos deux pierres", body: "Saphir et diamant reste la combinaison classique, mais deux diamants de tailles différentes, ou la pierre de naissance de chaque partenaire, sont des façons tout aussi populaires de personnaliser davantage la signification." },
        { heading: "Sertissage bypass vs griffes partagées", body: "Un anneau bypass se courbe pour que les pierres soient proches sans se toucher, pour un look fluide. Un sertissage à griffes partagées les place directement adjacentes pour une silhouette plus unifiée." },
        { heading: "À qui ce style convient", body: "Le toi et moi fonctionne particulièrement bien pour les couples qui veulent que leur bague dise quelque chose de précis sur eux en tant que couple, pas seulement signaler « fiancés » — il récompense des choix de pierres intentionnels plutôt que de simplement choisir le plus gros diamant disponible." },
      ],
    },
  },
  {
    slug: "halo-cache",
    category: "engagement-rings",
    heroImage: "/rings/ring-oval-hidden-halo.jpg",
    heroImageAlt: { en: "An oval engagement ring with a hidden halo beneath the center stone", fr: "Une bague de fiançailles ovale avec un halo caché sous la pierre centrale" },
    relatedBlogSlugs: ["guide-styles-bagues-fiancailles"],
    en: {
      title: "Hidden Halo Engagement Rings",
      subtitle: "All the extra sparkle of a halo, tucked just beneath the center stone — visible only when you look closely.",
      seoTitle: "Custom Hidden Halo Engagement Ring — Montreal",
      seoDescription: "Design a custom hidden halo engagement ring in Montreal. Extra brilliance tucked beneath the center stone, revealed from the side.",
      sections: [
        { heading: "What makes it 'hidden'", body: "A ring of small diamonds sits directly beneath the center stone rather than around it, invisible from a straight-on view but catching light and revealing itself from the side — a quieter, more unexpected kind of sparkle." },
        { heading: "Why clients choose it over a classic halo", body: "It adds the same visual boost in perceived size and brilliance as a classic halo, without changing the ring's silhouette when viewed from above — ideal for someone who wants a solitaire's clean look with a hidden layer of extra detail." },
        { heading: "Best center stone shapes", body: "Oval and cushion cuts show the hidden halo especially well from the side profile, though it works with virtually any shape." },
        { heading: "A detail worth seeing in CAD", body: "Because the hidden halo isn't visible from the top, it's genuinely worth reviewing your CAD render from multiple angles to appreciate exactly how it will catch light on the hand." },
      ],
    },
    fr: {
      title: "Bagues de fiançailles halo caché",
      subtitle: "Tout le scintillement supplémentaire d'un halo, glissé juste sous la pierre centrale — visible seulement de près.",
      seoTitle: "Bague de fiançailles halo caché sur mesure — Montréal",
      seoDescription: "Concevez une bague de fiançailles halo caché sur mesure à Montréal. Une brillance supplémentaire glissée sous la pierre centrale, révélée de côté.",
      sections: [
        { heading: "Ce qui le rend « caché »", body: "Un cercle de petits diamants se place directement sous la pierre centrale plutôt qu'autour, invisible de face mais captant la lumière et se révélant de côté — un genre de scintillement plus discret et inattendu." },
        { heading: "Pourquoi les clients le choisissent plutôt qu'un halo classique", body: "Il ajoute le même effet visuel de taille et de brillance perçues qu'un halo classique, sans changer la silhouette de la bague vue de dessus — idéal pour quelqu'un qui veut le look épuré d'un solitaire avec une couche cachée de détail supplémentaire." },
        { heading: "Meilleures formes de pierre centrale", body: "Les tailles ovale et coussin montrent particulièrement bien le halo caché de profil, bien qu'il fonctionne avec presque toutes les formes." },
        { heading: "Un détail à voir en CAD", body: "Comme le halo caché n'est pas visible du dessus, ça vaut vraiment la peine de revoir votre rendu CAD sous plusieurs angles pour apprécier exactement comment il captera la lumière sur la main." },
      ],
    },
  },
  {
    slug: "vintage",
    category: "engagement-rings",
    heroImage: "/rings/ring-toi-et-moi-2.jpg",
    heroImageAlt: { en: "A vintage-style engagement ring with intricate detail", fr: "Une bague de fiançailles de style vintage avec des détails complexes" },
    relatedBlogSlugs: ["bagues-vintage-antiques-sur-mesure"],
    en: {
      title: "Vintage-Style Engagement Rings",
      subtitle: "Intricate period detail — filigree, milgrain, engraving — captured in a brand-new setting built to modern durability standards.",
      seoTitle: "Custom Vintage-Style Engagement Ring — Montreal",
      seoDescription: "Design a custom vintage-style engagement ring in Montreal. Period detail like filigree and milgrain, built new for lasting durability.",
      sections: [
        { heading: "Antique look, modern durability", body: "A custom vintage-style ring lets you capture the intricate detail of a specific era — filigree, milgrain, hand engraving — while starting with a new stone and a setting built to hold up for decades, without the repair-history unknowns of an actual antique." },
        { heading: "The eras we draw from most often", body: "Art Deco's bold geometry, Edwardian filigree, Victorian floral motifs, and Retro's bold rose gold designs each bring a distinct look — bringing 2-3 reference images from the era you're drawn to is the fastest way to start the conversation." },
        { heading: "Details that make it read as genuinely vintage", body: "Milgrain edging — a fine beaded texture along metal edges —, filigree scrollwork, and hand engraving are the details that separate a convincing vintage-style piece from a modern ring with an old-fashioned stone." },
        { heading: "Pairing with today's stone options", body: "A vintage-style setting pairs just as well with a modern lab-grown diamond as with a natural stone — the era-specific detail is in the metalwork, not a requirement on stone origin, so you can combine a historic look with a stone that fits your budget." },
      ],
    },
    fr: {
      title: "Bagues de fiançailles de style vintage",
      subtitle: "Des détails d'époque complexes — filigrane, milgrain, gravure — capturés dans un sertissage neuf construit selon les standards de durabilité modernes.",
      seoTitle: "Bague de fiançailles style vintage sur mesure — Montréal",
      seoDescription: "Concevez une bague de fiançailles style vintage sur mesure à Montréal. Détails d'époque comme le filigrane et le milgrain, construits neufs pour durer.",
      sections: [
        { heading: "Look antique, durabilité moderne", body: "Une bague de style vintage sur mesure vous permet de capturer le détail complexe d'une époque précise — filigrane, milgrain, gravure à la main — tout en partant d'une nouvelle pierre et d'un sertissage construit pour durer des décennies, sans les inconnues d'historique de réparation d'une vraie antiquité." },
        { heading: "Les époques dont nous nous inspirons le plus", body: "La géométrie audacieuse de l'Art Déco, le filigrane édouardien, les motifs floraux victoriens et les designs en or rose audacieux de l'ère rétro apportent chacun un look distinct — apporter 2-3 images de référence de l'époque qui vous attire est la façon la plus rapide de démarrer la conversation." },
        { heading: "Les détails qui font vraiment « vintage »", body: "La bordure milgrain — une fine texture perlée le long des bords métalliques —, le filigrane et la gravure à la main sont les détails qui distinguent une pièce de style vintage convaincante d'une bague moderne avec une pierre à l'ancienne." },
        { heading: "S'associer avec les options de pierre d'aujourd'hui", body: "Un sertissage de style vintage s'associe aussi bien à un diamant de laboratoire moderne qu'à une pierre naturelle — le détail propre à l'époque est dans le travail du métal, pas une exigence sur l'origine de la pierre, donc vous pouvez combiner un look historique avec une pierre adaptée à votre budget." },
      ],
    },
  },
  {
    slug: "serti-tension",
    category: "engagement-rings",
    heroImage: "/rings/ring-marquise.jpg",
    heroImageAlt: { en: "A tension-set engagement ring with a marquise diamond appearing to float", fr: "Une bague de fiançailles serti-tension avec un diamant marquise semblant flotter" },
    relatedBlogSlugs: ["guide-styles-bagues-fiancailles"],
    en: {
      title: "Tension-Set Engagement Rings",
      subtitle: "The stone appears to float, held only by the tension of the metal itself — modern architecture, unmistakable presence.",
      seoTitle: "Custom Tension-Set Engagement Ring — Montreal",
      seoDescription: "Design a custom tension-set engagement ring in Montreal. The diamond appears to float, held by precisely engineered tension in the band.",
      sections: [
        { heading: "How a tension setting actually works", body: "The band is precisely engineered so its two ends grip the stone under tension, with no visible prongs — the diamond appears to float in mid-air, which is exactly the effect that makes this style so distinctive." },
        { heading: "It shows more of the diamond", body: "Without prongs covering the sides of the stone, more of the diamond is visible from every angle, letting more light in and out — a genuine brilliance advantage over a fully pronged setting." },
        { heading: "Precision engineering matters here", body: "Because the setting relies on exact tension rather than prongs, a tension-set ring requires more precise fabrication than most styles — this is exactly the kind of setting where working with an experienced hand matters most." },
        { heading: "Who this style suits", body: "Tension settings suit clients drawn to modern, architectural design over traditional jewelry silhouettes — it reads as noticeably different from anything else in a room." },
      ],
    },
    fr: {
      title: "Bagues de fiançailles serti-tension",
      subtitle: "La pierre semble flotter, retenue uniquement par la tension du métal lui-même — architecture moderne, présence incontestable.",
      seoTitle: "Bague de fiançailles serti-tension sur mesure — Montréal",
      seoDescription: "Concevez une bague de fiançailles serti-tension sur mesure à Montréal. Le diamant semble flotter, retenu par une tension précisément conçue dans l'anneau.",
      sections: [
        { heading: "Comment un serti-tension fonctionne réellement", body: "L'anneau est conçu avec précision pour que ses deux extrémités retiennent la pierre sous tension, sans griffes visibles — le diamant semble flotter dans les airs, exactement l'effet qui rend ce style si distinctif." },
        { heading: "Il montre davantage le diamant", body: "Sans griffes couvrant les côtés de la pierre, davantage du diamant est visible sous tous les angles, laissant entrer et sortir plus de lumière — un véritable avantage de brillance par rapport à un sertissage entièrement à griffes." },
        { heading: "La précision d'ingénierie compte ici", body: "Comme le sertissage repose sur une tension exacte plutôt que sur des griffes, une bague serti-tension exige une fabrication plus précise que la plupart des styles — c'est exactement le genre de sertissage où travailler avec une main expérimentée compte le plus." },
        { heading: "À qui ce style convient", body: "Les sertis-tension conviennent aux clients attirés par un design moderne et architectural plutôt que par les silhouettes traditionnelles — la bague se distingue nettement de tout ce qu'on voit habituellement." },
      ],
    },
  },
  {
    slug: "taille-emeraude",
    category: "engagement-rings",
    heroImage: "/rings/ring-emerald-solitaire.jpg",
    heroImageAlt: { en: "An emerald cut engagement ring with a gold pavé band", fr: "Une bague de fiançailles taille émeraude avec un anneau pavé en or" },
    relatedBlogSlugs: ["taille-emeraude-vs-taille-ronde"],
    en: {
      title: "Emerald Cut Engagement Rings",
      subtitle: "Long, clean lines and a quiet 'hall of mirrors' sparkle — architectural elegance instead of maximum fire.",
      seoTitle: "Custom Emerald Cut Engagement Ring — Montreal",
      seoDescription: "Design a custom emerald cut engagement ring in Montreal. Clean architectural lines and a distinctive, quieter kind of brilliance.",
      sections: [
        { heading: "A different kind of sparkle", body: "An emerald cut's broad, flat facets produce fewer but wider flashes of light than a brilliant cut — sometimes described as a 'hall of mirrors' effect rather than fire, exactly why it reads as quiet and elegant rather than flashy." },
        { heading: "Clarity matters more with this cut", body: "The open facets act like a window into the stone, so inclusions are more visible than in a brilliant cut — worth prioritizing clarity a step higher when selecting an emerald-cut stone specifically." },
        { heading: "A genuine budget advantage", body: "Emerald cuts typically run 15-25% less per carat than round brilliants, and their elongated shape can make them look larger than their actual carat weight — real value for a comparable-looking stone." },
        { heading: "Protecting the corners", body: "Emerald cuts have open corners that are more vulnerable to chipping than a round's continuous edge — a well-designed prong setting addresses this, worth discussing if you have an active lifestyle." },
      ],
    },
    fr: {
      title: "Bagues de fiançailles taille émeraude",
      subtitle: "Des lignes longues et épurées, un scintillement discret en « salle des miroirs » — une élégance architecturale plutôt qu'un feu maximal.",
      seoTitle: "Bague de fiançailles taille émeraude sur mesure — Montréal",
      seoDescription: "Concevez une bague de fiançailles taille émeraude sur mesure à Montréal. Des lignes architecturales épurées et une brillance distinctive et discrète.",
      sections: [
        { heading: "Un scintillement différent", body: "Les larges facettes plates d'une taille émeraude produisent moins d'éclats de lumière, mais plus larges, qu'une taille brillante — parfois décrit comme un effet « salle des miroirs » plutôt qu'un feu, exactement pourquoi elle paraît discrète et élégante plutôt qu'éclatante." },
        { heading: "La pureté compte davantage avec cette taille", body: "Les facettes ouvertes agissent comme une fenêtre dans la pierre, donc les inclusions sont plus visibles que dans une taille brillante — vaut la peine de prioriser une pureté un cran plus élevée pour une pierre taille émeraude spécifiquement." },
        { heading: "Un vrai avantage budgétaire", body: "Les tailles émeraude coûtent généralement 15 à 25 % de moins au carat que les tailles rondes brillantes, et leur forme allongée peut les faire paraître plus grandes que leur poids réel — une vraie valeur pour une pierre à l'apparence comparable." },
        { heading: "Protéger les coins", body: "Les tailles émeraude ont des coins ouverts plus vulnérables à l'ébréchure que le bord continu d'un rond — un sertissage à griffes bien conçu y remédie, à discuter si vous avez un mode de vie actif." },
      ],
    },
  },
  {
    slug: "accents-flottants",
    category: "engagement-rings",
    heroImage: "/rings/ring-oval-accent.jpg",
    heroImageAlt: { en: "An engagement ring with floating marquise diamond accents along the band", fr: "Une bague de fiançailles avec des accents de diamants marquise flottants le long de l'anneau" },
    relatedBlogSlugs: ["guide-styles-bagues-fiancailles"],
    en: {
      title: "Floating Accent Engagement Rings",
      subtitle: "Small marquise or round diamonds set to appear suspended along the band, dancing around your center stone.",
      seoTitle: "Custom Floating Accent Engagement Ring — Montreal",
      seoDescription: "Design a custom engagement ring with floating diamond accents in Montreal. Small stones set to appear suspended, adding movement without bulk.",
      sections: [
        { heading: "What 'floating' means here", body: "Small accent diamonds — often marquise-cut — are set with minimal visible metal around them, so they appear to hover just above or beside the band rather than being fully embedded in it." },
        { heading: "It adds movement without adding bulk", body: "Unlike a full pavé band, floating accents add sparkle and visual interest in a few precise points rather than continuously — a lighter, more playful look that still reads as detailed and intentional." },
        { heading: "Works especially well with a solitaire center", body: "Because the accents are set apart from the center stone, this style pairs naturally with a clean solitaire or simple halo center, adding personality without competing with the main stone." },
        { heading: "A setting that photographs distinctively", body: "The negative space around each floating accent catches light differently than a conventional pavé band, giving the ring a distinct look in photos — a detail many clients specifically ask for." },
      ],
    },
    fr: {
      title: "Bagues de fiançailles à accents flottants",
      subtitle: "De petits diamants marquise ou ronds sertis pour paraître suspendus le long de l'anneau, dansant autour de votre pierre centrale.",
      seoTitle: "Bague de fiançailles à accents flottants sur mesure — Montréal",
      seoDescription: "Concevez une bague de fiançailles à accents de diamants flottants sur mesure à Montréal. De petites pierres serties pour paraître suspendues, ajoutant du mouvement sans lourdeur.",
      sections: [
        { heading: "Ce que « flottant » signifie ici", body: "De petits diamants d'accent — souvent taille marquise — sont sertis avec un minimum de métal visible autour d'eux, pour qu'ils semblent flotter juste au-dessus ou à côté de l'anneau plutôt que d'y être entièrement encastrés." },
        { heading: "Ça ajoute du mouvement sans ajouter de lourdeur", body: "Contrairement à un anneau entièrement pavé, les accents flottants ajoutent du scintillement et de l'intérêt visuel en quelques points précis plutôt que continuellement — un look plus léger et ludique qui reste détaillé et intentionnel." },
        { heading: "Fonctionne particulièrement bien avec un centre solitaire", body: "Comme les accents sont séparés de la pierre centrale, ce style s'associe naturellement à un centre solitaire épuré ou à un halo simple, ajoutant de la personnalité sans rivaliser avec la pierre principale." },
        { heading: "Un sertissage qui se photographie distinctement", body: "L'espace négatif autour de chaque accent flottant capte la lumière différemment d'un anneau pavé conventionnel, donnant à la bague un look distinct en photo — un détail que plusieurs clients demandent spécifiquement." },
      ],
    },
  },
  {
    slug: "coussin-solitaire",
    category: "engagement-rings",
    heroImage: "/rings/ring-cushion-solitaire.jpg",
    heroImageAlt: { en: "A cushion cut solitaire engagement ring", fr: "Une bague de fiançailles solitaire taille coussin" },
    relatedBlogSlugs: ["guide-styles-bagues-fiancailles"],
    en: {
      title: "Cushion Solitaire Engagement Rings",
      subtitle: "Soft, rounded corners on a square-ish silhouette — a warmer, more romantic alternative to a round or emerald solitaire.",
      seoTitle: "Custom Cushion Solitaire Engagement Ring — Montreal",
      seoDescription: "Design a custom cushion solitaire engagement ring in Montreal. A soft, romantic cut with warm brilliance in a clean solitaire setting.",
      sections: [
        { heading: "What makes a cut 'cushion'", body: "A cushion cut combines a square or rectangular outline with rounded corners and larger facets, producing a softer, more romantic sparkle than a round brilliant while still reading as a classic silhouette." },
        { heading: "Why it pairs so well with a solitaire setting", body: "Without a halo or pavé competing for attention, a cushion solitaire's soft outline and warm brilliance carry the entire design — the simplicity suits the cut's already-gentle character." },
        { heading: "Modified vs. classic cushion cuts", body: "A 'modified' cushion cut adds extra facets for more brilliance and sparkle; a 'classic' cushion cut shows larger, more open facets with a softer glow — worth specifying which look you prefer when sourcing the stone." },
        { heading: "Best metal pairings", body: "Cushion cuts read especially warm in yellow or rose gold, though they're equally striking in platinum or white gold for a cooler, more contemporary look." },
      ],
    },
    fr: {
      title: "Bagues de fiançailles solitaire taille coussin",
      subtitle: "Des coins doux et arrondis sur une silhouette carrée — une alternative plus chaleureuse et romantique à un solitaire rond ou émeraude.",
      seoTitle: "Bague de fiançailles solitaire taille coussin sur mesure — Montréal",
      seoDescription: "Concevez une bague de fiançailles solitaire taille coussin sur mesure à Montréal. Une taille douce et romantique avec une brillance chaleureuse dans un sertissage épuré.",
      sections: [
        { heading: "Ce qui rend une taille « coussin »", body: "Une taille coussin combine un contour carré ou rectangulaire avec des coins arrondis et de plus grandes facettes, produisant un scintillement plus doux et romantique qu'une taille ronde brillante tout en gardant une silhouette classique." },
        { heading: "Pourquoi elle s'associe si bien à un sertissage solitaire", body: "Sans halo ni pavé pour rivaliser d'attention, le contour doux et la brillance chaleureuse d'un solitaire coussin portent tout le design — la simplicité convient au caractère déjà doux de la taille." },
        { heading: "Taille coussin modifiée vs classique", body: "Une taille coussin « modifiée » ajoute des facettes supplémentaires pour plus de brillance et de scintillement ; une taille coussin « classique » montre de plus grandes facettes ouvertes avec un éclat plus doux — à préciser lors du choix de la pierre." },
        { heading: "Meilleures associations de métal", body: "Les tailles coussin paraissent particulièrement chaleureuses en or jaune ou rose, bien qu'elles soient tout aussi frappantes en platine ou en or blanc pour un look plus frais et contemporain." },
      ],
    },
  },
  {
    slug: "alliances-homme",
    category: "wedding-bands",
    heroImage: "/bands/band-men.png",
    heroImageAlt: { en: "A men's comfort-fit wedding band", fr: "Une alliance homme à coupe confort" },
    relatedBlogSlugs: ["guide-alliances-homme"],
    en: {
      title: "Men's Wedding Bands",
      subtitle: "Refined comfort-fit bands in every metal — designed to be worn every single day for the rest of your life.",
      seoTitle: "Custom Men's Wedding Band — Montreal",
      seoDescription: "Design a custom men's wedding band in Montreal. Comfort-fit profiles in platinum, gold, or tungsten, built for everyday durability.",
      sections: [
        { heading: "Comfort fit matters more than most people expect", body: "A comfort-fit band has a slightly rounded interior, making it noticeably easier to put on, take off, and wear all day compared to a flat-interior band — we recommend this profile for nearly every men's band we make." },
        { heading: "Metal choice affects daily durability", body: "Platinum and tungsten resist scratching best for an active lifestyle; gold offers more warmth and can be refinished if it does pick up wear marks over the years — worth discussing your daily routine at the consultation." },
        { heading: "Width and finish options", body: "Widths typically range from 4mm to 8mm, and a brushed or matte finish hides everyday scuffs far better than a high-polish shine for someone who works with their hands." },
      ],
    },
    fr: {
      title: "Alliances pour homme",
      subtitle: "Des alliances à coupe confort raffinées dans tous les métaux — conçues pour être portées tous les jours, pour le reste de votre vie.",
      seoTitle: "Alliance homme sur mesure — Montréal",
      seoDescription: "Concevez une alliance homme sur mesure à Montréal. Profils à coupe confort en platine, or ou tungstène, construits pour une durabilité quotidienne.",
      sections: [
        { heading: "La coupe confort compte plus qu'on ne le pense", body: "Une alliance à coupe confort a un intérieur légèrement arrondi, la rendant nettement plus facile à mettre, retirer et porter toute la journée qu'un anneau à intérieur plat — nous recommandons ce profil pour presque toutes les alliances homme que nous fabriquons." },
        { heading: "Le choix du métal affecte la durabilité quotidienne", body: "Le platine et le tungstène résistent le mieux aux égratignures pour un mode de vie actif ; l'or offre plus de chaleur et peut être refini s'il montre des marques d'usure au fil des ans — à discuter selon votre routine quotidienne lors de la consultation." },
        { heading: "Options de largeur et de finition", body: "Les largeurs varient généralement de 4 mm à 8 mm, et une finition brossée ou mate cache bien mieux les égratignures quotidiennes qu'un fini haute brillance pour quelqu'un qui travaille de ses mains." },
      ],
    },
  },
  {
    slug: "alliances-assorties",
    category: "wedding-bands",
    heroImage: "/bands/band-matching-set.png",
    heroImageAlt: { en: "A matching wedding band set for two partners", fr: "Un ensemble d'alliances assorties pour deux partenaires" },
    relatedBlogSlugs: ["alliances-assorties-jumeler-anneaux"],
    en: {
      title: "Matching Wedding Band Sets",
      subtitle: "Designed together so your bands feel like a pair, not two separate purchases made months apart.",
      seoTitle: "Custom Matching Wedding Bands — Montreal",
      seoDescription: "Design matching wedding bands together in Montreal. Coordinated metal, finish, and proportions for a genuinely cohesive pair.",
      sections: [
        { heading: "Why design them together", body: "When both bands are designed in the same sitting, the metal tone, finish, and proportions are matched intentionally — a subtlety that's hard to replicate when each partner buys separately at different times." },
        { heading: "Matching doesn't mean identical", body: "A cohesive set can still reflect two different personal styles — a diamond band for one partner, a plain comfort-fit band for the other — while sharing the same metal and finish for visual harmony." },
        { heading: "Pairing with an existing engagement ring", body: "If one partner already has an engagement ring, we design their wedding band to sit flush against it — a detail genuinely difficult to get right without seeing both pieces together in CAD." },
      ],
    },
    fr: {
      title: "Ensembles d'alliances assorties",
      subtitle: "Conçues ensemble pour que vos alliances se sentent comme une paire, pas comme deux achats séparés faits à des mois d'intervalle.",
      seoTitle: "Alliances assorties sur mesure — Montréal",
      seoDescription: "Concevez des alliances assorties ensemble à Montréal. Ton de métal, finition et proportions coordonnés pour une paire vraiment cohérente.",
      sections: [
        { heading: "Pourquoi les concevoir ensemble", body: "Quand les deux alliances sont conçues dans la même séance, le ton du métal, la finition et les proportions sont assortis intentionnellement — une subtilité difficile à reproduire quand chaque partenaire achète séparément à des moments différents." },
        { heading: "Assorti ne veut pas dire identique", body: "Un ensemble cohérent peut quand même refléter deux styles personnels différents — une alliance en diamant pour l'un, une alliance à coupe confort unie pour l'autre — tout en partageant le même métal et la même finition pour l'harmonie visuelle." },
        { heading: "S'associer avec une bague de fiançailles existante", body: "Si un partenaire a déjà une bague de fiançailles, nous concevons son alliance pour qu'elle s'aligne parfaitement contre — un détail vraiment difficile à bien réussir sans voir les deux pièces ensemble en CAD." },
      ],
    },
  },
  {
    slug: "alliances-diamant",
    category: "wedding-bands",
    heroImage: "/bands/band-diamond.webp",
    heroImageAlt: { en: "A diamond eternity wedding band", fr: "Une alliance éternité en diamants" },
    relatedBlogSlugs: ["or-blanc-or-rose-ou-platine-quel-metal-choisir"],
    en: {
      title: "Diamond Wedding Bands",
      subtitle: "Full or half eternity, channel-set or pavé — a band with its own quiet sparkle, worn alone or stacked.",
      seoTitle: "Custom Diamond Wedding Band — Montreal",
      seoDescription: "Design a custom diamond wedding band in Montreal. Full or half eternity, channel-set or pavé, in your choice of metal and stone quality.",
      sections: [
        { heading: "Full vs. half eternity", body: "A full eternity band is set with diamonds all the way around, which looks stunning but generally can't be resized easily. A half-eternity band is set on the top half only, keeping the comfort and resizability of a plain band." },
        { heading: "Setting styles change how it wears daily", body: "Channel-set diamonds sit flush and snag-resistant, ideal for active hands. Prong or shared-prong settings show more of each stone's brilliance but sit slightly higher, with a bit more exposure to daily wear." },
        { heading: "Stacking with your engagement ring", body: "A diamond band is one of the most popular pieces to stack alongside an engagement ring — we design the curve and stone placement specifically to sit flush against your existing ring, not just any generic band." },
      ],
    },
    fr: {
      title: "Alliances en diamants",
      subtitle: "Éternité complète ou demi-éternité, serti-rail ou pavé — un anneau avec son propre scintillement discret, porté seul ou superposé.",
      seoTitle: "Alliance en diamants sur mesure — Montréal",
      seoDescription: "Concevez une alliance en diamants sur mesure à Montréal. Éternité complète ou demi, serti-rail ou pavé, dans le métal et la qualité de pierre de votre choix.",
      sections: [
        { heading: "Éternité complète vs demi-éternité", body: "Une alliance éternité complète est sertie de diamants tout autour, ce qui est magnifique mais généralement difficile à redimensionner. Une demi-éternité est sertie seulement sur la moitié supérieure, gardant le confort et la redimensionnabilité d'un anneau uni." },
        { heading: "Le style de sertissage change le port quotidien", body: "Les diamants en serti-rail sont à fleur et résistent aux accrochages, idéal pour des mains actives. Les sertis à griffes ou griffes partagées montrent davantage la brillance de chaque pierre mais sont légèrement plus hauts, avec un peu plus d'exposition à l'usure quotidienne." },
        { heading: "Superposer avec votre bague de fiançailles", body: "Une alliance en diamants est l'une des pièces les plus populaires à superposer avec une bague de fiançailles — nous concevons la courbe et le placement des pierres spécifiquement pour qu'elle s'aligne contre votre bague existante." },
      ],
    },
  },
  {
    slug: "pendentifs",
    category: "fine-jewelry",
    heroImage: "/jewelry/pendant-bee.jpg",
    heroImageAlt: { en: "A custom gold pendant with a bee charm design", fr: "Un pendentif en or sur mesure avec un design de charm abeille" },
    relatedBlogSlugs: ["guide-pendentifs-sur-mesure"],
    en: {
      title: "Custom Pendants",
      subtitle: "A single meaningful detail — an initial, a birthstone, a symbol — designed around what it means to you.",
      seoTitle: "Custom Pendant Design — Montreal",
      seoDescription: "Design a custom pendant in Montreal — initial, birthstone, or symbolic charm, built around your exact idea and chain preference.",
      sections: [
        { heading: "The most personal category we design", body: "Unlike an engagement ring, a custom pendant often carries a very specific, individual meaning — a child's initial, a birthstone, a symbol tied to a memory — which makes the design conversation as important as the piece itself." },
        { heading: "Chain length changes how it wears", body: "A 16-18 inch chain sits at the collarbone for everyday visibility; 20-24 inches sits lower, better suited to layering with other necklaces — worth deciding before finalizing the pendant's proportions." },
        { heading: "Popular starting points", body: "Initial pendants, birthstone settings, and symbolic charms — a shape, an icon meaningful to you — are the most requested designs, though a genuinely custom concept from a sketch or idea is equally possible." },
        { heading: "Building a piece you can add to over time", body: "Many clients start with a single pendant and design a second one for a later milestone — a child, an anniversary — meant to be worn together on the same chain." },
      ],
    },
    fr: {
      title: "Pendentifs sur mesure",
      subtitle: "Un seul détail significatif — une initiale, une pierre de naissance, un symbole — conçu autour de ce qu'il représente pour vous.",
      seoTitle: "Design de pendentif sur mesure — Montréal",
      seoDescription: "Concevez un pendentif sur mesure à Montréal — initiale, pierre de naissance ou charm symbolique, construit autour de votre idée exacte et de votre préférence de chaîne.",
      sections: [
        { heading: "La catégorie la plus personnelle que nous concevons", body: "Contrairement à une bague de fiançailles, un pendentif sur mesure porte souvent une signification très précise et individuelle — l'initiale d'un enfant, une pierre de naissance, un symbole lié à un souvenir — ce qui rend la conversation de design aussi importante que la pièce elle-même." },
        { heading: "La longueur de chaîne change le port", body: "Une chaîne de 16-18 pouces se place à la clavicule pour une visibilité quotidienne ; 20-24 pouces se place plus bas, mieux adaptée pour superposer avec d'autres colliers — à décider avant de finaliser les proportions du pendentif." },
        { heading: "Points de départ populaires", body: "Les pendentifs initiale, les sertissages de pierre de naissance et les charms symboliques — une forme, une icône significative pour vous — sont les designs les plus demandés, bien qu'un concept vraiment sur mesure à partir d'un croquis ou d'une idée soit tout aussi possible." },
        { heading: "Construire une pièce à laquelle ajouter avec le temps", body: "Plusieurs clients commencent avec un seul pendentif et en conçoivent un deuxième pour une étape ultérieure — un enfant, un anniversaire — destiné à être porté ensemble sur la même chaîne." },
      ],
    },
  },
  {
    slug: "boucles-oreilles",
    category: "fine-jewelry",
    heroImage: "/jewelry/earrings-hoops.jpg",
    heroImageAlt: { en: "Custom diamond hoop earrings", fr: "Des boucles d'oreilles créoles diamants sur mesure" },
    relatedBlogSlugs: ["guide-boucles-oreilles-sur-mesure"],
    en: {
      title: "Custom Earrings",
      subtitle: "Hoops, studs, huggies, or drops — designed and set entirely to your specifications, not pulled from a catalogue.",
      seoTitle: "Custom Earring Design — Montreal",
      seoDescription: "Design custom earrings in Montreal — hoops, studs, huggies, or drops, built in your choice of size, metal, and stone quality.",
      sections: [
        { heading: "The most common custom earring requests", body: "Diamond hoops, pavé huggies, and stud pairs make up the majority of what we design — each can be built in your choice of size, metal, and stone quality rather than the fixed options of a retail catalogue." },
        { heading: "Comfort for daily wear", body: "Earrings are worn longer per day than almost any other jewelry category, so weight and backing style genuinely matter — we can advise on lighter constructions for anyone who wears earrings all day, every day." },
        { heading: "Designing a pair vs. a single statement piece", body: "Most requests are for a matched pair, but a single ear crawler or an asymmetric design — different styles per ear — has become an increasingly popular way to create something distinctly personal." },
        { heading: "Matching an existing piece", body: "If you already own a ring or pendant in a specific metal and stone quality, we can match new earrings to it precisely — useful for building a cohesive set over time." },
      ],
    },
    fr: {
      title: "Boucles d'oreilles sur mesure",
      subtitle: "Créoles, puces, huggies ou pendantes — conçues et serties entièrement selon vos spécifications, pas tirées d'un catalogue.",
      seoTitle: "Design de boucles d'oreilles sur mesure — Montréal",
      seoDescription: "Concevez des boucles d'oreilles sur mesure à Montréal — créoles, puces, huggies ou pendantes, construites selon la taille, le métal et la qualité de pierre de votre choix.",
      sections: [
        { heading: "Les demandes les plus courantes en boucles sur mesure", body: "Les créoles diamants, les huggies pavé et les paires de puces constituent la majorité de ce que nous concevons — chacune peut être construite selon la taille, le métal et la qualité de pierre de votre choix plutôt que les options fixes d'un catalogue de détail." },
        { heading: "Le confort pour un port quotidien", body: "Les boucles d'oreilles sont portées plus longtemps par jour que presque toute autre catégorie de bijou, donc le poids et le style de fermoir comptent vraiment — nous pouvons conseiller des constructions plus légères pour quiconque porte des boucles toute la journée." },
        { heading: "Concevoir une paire vs une pièce statement unique", body: "La plupart des demandes sont pour une paire assortie, mais un grimpeur d'oreille unique ou un design asymétrique — styles différents par oreille — est devenu une façon de plus en plus populaire de créer quelque chose de distinctement personnel." },
        { heading: "Assortir une pièce existante", body: "Si vous possédez déjà une bague ou un pendentif dans un métal et une qualité de pierre précis, nous pouvons assortir de nouvelles boucles avec précision — utile pour bâtir un ensemble cohérent avec le temps." },
      ],
    },
  },
  {
    slug: "bracelets",
    category: "fine-jewelry",
    heroImage: "/jewelry/bracelet-tennis-diamond.jpg",
    heroImageAlt: { en: "A white gold diamond tennis bracelet", fr: "Un bracelet tennis en diamants et or blanc" },
    relatedBlogSlugs: [],
    en: {
      title: "Custom Bracelets",
      subtitle: "Tennis, bangle, or chain-link — a bracelet built to your wrist size and your exact stone and metal preferences.",
      seoTitle: "Custom Bracelet Design — Montreal",
      seoDescription: "Design a custom bracelet in Montreal — tennis, bangle, or chain-link, built to your exact wrist size and stone preferences.",
      sections: [
        { heading: "Getting the fit right matters most", body: "Unlike a ring, a bracelet's fit is forgiving in inches but unforgiving in feel — we measure your wrist directly, or guide you through it remotely, rather than defaulting to a standard length, since even a quarter-inch changes how it sits." },
        { heading: "Tennis vs. bangle vs. chain-link", body: "A tennis bracelet is a continuous line of stones for maximum sparkle; a bangle is a solid, structured piece with a bolder presence; a chain-link design offers the most flexibility to mix metals and add pendant charms over time." },
        { heading: "Stacking considerations", body: "If you plan to wear it alongside other bracelets, we can design the clasp and profile specifically to sit well in a stack rather than fight for space on the wrist." },
        { heading: "A piece that works for everyday or occasion wear", body: "Metal weight and setting security are the two details that most determine whether a bracelet holds up to daily wear versus special-occasion-only use — worth flagging your intended use at the consultation." },
      ],
    },
    fr: {
      title: "Bracelets sur mesure",
      subtitle: "Tennis, jonc ou chaîne — un bracelet construit selon la taille de votre poignet et vos préférences exactes de pierre et de métal.",
      seoTitle: "Design de bracelet sur mesure — Montréal",
      seoDescription: "Concevez un bracelet sur mesure à Montréal — tennis, jonc ou chaîne, construit selon la taille exacte de votre poignet et vos préférences de pierre.",
      sections: [
        { heading: "Bien ajuster la taille compte le plus", body: "Contrairement à une bague, l'ajustement d'un bracelet est tolérant en pouces mais exigeant en sensation — nous mesurons votre poignet directement, ou vous guidons à distance, plutôt que de nous fier à une longueur standard, car même un quart de pouce change tout." },
        { heading: "Tennis vs jonc vs chaîne", body: "Un bracelet tennis est une ligne continue de pierres pour un scintillement maximal ; un jonc est une pièce solide et structurée avec une présence plus affirmée ; un design en chaîne offre le plus de flexibilité pour mélanger les métaux et ajouter des charms avec le temps." },
        { heading: "Considérations pour la superposition", body: "Si vous prévoyez le porter avec d'autres bracelets, nous pouvons concevoir le fermoir et le profil spécifiquement pour qu'il s'intègre bien dans un empilement plutôt que de se disputer l'espace sur le poignet." },
        { heading: "Une pièce pour le quotidien ou les occasions", body: "Le poids du métal et la sécurité du sertissage sont les deux détails qui déterminent le plus si un bracelet résiste au port quotidien ou convient seulement aux occasions spéciales — à préciser lors de la consultation." },
      ],
    },
  },
  {
    slug: "single-tooth",
    category: "grillz",
    heroImage: "/grillz/single-tooth.png",
    heroImageAlt: { en: "A single tooth gold grillz cap", fr: "Un grillz une dent en or" },
    relatedBlogSlugs: ["culture-grillz-bijoux-hip-hop", "entretien-nettoyage-grillz", "tendance-single-tooth-grillz"],
    en: {
      title: "Single Tooth Grillz",
      subtitle: "One statement cap, entirely custom-fit — the most understated way to start with grillz.",
      seoTitle: "Custom Single Tooth Grillz — Montreal",
      seoDescription: "Design a custom single tooth grillz cap in Montreal, made from your own dental impression in your choice of metal and finish.",
      sections: [
        { heading: "A lower-commitment way to start", body: "A single tooth cap lets you try the look and feel of custom grillz without committing to a full set — many clients start here before deciding whether to expand later." },
        { heading: "Still a genuinely custom fit", body: "Even a single cap is made from your own dental impression, not a generic mold — it fits precisely and stays comfortably in place, unlike the one-size clip-on grillz sold online." },
        { heading: "Metal and finish options", body: "Available in yellow, white, or rose gold, high-polish or matte finish, with or without a single accent stone — a small piece with real room for personalization." },
        { heading: "Placement matters", body: "A canine or a front incisor each read very differently when you smile — worth discussing which tooth and which side during your consultation, since it changes the overall visual effect significantly." },
      ],
    },
    fr: {
      title: "Grillz single tooth",
      subtitle: "Une dent signature, entièrement personnalisée — la façon la plus discrète de commencer avec les grillz.",
      seoTitle: "Grillz single tooth sur mesure — Montréal",
      seoDescription: "Concevez un grillz single tooth sur mesure à Montréal, fabriqué à partir de votre propre empreinte dentaire, dans le métal et la finition de votre choix.",
      sections: [
        { heading: "Une façon de commencer avec moins d'engagement", body: "Une dent unique vous permet d'essayer le look et la sensation des grillz sur mesure sans vous engager pour un ensemble complet — plusieurs clients commencent ici avant de décider d'étendre plus tard." },
        { heading: "Toujours un ajustement vraiment sur mesure", body: "Même une seule dent est fabriquée à partir de votre propre empreinte dentaire, pas un moule générique — elle s'ajuste avec précision et reste confortablement en place, contrairement aux grillz clip-on universels vendus en ligne." },
        { heading: "Options de métal et de finition", body: "Disponible en or jaune, blanc ou rose, fini haute brillance ou mat, avec ou sans une pierre d'accent unique — une petite pièce avec une vraie place pour la personnalisation." },
        { heading: "Le placement compte", body: "Une canine ou une incisive avant se lisent très différemment lorsque vous souriez — à discuter, quelle dent et quel côté, lors de votre consultation, puisque ça change significativement l'effet visuel général." },
      ],
    },
  },
  {
    slug: "full-ice-out",
    category: "grillz",
    heroImage: "/grillz/full-ice-out.png",
    heroImageAlt: { en: "A full ice out rose gold grillz set fully paved with diamonds", fr: "Un ensemble de grillz full ice out en or rose entièrement pavé de diamants" },
    relatedBlogSlugs: ["culture-grillz-bijoux-hip-hop", "entretien-nettoyage-grillz", "grillz-occasions-speciales"],
    en: {
      title: "Full Ice Out Grillz",
      subtitle: "Rose gold fully paved in diamonds — every angle catches the light. The most statement-making piece we make.",
      seoTitle: "Custom Full Ice Out Grillz — Montreal",
      seoDescription: "Design custom full ice out grillz in Montreal — fully paved in diamonds over your chosen metal, made from your exact dental impression.",
      sections: [
        { heading: "What 'full ice out' means", body: "Every visible surface of the grillz is paved edge-to-edge in diamonds or stones, over a rose gold — or your chosen metal — base — the most maximalist version of custom grillz, built for people who want maximum visual impact." },
        { heading: "Built from your exact dental impression", body: "Like every grillz piece we make, a full ice out set starts from your own dental mold — either taken at home with our kit or in person in Montreal — so the fit is precise, not generic." },
        { heading: "Stone and metal choices", body: "Natural or lab-grown diamonds, and your choice of base metal tone underneath the pavé — the density and cut of the stones is where most of the customization and budget range lives." },
        { heading: "Care matters more with a fully paved surface", body: "With stones covering the entire surface, keeping the piece brilliant requires the same care routine as any heavily set jewelry — see our grillz care guide for the specifics." },
      ],
    },
    fr: {
      title: "Grillz full ice out",
      subtitle: "Or rose entièrement pavé de diamants — chaque angle capte la lumière. La pièce la plus spectaculaire que nous fabriquons.",
      seoTitle: "Grillz full ice out sur mesure — Montréal",
      seoDescription: "Concevez des grillz full ice out sur mesure à Montréal — entièrement pavés de diamants sur le métal de votre choix, fabriqués à partir de votre empreinte dentaire exacte.",
      sections: [
        { heading: "Ce que « full ice out » signifie", body: "Chaque surface visible du grillz est pavée bord à bord de diamants ou de pierres, sur une base en or rose — ou le métal de votre choix — la version la plus maximaliste des grillz sur mesure, pour ceux qui veulent un impact visuel maximal." },
        { heading: "Fabriqué à partir de votre empreinte dentaire exacte", body: "Comme chaque pièce de grillz que nous fabriquons, un ensemble full ice out part de votre propre moule dentaire — pris à la maison avec notre kit ou en personne à Montréal — pour un ajustement précis, pas générique." },
        { heading: "Choix de pierres et de métal", body: "Diamants naturels ou de laboratoire, et le ton de métal de base sous le pavé de votre choix — la densité et la taille des pierres sont là où se trouve la majeure partie de la personnalisation et de la fourchette de budget." },
        { heading: "L'entretien compte davantage avec une surface entièrement pavée", body: "Avec des pierres couvrant toute la surface, garder la pièce brillante demande la même routine d'entretien que tout bijou fortement serti — consultez notre guide d'entretien des grillz pour les détails." },
      ],
    },
  },
];

export function getStylePage(category: StyleCategory, slug: string): StylePage | undefined {
  return stylePages.find((p) => p.category === category && p.slug === slug);
}

export function getStylePagesByCategory(category: StyleCategory): StylePage[] {
  return stylePages.filter((p) => p.category === category);
}
