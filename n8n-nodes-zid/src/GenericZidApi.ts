import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class GenericZidApi {
  private client: AxiosInstance;

  constructor(baseURL: string, accessToken: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Zid API Error: ${error.response.status} ${JSON.stringify(error.response.data)}`);
      }
      throw new Error(`Zid API Error: ${error.message}`);
    }
  }

  // Example: GET with pagination
  async getPaginated<T = any>(url: string, params: any = {}): Promise<T[]> {
    let results: T[] = [];
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const response = await this.request<{ data: T[]; meta?: any }>({
        method: 'GET',
        url,
        params: { ...params, page },
      });
      results = results.concat(response.data);
      if (response.meta && response.meta.current_page < response.meta.last_page) {
        page++;
      } else {
        hasMore = false;
      }
    }
    return results;
  }
} 