import type { OS } from "./OS";

export class SystemManager {
  private os: OS;

  constructor(os: OS) {
    this.os = os;
  }

  /** Get the OS scale factor */
  public async getScale(): Promise<number> {
    const api = await this.os.getRPCAPI();
    return await api.system_getScale();
  }

  /** Apply the OS scale factor to the current document */
  public async applyScale(): Promise<number> {
    const scale = await this.getScale();
    document.documentElement.style.setProperty("--os-scale", String(scale));
    document.documentElement.style.zoom = String(scale);
    return scale;
  }
}
