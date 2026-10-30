import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// pemeriksaan optimistik: hanya memeriksa keberadaan cookie
export function proxy(request: NextRequest) {
  if (!request.cookies.has("sesi")) {
    return NextResponse.redirect(new URL("/masuk", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/katalog/tambah"],
};

export default function middleware(request: NextRequest) {
  return proxy(request);
}

