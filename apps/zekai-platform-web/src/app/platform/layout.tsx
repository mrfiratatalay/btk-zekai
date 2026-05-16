"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/api/auth";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) router.replace("/login");
  }, [router]);

  if (typeof window !== "undefined" && !isLoggedIn()) return null;

  return <>{children}</>;
}
