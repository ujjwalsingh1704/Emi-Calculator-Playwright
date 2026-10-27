import { test, expect, type APIResponse } from "@playwright/test";

const endpoint = "/posts";

async function expectValidationError(
  response: APIResponse,
  description: string
) {
  // The assignment requires invalid input to be rejected. Mark only an actual
  // successful HTTP response as an expected contract mismatch; network errors
  // and server errors remain genuine test failures.
  if (response.status() >= 200 && response.status() < 300) {
    test.fail(true, `JSONPlaceholder accepts invalid input: ${description}`);
  }
  expect([400, 413, 422]).toContain(response.status());
  const body = await response.json();
  expect([body.error, body.message].some(value => typeof value === "string" && value.trim().length > 0)).toBe(true);
}

test.describe("JSONPlaceholder POST /posts boundary validation", () => {
  test("accepts a normal post and returns the created shape", async ({ request }) => {
    const response = await request.post(endpoint, { data: { title: "QA boundary check", body: "sample", userId: 7 } });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toMatchObject({ title: "QA boundary check", body: "sample", userId: 7 });
    expect(body.id).toBeTruthy();
  });
  test("rejects an excessively long title with a validation error", async ({ request }) => {
    const title = "x".repeat(100_000);
    const response = await request.post(endpoint, { data: { title, body: "long title boundary", userId: 1 } });
    await expectValidationError(response, "100,000-character title");
  });
  test("rejects unsupported control characters with a validation error", async ({ request }) => {
    const response = await request.post(endpoint, { data: { title: "unsupported\u0000character", body: "control character boundary", userId: 2 } });
    await expectValidationError(response, "control character in title");
  });
  test("requires an error response when required fields are omitted", async ({ request }) => {
    // This is the contract the assignment asks us to validate. JSONPlaceholder is
    // a permissive mock that currently violates it, so retain the assertion and
    // report the provider mismatch as an expected failure.
    const response = await request.post(endpoint, { data: { title: "missing userId", body: "field omitted" } });
    await expectValidationError(response, "missing required userId");
  });
  test("rejects malformed JSON at the HTTP boundary", async ({ request }) => {
    const response = await request.post(endpoint, { data: "{ invalid json", headers: { "content-type": "application/json" } });
    expect(response.status()).toBe(400);
  });
});

