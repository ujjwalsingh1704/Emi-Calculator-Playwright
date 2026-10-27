import { NextRequest, NextResponse } from "next/server";

const MAX_TITLE_LENGTH = 255;
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/;

function validationError(message: string, status = 422) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return validationError("Request body must be valid JSON.", 400);
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return validationError("Request body must be a JSON object.");
  }

  const { title, body, userId } = payload as Record<string, unknown>;

  if (typeof title !== "string" || title.trim().length === 0) {
    return validationError("title is required and must be a non-empty string.");
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return validationError(`title must be no more than ${MAX_TITLE_LENGTH} characters.`);
  }
  if (CONTROL_CHARACTERS.test(title)) {
    return validationError("title must not contain control characters.");
  }
  if (typeof body !== "string" || body.trim().length === 0) {
    return validationError("body is required and must be a non-empty string.");
  }
  if (!Number.isSafeInteger(userId) || Number(userId) < 1) {
    return validationError("userId is required and must be a positive integer.");
  }

  try {
    const upstream = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: title.trim(), body, userId }),
      cache: "no-store"
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "The upstream post service could not create the post." },
        { status: 502 }
      );
    }

    const createdPost = await upstream.json();
    return NextResponse.json(createdPost, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "The upstream post service is unavailable." },
      { status: 502 }
    );
  }
}
