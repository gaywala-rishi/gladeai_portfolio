import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "https://github.com/gaywala-rishi/gladeai_portfolio/releases/download/v1.1.2";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  let res: Response | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      res = await fetch(`${BASE_URL}/${file}`, { redirect: "follow" });
      break;
    } catch {
      if (attempt === 2)
        throw new Error(`Failed to fetch ${file} after 3 attempts`);
    }
  }
  res = res!;

  if (!res.ok) {
    return new NextResponse("Not found", { status: res.status });
  }

  const buffer = await res.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        res.headers.get("Content-Type") ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
