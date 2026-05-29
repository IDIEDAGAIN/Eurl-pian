import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Phone, ShieldCheck, Sparkles } from "lucide-react";
import tower from "@/assets/tower-hero.jpg";
import office from "@/assets/building-white.jpg";
import { LanguageGate } from "@/components/site/LanguageGate";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NOUFA AEK — Promotion Immobilière à Oran" },
      { name: "description", content: "Découvrez nos appartements neufs au Bloc N°17 AADL COSIDER USTO, Bir El Djir, Oran. Achetez en ligne en quelques clics." },
      { property: "og:title", content: "NOUFA AEK — Promotion Immobilière" },
      { property: "og:description", content: "Appartements neufs à Oran — réservez le vôtre en ligne." },
    ],
  }),
  component: Index,
});

import type { Variants } from "motion/react";
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const } }),
};

function Index() {
  return (
    <div className="min-h-screen">
      <LanguageGate />
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 opacity-30 mix-blend-screen" style={{ background: "radial-gradient(60% 60% at 30% 30%, oklch(0.85 0.15 75 / 0.6), transparent)" }} />
        <div className="container mx-auto px-6 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center relative">
          <div>
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold mb-6">
              <Sparkles className="size-4" /> Bloc N°17 — AADL COSIDER USTO
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="show" className="font-display text-5xl md:text-7xl leading-[1.05] font-medium">
              Habiter un <span className="italic text-gold">geste</span>,<br />pas seulement un lieu.
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} initial="hidden" animate="show" className="mt-6 text-lg opacity-85 max-w-lg">
              NOUFA AEK conçoit des résidences pensées pour la lumière, la durabilité et le confort des familles d'Oran.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} initial="hidden" animate="show" className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-gradient-gold text-primary hover:opacity-90 group">
                <Link to="/apartments">
                  Voir les appartements <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                <a href="tel:0560002705"><Phone className="mr-2 size-4" /> 0560 00 27 05</a>
              </Button>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.92, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as const }} className="relative">
            <div className="absolute -inset-6 bg-gradient-gold rounded-3xl blur-2xl opacity-40" />
            <img src={tower} alt="Résidence NOUFA AEK — Bloc N°17 AADL Oran" className="relative rounded-3xl shadow-elegant w-full object-cover aspect-[4/5]" />
          </motion.div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="container mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
        {[
          { icon: ShieldCheck, title: "Promoteur certifié", text: "Programmes conformes aux normes AADL." },
          { icon: MapPin, title: "Cœur d'Oran", text: "Bir El Djir — proximité écoles, commerces, autoroute." },
          { icon: Sparkles, title: "Finitions premium", text: "Cuisines équipées, ascenseur, parking, sécurité 24/7." },
        ].map((f, i) => (
          <motion.div key={f.title} variants={fadeUp} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="p-8 rounded-2xl border bg-card shadow-soft hover:shadow-elegant hover:-translate-y-1 transition-all">
            <f.icon className="size-7 text-gold mb-4" />
            <h3 className="font-display text-2xl mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.text}</p>
          </motion.div>
        ))}
      </section>

      {/* About strip */}
      <section className="container mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <motion.img variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          src={office} alt="Bureau NOUFA AEK" className="rounded-3xl shadow-elegant w-full object-cover aspect-[4/3]" />
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-gold mb-3">À propos</div>
          <h2 className="font-display text-4xl md:text-5xl mb-5">Un savoir-faire familial,<br />une exigence d'architecte.</h2>
          <p className="text-muted-foreground leading-relaxed">
            Depuis nos débuts à Oran, nous accompagnons les familles algériennes vers la propriété avec transparence et qualité.
            Chaque résidence est étudiée pour offrir un cadre de vie lumineux, fonctionnel et durable.
          </p>
          <Button asChild className="mt-8 bg-primary hover:bg-primary/90"><Link to="/apartments">Découvrir le catalogue</Link></Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
