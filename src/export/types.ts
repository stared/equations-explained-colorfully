// Shared types for export modules

export interface ColorScheme {
  name: string;
  colors: string[];
}

export type ExportFormat = 'html' | 'latex' | 'beamer' | 'typst';
