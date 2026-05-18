"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useProfileStore } from "@/lib/buyer-store";
import { PlatformNav } from "@/components/platform/PlatformNav";
import { QuickAnalyzeBar } from "@/components/platform/QuickAnalyzeBar";
import { BuyerOnboarding } from "@/components/platform/BuyerOnboarding";

export function BuyerDashboard() {
  const profile = useProfileStore((s) => s.profile);
  const profileLoaded = useProfileStore((s) => s.loaded);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (profileLoaded && !profile.onboarded) {
      setShowOnboarding(true);
    }
  }, [profileLoaded, profile.onboarded]);

  const firstName = profile?.name?.split(" ")[0] || "Alıcı";

  const greetings = [
    `Merhaba ${firstName} 👋`,
    `Hoş geldin ${firstName}!`,
    `Ne alacağız bugün, ${firstName}?`,
  ];
  const greeting = greetings[new Date().getHours() % greetings.length];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {showOnboarding && (
        <BuyerOnboarding onComplete={() => setShowOnboarding(false)} />
      )}

      <PlatformNav />

      <main className="flex flex-1 flex-col items-center justify-center px-4 md:px-6">
        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-10 text-center"
          >
            <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
              {greeting}
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Alışveriş karar merkezine hoş geldin.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <QuickAnalyzeBar />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
