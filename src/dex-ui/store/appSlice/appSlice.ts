import { AppActionType, AppState, AppStore, AppSlice } from "./types";

const initialAppStore: AppState = {
  featuresLoading: new Set(),
};

/**
 */
const createAppSlice: AppSlice = (set, get): AppStore => {
  return {
    ...initialAppStore,
    isFeatureLoading: (feature) => {
      const { featuresLoading } = get().app;
      return featuresLoading.has(feature);
    },
    setFeaturesAsLoading: (features) => {
      set(
        ({ app }) => {
          features.forEach((feature) => app.featuresLoading.add(feature));
        },
        false,
        AppActionType.SET_FEATURES_AS_LOADING
      );
    },
    setFeaturesAsLoaded: (features) => {
      set(
        ({ app }) => {
          features.forEach((feature) => app.featuresLoading.delete(feature));
        },
        false,
        AppActionType.SET_FEATURES_AS_LOADED
      );
    },
  };
};

export { createAppSlice };
