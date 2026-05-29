import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe } from "lucide-react";

const KEY = "noufa-lang";
type Lang = "en" | "fr" | "ar";

const langs: { code: Lang; label: string; native: string; flag: string }[] = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧" },
  { code: "fr", label: "French", native: "Français", flag: "🇫🇷" },
  { code: "ar", label: "Arabic", native: "العربية", flag: "🇩🇿" },
];

export function LanguageGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) setOpen(true);
  }, []);

  function pick(l: Lang) {
    localStorage.setItem(KEY, l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
            className="bg-card rounded-3xl shadow-elegant max-w-md w-full p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
              className="mx-auto size-16 rounded-full bg-gradient-gold flex items-center justify-center mb-5"
            >
              <Globe className="size-8 text-primary" />
            </motion.div>
            <h2 className="font-display text-3xl mb-2">Choose your language</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Français · English · العربية
            </p>
            <div className="space-y-3">
              {langs.map((l, i) => (
                <motion.button
                  key={l.code}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => pick(l.code)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border border-border bg-background hover:border-gold hover:bg-gold/5 transition-colors group"
                >
                  <span className="text-2xl">{l.flag}</span>
                  <span className="flex-1 text-left">
                    <span className="block font-display text-lg group-hover:text-gold transition-colors">
                      {l.native}
                    </span>
                    <span className="block text-xs text-muted-foreground">{l.label}</span>
                  </span>
                  <span className="text-gold opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
