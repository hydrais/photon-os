import * as pmrpc from "pm-rpc";
import { OperatingSystemAPI } from "../types/os";
import { AppManager } from "./AppManager";

export type OSConfig = {
  target: Window;
};

export class OS {
  public apps: AppManager;

  private config: OSConfig;

  constructor(config: OSConfig = { target: window.parent }) {
    this.config = config;
    this.apps = new AppManager(this);
  }

  public async homeButton() {
    const api = await this.getRPCAPI();
    await api.system_homeButton();
  }

  public async getRPCAPI(): Promise<OperatingSystemAPI> {
    return await pmrpc.api.request<OperatingSystemAPI>("photon_os", {
      target: this.config.target,
    });
  }
}
