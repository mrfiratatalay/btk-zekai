"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import type { ArbiterCase } from "@/types/arbiter";
import { ArbiterActionBar } from "@/components/arbiter/ArbiterActionBar";
import { ArbiterDecisionHeader } from "@/components/arbiter/ArbiterDecisionHeader";
import { ArbiterEvidencePanel } from "@/components/arbiter/ArbiterEvidencePanel";
import { ArbiterPartyClaims } from "@/components/arbiter/ArbiterPartyClaims";
import { ArbiterResolutionCard } from "@/components/arbiter/ArbiterResolutionCard";
import { ArbiterReviewProgress } from "@/components/arbiter/ArbiterReviewProgress";

export function ArbiterCaseExperience({
  arbiterCase,
}: {
  arbiterCase: ArbiterCase;
}) {
  const [decisionVisible, setDecisionVisible] = useState(false);
  const showDecision = useCallback(() => setDecisionVisible(true), []);

  return (
    <main className="min-h-screen bg-[#F5F6F8] px-4 py-6">
      <div className="mx-auto max-w-[1180px] space-y-6">
        {!decisionVisible ? (
          <ArbiterReviewProgress
            steps={arbiterCase.reviewSteps}
            onComplete={showDecision}
          />
        ) : (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <ArbiterDecisionHeader arbiterCase={arbiterCase} />
            <ArbiterPartyClaims arbiterCase={arbiterCase} />
            <ArbiterEvidencePanel
              sellerEvidence={arbiterCase.sellerEvidence}
              buyerEvidence={arbiterCase.buyerEvidence}
            />
            <ArbiterResolutionCard arbiterCase={arbiterCase} />
            <ArbiterActionBar />
          </motion.div>
        )}
      </div>
    </main>
  );
}
