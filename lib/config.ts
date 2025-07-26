export const config = {
  HKEY: 'ratio1-drive-test-2',
  DEBUG: process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true'
} as const;

export type Config = typeof config; 
