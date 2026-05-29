export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <div className="font-display text-2xl">NOUFA AEK</div>
          <p className="text-sm mt-2 opacity-80">Promotion Immobilière — Oran</p>
        </div>
        <div className="text-sm space-y-1 opacity-90">
          <div className="text-gold uppercase text-xs tracking-widest mb-2">Adresse</div>
          <div>Bloc N°17, AADL COSIDER USTO</div>
          <div>Bir El Djir, Oran 31028</div>
        </div>
        <div className="text-sm space-y-1 opacity-90">
          <div className="text-gold uppercase text-xs tracking-widest mb-2">Contact</div>
          <div>0560 00 27 05</div>
          <div>Ouvert dim. dès 8h</div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs opacity-60">
        © {new Date().getFullYear()} NOUFA AEK Promotion Immobilière
      </div>
    </footer>
  );
}
