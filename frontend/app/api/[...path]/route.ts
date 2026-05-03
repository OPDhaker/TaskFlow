import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8080";

export const dynamic = "force-dynamic";

async function forward(request: NextRequest, path: string[]) {
  const search = request.nextUrl.search || "";
  const target = `${BACKEND_URL}/${path.join("/")}${search}`;
  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  const response = await fetch(target, {
    method: request.method,
    headers: filterHeaders(request.headers),
    body: hasBody ? await request.text() : undefined,
    cache: "no-store",
  });

  const headers = new Headers();
  const contentType = response.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  return new NextResponse(response.body, {
    status: response.status,
    headers,
  });
}

function filterHeaders(headers: Headers) {
  const nextHeaders = new Headers();
  const contentType = headers.get("content-type");
  if (contentType) nextHeaders.set("content-type", contentType);
  return nextHeaders;
}

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return forward(request, path);
}
