export interface RecentFile {
  uri: string;
  name: string;
  lastOpened: string;
  page: number;
  totalPages: number;
  viewMode?: "original" | "text";
}

export const DASHBOARD_THEME_COLORS = {
  light: {
    bg: "#F8FAFC",          // slate-50
    cardBg: "#FFFFFF",      // white
    cardBorder: "#E2E8F0",  // slate-200
    text: "#1E293B",        // slate-800
    textMuted: "#64748B",   // slate-500
    accent: "#2563EB",      // blue-600
    iconColor: "#475569",   // slate-600
    headerBorder: "#E2E8F0" // slate-200
  },
  dark: {
    bg: "#0A0A0A",          // neutral-950
    cardBg: "#171717",      // neutral-900
    cardBorder: "#262626",  // neutral-800
    text: "#E2E8F0",        // neutral-200
    textMuted: "#737373",   // neutral-500
    accent: "#2563EB",      // blue-600
    iconColor: "#A3A3A3",   // neutral-400
    headerBorder: "#262626" // neutral-800
  },
  sepia: {
    bg: "#F4ECD8",          // sepia-bg
    cardBg: "#ECE2C8",      // sepia card
    cardBorder: "#DCD0B4",  // sepia border
    text: "#4A3728",        // sepia text
    textMuted: "#7A6250",   // sepia muted
    accent: "#8B6B4F",      // sepia accent
    iconColor: "#4A3728",   // sepia icon
    headerBorder: "#DCD0B4" // sepia border
  },
  forest: {
    bg: "#14241C",          // forest-bg
    cardBg: "#0E1B15",      // forest card
    cardBorder: "#1C362A",  // forest border
    text: "#E6EFE9",        // forest text
    textMuted: "#9CB3A6",   // forest muted
    accent: "#2D5A43",      // forest accent
    iconColor: "#E6EFE9",   // forest icon
    headerBorder: "#1C362A" // forest border
  },
} as const;

export type DashboardThemeType = keyof typeof DASHBOARD_THEME_COLORS;

import { ReadingNote } from "../Notes/types";

export interface DashboardProps {
  recentFiles: RecentFile[];
  notes: ReadingNote[];
  theme: DashboardThemeType;
  onSelectFile: (uri: string, name: string) => void;
  onPickNewFile: () => void;
  onClearHistory: () => void;
  onToggleTheme: (theme: DashboardThemeType) => void;
  onDeleteNote: (id: string) => void;
  onRestoreComplete: (data: any) => void;
}
