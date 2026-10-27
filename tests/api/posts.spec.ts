import { test, expect, type APIResponse } from "@playwright/test";

const endpoint = "/api/posts";

async function expectValidationError(response: APIResponse) {
  expect([400, 422]).toContain(response.status());
  const body = await response.json();
  expect(body.error).toEqual(expect.any(String));
  expect(body.error.trim().length).toBeGreaterThan(0);
}

test.describe("POST /api/posts validation proxy", () => {
  test("accepts a valid post and returns the upstream created shape", async ({ request }) => {
    const response = await request.post(endpoint, {
      data: { title: "QA boundary check", body: "sample", userId: 7 }
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toMatchObject({ title: "QA boundary check", body: "sample", userId: 7 });
    expect(body.id).toBeTruthy();
  });

  test("rejects a title longer than 255 characters", async ({ request }) => {
    const response = await request.post(endpoint, {
      data: { title: "x".repeat(100_000), body: "long title boundary", userId: 1 }
    });
    await expectValidationError(response);
  });

  test("rejects unsupported control characters in a title", async ({ request }) => {
    const response = await request.post(endpoint, {
      data: { title: "unsupported\u0000character", body: "control character boundary", userId: 2 }
    });
    await expectValidationError(response);
  });

  test("requires userId", async ({ request }) => {
    const response = await request.post(endpoint, {
      data: { title: "missing userId", body: "field omitted" }
    });
    await expectValidationError(response);
  });

  test("rejects malformed JSON with a client error", async ({ request }) => {
    const response = await request.post(endpoint, {
      data: "{ invalid json",
      headers: { "content-type": "application/json" }
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).error).toEqual(expect.any(String));
  });
});
