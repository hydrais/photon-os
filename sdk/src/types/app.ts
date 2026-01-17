export type AppBundleId = string;

export type AppDefinition = {
  bundleId: AppBundleId;
  name: string;
  author: string;
  url: string;
  icon?: string;
};

export type RunningAppInstance = {
  definition: AppDefinition;
  startedAt: Date;
  lastForegroundedAt: Date;
  isInBackground: boolean;
};
