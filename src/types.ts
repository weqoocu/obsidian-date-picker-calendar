export interface DateMatch {
  dateStr: string;
  startCh: number;
  endCh: number;
  line: number;
}

export interface CalendarPosition {
  left: number;
  top: number;
  bottom: number;
}

export interface ShortcutItem {
  label: string;
  offset: number;
}