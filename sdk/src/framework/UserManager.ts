import type { PhotonUser } from "../types/user";
import type { OS } from "./OS";

export class UserManager {
  private os: OS;

  constructor(os: OS) {
    this.os = os;
  }

  /** Get the current authenticated user */
  public async getCurrentUser(): Promise<PhotonUser> {
    const api = await this.os.getRPCAPI();
    return await api.user_getCurrentUser();
  }
}
