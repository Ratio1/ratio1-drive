export const config = {
  HKEY: process.env.CSTORE_HKEY || 'ratio1-drive-test',
  // HKEY: process.env.CSTORE_HKEY || 'ratio1-drive-demo-0',
  DEBUG: process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10)
} as const;

export type Config = typeof config;
