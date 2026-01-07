/**
 * Represents a linked Second Life account visible to apps via the SDK.
 */
export type SecondLifeAccount = {
  /** Second Life avatar UUID (key) */
  avatarUuid: string;
  /** Second Life avatar display name */
  avatarName: string;
  /** When the account was linked (ISO 8601 timestamp) */
  linkedAt: string;
};
