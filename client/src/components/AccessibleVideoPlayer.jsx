import { useMemo, useState } from "react";
import ReactPlayer from "react-player";
import { AlertCircle, Captions, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAccessibility } from "../context/AccessibilityContext";

const isNativeVideo = (url) => /\.(mp4|webm|ogg)(\?|#|$)/i.test(String(url || ""));

const normalizeTrack = (track) => {
  if (!track) return null;
  if (typeof track === "string") {
    return { src: track, srclang: "en", label: "English", default: true };
  }
  if (!track.src) return null;
  return {
    src: track.src,
    srclang: String(track.srclang || track.lang || "en").toLowerCase(),
    label: track.label || (String(track.lang || "en").toLowerCase() === "es" ? "Spanish" : "English"),
    default: Boolean(track.default),
    kind: track.kind || "captions",
  };
};

const AccessibleVideoPlayer = ({ title, videoUrl, captionTracks = [], transcriptLines = [] }) => {
  const { t } = useTranslation();
  const { language } = useAccessibility();
  const [showTranscript, setShowTranscript] = useState(false);

  const normalizedTracks = useMemo(
    () => captionTracks.map(normalizeTrack).filter(Boolean),
    [captionTracks]
  );

  const hasCaptions = normalizedTracks.length > 0;
  const directVideo = isNativeVideo(videoUrl);

  if (!videoUrl) {
    return (
      <div style={styles.emptyBox}>
        <AlertCircle size={20} />
        <span>{t("video.captionsMissing")}</span>
      </div>
    );
  }

  return (
    <section style={styles.wrapper} aria-label={`${t("video.lessonVideo")}: ${title || ""}`}>
      {!hasCaptions && (
        <div style={styles.warnBox} role="alert">
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <div>
            <strong>{t("video.captionsRequired")}</strong>
            <div style={styles.warnSub}>{t("video.captionsMissing")}</div>
          </div>
        </div>
      )}

      {directVideo ? (
        <video controls style={styles.video} preload="metadata">
          <source src={videoUrl} />
          {normalizedTracks.map((track, idx) => (
            <track
              key={`${track.src}-${idx}`}
              src={track.src}
              kind={track.kind || "captions"}
              srcLang={track.srclang}
              label={track.label}
              default={track.default || track.srclang === language}
            />
          ))}
        </video>
      ) : (
        <div style={styles.playerWrap}>
          <ReactPlayer
            url={videoUrl}
            controls
            width="100%"
            height="100%"
            config={{
              youtube: { playerVars: { cc_load_policy: 1, hl: language } },
              vimeo: { playerOptions: { texttrack: language } },
            }}
          />
          <div style={styles.externalHint}>
            <Captions size={13} /> {t("video.externalVideoHint")}
          </div>
        </div>
      )}

      <div style={styles.toolsRow}>
        <button
          type="button"
          onClick={() => setShowTranscript((prev) => !prev)}
          style={styles.transcriptBtn}
          aria-expanded={showTranscript}
        >
          <FileText size={13} /> {t("video.transcript")}
        </button>
      </div>

      {showTranscript && (
        <div style={styles.transcriptBox}>
          {transcriptLines.length > 0 ? (
            <ul style={styles.transcriptList}>
              {transcriptLines.map((line, idx) => (
                <li key={`${line}-${idx}`}>{line}</li>
              ))}
            </ul>
          ) : (
            <div style={styles.transcriptEmpty}>{t("video.noTranscript")}</div>
          )}
        </div>
      )}
    </section>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  video: {
    width: "100%",
    borderRadius: 14,
    background: "#000",
    maxHeight: 520,
  },
  playerWrap: {
    width: "100%",
    aspectRatio: "16 / 9",
    borderRadius: 14,
    overflow: "hidden",
    background: "#000",
    position: "relative",
  },
  externalHint: {
    position: "absolute",
    bottom: 8,
    left: 8,
    borderRadius: 999,
    padding: "6px 10px",
    background: "rgba(2,8,23,0.75)",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    display: "flex",
    gap: 5,
    alignItems: "center",
  },
  warnBox: {
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
    borderRadius: 12,
    padding: "10px 12px",
    border: "1px solid rgba(220,38,38,0.35)",
    background: "rgba(220,38,38,0.08)",
    color: "#7f1d1d",
    fontSize: 13,
    fontWeight: 700,
  },
  warnSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: 600,
  },
  toolsRow: {
    display: "flex",
    justifyContent: "flex-start",
  },
  transcriptBtn: {
    borderRadius: 10,
    border: "1px solid rgba(2,8,23,0.14)",
    background: "#fff",
    color: "#0f172a",
    fontSize: 12,
    fontWeight: 700,
    padding: "8px 12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  transcriptBox: {
    borderRadius: 12,
    border: "1px solid rgba(2,8,23,0.1)",
    background: "#fff",
    padding: "12px 14px",
  },
  transcriptList: {
    margin: 0,
    paddingLeft: 18,
    color: "#334155",
    fontSize: 13,
    lineHeight: 1.6,
    fontWeight: 600,
  },
  transcriptEmpty: {
    color: "#475569",
    fontSize: 13,
    fontWeight: 600,
  },
  emptyBox: {
    borderRadius: 12,
    border: "1px dashed rgba(2,8,23,0.22)",
    background: "rgba(248,250,252,0.7)",
    color: "#475569",
    fontSize: 13,
    fontWeight: 700,
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
};

export default AccessibleVideoPlayer;
