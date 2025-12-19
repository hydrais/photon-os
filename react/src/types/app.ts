export type AppBundleId = string;

export type AppDefinition = {
  bundleId: AppBundleId;
  name: string;
  author: string;
  url: string;
};

export type RunningAppInstance = {
  definition: AppDefinition;
  startedAt: Date;
  isInBackground: boolean;
};
