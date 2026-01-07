import type { OS } from "./OS";
import type { PreferenceValue } from "../types/preferences";

/**
 * Manages user preferences for apps.
 *
 * Sandboxed methods (get, set, delete) store preferences scoped to the calling app.
 * Shared methods (getShared, setShared, deleteShared) store preferences accessible by all apps.
 */
export class PreferencesManager {
  private os: OS;

  constructor(os: OS) {
    this.os = os;
  }

  /**
   * Get a sandboxed preference value (app-specific).
   * Only accessible by the app that set it.
   */
  public async get(key: string): Promise<PreferenceValue> {
    const api = await this.os.getRPCAPI();
    return await api.prefs_getSandboxed(key);
  }

  /**
   * Set a sandboxed preference value (app-specific).
   * Only accessible by the app that set it.
   */
  public async set(key: string, value: PreferenceValue): Promise<void> {
    const api = await this.os.getRPCAPI();
    await api.prefs_setSandboxed(key, value);
  }

  /**
   * Delete a sandboxed preference (app-specific).
   */
  public async delete(key: string): Promise<void> {
    const api = await this.os.getRPCAPI();
    await api.prefs_deleteSandboxed(key);
  }

  /**
   * Get a shared preference value.
   * Accessible by all apps.
   */
  public async getShared(key: string): Promise<PreferenceValue> {
    const api = await this.os.getRPCAPI();
    return await api.prefs_getShared(key);
  }

  /**
   * Set a shared preference value.
   * Accessible by all apps.
   */
  public async setShared(key: string, value: PreferenceValue): Promise<void> {
    const api = await this.os.getRPCAPI();
    await api.prefs_setShared(key, value);
  }

  /**
   * Delete a shared preference.
   */
  public async deleteShared(key: string): Promise<void> {
    const api = await this.os.getRPCAPI();
    await api.prefs_deleteShared(key);
  }
}
