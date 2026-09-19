import APIBase from './httpBase'
import type { SessionUser } from '@/types'

class AuthService extends APIBase {
  async login(email: string, password: string): Promise<{ token: string; user: SessionUser }> {
    const { data } = await this.post<{ token: string; user: SessionUser }>('auth/login', {
      email,
      password,
    })
    return data
  }

  async me(): Promise<SessionUser> {
    const { data } = await this.get<{ user: SessionUser }>('auth/me')
    return data.user
  }

  async changePassword(current: string, next: string): Promise<SessionUser> {
    const { data } = await this.put<{ user: SessionUser }>('auth/password', { current, next })
    return data.user
  }
}

export const authService = new AuthService()
