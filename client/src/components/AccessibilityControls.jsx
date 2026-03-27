import { useState } from "react";
import { Globe, Contrast, Keyboard, Type, Accessibility, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAccessibility } from "../context/AccessibilityContext";

const AccessibilityControls = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const {
    highContrast,
    keyboardFocus,
    fontScale,
    language,
    setLanguage,
    setFontScale,
    toggleHighContrast,
    toggleKeyboardFocus,
    resetAccessibility,
  } = useAccessibility();

  return (
    <>
      {open && <div style={styles.backdrop} onClick={() => setOpen(false)} aria-hidden="true" />}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={styles.toggleBtn}
        aria-expanded={open}
        aria-controls="accessibility-panel"
        aria-label={open ? t("accessibility.closePanel") : t("accessibility.openPanel")}
      >
        {open ? <X size={18} /> : <Accessibility size={18} />}
      </button>

      {open && (
        <section id="accessibility-panel" style={styles.panel} aria-label={t("accessibility.title")}>
          <h2 style={styles.title}>{t("accessibility.title")}</h2>

          <label style={styles.label}>
            <Globe size={14} />
            <span>{t("accessibility.language")}</span>
          </label>
          <div style={styles.row}>
            <button type="button" onClick={() => setLanguage("en")} style={{ ...styles.choice, ...(language === "en" ? styles.choiceActive : {}) }}>
              {t("accessibility.english")}
            </button>
            <button type="button" onClick={() => setLanguage("es")} style={{ ...styles.choice, ...(language === "es" ? styles.choiceActive : {}) }}>
              {t("accessibility.spanish")}
            </button>
          </div>

          <button type="button" onClick={toggleHighContrast} style={styles.settingBtn}>
            <span style={styles.settingLeft}><Contrast size={14} /> {t("accessibility.highContrast")}</span>
            <strong>{highContrast ? t("accessibility.highContrastOn") : t("accessibility.highContrastOff")}</strong>
          </button>

          <button type="button" onClick={toggleKeyboardFocus} style={styles.settingBtn}>
            <span style={styles.settingLeft}><Keyboard size={14} /> {t("accessibility.keyboardNav")}</span>
            <strong>{keyboardFocus ? t("accessibility.keyboardNavOn") : t("accessibility.keyboardNavOff")}</strong>
          </button>

          <label style={styles.label}>
            <Type size={14} />
            <span>{t("accessibility.fontScale")}: {Math.round(fontScale * 100)}%</span>
          </label>
          <input
            type="range"
            min="0.9"
            max="1.2"
            step="0.05"
            value={fontScale}
            onChange={(event) => setFontScale(event.target.value)}
            style={styles.range}
          />

          <button type="button" onClick={resetAccessibility} style={styles.resetBtn}>
            {t("accessibility.reset")}
          </button>
          <p style={styles.hint}>{t("accessibility.shortcutHint")}</p>
        </section>
      )}
    </>
  );
};

const styles = {
  toggleBtn: {
    position: "fixed",
    right: 16,
    bottom: 16,
    zIndex: 999,
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "1px solid rgba(2,8,23,0.2)",
    background: "#091925",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(2,8,23,0.3)",
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(2,8,23,0.45)",
    zIndex: 997,
  },
  panel: {
    position: "fixed",
    right: 16,
    bottom: 68,
    width: "min(340px, calc(100vw - 32px))",
    borderRadius: 14,
    padding: 16,
    background: "#ffffff",
    border: "1px solid rgba(2,8,23,0.12)",
    boxShadow: "0 20px 40px rgba(2,8,23,0.25)",
    zIndex: 998,
  },
  title: {
    margin: "0 0 12px 0",
    fontSize: 16,
    fontWeight: 800,
    color: "#091925",
  },
  label: {
    margin: "8px 0",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "#334155",
    fontWeight: 700,
  },
  row: {
    display: "flex",
    gap: 8,
    marginBottom: 10,
  },
  choice: {
    borderRadius: 10,
    border: "1px solid rgba(2,8,23,0.16)",
    background: "#fff",
    color: "#0f172a",
    fontWeight: 700,
    fontSize: 13,
    padding: "8px 10px",
    cursor: "pointer",
  },
  choiceActive: {
    borderColor: "#2EABFE",
    background: "rgba(46,171,254,0.1)",
  },
  settingBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    border: "1px solid rgba(2,8,23,0.12)",
    background: "#f8fafc",
    color: "#0f172a",
    fontWeight: 700,
    fontSize: 13,
    padding: "10px 12px",
    cursor: "pointer",
    marginBottom: 8,
  },
  settingLeft: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  range: {
    width: "100%",
    marginBottom: 12,
  },
  resetBtn: {
    width: "100%",
    borderRadius: 10,
    border: "1px solid rgba(2,8,23,0.16)",
    background: "#fff",
    color: "#0f172a",
    fontWeight: 700,
    fontSize: 13,
    padding: "10px 12px",
    cursor: "pointer",
  },
  hint: {
    margin: "10px 0 0",
    fontSize: 11,
    color: "#475569",
    fontWeight: 600,
  },
};

export default AccessibilityControls;
