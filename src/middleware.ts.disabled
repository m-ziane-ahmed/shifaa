import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPPORTED_LOCALES = ["fr", "ar"];
const DEFAULT_LOCALE = "fr";

function detectLocale(request: NextRequest): string {
  // 1. Cookie utilisateur (priorité maximale)
  const cookieLocale = request.cookies.get("shifaa_locale")?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    return cookieLocale;
  }
  // 2. Accept-Language header
  const acceptLang = request.headers.get("accept-language") ?? "";
  if (acceptLang.startsWith("ar")) return "ar";
  return DEFAULT_LOCALE;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclure les fichiers statiques et manifest du middleware
  if (
    pathname.startsWith("/_next") ||
    pathname === "/manifest.json" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/locales") ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|txt|xml)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Rafraîchir la session si expirée
  await supabase.auth.getUser();

  // Ajouter le header locale pour les Server Components
  const locale = detectLocale(request);
  supabaseResponse.headers.set("x-locale", locale);

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
