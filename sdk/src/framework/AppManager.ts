import { AppDefinition } from "../types/app";
import { OS } from "./OS";

export class AppManager {
  private os: OS;

  constructor(os: OS) {
    this.os = os;
  }

  public async getInstalledApps(): Promise<AppDefinition[]> {
    const api = await this.os.getRPCAPI();
    return await api.apps_getInstalledApps();
  }

  public async launchApp(app: AppDefinition) {
    const api = await this.os.getRPCAPI();
    return await api.apps_launchApp(app);
  }
}
