import { test, expect, type APIResponse } from "@playwright/test";

const endpoint = "/posts";

async function expectProviderValidationError(response: APIResponse) {
  expect([400, 413, 422]).toContain(response.status());
  const body = await response.json();
  expect([body.error, body.message].some((value) => typeof value === "string" && value.trim().length > 0)).toBe(true);
}

test.describe("JSONPlaceholder POST /posts boundary behavior", () => {
  test("accepts a valid post and returns the created shape", async ({ request }) => {
    const response = await request.post(endpoint, {
      data: { title: "QA boundary check", body: "sample", userId: 7 }
    });
    expect(response.status()).toBe(201);
    expect(await response.json()).toMatchObject({ title: "QA boundary check", body: "sample", userId: 7, id: expect.any(Number) });
  });

  test("rejects an excessively long title (known provider mismatch)", async ({ request }) => {
    const response = await request.post(endpoint, {
      data: { title: "x".repeat(100_000), body: "long title boundary", userId: 1 }
    });
    console.info(`Observed JSONPlaceholder response for oversized title: HTTP ${response.status()}`);
    test.fail(true, `Known provider mismatch: expected a validation error, received HTTP ${response.status()}.`);
    await expectProviderValidationError(response);
  });

  test("rejects unsupported control characters (known provider mismatch)", async ({ request }) => {
    const response = await request.post(endpoint, {
      data: { title: "unsupported\u0000character", body: "control character boundary", userId: 2 }
    });
    console.info(`Observed JSONPlaceholder response for control character: HTTP ${response.status()}`);
    test.fail(true, `Known provider mismatch: expected a validation error, received HTTP ${response.status()}.`);
    await expectProviderValidationError(response);
  });

  test("requires userId (known provider mismatch)", async ({ request }) => {
    const response = await request.post(endpoint, {
      data: { title: "missing userId", body: "field omitted" }
    });
    console.info(`Observed JSONPlaceholder response for missing userId: HTTP ${response.status()}`);
    test.fail(true, `Known provider mismatch: expected a missing-field error, received HTTP ${response.status()}.`);
    await expectProviderValidationError(response);
  });

  test("rejects malformed JSON without a server error (known provider mismatch)", async ({ request }) => {
    const response = await request.post(endpoint, {
      data: Buffer.from("{ invalid json"),
      headers: { "content-type": "application/json" }
    });
    console.info(`Observed JSONPlaceholder response for malformed JSON: HTTP ${response.status()}`);
    test.fail(true, `Known provider mismatch: expected a client error, received HTTP ${response.status()}.`);
    expect(response.status()).toBe(400);
    expect((await response.json()).error).toEqual(expect.any(String));
  });
});
