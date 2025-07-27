import { config } from './config';
import { 
  CStoreStatusResponse, 
  CStoreValueResponse, 
  CStoreHashResponse,
  ChainStoreValue 
} from './types';

const CSTORE_API_URL = process.env.CSTORE_API_URL || 'http://localhost:31234';
const R1FS_API_URL = process.env.R1FS_API_URL || 'http://localhost:31235';

// Base API Client with common functionality
abstract class BaseApiClient {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  protected async request(
    endpoint: string,
    options: {
      method: 'GET' | 'POST';
      headers?: Record<string, string>;
      body?: string | FormData;
    }
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    
    if (config.DEBUG) {
      console.log('🚀 [DEBUG] Sending request:', {
        url,
        method: options.method,
        headers: options.headers,
        body: options.body instanceof FormData ? '[FormData]' : options.body
      });
    }

    const startTime = Date.now();
    
    try {
      const response = await fetch(url, {
        method: options.method,
        headers: options.headers,
        body: options.body,
      });

      const duration = Date.now() - startTime;

      if (config.DEBUG) {
        console.log('✅ [DEBUG] Received response:', {
          url,
          status: response.status,
          statusText: response.statusText,
          duration: `${duration}ms`,
          headers: Object.fromEntries(response.headers.entries())
        });
      }

      if (!response.ok) {
        if (config.DEBUG) {
          console.error('❌ [DEBUG] Request failed:', {
            url,
            status: response.status,
            statusText: response.statusText
          });
        }
        throw new Error(`Request failed: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (config.DEBUG) {
        console.error('💥 [DEBUG] Request error:', {
          url,
          error: error instanceof Error ? error.message : String(error),
          duration: `${duration}ms`
        });
      }
      
      throw error;
    }
  }

  protected buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    }
    return searchParams.toString();
  }
}

// CSTORE API Client - all endpoints require token='admin' as query parameter
class CStoreApiClient extends BaseApiClient {
  constructor() {
    super(CSTORE_API_URL);
  }

  async getStatus(): Promise<CStoreStatusResponse> {
    const response = await this.request('/get_status', {
      method: 'GET',
    });

    return response.json();
  }

  async getValue(cstore_key: string): Promise<CStoreValueResponse> {
    const queryString = this.buildQueryString({
      token: 'admin',
      cstore_key
    });

    const response = await this.request(`/get_value?${queryString}`, {
      method: 'GET',
    });

    return response.json();
  }

  async setValue(cstore_key: string, chainstore_value: ChainStoreValue): Promise<CStoreValueResponse> {
    const queryString = this.buildQueryString({
      token: 'admin',
      cstore_key,
      chainstore_value
    });

    const response = await this.request(`/set_value?${queryString}`, {
      method: 'GET',
    });

    return response.json();
  }

  async hashSetValue(hkey: string, key: string, value: ChainStoreValue): Promise<CStoreHashResponse> {
    const queryString = this.buildQueryString({
      token: 'admin',
      hkey,
      key,
      value
    });

    const response = await this.request(`/hash_set_value?${queryString}`, {
      method: 'GET',
    });

    return response.json();
  }

  async hashGetValue(hkey: string, key: string): Promise<CStoreHashResponse> {
    const queryString = this.buildQueryString({
      token: 'admin',
      hkey,
      key
    });

    const response = await this.request(`/hash_get_value?${queryString}`, {
      method: 'GET',
    });

    return response.json();
  }

  async hashGetAllValues(hkey: string): Promise<CStoreHashResponse> {
    const response = await this.request(`/hgetall`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': 'admin'
      },
      body: JSON.stringify({
        hkey
      }),
    });

    return response.json();
  }

  async hashGetAllValuesWithQuery(hkey: string): Promise<CStoreHashResponse> {
    const queryString = this.buildQueryString({
      hkey
    });
    const response = await this.request(`/hgetall?${queryString}`, {
      method: 'GET',
    });

    return response.json();
  }

  async hashGet(hkey: string, key: string): Promise<CStoreHashResponse> {
    const queryString = this.buildQueryString({
      hkey,
      key
    });

    const response = await this.request(`/hget?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    return response.json();
  }

  async hashSet(hkey: string, key: string, value: string): Promise<CStoreHashResponse> {
    const response = await this.request('/hset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hkey,
        key,
        value
      }),
    });

    return response.json();
  }

  // Method to get all files using the correct endpoint
  async getAllFiles(): Promise<any> {
    const response = await this.hashGetAllValues(config.HKEY);
    // Return the hkey data directly (which contains the files structure)
    return response[config.HKEY] || {};
  }
}

// R1FS API Client - handles file operations
class R1FSApiClient extends BaseApiClient {
  constructor() {
    super(R1FS_API_URL);
  }

  async getStatus(): Promise<any> {
    console.log('Fetching R1FS status...');
    const response = await this.request('/get_status', {
      method: 'GET',
    });

    return response.json();
  }

  async uploadFileStreaming(formData: FormData): Promise<any> {
    // Extract metadata from the original FormData
    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string;
    const secret = formData.get('secret') as string;
    
    // Create a new FormData with the correct structure
    const uploadFormData = new FormData();
    
    // Add the file
    uploadFormData.append('file', file);
    
    // Create body object with metadata and stringify it
    const bodyData: any = {};
    if (filename) bodyData.filename = filename;
    if (secret) bodyData.secret = secret;
    
    // Add the stringified body as a separate field
    uploadFormData.append('body', JSON.stringify(bodyData));

    const response = await this.request('/add_file', {
      method: 'POST',
      body: uploadFormData,
    });

    return response.json();
  }

  async uploadFileBase64(data: { file_base64_str: string; filename?: string; secret?: string }): Promise<any> {
    const response = await this.request('/add_file_base64', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }

  async downloadFileStreaming(cid: string, secret?: string): Promise<Response> {
    const queryString = this.buildQueryString({
      cid,
      ...(secret && { secret })
    });

    return this.request(`/get_file?${queryString}`, {
      method: 'GET',
    });
  }

  async downloadFileBase64(cid: string, secret?: string): Promise<any> {
    const response = await this.request('/get_file_base64', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cid, secret }),
    });

    return response.json();
  }
}

// Export instances of the API clients
export const cstoreApi = new CStoreApiClient();
export const r1fsApi = new R1FSApiClient();

// Legacy ApiClient for backward compatibility
export class ApiClient {
  static async getAllFiles(): Promise<any> {
    return cstoreApi.getAllFiles();
  }

  static async getStatus(): Promise<any> {
    return r1fsApi.getStatus();
  }

  static async getR1FSStatus(): Promise<any> {
    return r1fsApi.getStatus();
  }

  static async getCStoreStatus(): Promise<any> {
    return cstoreApi.getStatus();
  }

  static async uploadFileStreaming(formData: FormData): Promise<any> {
    return r1fsApi.uploadFileStreaming(formData);
  }

  static async uploadFileBase64(data: { file_base64_str: string; filename?: string; secret?: string }): Promise<any> {
    return r1fsApi.uploadFileBase64(data);
  }

  static async downloadFileStreaming(cid: string, secret?: string): Promise<Response> {
    return r1fsApi.downloadFileStreaming(cid, secret);
  }

  static async downloadFileBase64(cid: string, secret?: string): Promise<any> {
    return r1fsApi.downloadFileBase64(cid, secret);
  }

  static async hashGet(hkey: string, key: string): Promise<any> {
    return cstoreApi.hashGet(hkey, key);
  }

  static async hashSet(hkey: string, key: string, value: string): Promise<any> {
    return cstoreApi.hashSet(hkey, key, value);
  }
} 