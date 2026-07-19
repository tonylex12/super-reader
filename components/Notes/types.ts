export interface ReadingNote {
  id: string;
  pdfName: string;
  date: string; // ISOString
  text: string;
  page: number;
}

export interface BackupData {
  version: string;
  theme: "light" | "dark" | "sepia" | "forest";
  history: any[];
  notes: ReadingNote[];
  exportedAt: string;
}
