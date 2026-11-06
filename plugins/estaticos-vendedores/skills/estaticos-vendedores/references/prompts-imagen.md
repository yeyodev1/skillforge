# Prompts de imagen

## Estructura del prompt (en inglés para el generador, texto de la pieza en español entre comillas)

1. **Formato y propósito**: "Vertical 9:16 (1080x1920) Instagram Story ad for a performance marketing agency."
2. **Fondo y paleta** con HEX: "Deep dark background #0A0712 with subtle magenta #E6285C and purple #85529C radial glows."
3. **Logo**: texto exacto, color, posición y tamaño. "White wordmark 'BAKANO.' with a magenta dot, top center, small."
4. **Jerarquía de texto** (texto literal entre comillas, con tildes): eyebrow → titular → apoyo → CTA. Indica peso y color ("bold geometric sans-serif, white; '10% y 20%' in magenta").
5. **Visual protagonista**: qué objeto/escena y dónde ("glowing magenta 3D rising arrow with glass dashboard cards, right side").
6. **CTA**: "Rounded magenta pill button with white uppercase text 'SOLICITA TU DIAGNÓSTICO GRATIS'".
7. **Zonas seguras** (9:16): "Keep the top 14% and bottom 20% free of text and buttons; CTA button must sit above 78% of the height."
8. **Restricciones**: "Spanish text must be spelled exactly as written. No extra text, no fake words on decorative UI, no stock photo look."

## Adaptar por formato

- **1:1**: texto a la izquierda (logo arriba-izq, titular, apoyo, CTA), visual a la derecha.
- **4:5**: logo + badge de escasez arriba, titular grande, visual abajo-der, CTA centrado abajo, firma del método pequeña al pie.
- **9:16**: todo centrado y apilado; logo bajo el 14% superior; CTA por encima del 80% de la altura.

## Ejemplos que funcionaron (Bakano, nov 2026)

Ver `marcas/bakano/ejemplos/`:
- `calificacion-*.png`: badge "SOLO 3 CUPOS ESTA SEMANA" + "¿Tu negocio de servicios factura +$8K al mes?" + "Hazlo crecer entre 10% y 20% de forma predecible" + flecha 3D magenta con tarjetas de vidrio + CTA "SOLICITA TU DIAGNÓSTICO GRATIS".
- `dolor-suerte-*.png`: "Tu crecimiento no debería depender de la ~~suerte~~" (palabra tachada en magenta), dados que se rompen y se convierten en gráfico de barras neón, checklist ✗ Sin improvisación / ✗ Sin depender de videos virales / ✓ Con estrategia data-driven, CTA "PIDE TU DIAGNÓSTICO SIN COSTO".
- `prueba-social-*.png`: eyebrow "RESULTADOS REALES", "+25 negocios aumentaron su facturación más de 20%", tarjetas de vidrio con "+$50K USD en ventas generadas" y "4 países: EC · CO · US · SG" sobre mapa de puntos, CTA "QUIERO ESTOS RESULTADOS".

Lecciones de esa tanda: el CTA de las stories quedó cerca del borde inferior (pedir zona segura explícita), la tarjeta "+20% facturación" del 4:5 repetía el titular (no repetir), y los dashboards decorativos traían palabras de relleno ("growth" repetido): pedir "no readable text on decorative UI".
