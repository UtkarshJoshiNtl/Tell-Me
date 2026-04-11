import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Skip static assets, PWA shell (service worker + offline page + manifest),
     * and image extensions so middleware does not run on those requests.
     */
    "/((?!_next/static|_next/image|sw\\.js|offline\\.html|manifest\\.webmanifest|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp)$).*)",
  ],
};
