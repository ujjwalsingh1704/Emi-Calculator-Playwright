import { test, expect } from "@playwright/test";

const endpoint = "/posts";
test.describe("JSONPlaceholder POST /posts boundary validation", () => {
  test("accepts a normal post and returns the created shape", async ({ request }) => {
    const response = await request.post(endpoint, { data: { title: "QA boundary check", body: "sample", userId: 7 } });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toMatchObject({ title: "QA boundary check", body: "sample", userId: 7 });
    expect(body.id).toBeTruthy();
  });
  test("accepts an excessively long title without server failure", async ({ request }) => {
    const title = "x".repeat(100_000);
    const response = await request.post(endpoint, { data: { title, body: "long title boundary", userId: 1 } });
    expect(response.status()).toBe(201);
    expect((await response.json()).title).toBe(title);
  });
  test("accepts supported special characters in title and body", async ({ request }) => {
    const title = "quotes ' \" & < > / — emoji 🚀";
    const response = await request.post(endpoint, { data: { title, body: "unicode ✓ 漢字", userId: 2 } });
    expect(response.status()).toBe(201);
    expect((await response.json()).title).toBe(title);
  });
  test("documents JSONPlaceholder behavior when required fields are omitted", async ({ request }) => {
    const response = await request.post(endpoint, { data: { title: "missing userId", body: "field omitted" } });
    // JSONPlaceholder is a permissive mock: it returns 201 rather than enforcing a production schema.
    expect(response.status()).toBe(201);
    expect(await response.json()).toMatchObject({ title: "missing userId", body: "field omitted" });
  });
  test("rejects malformed JSON at the HTTP boundary", async ({ request }) => {
    const response = await request.post(endpoint, { data: "{ invalid json", headers: { "content-type": "application/json" } });
    expect([400, 500]).toContain(response.status());
  });
});
