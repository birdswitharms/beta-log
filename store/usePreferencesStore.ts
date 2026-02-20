import { create } from "zustand";
import { getSetting, setSetting } from "../db/database";

type WeightUnit = "lbs" | "kg";

const LBS_PER_KG = 2.20462;

interface PreferencesState {
  weightUnit: WeightUnit;
  onboardingComplete: boolean;
  loaded: boolean;

  load: () => Promise<void>;
  setWeightUnit: (unit: WeightUnit) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  weightUnit: "lbs",
  onboardingComplete: false,
  loaded: false,

  load: async () => {
    const unit = await getSetting("weight_unit");
    const onboarding = await getSetting("onboarding_complete");
    set({
      weightUnit: (unit as WeightUnit) ?? "lbs",
      onboardingComplete: onboarding === "true",
      loaded: true,
    });
  },

  setWeightUnit: async (unit) => {
    await setSetting("weight_unit", unit);
    set({ weightUnit: unit });
  },

  completeOnboarding: async () => {
    await setSetting("onboarding_complete", "true");
    set({ onboardingComplete: true });
  },
}));

export function formatWeight(lbs: number | null, unit: WeightUnit): string {
  if (lbs === null) return "";
  if (unit === "kg") {
    const kg = lbs / LBS_PER_KG;
    return `${Math.round(kg * 10) / 10} kg`;
  }
  return `${lbs} lbs`;
}

export function convertToLbs(value: number, unit: WeightUnit): number {
  if (unit === "kg") {
    return Math.round(value * LBS_PER_KG * 10) / 10;
  }
  return value;
}

export function convertFromLbs(lbs: number, unit: WeightUnit): number {
  if (unit === "kg") {
    return Math.round((lbs / LBS_PER_KG) * 10) / 10;
  }
  return lbs;
}
