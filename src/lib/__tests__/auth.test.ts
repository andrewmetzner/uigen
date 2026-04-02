import { vi, test, expect, beforeEach } from "vitest";
import { jwtVerify } from "jose";
import { createSession } from "@/lib/auth";

vi.mock("server-only", () => ({}));

const mockCookieSet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ set: mockCookieSet })),
}));

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

beforeEach(() => {
  mockCookieSet.mockClear();
});

test("sets auth-token cookie", async () => {
  await createSession("user-1", "user@example.com");

  expect(mockCookieSet).toHaveBeenCalledOnce();
  const [name] = mockCookieSet.mock.calls[0];
  expect(name).toBe("auth-token");
});

test("cookie is httpOnly with correct path and sameSite", async () => {
  await createSession("user-1", "user@example.com");

  const [, , options] = mockCookieSet.mock.calls[0];
  expect(options.httpOnly).toBe(true);
  expect(options.path).toBe("/");
  expect(options.sameSite).toBe("lax");
});

test("cookie expires in ~7 days", async () => {
  const before = Date.now();
  await createSession("user-1", "user@example.com");
  const after = Date.now();

  const [, , options] = mockCookieSet.mock.calls[0];
  const expiresMs = options.expires.getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  expect(expiresMs).toBeGreaterThanOrEqual(before + sevenDays - 1000);
  expect(expiresMs).toBeLessThanOrEqual(after + sevenDays + 1000);
});

test("JWT contains userId and email", async () => {
  await createSession("user-42", "hello@example.com");

  const [, token] = mockCookieSet.mock.calls[0];
  const { payload } = await jwtVerify(token, JWT_SECRET);

  expect(payload.userId).toBe("user-42");
  expect(payload.email).toBe("hello@example.com");
});

test("JWT is signed with HS256", async () => {
  await createSession("user-1", "user@example.com");

  const [, token] = mockCookieSet.mock.calls[0];
  const header = JSON.parse(atob(token.split(".")[0]));
  expect(header.alg).toBe("HS256");
});

test("JWT cannot be verified with a wrong secret", async () => {
  await createSession("user-1", "user@example.com");

  const [, token] = mockCookieSet.mock.calls[0];
  const wrongSecret = new TextEncoder().encode("wrong-secret");

  await expect(jwtVerify(token, wrongSecret)).rejects.toThrow();
});
