<script setup lang="ts">
import { toRef } from 'vue'
import { useBodyScroll } from '@/composables/useBodyScroll'

const props = defineProps<{
  open: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}>()

const emit = defineEmits<{ confirm: []; cancel: [] }>()

useBodyScroll(toRef(props, 'open'))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal" @click.self="emit('cancel')">
        <div class="modal__box" role="dialog" aria-modal="true" :aria-label="title">
          <span class="modal__icon" :class="{ 'modal__icon--danger': danger }">
            <i :class="danger ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-question'"></i>
          </span>
          <h3 class="modal__title">{{ title }}</h3>
          <p v-if="message" class="modal__message">{{ message }}</p>
          <slot />
          <div class="modal__actions">
            <button class="btn btn--ghost" @click="emit('cancel')">
              {{ cancelLabel || 'Cancelar' }}
            </button>
            <button class="btn" :class="danger ? 'btn--danger' : 'btn--primary'" @click="emit('confirm')">
              {{ confirmLabel || 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.modal {
  position: fixed;
  inset: 0;
  background: $overlay;
  backdrop-filter: blur(3px);
  @include flex(row, center, center);
  z-index: 200;
  padding: 1rem;

  &__box {
    @include card;
    @include flex(column, center, flex-start, 0.65rem);
    text-align: center;
    max-width: 420px;
    width: 100%;
    padding: 2.2rem 2rem 1.8rem;
    box-shadow: $shadow-lg;
  }

  &__icon {
    font-size: 1.7rem;
    color: $accent;

    &--danger {
      color: $danger;
    }
  }

  &__title {
    @include display($text-xl, 600);
  }

  &__message {
    font-size: $text-sm;
    color: $ink-soft;
  }

  &__actions {
    @include flex(row, center, center, 0.6rem);
    flex-wrap: wrap;
    margin-top: 0.8rem;
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;

  .modal__box {
    transition: transform 0.3s $ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal__box {
    transform: translateY(12px) scale(0.98);
  }
}
</style>
