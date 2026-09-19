import axios from 'axios'
import type { AxiosResponse, AxiosRequestConfig } from 'axios'

const TOKEN_KEY = 'access_token'

/**
 * A qué backend hablar, según desde dónde se esté sirviendo la web.
 *
 * localhost → backend local; túnel de desarrollo con "-front" en el host →
 * mismo host con "-back"; producción → API de producción.
 * VITE_API_BASE_URL sobreescribe, salvo que apunte a localhost y el visitante
 * NO esté en localhost (un remoto no puede ver tu localhost).
 */
export function resolveApiBaseUrl(): string {
  const host = window.location.hostname
  const isLocal = ['localhost', '127.0.0.1'].includes(host)

  let fallback = '__API_PROD_URL__'
  if (isLocal) fallback = 'http://localhost:__API_PORT__/api'
  else if (host.includes('-front')) {
    fallback = `${window.location.protocol}//${host.replace('-front', '-back')}/api`
  }

  const envUrl = (import.meta.env.VITE_API_BASE_URL as string) || ''
  const envIsLocal = envUrl.includes('localhost') || envUrl.includes('127.0.0.1')
  const raw = envUrl && (isLocal || !envIsLocal) ? envUrl : fallback
  const trimmed = raw.replace(/\/+$/, '')
  return trimmed.endsWith('/api') || /\/api\//.test(trimmed) ? trimmed : `${trimmed}/api`
}

function toApiError(error: unknown) {
  if (axios.isAxiosError(error) && error.response) {
    return {
      status: error.response.status,
      message: error.response.data?.message || error.message,
      data: error.response.data,
    }
  }
  if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
    return { status: 408, message: 'El servidor tardó demasiado en responder' }
  }
  return { status: 500, message: 'No se pudo conectar con el servidor' }
}

class APIBase {
  private baseUrl: string
  private axiosInstance = axios.create()

  constructor() {
    this.baseUrl = resolveApiBaseUrl()
    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        config.timeout = config.timeout || 15000
        return config
      },
      (error) => Promise.reject(error),
    )

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          window.dispatchEvent(new CustomEvent('auth:token-expired'))
        }
        return Promise.reject(error)
      },
    )
  }

  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`
  }

  protected getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    const accessToken = localStorage.getItem(TOKEN_KEY)
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    return headers
  }

  protected async get<T>(
    endpoint: string,
    headers?: Record<string, string>,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.axiosInstance.get<T>(this.buildUrl(endpoint), {
        headers: headers || this.getHeaders(),
        ...config,
      })
    } catch (error: unknown) {
      throw toApiError(error)
    }
  }

  protected async post<T>(
    endpoint: string,
    data: unknown,
    headers?: Record<string, string>,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const finalHeaders = headers || this.getHeaders()
    // Con FormData el navegador pone el boundary; un Content-Type manual lo rompe.
    if (data instanceof FormData) delete finalHeaders['Content-Type']

    try {
      return await this.axiosInstance.post<T>(this.buildUrl(endpoint), data, {
        headers: finalHeaders,
        ...config,
      })
    } catch (error: unknown) {
      throw toApiError(error)
    }
  }

  protected async put<T>(
    endpoint: string,
    data: unknown,
    headers?: Record<string, string>,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.axiosInstance.put<T>(this.buildUrl(endpoint), data, {
        headers: headers || this.getHeaders(),
        ...config,
      })
    } catch (error: unknown) {
      throw toApiError(error)
    }
  }

  protected async patch<T>(
    endpoint: string,
    data: unknown,
    headers?: Record<string, string>,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.axiosInstance.patch<T>(this.buildUrl(endpoint), data, {
        headers: headers || this.getHeaders(),
        ...config,
      })
    } catch (error: unknown) {
      throw toApiError(error)
    }
  }

  protected async delete<T>(
    endpoint: string,
    headers?: Record<string, string>,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.axiosInstance.delete<T>(this.buildUrl(endpoint), {
        headers: headers || this.getHeaders(),
        ...config,
      })
    } catch (error: unknown) {
      throw toApiError(error)
    }
  }
}

export default APIBase
