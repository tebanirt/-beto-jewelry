"use client";

import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import Magnetic from "@/components/ui/Magnetic";

const RING_IMAGES = [
  "/rings/ring-solitaire-rose-gold.jpg",
  "/rings/ring-cushion-pave.jpg",
  "/rings/ring-halo-cushion.jpg",
  "/rings/ring-three-stone-oval.jpg",
  "/rings/ring-toi-et-moi.jpg",
  "/rings/ring-oval-hidden-halo.jpg",
  "/rings/ring-toi-et-moi-2.jpg",
  "/rings/ring-marquise.jpg",
  "/rings/ring-emerald-solitaire.jpg",
  "/rings/ring-oval-accent.jpg",
  "/rings/ring-cushion-solitaire.jpg",
];

const STYLES = [
  { slug: "solitaire", name: "Solitaire", desc: "Élégance intemporelle et sans interruption." },
  { slug: "pave", name: "Pavé", desc: "Un anneau scintillant de diamants." },
  { slug: "halo", name: "Halo", desc: "Une couronne de diamants autour de votre pierre centrale." },
  { slug: "trois-pierres", name: "Trois-pierres", desc: "Passé, présent et avenir." },
  { slug: "toi-et-moi", name: "Toi et Moi", desc: "Deux diamants, un lien éternel." },
  { slug: "halo-cache", name: "Halo caché", desc: "Brillance discrète, invisible du dessus." },
  { slug: "vintage", name: "Vintage", desc: "Détails complexes, âme intemporelle." },
  { slug: "serti-tension", name: "Serti-tension", desc: "Architecture moderne, présence extraordinaire." },
  { slug: "taille-emeraude", name: "Taille émeraude", desc: "Lignes épurées, grâce architecturale." },
  { slug: "accents-flottants", name: "Accents flottants", desc: "Diamants marquise qui dansent sur l'anneau." },
  { slug: "coussin-solitaire", name: "Coussin solitaire", desc: "Courbes douces, présence affirmée." },
];

const PROCESS_STEPS = [
  { step: "01", title: "Consultation", body: "Nous commençons par une consultation de 30 à 45 minutes — virtuelle ou en personne à Montréal. Nous apprenons à vous connaître, votre vision, votre délai et votre budget." },
  { step: "02", title: "Design 3D", body: "En ~48 heures, vous recevez un rendu 3D précis de votre bague. Vous pouvez réviser, ajuster et valider avant qu'un seul gramme de métal soit touché." },
  { step: "03", title: "Production", body: "Une fois votre design approuvé, la production commence. Chaque bague est fabriquée à la main avec des métaux sourcés éthiquement et des diamants certifiés." },
  { step: "04", title: "Livraison", body: "Votre bague arrive dans un emballage premium Beto Jewelry — accompagnée de la documentation complète et d'un certificat d'authenticité." },
];

const FAQS = [
  { q: "Combien de temps faut-il pour créer une bague de fiançailles sur mesure à Montréal ?", a: "Généralement 3 à 6 semaines de l'approbation du design à la livraison, selon la complexité et le volume de production en cours. Nous vous donnons un calendrier précis au début de votre projet." },
  { q: "Qu'est-ce que le dépôt de design de 200$ ?", a: "Le dépôt de design de 200 CAD sécurise votre projet et initie le processus de design. Il est non remboursable, mais crédité à 100% vers le prix final de votre bague si vous procédez." },
];

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Bague de fiançailles sur mesure à Montréal",
  serviceType: "Création de bijoux sur mesure",
  areaServed: { "@type": "City", name: "Montréal" },
  provider: { "@type": "JewelryStore", name: "Beto Jewelry", url: "https://betojewelry.com" },
  description:
    "Conception et fabrication de bagues de fiançailles sur mesure à Montréal, de la consultation au rendu 3D en 48h jusqu'à la livraison.",
};

export default function BaguesFiancaillesMontrealContent() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      <PageHero
        eyebrow="Bagues de fiançailles sur mesure"
        title="Votre bague de fiançailles sur mesure,"
        titleItalic="conçue et fabriquée à Montréal."
        subtitle="Un joaillier diplômé (DEP en bijouterie), plus de 500 créations réalisées, et un rendu 3D de votre bague en 48 heures — avant qu'un seul gramme d'or ne soit coulé."
      />

      {/* Intro */}
      <section className="py-16 lg:py-20 bg-beto-white">
        <div className="container-beto max-w-3xl">
          <AnimatedSection>
            <p className="text-base text-beto-gray leading-relaxed mb-6">
              Chercher une <strong className="text-beto-black font-medium">bague de fiançailles sur mesure à Montréal</strong> ne devrait jamais ressembler à un pari. Chez Beto Jewelry, chaque bague est dessinée de zéro autour de votre histoire — pas choisie dans un catalogue, pas produite en série. Vous parlez directement à la personne qui conçoit et fabrique votre pièce.
            </p>
            <p className="text-base text-beto-gray leading-relaxed">
              Le processus commence par une consultation gratuite, sans obligation, pour comprendre votre vision, votre budget et votre échéancier. Vous recevez ensuite un rendu 3D précis de votre bague en environ 48 heures — vous la voyez avant qu&rsquo;elle existe, et vous approuvez chaque détail avant le début de la fabrication.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-beto-gray-subtle/30 bg-beto-offwhite">
        <div className="container-beto grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="font-display text-beto-black text-3xl lg:text-4xl font-light">500+</p>
            <p className="text-xs uppercase tracking-widest text-beto-gray-light mt-2">Créations réalisées</p>
          </div>
          <div>
            <p className="font-display text-beto-black text-3xl lg:text-4xl font-light">48h</p>
            <p className="text-xs uppercase tracking-widest text-beto-gray-light mt-2">Rendu 3D</p>
          </div>
          <div>
            <p className="font-display text-beto-black text-3xl lg:text-4xl font-light">5,0★</p>
            <p className="text-xs uppercase tracking-widest text-beto-gray-light mt-2">Avis Google</p>
          </div>
        </div>
      </section>

      {/* Styles grid */}
      <section className="py-20 lg:py-28 bg-beto-white">
        <div className="container-beto">
          <AnimatedSection className="mb-12">
            <p className="text-label text-beto-gold mb-3">Nos styles</p>
            <h2 className="font-display text-beto-black text-3xl lg:text-4xl font-light">
              Trouvez votre direction.
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-beto-gray-subtle/20">
            {STYLES.map((style, i) => (
              <AnimatedSection key={style.slug} delay={i * 0.05}>
                <Link
                  href={`/engagement-rings/${style.slug}`}
                  className="group bg-beto-white hover:bg-beto-offwhite transition-colors duration-300 flex flex-col"
                >
                  <div className="w-full aspect-square relative overflow-hidden bg-beto-offwhite">
                    <Image
                      src={RING_IMAGES[i] ?? ""}
                      alt={`Bague de fiançailles ${style.name} — Beto Jewelry Montréal`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-beto-black text-lg font-normal mb-1">{style.name}</h3>
                    <p className="text-sm text-beto-gray">{style.desc}</p>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 lg:py-28 bg-beto-offwhite">
        <div className="container-beto">
          <AnimatedSection className="mb-12 max-w-xl">
            <p className="text-label text-beto-gold mb-3">Le processus sur mesure</p>
            <h2 className="font-display text-beto-black text-3xl lg:text-4xl font-light">
              De votre idée à un héritage de famille.
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {PROCESS_STEPS.map((s, i) => (
              <AnimatedSection key={s.step} delay={i * 0.08}>
                <p className="font-display text-beto-gold text-2xl font-light mb-3">{s.step}</p>
                <h3 className="font-display text-beto-black text-lg font-normal mb-2">{s.title}</h3>
                <p className="text-sm text-beto-gray leading-relaxed">{s.body}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28 bg-beto-white">
        <div className="container-beto max-w-3xl">
          <AnimatedSection className="mb-10">
            <h2 className="font-display text-beto-black text-3xl lg:text-4xl font-light">
              Questions fréquentes
            </h2>
          </AnimatedSection>
          <div className="flex flex-col gap-8">
            {FAQS.map((f) => (
              <AnimatedSection key={f.q}>
                <h3 className="font-display text-beto-black text-lg font-normal mb-2">{f.q}</h3>
                <p className="text-sm text-beto-gray leading-relaxed">{f.a}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-beto-black">
        <div className="container-beto text-center max-w-2xl mx-auto">
          <AnimatedSection>
            <p className="text-label text-beto-gold mb-4">Prêt à commencer ?</p>
            <h2 className="font-display text-white text-3xl lg:text-4xl font-light mb-6">
              Votre bague de fiançailles sur mesure commence ici.
            </h2>
            <p className="text-white/60 mb-10">
              Consultation gratuite, sans obligation — à Montréal ou en virtuel.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Magnetic>
                <Button href="/design-your-jewelry/custom-design" variant="gold" size="lg">
                  Commencer votre design
                </Button>
              </Magnetic>
              <Magnetic>
                <Button href="/design-your-jewelry/consultation" variant="secondary" size="lg" className="border-white/30 text-white hover:bg-white/5 hover:border-white">
                  Réserver une consultation
                </Button>
              </Magnetic>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
