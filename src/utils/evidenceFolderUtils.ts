import { EvidenceItem } from '../types';

export interface EvidenceFolder {
  folderId: string;
  folderName: string;
  dateStr: string;
  timeRangeStr: string;
  startTime: string;
  endTime: string;
  startMs: number;
  endMs: number;
  isCurrentWindow: boolean;
  items: EvidenceItem[];
}

export const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

/**
 * Calculates the distinct 15-minute folder metadata for a given timestamp.
 * Every 15 minutes forms a distinct bucket with a unique name based on date and time.
 */
export function getEvidenceFolderInfo(dateInput?: string | Date | number): {
  folderId: string;
  folderName: string;
  dateStr: string;
  timeRangeStr: string;
  startTime: string;
  endTime: string;
  startMs: number;
  endMs: number;
  isCurrentWindow: boolean;
} {
  let validTime: number;
  if (!dateInput) {
    validTime = Date.now();
  } else if (typeof dateInput === 'number') {
    validTime = isNaN(dateInput) ? Date.now() : dateInput;
  } else {
    const parsed = new Date(dateInput).getTime();
    validTime = isNaN(parsed) ? Date.now() : parsed;
  }

  // 15-minute slot boundary calculation
  const startMs = Math.floor(validTime / FIFTEEN_MINUTES_MS) * FIFTEEN_MINUTES_MS;
  const endMs = startMs + FIFTEEN_MINUTES_MS;

  const startDate = new Date(startMs);
  const endDate = new Date(endMs);

  const dateStr = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const startTime = startDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const endTime = endDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const timeRangeStr = `${startTime} – ${endTime}`;
  const folderId = `folder_${startMs}`;
  const folderName = `${dateStr} • ${timeRangeStr}`;

  const now = Date.now();
  const currentSlotStart = Math.floor(now / FIFTEEN_MINUTES_MS) * FIFTEEN_MINUTES_MS;
  const isCurrentWindow = startMs === currentSlotStart;

  return {
    folderId,
    folderName,
    dateStr,
    timeRangeStr,
    startTime,
    endTime,
    startMs,
    endMs,
    isCurrentWindow,
  };
}

/**
 * Checks if a given timestamp was captured/uploaded in the last 15 minutes.
 */
export function isWithinLast15Minutes(dateInput: string | Date | number): boolean {
  let validTime: number;
  if (!dateInput) return false;
  if (typeof dateInput === 'number') {
    validTime = dateInput;
  } else {
    validTime = new Date(dateInput).getTime();
  }
  if (isNaN(validTime)) return false;
  const diff = Date.now() - validTime;
  return diff >= 0 && diff <= FIFTEEN_MINUTES_MS;
}

/**
 * Segregates an array of evidence items into 15-minute folders.
 * Folders are ordered in reverse chronological order (newest first).
 * Items inside each folder are sorted by dateAdded descending.
 */
export function groupEvidenceBy15MinFolders(items: EvidenceItem[]): EvidenceFolder[] {
  if (!items || items.length === 0) return [];

  const folderMap = new Map<string, EvidenceFolder>();

  items.forEach((item) => {
    // Determine folder info using stored folder or computing from dateAdded
    const info = getEvidenceFolderInfo(item.dateAdded || item.originalDate || Date.now());
    const effectiveFolderId = item.folderId || info.folderId;
    const effectiveFolderName = item.folderName || info.folderName;

    if (!folderMap.has(effectiveFolderId)) {
      folderMap.set(effectiveFolderId, {
        folderId: effectiveFolderId,
        folderName: effectiveFolderName,
        dateStr: info.dateStr,
        timeRangeStr: info.timeRangeStr,
        startTime: info.startTime,
        endTime: info.endTime,
        startMs: info.startMs,
        endMs: info.endMs,
        isCurrentWindow: info.isCurrentWindow,
        items: [],
      });
    }

    folderMap.get(effectiveFolderId)!.items.push(item);
  });

  // Sort items inside each folder by dateAdded descending
  folderMap.forEach((folder) => {
    folder.items.sort((a, b) => {
      const timeA = new Date(a.dateAdded).getTime() || 0;
      const timeB = new Date(b.dateAdded).getTime() || 0;
      return timeB - timeA;
    });
  });

  // Convert to array and sort folders by startMs descending
  const sortedFolders = Array.from(folderMap.values()).sort((a, b) => b.startMs - a.startMs);
  return sortedFolders;
}
