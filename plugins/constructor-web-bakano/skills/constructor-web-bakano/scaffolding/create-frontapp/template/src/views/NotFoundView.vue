<template>
  <section class="not-found">
    <p class="not-found__code">404</p>
    <h1 class="not-found__title">Esta página no existe</h1>
    <p class="not-found__text">Puede que el enlace esté mal escrito o que la página se haya movido.</p>
    <RouterLink to="/" class="btn btn--primary">Volver al inicio</RouterLink>
  </section>
</template>

<style scoped lang="scss">
.not-found {
  @include container(640px);
  @include flex(column, center, center, 0.8rem);
  flex: 1;
  text-align: center;
  padding-block: $space-section;

  &__code {
    @include eyebrow;
    font-size: $text-base;
  }

  &__title {
    @include display($display-md);
  }

  &__text {
    color: $ink-soft;
    margin-bottom: 0.6rem;
  }
}
</style>
