/**
 * Value types supported for preferences.
 * Stored as JSONB in the database.
 */
export type PreferenceValue =
  | string
  | number
  | boolean
  | null
  | PreferenceValue[]
  | { [key: string]: PreferenceValue };
