/**
 * Represents the authenticated user visible to apps via the SDK.
 * This is a read-only, minimal representation.
 */
export type PhotonUser = {
  /** Unique user identifier */
  id: string;
  /** User's display name */
  displayName: string;
};
