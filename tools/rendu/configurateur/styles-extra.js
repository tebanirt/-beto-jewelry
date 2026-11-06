// Styles supplémentaires du configurateur Beto Jewelry.
// Chaque style est un assemblage des briques du moteur 3D :
//   head  : tête (sol4 = 4 griffes de Rayane, HC = halo caché, hc6x = six griffes)
//   band  : jonc (sol4, hc4, hc6x)
//   pave  : { cover: "demi" | "3/4" }   petits diamants sur le dessus du jonc
//   halo, cathedral, bezel, baguettes, split (jonc fendu), twist (torsadé) : {} ou true
//   sides : { shape: "rond" | "poire" | "emeraude" }  pierres de côté (trois pierres)
//   conf  : { bandWidth (mm), orientation: "eo" (est-ouest), toi: true, head: "bezel", sideKit }
// Pour ajouter un style à partir d'une photo : identifier ces briques sur la photo, ajouter une ligne add(...),
// puis générer ses 4 vignettes (blanc, jaune, rose, platine) dans img/thumbs/<id>_<métal>.jpg.
// Seulement des designs génériques du métier (jamais la copie d'un modèle signature d'une autre maison).
(function () {
  var B = window.BetoRing;
  if (!B || !B.STYLES) return;
  var base = B.styleById("solitaire").conf;
  var S4 = { default: "sol4" };
  var HC = { default: "hc4", coussin: "hcpave", radiant: "hcpave", princesse: "hcpave", emeraude: "hcpave" };
  function add(id, label, desc, tag, grams14, kit, accents, conf, family) {
    if (B.STYLES.some(function (x) { return x.id === id; })) return;
    B.STYLES.push({ id: id, label: label, desc: desc, tag: tag, grams14: grams14, kit: kit, accents: accents,
      family: family || "classique", conf: Object.assign({}, base, conf || {}) });
  }
  add("cathedralepave", "Cathédrale pavée", "Les épaules s'élèvent en arche pour porter la pierre, bordées de petits diamants.", "Nouveau",
    3.5, { head: S4, band: "sol4", cathedral: {}, pave: { cover: "demi" } }, { n: 18, ct: 0.22 }, { bandWidth: 2 });
  add("halocathedrale", "Halo caché, cathédrale", "L'arche de la cathédrale et un halo secret visible de profil.", "Nouveau",
    3.5, { head: HC, band: "sol4", cathedral: {} }, { n: 18, ct: 0.09 }, { bandWidth: 2 });
  add("troispierrespave", "Trois pierres pavée", "Trois pierres rondes sur un jonc pavé, pour un éclat continu.", "Nouveau",
    3.7, { head: S4, band: "sol4", sides: { shape: "rond" }, pave: { cover: "demi" } }, { n: 18, ct: 0.22 }, { bandWidth: 2, sideKit: "rond" });
  add("bezelpave", "Bezel pavé", "Le serti clos moderne, adouci par un jonc pavé.", "Nouveau",
    3.7, { head: S4, band: "sol4", bezel: {}, pave: { cover: "demi" } }, { n: 18, ct: 0.22 }, { head: "bezel", bandWidth: 2 });
  add("estouesthalo", "Est-ouest, halo caché", "La pierre posée à l'horizontale, avec un halo secret.", "Nouveau",
    3.3, { head: HC, band: "sol4" }, { n: 18, ct: 0.09 }, { orientation: "eo", bandWidth: 2 });
  add("toietmoipave", "Toi et moi pavé", "Vos deux pierres côte à côte, sur un jonc pavé.", "Nouveau",
    3.9, { head: S4, band: "sol4", toi: true, pave: { cover: "demi" } }, { n: 18, ct: 0.22 }, { toi: true, bandWidth: 2 });
})();
