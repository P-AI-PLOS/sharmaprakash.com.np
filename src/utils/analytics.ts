import { useState, type ChangeEvent } from "react";
import { useRef, useEffect } from "react";

interface AnalyticsEvent {
  event: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

declare global {
  interface Window {
    trackEvent: typeof trackEvent;
  }
}

const analyticsBuffer: AnalyticsEvent[] = [];

export function trackEvent(event: string, metadata?: Record<string, any>) {
  const e: AnalyticsEvent = { event, timestamp: Date.now(), metadata };
  analyticsBuffer.push(e);
  
  // Send to analytics service asynchronously
  setTimeout(() => {
    try {
      localStorage.setItem("analytics-buffer", JSON.stringify(analyticsBuffer));
    } catch {
      // LocalStorage might be full
    }
  }, 0);
}

export function loadStoredAnalytics(): AnalyticsEvent[] {
  try {
    const stored = localStorage.getItem("analytics-buffer");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getCurrentSessionId(): string {
  let sessionId = localStorage.getItem("session-id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("session-id", sessionId);
  }
  return sessionId;
}
