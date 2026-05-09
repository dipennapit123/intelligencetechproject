import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization") ?? "";

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const upstream = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/api/admin/upload`, {
    method: "POST",
    headers: { authorization: auth },
    body: formData,
  });

  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
