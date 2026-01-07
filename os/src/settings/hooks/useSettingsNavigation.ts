import { useState, useCallback, useEffect } from "react";
import type { SettingsSectionId } from "../types";

// Check if we're on a medium+ screen (desktop)
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 768px)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isDesktop;
}

export interface SettingsNavigationState {
  activeSection: SettingsSectionId | null;
  setActiveSection: (section: SettingsSectionId | null) => void;
  goBack: () => void;
  isDesktop: boolean;
}

export function useSettingsNavigation(): SettingsNavigationState {
  const isDesktop = useIsDesktop();

  // Default to "account" on desktop, null on mobile
  const [activeSection, setActiveSectionState] = useState<SettingsSectionId | null>(
    () => (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches)
      ? "account"
      : null
  );

  // When switching to desktop, ensure we have an active section
  useEffect(() => {
    if (isDesktop && activeSection === null) {
      setActiveSectionState("account");
    }
  }, [isDesktop, activeSection]);

  const setActiveSection = useCallback((section: SettingsSectionId | null) => {
    setActiveSectionState(section);
  }, []);

  const goBack = useCallback(() => {
    setActiveSectionState(null);
  }, []);

  return {
    activeSection,
    setActiveSection,
    goBack,
    isDesktop,
  };
}
