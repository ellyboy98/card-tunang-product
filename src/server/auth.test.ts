import { beforeEach, describe, expect, it } from "vitest";
import { checkPassword, isValidSession, makeSessionToken, timingSafeEqual } from "./auth";

beforeEach(() => {
  process.env.ADMIN_PASSWORD = "rahsia-123";
  process.env.ADMIN_SECRET = "test-secret";
});

describe("timingSafeEqual", () => {
  it("is true only for identical strings", () => {
    expect(timingSafeEqual("abc", "abc")).toBe(true);
    expect(timingSafeEqual("abc", "abd")).toBe(false);
    expect(timingSafeEqual("abc", "ab")).toBe(false);
    expect(timingSafeEqual("", "")).toBe(true);
    expect(timingSafeEqual("", "a")).toBe(false);
    expect(timingSafeEqual("ünïcode", "ünïcode")).toBe(true);
  });
});

describe("session", () => {
  it("accepts its own token and nothing else", async () => {
    const token = await makeSessionToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
    await expect(isValidSession(token)).resolves.toBe(true);
    await expect(isValidSession(token.slice(0, -1) + (token.endsWith("0") ? "1" : "0"))).resolves.toBe(false);
    await expect(isValidSession(undefined)).resolves.toBe(false);
    await expect(isValidSession("")).resolves.toBe(false);
  });

  it("changes when the secret rotates", async () => {
    const before = await makeSessionToken();
    process.env.ADMIN_SECRET = "rotated";
    await expect(isValidSession(before)).resolves.toBe(false);
  });
});

describe("checkPassword", () => {
  it("compares against ADMIN_PASSWORD", () => {
    expect(checkPassword("rahsia-123")).toBe(true);
    expect(checkPassword("rahsia-124")).toBe(false);
    expect(checkPassword("")).toBe(false);
  });
});
