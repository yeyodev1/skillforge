# 🎯 estratega-anuncios

**Tu media buyer senior dentro de Claude.** Hace el onboarding de un cliente, audita la comunicación de sus anuncios, espía a la competencia en **Meta Ads Library** y entrega una estrategia de pauta completa con guiones listos para grabar.

> 🔒 Enfoque 100% en **anuncios pagos**. Solo incluye feed orgánico si lo pides explícitamente.

## 📦 Instalación

```
/plugin marketplace add yeyodev1/skillforge
/plugin install estratega-anuncios@skillforge
```

O descarga el [ZIP desde Releases](https://github.com/yeyodev1/skillforge/releases).

## 🗣️ Cómo activarlo

Habla con Claude de forma natural. Cualquiera de estas frases lo dispara:

- *"Haz el onboarding de este cliente"*
- *"Analiza este nuevo cliente para anuncios"*
- *"Inicia auditoría de pauta de [cliente]"*
- *"Crea la estrategia de anuncios de [negocio]"*
- *"Audita los anuncios de la competencia de [marca]"*

## 🧭 Las 4 fases

### 1️⃣ Onboarding y validación
Claude te entrevista para completar la ficha del cliente (negocio, Instagram, web, nicho, cliente ideal, antigüedad, geografía). Luego **verifica en la web** que lo que dijiste coincide con lo que publica el cliente. Si hay inconsistencias, te frena y pregunta.

🛑 **No avanza sin tu confirmación explícita de la ficha.**

### 2️⃣ Análisis interno del cliente
Propuesta de valor, ganchos y oferta actual, dolores y deseos a los que apunta, a dónde manda el tráfico y las **3 objeciones críticas** que sus anuncios deben derribar.

### 3️⃣ Competencia en Meta Ads Library
Mapea **3 competidores locales** y **1 referente internacional** en otro continente. Entra a la Ads Library de cada uno y audita anuncios activos, longevidad, formatos dominantes (UGC, VSL, estáticos, carruseles), estructura de los primeros 3 segundos, ángulos, ofertas y CTA.

🚫 Si un competidor no pauta, lo dice. Nunca inventa anuncios.

### 4️⃣ Matriz GAP y roadmap de pauta
El entregable final incluye:

| Sección | Contenido |
|---|---|
| 🩺 Diagnóstico | Estado actual y cuellos de botella |
| 🔍 Competencia | Qué les funciona a los mejores |
| 📊 Matriz GAP | Cliente vs. competidores en hooks, oferta, formato, ángulo y CTA. Columna final: **dónde ganamos** |
| 💡 3 ángulos nuevos | Dolores y deseos que nadie está explotando |
| 🔻 Embudo | TOFU / MOFU / BOFU |
| 🎬 2 guiones | Estructura por tiempos: Hook → Problema → Solución → Prueba → CTA |

## 🧪 Pruebas

En `skills/estratega-anuncios/evals/evals.json` hay 3 casos de prueba que cubren: onboarding parcial que debe frenar, ejecución completa tras confirmación, y cliente sin pauta que pide feed orgánico.

## 📄 Licencia

MIT © Diego Reyes
