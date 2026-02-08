import { describe, it, expect } from "vitest";
import {
  KinstaClient,
  loadKinstaConfig,
  isKinstaConfigured,
  KinstaAuthError,
  getKinstaClient,
  getKinstaClientOrThrow,
  KinstaClientError,
} from "./index.js";

describe("kinsta barrel export", () => {
  it("should export all value members", () => {
    expect(KinstaClient).toBeDefined();
    expect(loadKinstaConfig).toBeDefined();
    expect(isKinstaConfigured).toBeDefined();
    expect(KinstaAuthError).toBeDefined();
    expect(getKinstaClient).toBeDefined();
    expect(getKinstaClientOrThrow).toBeDefined();
    expect(KinstaClientError).toBeDefined();
  });
});
