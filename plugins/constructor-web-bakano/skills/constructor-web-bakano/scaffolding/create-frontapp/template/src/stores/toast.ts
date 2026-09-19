import { defineStore } from 'pinia'

export interface Toast {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
}

let nextId = 1

export const useToastStore = defineStore('toast', {
  state: () => ({ toasts: [] as Toast[] }),

  actions: {
    show(message: string, type: Toast['type'] = 'info', duration = 3800) {
      const id = nextId++
      this.toasts.push({ id, type, message })
      setTimeout(() => this.dismiss(id), duration)
    },
    success(message: string) {
      this.show(message, 'success')
    },
    error(message: string) {
      this.show(message, 'error', 5000)
    },
    info(message: string) {
      this.show(message, 'info')
    },
    dismiss(id: number) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    },
  },
})
