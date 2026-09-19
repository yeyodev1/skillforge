<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { site } from '@/config/site'
import { useUserStore } from '@/stores/user'
import { useBodyScroll } from '@/composables/useBodyScroll'

const route = useRoute()
const userStore = useUserStore()
const mobileOpen = ref(false)

useBodyScroll(mobileOpen)

// Al navegar se cierra el menú móvil.
watch(() => route.fullPath, () => (mobileOpen.value = false))
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <RouterLink to="/" class="header__logo">{{ site.name }}</RouterLink>

      <nav class="header__nav" :class="{ 'header__nav--open': mobileOpen }">
        <RouterLink v-for="link in site.nav" :key="link.to" :to="link.to" class="header__link">
          {{ link.label }}
        </RouterLink>
        <RouterLink v-if="userStore.isAuthenticated" to="/cuenta" class="header__link">
          Mi cuenta
        </RouterLink>
        <RouterLink v-else to="/login" class="btn btn--primary header__cta">Ingresar</RouterLink>
      </nav>

      <button
        class="header__burger"
        :aria-label="mobileOpen ? 'Cerrar menú' : 'Abrir menú'"
        :aria-expanded="mobileOpen"
        @click="mobileOpen = !mobileOpen"
      >
        <i :class="mobileOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'"></i>
      </button>
    </div>
  </header>
</template>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba($paper, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid $line;

  &__inner {
    @include container;
    @include flex(row, center, space-between, 1rem);
    padding-block: 0.85rem;
  }

  &__logo {
    @include display($text-xl, 600);
    color: $ink;
  }

  &__nav {
    display: none;

    @include from('md') {
      @include flex(row, center, flex-end, 1.75rem);
    }

    &--open {
      @include until('md') {
        @include flex(column, stretch, flex-start, 0.5rem);
        position: fixed;
        inset: 0;
        top: 61px;
        background: $paper;
        padding: 1.5rem 1.25rem;
        z-index: 90;
      }
    }
  }

  &__link {
    @include eyebrow;
    color: $ink-soft;
    padding: 0.6rem 0;
    border-bottom: 1px solid transparent;
    @include transition;

    &:hover,
    &.router-link-active {
      color: $accent-deep;
      border-color: $accent;
    }
  }

  &__cta {
    padding: 0.6rem 1.3rem;
    font-size: $text-xs;
  }

  &__burger {
    font-size: 1.3rem;
    color: $ink;
    width: 2.4rem;
    height: 2.4rem;
    @include flex(row, center, center);

    @include from('md') {
      display: none;
    }
  }
}
</style>
