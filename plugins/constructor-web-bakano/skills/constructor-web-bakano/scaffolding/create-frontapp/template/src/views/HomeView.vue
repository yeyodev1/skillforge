<script setup lang="ts">
import { site, whatsappLink } from '@/config/site'

const features = [
  { icon: 'fa-solid fa-bolt', title: 'Rápido', text: 'Vite 7, Vue 3.5 y builds de segundos.' },
  { icon: 'fa-solid fa-palette', title: 'Con identidad', text: 'Tokens SCSS propios, sin Tailwind ni librerías UI.' },
  { icon: 'fa-solid fa-plug', title: 'Conectado', text: 'APIBase listo para hablar con el backapp.' },
]
</script>

<template>
  <div class="home">
    <section class="hero">
      <p class="hero__eyebrow">{{ site.name }}</p>
      <h1 class="hero__title">{{ site.tagline }}</h1>
      <p class="hero__text">{{ site.description }}</p>
      <div class="hero__actions">
        <RouterLink to="/login" class="btn btn--primary">Empezar</RouterLink>
        <a v-if="site.whatsapp" :href="whatsappLink()" class="btn btn--ghost" target="_blank" rel="noopener">
          <i class="fa-brands fa-whatsapp"></i> Escríbenos
        </a>
      </div>
    </section>

    <section id="nosotros" class="features">
      <article v-for="feature in features" :key="feature.title" class="feature">
        <span class="feature__icon"><i :class="feature.icon"></i></span>
        <h3 class="feature__title">{{ feature.title }}</h3>
        <p class="feature__text">{{ feature.text }}</p>
      </article>
    </section>
  </div>
</template>

<style scoped lang="scss">
.hero {
  @include container(880px);
  @include flex(column, center, center, 1.2rem);
  text-align: center;
  padding-block: $space-section $space-xl;

  &__eyebrow {
    @include eyebrow;
  }

  &__title {
    @include display($display-lg);
  }

  &__text {
    font-size: $text-lg;
    color: $ink-soft;
    max-width: 52ch;
  }

  &__actions {
    @include flex(row, center, center, 0.8rem);
    flex-wrap: wrap;
    margin-top: 0.6rem;
  }
}

.features {
  @include container;
  @include flex-cards(260px, 1.25rem);
  padding-block: 0 $space-section;
}

.feature {
  @include card;
  padding: 1.8rem 1.6rem;
  @include transition;

  &:hover {
    transform: translateY(-3px);
    box-shadow: $shadow-md;
  }

  &__icon {
    @include flex(row, center, center);
    width: 2.6rem;
    height: 2.6rem;
    border-radius: $radius-sm;
    background: $accent-soft;
    color: $accent-deep;
    margin-bottom: 1rem;
  }

  &__title {
    @include display($text-xl, 600);
    margin-bottom: 0.4rem;
  }

  &__text {
    font-size: $text-sm;
    color: $ink-soft;
  }
}
</style>
