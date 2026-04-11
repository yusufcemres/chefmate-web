const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://chefmate-api-production.up.railway.app/api/v1';

class ApiClient {
  private accessToken: string | null = null;
  private isRefreshing = false;

  init() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
    }
  }

  setToken(token: string | null) {
    this.accessToken = token;
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  setRefreshToken(token: string | null) {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem('refresh_token', token);
    } else {
      localStorage.removeItem('refresh_token');
    }
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  private async request<T>(endpoint: string, options: { method?: string; body?: any; token?: string | null } = {}): Promise<T> {
    const { method = 'GET', body, token } = options;
    const authToken = token ?? this.accessToken;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const config: RequestInit = { method, headers };
    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    const res = await fetch(`${API_BASE}${endpoint}`, config);

    if (res.status === 401 && authToken) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        const retryRes = await fetch(`${API_BASE}${endpoint}`, { ...config, headers });
        if (!retryRes.ok) throw await this.parseError(retryRes);
        const retryJson = await retryRes.json();
        return retryJson.data !== undefined ? retryJson.data : retryJson;
      }
      throw new Error('Oturum suresi doldu. Lutfen tekrar giris yapin.');
    }

    if (!res.ok) throw await this.parseError(res);
    if (res.status === 204) return {} as T;

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  }

  private async parseError(res: Response): Promise<Error> {
    try {
      const data = await res.json();
      return new Error(data.error?.message || data.message || `Hata: ${res.status}`);
    } catch {
      return new Error(`Hata: ${res.status}`);
    }
  }

  private async tryRefresh(): Promise<boolean> {
    if (this.isRefreshing) return false;
    this.isRefreshing = true;
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return false;
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        this.setToken(null);
        this.setRefreshToken(null);
        return false;
      }
      const data = await res.json();
      this.setToken(data.data?.accessToken || data.accessToken);
      this.setRefreshToken(data.data?.refreshToken || data.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  get<T>(endpoint: string) { return this.request<T>(endpoint); }
  post<T>(endpoint: string, body?: any) { return this.request<T>(endpoint, { method: 'POST', body }); }
  put<T>(endpoint: string, body?: any) { return this.request<T>(endpoint, { method: 'PUT', body }); }
  patch<T>(endpoint: string, body?: any) { return this.request<T>(endpoint, { method: 'PATCH', body }); }
  delete<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'DELETE' }); }
}

export const api = new ApiClient();

// Server-side fetch helper (no auth needed)
export async function fetchApi<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}
