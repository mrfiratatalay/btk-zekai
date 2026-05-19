import { revalidatePath } from "next/cache";
import { type NextRequest } from "next/server";

const SECRET = process.env.REVALIDATE_SECRET ?? "zekai-revalidate-2024";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const productId = req.nextUrl.searchParams.get("productId");

  if (secret !== SECRET) {
    return Response.json({ error: "Geçersiz token." }, { status: 401 });
  }

  revalidatePath("/");

  if (productId) {
    revalidatePath(`/product/${productId}`);
  }

  return Response.json({ revalidated: true, productId });
}
