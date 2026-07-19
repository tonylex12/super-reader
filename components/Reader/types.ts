export const THEME_COLORS = {
  light: {
    bg: "#FFFFFF",          // white
    headerBg: "#FFFFFF",    // white
    headerBorder: "#E2E8F0",// slate-200
    text: "#1E293B",        // slate-800
    textMuted: "#64748B",   // slate-500
    border: "#E2E8F0",      // slate-200
    accent: "#2563EB",      // blue-600
    accentText: "#FFFFFF",
    buttonBg: "#F1F5F9",    // slate-100
    sheetBg: "#F8FAFC",     // slate-50
    iconColor: "#475569",   // slate-600
  },
  dark: {
    bg: "#0A0A0A",          // neutral-950
    headerBg: "#0A0A0A",    // neutral-950
    headerBorder: "#262626",// neutral-800
    text: "#E2E8F0",        // neutral-200
    textMuted: "#737373",   // neutral-500
    border: "#262626",      // neutral-800
    accent: "#2563EB",      // blue-600
    accentText: "#FFFFFF",
    buttonBg: "#171717",    // neutral-900
    sheetBg: "#171717",     // neutral-900
    iconColor: "#E2E8F0",   // neutral-200
  },
  sepia: {
    bg: "#F4ECD8",          // sepia-bg
    headerBg: "#F4ECD8",    // sepia-bg
    headerBorder: "#DCD0B4",// sepia-border
    text: "#4A3728",        // sepia-text
    textMuted: "#7A6250",   // sepia-muted
    border: "#DCD0B4",      // sepia-border
    accent: "#8B6B4F",      // sepia-accent
    accentText: "#FFFFFF",
    buttonBg: "#ECE2C8",    // sepia card/button
    sheetBg: "#ECE2C8",     // sepia sheet
    iconColor: "#4A3728",   // sepia-text
  },
  forest: {
    bg: "#14241C",          // forest-bg
    headerBg: "#14241C",    // forest-bg
    headerBorder: "#1C362A",// forest-border
    text: "#E6EFE9",        // forest-text
    textMuted: "#9CB3A6",   // forest-muted
    border: "#1C362A",      // forest-border
    accent: "#2D5A43",      // forest-accent
    accentText: "#FFFFFF",
    buttonBg: "#0E1B15",    // forest card/button
    sheetBg: "#0E1B15",     // forest sheet
    iconColor: "#E6EFE9",   // forest-text
  },
} as const;

export type ThemeType = keyof typeof THEME_COLORS;

export interface ReaderProps {
  pdfUri: string;
  pdfName: string;
  initialPage: number;
  initialViewMode: "original" | "text";
  theme: ThemeType;
  onBack: () => void;
  onPageChange: (page: number, totalPages: number, viewMode?: "original" | "text") => void;
  onThemeChange: (theme: ThemeType) => void;
  onSaveNote: (text: string, page: number) => void;
}
