import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "relstone_accessibility_v1";

const AccessibilityContext = createContext(null);

const getStoredState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const AccessibilityProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [settings, setSettings] = useState(() => {
    const stored = getStoredState();
    return {
      highContrast: Boolean(stored?.highContrast),
      keyboardFocus: stored?.keyboardFocus !== false,
      fontScale: Number.isFinite(stored?.fontScale) ? Math.min(1.2, Math.max(0.9, stored.fontScale)) : 1,
      language: stored?.language === "es" ? "es" : "en",
    };
  });

  useEffect(() => {
    i18n.changeLanguage(settings.language);
  }, [i18n, settings.language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    document.documentElement.setAttribute("data-high-contrast", settings.highContrast ? "true" : "false");
    document.documentElement.setAttribute("data-keyboard-focus", settings.keyboardFocus ? "true" : "false");
    document.documentElement.style.setProperty("--app-font-scale", String(settings.fontScale));
  }, [settings]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.altKey && event.key.toLowerCase() === "h") {
        event.preventDefault();
        setSettings((prev) => ({ ...prev, highContrast: !prev.highContrast }));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const setLanguage = useCallback((language) => {
    setSettings((prev) => ({ ...prev, language: language === "es" ? "es" : "en" }));
  }, []);

  const setFontScale = useCallback((fontScale) => {
    const parsed = Number(fontScale);
    if (!Number.isFinite(parsed)) return;
    setSettings((prev) => ({ ...prev, fontScale: Math.min(1.2, Math.max(0.9, parsed)) }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setSettings((prev) => ({ ...prev, highContrast: !prev.highContrast }));
  }, []);

  const toggleKeyboardFocus = useCallback(() => {
    setSettings((prev) => ({ ...prev, keyboardFocus: !prev.keyboardFocus }));
  }, []);

  const resetAccessibility = useCallback(() => {
    setSettings({
      highContrast: false,
      keyboardFocus: true,
      fontScale: 1,
      language: "en",
    });
  }, []);

  const value = useMemo(() => ({
    ...settings,
    setLanguage,
    setFontScale,
    toggleHighContrast,
    toggleKeyboardFocus,
    resetAccessibility,
  }), [settings, setLanguage, setFontScale, toggleHighContrast, toggleKeyboardFocus, resetAccessibility]);

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
};
