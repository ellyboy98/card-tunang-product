import { describe, expect, it } from "vitest";

// Proves the test pipeline runs inside the container. Replaced by real tests in Phase 1.
describe("pipeline", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
