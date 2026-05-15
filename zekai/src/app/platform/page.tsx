import { Suspense } from "react";
import { PlatformBuyerFlow } from "@/components/platform/PlatformBuyerFlow";

export default function PlatformPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
      <PlatformBuyerFlow />
    </Suspense>
  );
}
