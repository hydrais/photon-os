import type { SecondLifeAccount } from "../types/secondlife";
import type { OS } from "./OS";

export class AccountManager {
  private os: OS;

  constructor(os: OS) {
    this.os = os;
  }

  /** Get all Second Life accounts linked to the current user */
  public async getLinkedSecondLifeAccounts(): Promise<SecondLifeAccount[]> {
    const api = await this.os.getRPCAPI();
    return await api.accounts_getLinkedSecondLifeAccounts();
  }

  /** Unlink a Second Life account from the current user */
  public async unlinkSecondLifeAccount(avatarUuid: string): Promise<void> {
    const api = await this.os.getRPCAPI();
    await api.accounts_unlinkSecondLifeAccount(avatarUuid);
  }
}
