export interface StorageAdapter {
  /** Stores the file at `path` (e.g. "music/1710000000.mp3") and returns its public URL. */
  put(path: string, file: File): Promise<{ url: string }>;
}
