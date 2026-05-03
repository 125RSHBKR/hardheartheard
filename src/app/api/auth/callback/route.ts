import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Use the request origin so it works on any domain (localhost, Vercel, custom)
  const origin = req.nextUrl.origin;

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(
        `${origin}${next.startsWith("/") ? next : `/${next}`}`,
      );
    }
  }

  return NextResponse.redirect(`${origin}/?auth_error=true`);
}
