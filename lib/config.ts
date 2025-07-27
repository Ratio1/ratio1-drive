export const config = {
  HKEY: process.env.CSTORE_HKEY || 'ratio1-drive-demo-0',
  DEBUG: process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true'
} as const;

export type Config = typeof config; 
