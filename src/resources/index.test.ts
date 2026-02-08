import { describe, it, expect, vi, beforeEach } from "vitest";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

vi.mock("../kinsta/client-factory.js", () => ({
  getKinstaClientOrThrow: vi.fn(),
}));

vi.mock("@modelcontextprotocol/sdk/server/mcp.js", () => ({
  ResourceTemplate: class ResourceTemplate {
    constructor(
      public uri: string,
      public opts: any
    ) {}
  },
}));

import { registerResources } from "./index.js";
import { getKinstaClientOrThrow } from "../kinsta/client-factory.js";

type ResourceHandler = (...args: any[]) => Promise<any>;

interface RegisteredResource {
  name: string;
  template: any;
  metadata: any;
  handler: ResourceHandler;
}

function setupResources() {
  const resources: RegisteredResource[] = [];

  const server = {
    registerResource: vi.fn((...args: any[]) => {
      resources.push({
        name: args[0],
        template: args[1],
        metadata: args[2],
        handler: args[3],
      });
    }),
  } as unknown as McpServer;

  registerResources(server);
  return { server, resources };
}

function createMockClient(requestResult: any) {
  const client = {
    getCompanyId: vi.fn().mockReturnValue("company-123"),
    request: vi.fn().mockResolvedValue(requestResult),
  };
  (getKinstaClientOrThrow as ReturnType<typeof vi.fn>).mockReturnValue(client);
  return client;
}

describe("registerResources", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register all 4 resources", () => {
    const { server } = setupResources();
    expect(server.registerResource).toHaveBeenCalledTimes(4);
  });

  describe("sites resource", () => {
    it("should return sites data on success", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "sites")!;

      createMockClient({ success: true, data: { sites: [] } });

      const result = await res.handler("kinsta://sites", {} as any);
      expect(result.contents[0].uri).toBe("kinsta://sites");
      expect(result.contents[0].mimeType).toBe("application/json");
    });

    it("should throw on API error", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "sites")!;

      createMockClient({
        success: false,
        error: { code: "SERVER_ERROR", message: "fail" },
      });

      await expect(res.handler("kinsta://sites", {} as any)).rejects.toThrow(
        "Kinsta API Error"
      );
    });
  });

  describe("site-details resource", () => {
    it("should return site details on success", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "site-details")!;

      createMockClient({ success: true, data: { site: { id: "s1" } } });

      const result = await res.handler(
        "kinsta://sites/s1",
        { site_id: "s1" },
        {} as any
      );
      expect(result.contents[0].uri).toBe("kinsta://sites/s1");
    });

    it("should throw on API error", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "site-details")!;

      createMockClient({
        success: false,
        error: { code: "NOT_FOUND", message: "not found" },
      });

      await expect(
        res.handler("kinsta://sites/s1", { site_id: "s1" }, {} as any)
      ).rejects.toThrow("Kinsta API Error");
    });

    it("should list sites for template", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "site-details")!;

      createMockClient({
        success: true,
        data: { company: { sites: [{ id: "s1", name: "Site 1" }] } },
      });

      const listResult = await res.template.opts.list({} as any);
      expect(listResult.resources).toEqual([
        { uri: "kinsta://sites/s1", name: "Site 1" },
      ]);
    });

    it("should return empty list on API error in template list", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "site-details")!;

      createMockClient({
        success: false,
        error: { code: "SERVER_ERROR", message: "fail" },
      });

      const listResult = await res.template.opts.list({} as any);
      expect(listResult.resources).toEqual([]);
    });
  });

  describe("site-environments resource", () => {
    it("should return environments on success", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "site-environments")!;

      createMockClient({ success: true, data: { environments: [] } });

      const result = await res.handler(
        "kinsta://sites/s1/environments",
        { site_id: "s1" },
        {} as any
      );
      expect(result.contents[0].uri).toBe("kinsta://sites/s1/environments");
    });

    it("should throw on API error", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "site-environments")!;

      createMockClient({
        success: false,
        error: { code: "SERVER_ERROR", message: "fail" },
      });

      await expect(
        res.handler(
          "kinsta://sites/s1/environments",
          { site_id: "s1" },
          {} as any
        )
      ).rejects.toThrow("Kinsta API Error");
    });

    it("should list sites for template", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "site-environments")!;

      createMockClient({
        success: true,
        data: { company: { sites: [{ id: "s1", name: "Site 1" }] } },
      });

      const listResult = await res.template.opts.list({} as any);
      expect(listResult.resources).toEqual([
        { uri: "kinsta://sites/s1/environments", name: "Site 1 Environments" },
      ]);
    });

    it("should return empty list on API error in template list", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "site-environments")!;

      createMockClient({
        success: false,
        error: { code: "SERVER_ERROR", message: "fail" },
      });

      const listResult = await res.template.opts.list({} as any);
      expect(listResult.resources).toEqual([]);
    });
  });

  describe("regions resource", () => {
    it("should return regions on success", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "regions")!;

      createMockClient({ success: true, data: { regions: [] } });

      const result = await res.handler("kinsta://regions", {} as any);
      expect(result.contents[0].uri).toBe("kinsta://regions");
    });

    it("should throw on API error", async () => {
      const { resources } = setupResources();
      const res = resources.find((r) => r.name === "regions")!;

      createMockClient({
        success: false,
        error: { code: "SERVER_ERROR", message: "fail" },
      });

      await expect(res.handler("kinsta://regions", {} as any)).rejects.toThrow(
        "Kinsta API Error"
      );
    });
  });
});
