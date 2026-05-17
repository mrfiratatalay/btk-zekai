"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/api/auth";
import { useAnalysesStore, useProjectsStore, useProfileStore } from "@/lib/buyer-store";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const loadAnalyses = useAnalysesStore((s) => s.load);
  const loadProjects = useProjectsStore((s) => s.load);
  const loadProfile = useProfileStore((s) => s.load);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    loadAnalyses();
    loadProjects();
    loadProfile().catch(() => {});
  }, [router, loadAnalyses, loadProjects, loadProfile]);

  if (typeof window !== "undefined" && !isLoggedIn()) return null;

  return <>{children}</>;
}
