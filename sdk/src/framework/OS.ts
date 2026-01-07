import * as pmrpc from "pm-rpc";
import { OperatingSystemAPI } from "../types/os";
import { AccountManager } from "./AccountManager";
import { AppManager } from "./AppManager";
import { PreferencesManager } from "./PreferencesManager";
import { UserManager } from "./UserManager";

export type OSConfig = {
  target: Window;
};

export class OS {
  public accounts: AccountManager;
  public apps: AppManager;
  public prefs: PreferencesManager;
  public user: UserManager;

  private config: OSConfig;

  constructor(config: OSConfig = { target: window.parent }) {
    this.config = config;
    this.accounts = new AccountManager(this);
    this.apps = new AppManager(this);
    this.prefs = new PreferencesManager(this);
    this.user = new UserManager(this);
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
