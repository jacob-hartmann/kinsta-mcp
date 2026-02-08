import { describe, it, expect, vi } from "vitest";

vi.mock("./ping.js", () => ({ registerPingTool: vi.fn() }));
vi.mock("./operations.js", () => ({ registerOperationTools: vi.fn() }));
vi.mock("./company.js", () => ({ registerCompanyTools: vi.fn() }));
vi.mock("./dns.js", () => ({ registerDnsTools: vi.fn() }));
vi.mock("./sites.js", () => ({ registerSiteTools: vi.fn() }));
vi.mock("./environments.js", () => ({ registerEnvironmentTools: vi.fn() }));
vi.mock("./site-tools.js", () => ({ registerSiteOperationTools: vi.fn() }));
vi.mock("./plugins-themes.js", () => ({ registerPluginThemeTools: vi.fn() }));
vi.mock("./domains.js", () => ({ registerDomainTools: vi.fn() }));
vi.mock("./edge-cdn.js", () => ({ registerEdgeCdnTools: vi.fn() }));
vi.mock("./sftp-users.js", () => ({ registerSftpUserTools: vi.fn() }));
vi.mock("./analytics.js", () => ({ registerAnalyticsTools: vi.fn() }));
vi.mock("./backups.js", () => ({ registerBackupTools: vi.fn() }));
vi.mock("./logs.js", () => ({ registerLogTools: vi.fn() }));

import { registerTools } from "./index.js";
import { registerPingTool } from "./ping.js";
import { registerOperationTools } from "./operations.js";
import { registerCompanyTools } from "./company.js";
import { registerDnsTools } from "./dns.js";
import { registerSiteTools } from "./sites.js";
import { registerEnvironmentTools } from "./environments.js";
import { registerSiteOperationTools } from "./site-tools.js";
import { registerPluginThemeTools } from "./plugins-themes.js";
import { registerDomainTools } from "./domains.js";
import { registerEdgeCdnTools } from "./edge-cdn.js";
import { registerSftpUserTools } from "./sftp-users.js";
import { registerAnalyticsTools } from "./analytics.js";
import { registerBackupTools } from "./backups.js";
import { registerLogTools } from "./logs.js";

describe("registerTools", () => {
  it("should call all registration functions with the server", () => {
    const server = {} as any;
    registerTools(server);

    expect(registerPingTool).toHaveBeenCalledWith(server);
    expect(registerOperationTools).toHaveBeenCalledWith(server);
    expect(registerCompanyTools).toHaveBeenCalledWith(server);
    expect(registerDnsTools).toHaveBeenCalledWith(server);
    expect(registerSiteTools).toHaveBeenCalledWith(server);
    expect(registerEnvironmentTools).toHaveBeenCalledWith(server);
    expect(registerSiteOperationTools).toHaveBeenCalledWith(server);
    expect(registerPluginThemeTools).toHaveBeenCalledWith(server);
    expect(registerDomainTools).toHaveBeenCalledWith(server);
    expect(registerEdgeCdnTools).toHaveBeenCalledWith(server);
    expect(registerSftpUserTools).toHaveBeenCalledWith(server);
    expect(registerAnalyticsTools).toHaveBeenCalledWith(server);
    expect(registerBackupTools).toHaveBeenCalledWith(server);
    expect(registerLogTools).toHaveBeenCalledWith(server);
  });
});
