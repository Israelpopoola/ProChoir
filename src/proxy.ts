import { NextResponse, type NextRequest } from "next/server";
import { PIN_COOKIE, pinToken } from "@/lib/pin";

// Choir pages need the shared PIN (when CHOIR_PIN is set). MD pages have their own login.
export async function proxy(request: NextRequest) {
  const pin = process.env.CHOIR_PIN;
  if (!pin) return NextResponse.next();

  if (request.cookies.get(PIN_COOKIE)?.value === (await pinToken(pin))) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/pin";
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/", "/songs/:path*", "/setlists/:path*", "/past", "/api/export/:path*"],
};
