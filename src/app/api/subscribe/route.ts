import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const scriptUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!scriptUrl) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  let body: { email?: string; creator?: string; name?: string; page?: string; site?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const response = await fetch(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, creator: body.creator, name: body.name, page: body.page, site: body.site }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Failed to save" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
