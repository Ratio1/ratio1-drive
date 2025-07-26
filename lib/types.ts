export interface FileItem {
  cid: string;
  filename: string;
  date_uploaded: string;
}

export interface FileMetadata {
  cid: string;
  date_uploaded: string;
  filename: string;
  owner: string;
  isEncryptedWithCustomKey: boolean;
}

export interface FilesData {
  [machine: string]: FileMetadata[];
}

// CSTORE API Response Types - Based on __get_response() method
export interface CStoreBaseResponse {
  // Fields added by __get_response()
  server_alias: string;
  server_version: string;
  server_time: string; // UTC timestamp in format 'YYYY-MM-DD HH:MM:SS'
  server_current_epoch: number;
  server_uptime: string; // string representation of timedelta
  
  // Fields added by __sign() method - blockchain signature data
  // These are added dynamically by the blockchain engine
  [key: string]: any;
}

export interface CStoreStatusResponse extends CStoreBaseResponse {
  keys: string[];
}

export interface CStoreValueResponse extends CStoreBaseResponse {
  [cstore_key: string]: any;
}

export interface CStoreHashResponse extends CStoreBaseResponse {
  [hkey: string]: {
    [key: string]: any;
  } | any; // for hash_getall_values it returns the full hash object
}

// R1FS API Response Types
export interface StatusResponse {
  [key: string]: any;
  EE_ID?: string;
}

export interface UploadResponse {
  success: boolean;
  message?: string;
  cid?: string;
}

export interface DownloadResponse {
  file?: any;
  file_base64_str?: string;
  filename: string;
}

export type TransferMode = 'streaming' | 'base64';

// CSTORE API parameter types
export type ChainStoreValue = string | number | boolean | object | any[];

// Additional types for better type safety
export interface CStoreSignedResponse extends CStoreBaseResponse {
  // The __sign() method adds blockchain signature fields
  // Exact fields depend on blockchain engine implementation
  // Using index signature to allow for dynamic signature fields
} 