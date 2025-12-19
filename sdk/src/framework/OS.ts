import { AppDefinition } from "../types/app";
import pmrpc from "pm-rpc";
import { OperatingSystemAPI } from "../types/os";

export type OSConfig = {
  target: Window;
};

export class OS {
  private config: OSConfig;

  constructor(config: OSConfig = { target: window.parent }) {
    this.config = config;
  }

  async getInstalledApps(): Promise<AppDefinition[]> {
    console.log("inside getInstalledApps");
    return (await this.getRPCAPI()).apps_getInstalledApps();
  }

  async getRPCAPI(): Promise<OperatingSystemAPI> {
    return await pmrpc.api.request<OperatingSystemAPI>("photon_os", {
      target: this.config.target,
    });
  }
}
