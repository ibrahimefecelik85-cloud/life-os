"use client";
import { useSyncExternalStore } from "react";
import { getStatus, subscribeStatus, type SyncStatus } from "./engine";

const OFF: SyncStatus = { state: "off", lastSyncAt: null };

/** Senkron durumu (kapalı / hazır / senkronize ediliyor / hata) — değişince ekran güncellenir */
export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(subscribeStatus, getStatus, () => OFF);
}
