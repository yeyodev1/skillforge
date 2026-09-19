<script setup lang="ts">
import { site, whatsappLink } from '@/config/site'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__brand">
        <span class="footer__name">{{ site.name }}</span>
        <p class="footer__tagline">{{ site.tagline }}</p>
      </div>

      <div class="footer__col">
        <h4 class="footer__heading">Navegación</h4>
        <RouterLink v-for="link in site.nav" :key="link.to" :to="link.to">
          {{ link.label }}
        </RouterLink>
      </div>

      <div class="footer__col">
        <h4 class="footer__heading">Contacto</h4>
        <a :href="`mailto:${site.email}`">
          <i class="fa-solid fa-envelope"></i> {{ site.email }}
        </a>
        <a v-if="site.whatsapp" :href="whatsappLink()" target="_blank" rel="noopener">
          <i class="fa-brands fa-whatsapp"></i> WhatsApp
        </a>
      </div>
    </div>

    <div class="footer__bar">
      <span>© {{ year }} {{ site.name }}</span>
      <span class="footer__credit">Hecho por <a href="https://bakano.ec" target="_blank" rel="noopener">Bakano</a></span>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  background: $ink;
  color: rgba($paper, 0.85);
  margin-top: auto;

  &__inner {
    @include container;
    @include flex-cards(220px, 2.5rem);
    padding-block: $space-xl 2rem;
  }

  &__brand {
    flex: 2 1 260px;
  }

  &__name {
    @include display($text-xl, 600);
    color: $paper;
    display: block;
    margin-bottom: 0.6rem;
  }

  &__tagline {
    font-size: $text-sm;
    color: rgba($paper, 0.65);
    max-width: 34ch;
  }

  &__col {
    @include flex(column, flex-start, flex-start, 0.55rem);
    font-size: $text-sm;

    a {
      color: rgba($paper, 0.75);
      @include transition(color);

      &:hover {
        color: $accent-soft;
      }
    }
  }

  &__heading {
    @include eyebrow;
    color: $accent-soft;
    margin-bottom: 0.4rem;
  }

  &__bar {
    @include container;
    @include flex(row, center, space-between, 1rem);
    flex-wrap: wrap;
    padding-block: 1.2rem;
    border-top: 1px solid rgba($paper, 0.1);
    font-size: $text-xs;
    color: rgba($paper, 0.55);
  }

  &__credit a {
    color: rgba($paper, 0.8);
  }
}
</style>
