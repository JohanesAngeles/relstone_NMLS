import { useEffect, useRef, useCallback } from 'react';
import API from '../api/axios';

const INACTIVITY_LIMIT_MS = 6 * 60 * 1000; // 6 minutes — NMLS requirement
const FLUSH_INTERVAL_MS   = 30 * 1000;      // flush to backend every 30s

/**
 * useSeatTimer
 *
 * NMLS-compliant seat time tracking hook.
 *
 * Rules enforced:
 * - Auto-logout after 6 minutes of inactivity (no mouse/key/scroll/touch)
 * - Seat time only accumulates while student is actively engaged
 * - Seat time flushed to backend every 30s and on unmount
 * - On timeout: calls onInactivityLogout() so CoursePortal can return
 *   student to the start of the current unit (per NMLS spec)
 *
 * @param {string}   courseId           - MongoDB course _id
 * @param {number}   moduleOrder        - current module order number
 * @param {boolean}  enabled            - pause when false (e.g. during quiz)
 * @param {function} onInactivityLogout - called when student times out
 */
const useSeatTimer = ({ courseId, moduleOrder, enabled = true, onInactivityLogout }) => {
  const seatSecondsRef      = useRef(0);
  const lastTickRef         = useRef(null);
  const inactivityTimerRef  = useRef(null);
  const flushIntervalRef    = useRef(null);
  const enabledRef          = useRef(enabled);

  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  // ── Flush accumulated seat time to backend ────────────────────────
  const flush = useCallback(async () => {
    if (!courseId || seatSecondsRef.current <= 0) return;
    const delta = seatSecondsRef.current;
    seatSecondsRef.current = 0;
    try {
      await API.put(`/enrollment/${courseId}/progress`, {
        seat_seconds_delta: Math.round(delta),
        module_order: moduleOrder,
      });
    } catch {
      // Re-add on failure so time is not lost
      seatSecondsRef.current += delta;
    }
  }, [courseId, moduleOrder]);

  // ── Reset inactivity countdown on every user action ───────────────
  const resetInactivity = useCallback(() => {
    if (!enabledRef.current) return;

    // Accumulate time since last tick
    if (lastTickRef.current) {
      const elapsedMs = Date.now() - lastTickRef.current;
      // Only count if within reasonable range (< inactivity limit)
      if (elapsedMs < INACTIVITY_LIMIT_MS) {
        seatSecondsRef.current += elapsedMs / 1000;
      }
    }
    lastTickRef.current = Date.now();

    // Reset the 6-minute inactivity timer
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      // Student timed out — flush then trigger portal logout
      lastTickRef.current = null;
      flush().finally(() => {
        if (onInactivityLogout) onInactivityLogout();
      });
    }, INACTIVITY_LIMIT_MS);
  }, [flush, onInactivityLogout]);

  // ── Attach / detach activity listeners ────────────────────────────
  useEffect(() => {
    if (!enabled) {
      // Paused — clear timers and flush
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (flushIntervalRef.current)   clearInterval(flushIntervalRef.current);
      lastTickRef.current = null;
      flush();
      return;
    }

    const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, resetInactivity, { passive: true }));

    // Kick off immediately
    resetInactivity();

    // Periodic flush every 30s
    flushIntervalRef.current = setInterval(flush, FLUSH_INTERVAL_MS);

    return () => {
      events.forEach(e => window.removeEventListener(e, resetInactivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (flushIntervalRef.current)   clearInterval(flushIntervalRef.current);
      flush(); // final flush on unmount
    };
  }, [enabled, resetInactivity, flush]);

  // Expose manual flush (call after completing a step)
  return {
  flush,
  getSeatSeconds: () => seatSecondsRef.current,
};
};

export default useSeatTimer;