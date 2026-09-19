import { defineStore } from 'pinia'
import { authService } from '@/services/auth.service'
import type { SessionUser } from '@/types'

const TOKEN_KEY = 'access_token'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as SessionUser | null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (s) => Boolean(s.user),
    isAdmin: (s) => s.user?.accountType === 'admin',
    hasToken: () => Boolean(localStorage.getItem(TOKEN_KEY)),
  },

  actions: {
    setSession(token: string, user: SessionUser) {
      try {
        localStorage.setItem(TOKEN_KEY, token)
      } catch {
        // Modo privado: la sesión dura lo que dure la pestaña.
      }
      this.user = user
    },

    async login(email: string, password: string): Promise<SessionUser> {
      const { token, user } = await authService.login(email, password)
      this.setSession(token, user)
      return user
    },

    /** Recupera la sesión desde el token guardado, verificándola con el API. */
    async restore(): Promise<SessionUser | null> {
      if (this.user) return this.user
      if (!localStorage.getItem(TOKEN_KEY)) return null

      this.loading = true
      try {
        this.user = await authService.me()
        return this.user
      } catch {
        this.clear()
        return null
      } finally {
        this.loading = false
      }
    },

    clear() {
      this.user = null
      try {
        localStorage.removeItem(TOKEN_KEY)
      } catch {
        /* nada que limpiar */
      }
    },
  },
})
