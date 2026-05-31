import axios, { type AxiosInstance } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token — sessionStorage first, localStorage fallback (survives F5)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('access_token') ?? localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Silent refresh on 401
let isRefreshing = false
let queue: Array<(token: string) => void> = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }
    if (isRefreshing) {
      return new Promise((resolve) => {
        queue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`
          resolve(api(original))
        })
      })
    }
    original._retry = true
    isRefreshing = true
    try {
      const refresh_token = localStorage.getItem('refresh_token')
      if (!refresh_token) throw new Error('No refresh token')
      const { data } = await axios.post(`${API_URL}/api/v1/auth/refresh`, { refresh_token })
      sessionStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      queue.forEach((cb) => cb(data.access_token))
      queue = []
      original.headers.Authorization = `Bearer ${data.access_token}`
      return api(original)
    } catch {
      sessionStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      if (typeof window !== 'undefined') window.location.href = '/login'
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)
