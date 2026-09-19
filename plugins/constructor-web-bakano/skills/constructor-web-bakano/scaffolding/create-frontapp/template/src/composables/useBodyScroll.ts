import { onUnmounted, watch, type Ref } from 'vue'

/**
 * Congela el scroll del fondo mientras hay algo encima (modal, drawer, menú).
 *
 * Se cuentan los candados: el scroll vuelve cuando se suelta el último, y
 * soltarlo no depende de que nadie se acuerde de llamar a nada — el
 * desmontaje del componente lo hace.
 */

let candados = 0
let overflowPrevio = ''

function poner() {
  if (candados === 0) {
    overflowPrevio = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  candados += 1
}

function soltar() {
  if (candados === 0) return
  candados -= 1
  if (candados === 0) document.body.style.overflow = overflowPrevio
}

export function useBodyScroll(abierto: Ref<boolean>) {
  let tengoCandado = false

  watch(
    abierto,
    (valor) => {
      if (valor && !tengoCandado) {
        poner()
        tengoCandado = true
      } else if (!valor && tengoCandado) {
        soltar()
        tengoCandado = false
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    if (tengoCandado) soltar()
  })
}
