import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RoutePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  accent: "buyer" | "seller" | "arbiter" | "neutral";
};

const accentClasses = {
  buyer: "border-blue-200 bg-blue-50 text-blue-950",
  seller: "border-emerald-200 bg-emerald-50 text-emerald-950",
  arbiter: "border-amber-200 bg-amber-50 text-amber-950",
  neutral: "border-zinc-200 bg-zinc-50 text-zinc-950",
};

export function RoutePlaceholder({
  eyebrow,
  title,
  description,
  accent,
}: RoutePlaceholderProps) {
  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <Button asChild variant="ghost" className="w-fit px-0">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Ana ekrana don
          </Link>
        </Button>

        <Card className={accentClasses[accent]}>
          <CardHeader>
            <Badge className="w-fit" variant="secondary">
              {eyebrow}
            </Badge>
            <CardTitle className="text-3xl">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="max-w-2xl text-base leading-7 opacity-80">
              {description}
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
