"use client";

import { useLocalStorageNumber } from "@repo/ui/hooks/use-local-storage-number";
import {
  DEFAULT_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_STORAGE_KEY,
} from "../_components/sidebar-resize-handle";

export function useDashboardSidebarWidth() {
  const { setValue: setSidebarWidth, value: sidebarWidth } =
    useLocalStorageNumber({
      defaultValue: DEFAULT_SIDEBAR_WIDTH,
      key: SIDEBAR_WIDTH_STORAGE_KEY,
      max: MAX_SIDEBAR_WIDTH,
      min: MIN_SIDEBAR_WIDTH,
    });

  return { setSidebarWidth, sidebarWidth };
}
