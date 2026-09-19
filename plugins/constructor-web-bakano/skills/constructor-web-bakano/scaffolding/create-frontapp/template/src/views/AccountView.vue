<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const userStore = useUserStore()
const toast = useToastStore()

function logout() {
  userStore.clear()
  toast.info('Sesión cerrada')
  router.replace('/')
}
</script>

<template>
  <section class="account">
    <p class="account__eyebrow">Mi cuenta</p>
    <h1 class="account__title">{{ userStore.user?.name || userStore.user?.email }}</h1>

    <dl class="account__data">
      <div>
        <dt>Correo</dt>
        <dd>{{ userStore.user?.email }}</dd>
      </div>
      <div>
        <dt>Tipo de cuenta</dt>
        <dd>{{ userStore.user?.accountType }}</dd>
      </div>
    </dl>

    <button class="btn btn--ghost" @click="logout">
      <i class="fa-solid fa-right-from-bracket"></i> Cerrar sesión
    </button>
  </section>
</template>

<style scoped lang="scss">
.account {
  @include container(720px);
  @include flex(column, flex-start, flex-start, 1rem);
  padding-block: $space-xl;

  &__eyebrow {
    @include eyebrow;
  }

  &__title {
    @include display($display-sm, 600);
  }

  &__data {
    @include card;
    @include flex-cards(200px, 1rem);
    width: 100%;
    padding: 1.4rem 1.6rem;
    margin-block: 0.6rem 1rem;

    dt {
      @include eyebrow;
      font-size: 0.62rem;
      color: $ink-muted;
    }

    dd {
      font-size: $text-base;
      margin-top: 0.2rem;
    }
  }
}
</style>
