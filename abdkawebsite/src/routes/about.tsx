import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import office from "@/assets/building-white.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "À propos — NOUFA AEK" }, { name: "description", content: "NOUFA AEK Promotion Immobilière, promoteur basé à Oran." }] }),
  component: () => (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
        <motion.img initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}
          src={office} className="rounded-3xl shadow-elegant w-full" alt="Bureau NOUFA AEK" />
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-gold mb-2">À propos</div>
          <h1 className="font-display text-5xl mb-4">NOUFA AEK Promotion Immobilière</h1>
          <p className="text-muted-foreground leading-relaxed">
            Implantés à Oran, nous concevons et livrons des logements neufs alliant qualité de construction,
            confort moderne et accompagnement humain. Notre programme AADL COSIDER USTO illustre notre
            engagement pour une immobilier accessible et élégant.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  ),
});
