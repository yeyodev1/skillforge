// Kit «diorama»: un mundo de juguete low-poly, de noche, con textura de papel acuarela, como una maqueta.
// Personajes cabezones con cara dibujada (y que cambia de expresión), cuartos abiertos, pupitres, letreros escritos a
// mano, pizarras, lluvia, ciudad de fondo y planos de cámara con acercamiento lento. Va encima de kit3d.js.
// Todo sale del segundo s de la escena (nunca de un reloj): lo mismo en el preview y en el render.
import { tres as T, estudio, RoundedBoxGeometry, V, suave } from "./kit3d.js";

export { V, suave };
const lim = (x) => Math.min(1, Math.max(0, x));
const sale = (u) => 1 + 2.4 * Math.pow(u - 1, 3) + 1.4 * Math.pow(u - 1, 2); // back.out: crece y se pasa un poco
export function semilla(n = 1) { let a = n >>> 0; return () => ((a = (a + 0x6d2b79f5) >>> 0), (((a ^ (a >>> 15)) * (a | 1)) >>> 0) / 4294967296); }

// ---- El mundo -------------------------------------------------------------------------------------------------------
// mundo(sel): estudio de noche (cielo azul tinta, luz cálida de lámpara, niebla del color del cielo).
export function mundo(sel, o = {}) {
  const cielo = o.cielo || "#1b1d44";
  const E = estudio(sel, { fondo: cielo, luz: o.luz ?? 1.5, ambiente: o.ambiente ?? 0.25, exposicion: o.exposicion ?? 1.0,
    suelo: false, nieblaDesde: o.nieblaDesde ?? 14, nieblaHasta: o.nieblaHasta ?? 40, lente: o.lente || 30 });
  E.sol.color.set(o.colorSol || "#ffd9b0");
  E.sol.position.set(3, 9, 7);
  const calida = new T.PointLight(o.colorLampara || "#ffb070", o.lampara ?? 18, 14, 1.6);
  calida.position.set(0, 3.2, 2);
  E.scene.add(calida, new T.HemisphereLight("#8f86d8", "#3a2440", 0.9));
  E.lampara = calida;
  return E;
}

// ---- Papel ----------------------------------------------------------------------------------------------------------
// Manchas suaves de acuarela y grano fino, en una textura que se repite sin costuras. Una sola para todo.
let _papel;
export function papel() {
  if (_papel) return _papel;
  const N = 256, c = document.createElement("canvas"); c.width = c.height = N;
  const g = c.getContext("2d"), az = semilla(7);
  g.fillStyle = "#e4e4e4"; g.fillRect(0, 0, N, N);
  for (let i = 0; i < 240; i++) {
    const x = az() * N, y = az() * N, r = 10 + az() * 46, v = (190 + az() * 65) | 0, a = 0.18 + az() * 0.3;
    for (const dx of [-N, 0, N]) for (const dy of [-N, 0, N]) {
      const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
      gr.addColorStop(0, `rgba(${v},${v},${v},${a})`); gr.addColorStop(1, `rgba(${v},${v},${v},0)`);
      g.fillStyle = gr; g.fillRect(x + dx - r, y + dy - r, 2 * r, 2 * r);
    }
  }
  const img = g.getImageData(0, 0, N, N);
  for (let i = 0; i < img.data.length; i += 4) { const n = (az() - 0.5) * 22; img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n; }
  g.putImageData(img, 0, 0);
  _papel = new T.CanvasTexture(c); _papel.wrapS = _papel.wrapT = T.RepeatWrapping; _papel.colorSpace = T.SRGBColorSpace;
  return _papel;
}
// Material de maqueta: color + papel, mate y facetado.
export function pinta(color, o = {}) {
  return new T.MeshStandardMaterial({ color, map: papel(), roughness: 0.95, metalness: 0, flatShading: true, ...o });
}
const malla = (geo, mat, x = 0, y = 0, z = 0) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
const caja_ = (w, h, d, r = 0.03) => new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2));

// Una caja de papel. Para todo lo que no tenga pieza propia.
export function caja(E, w, h, d, color, pos = V(), padre) { const m = malla(caja_(w, h, d), pinta(color), pos.x, pos.y, pos.z); (padre || E.scene).add(m); return m; }

// ---- Texto en canvas (letreros, pizarra, pantallas) -----------------------------------------------------------------
// Antes de dibujar texto: await letras() (las fuentes vienen de estilo.css).
export async function letras(lista = ['56px "Patrick Hand"', '56px "Gochi Hand"', '700 56px "Inter"']) {
  await Promise.all(lista.map((f) => document.fonts.load(f).catch(() => null)));
}
function lienzo(w, h, pintar) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  pintar(c.getContext("2d"), w, h);
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t;
}

// Letrero escrito a mano: «salón», «escuela», «enfermería». Mira hacia +z; se coloca con .position / .rotation.
export function letrero(E, texto, o = {}) {
  const alto = o.alto || 0.32, ancho = o.ancho || Math.max(0.6, texto.length * alto * 0.42);
  const tex = lienzo(512, Math.round(512 * alto / ancho), (g, w, h) => {
    g.fillStyle = o.fondo || "#efe6cf"; g.fillRect(0, 0, w, h);
    g.strokeStyle = o.borde || "#6b4b3a"; g.lineWidth = Math.max(6, h * 0.07); g.strokeRect(0, 0, w, h);
    g.fillStyle = o.tinta || "#3b2f2a"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `${Math.round(h * 0.55)}px "Patrick Hand", "Gochi Hand", cursive`; g.fillText(texto, w / 2, h * 0.54);
  });
  const m = new T.Mesh(caja_(ancho, alto, 0.04, 0.01), [0, 1, 2, 3].map(() => pinta(o.borde || "#6b4b3a")).concat([new T.MeshStandardMaterial({ map: tex, roughness: 0.9 }), pinta(o.borde || "#6b4b3a")]));
  m.castShadow = true; (o.padre || E.scene).add(m); return m;
}

// Pizarra verde con tiza: lineas = ["2 + 2 = 4", "a e i o u"]. dibujo(g, w, h) opcional para pintar encima.
export function pizarra(E, lineas = [], o = {}) {
  const ancho = o.ancho || 2.6, alto = o.alto || 1.4;
  const tex = lienzo(1024, Math.round(1024 * alto / ancho), (g, w, h) => {
    g.fillStyle = o.fondo || "#2e4a3c"; g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(255,255,255,0.05)"; for (let i = 0; i < 40; i++) g.fillRect(Math.random() * w, Math.random() * h, 80, 3);
    g.fillStyle = o.tiza || "#f1f0e6"; g.font = `${Math.round(h * 0.16)}px "Gochi Hand", "Patrick Hand", cursive`; g.textBaseline = "top";
    lineas.forEach((l, i) => g.fillText(l, w * 0.06, h * (0.1 + i * 0.22)));
    if (o.dibujo) o.dibujo(g, w, h);
  });
  const grupo = new T.Group();
  grupo.add(malla(caja_(ancho + 0.12, alto + 0.12, 0.06), pinta("#6b4b3a")));
  const cara = new T.Mesh(new T.PlaneGeometry(ancho, alto), new T.MeshStandardMaterial({ map: tex, roughness: 1 }));
  cara.position.z = 0.032; grupo.add(cara);
  (o.padre || E.scene).add(grupo); return grupo;
}

// Pantalla (tablet, móvil, portátil): un rectángulo con lo que muestra. pinta(g, w, h) dibuja la interfaz.
export function pantalla(E, o = {}) {
  const ancho = o.ancho || 0.5, alto = o.alto || 0.34;
  const g = new T.Group();
  g.add(malla(caja_(ancho, alto, 0.03, 0.02), pinta(o.marco || "#2a2a33")));
  const tex = lienzo(512, Math.round(512 * alto / ancho), o.pinta || ((c, w, h) => {
    c.fillStyle = "#f6efe6"; c.fillRect(0, 0, w, h); c.fillStyle = o.color || "#d9634a"; c.fillRect(0, 0, w, h * 0.12);
    if (o.texto) { c.fillStyle = "#3b2f2a"; c.font = `${Math.round(h * 0.11)}px "Patrick Hand", cursive`; c.fillText(o.texto, w * 0.08, h * 0.4); }
  }));
  const vidrio = new T.Mesh(new T.PlaneGeometry(ancho * 0.9, alto * 0.86), new T.MeshStandardMaterial({ map: tex, emissive: "#ffffff", emissiveMap: tex, emissiveIntensity: 0.35, roughness: 0.6 }));
  vidrio.position.z = 0.017; g.add(vidrio);
  (o.padre || E.scene).add(g); return g;
}

// ---- Escenarios -----------------------------------------------------------------------------------------------------
// Un cuarto abierto como maqueta: suelo, pared del fondo y pared izquierda. Devuelve { grupo, suelo, fondo, lado }.
export function cuarto(E, o = {}) {
  const an = o.ancho || 8, fo = o.fondo || 7, al = o.alto || 3.4, gr = new T.Group();
  const suelo = malla(caja_(an, 0.2, fo, 0.02), pinta(o.suelo || "#5a3d5e"), 0, -0.1, 0);
  const fondo = malla(caja_(an, al, 0.2, 0.02), pinta(o.pared || "#c4532c"), 0, al / 2, -fo / 2);
  const lado = malla(caja_(0.2, al, fo, 0.02), pinta(o.pared2 || "#2f7a6c"), -an / 2, al / 2, 0);
  const zocalo = malla(caja_(an, 0.5, 0.06, 0.01), pinta(o.zocalo || "#8a3a26"), 0, 0.25, -fo / 2 + 0.12);
  gr.add(suelo, fondo, lado, zocalo);
  if (o.baldosas !== false) for (let x = -an / 2 + 1; x < an / 2; x += 1) for (let z = -fo / 2 + 1; z < fo / 2; z += 1) {
    const b = new T.Mesh(new T.PlaneGeometry(0.98, 0.98), pinta(o.suelo || "#5a3d5e", { color: new T.Color(o.suelo || "#5a3d5e").offsetHSL(0, 0, (Math.sin(x * 12.9 + z * 78.2) * 0.5) * 0.03) }));
    b.rotation.x = -Math.PI / 2; b.position.set(x - 0.5, 0.005, z - 0.5); b.receiveShadow = true; gr.add(b);
  }
  (o.padre || E.scene).add(gr);
  return { grupo: gr, suelo, fondo, lado };
}

// Fachada de un edificio con ventanas amarillas y puerta. Mira hacia +z.
export function fachada(E, o = {}) {
  const an = o.ancho || 8, al = o.alto || 6, g = new T.Group();
  g.add(malla(caja_(an, al, 0.4, 0.02), pinta(o.color || "#c4532c"), 0, al / 2, 0));
  const ven = pinta(o.ventana || "#efe48c", { emissive: o.ventana || "#efe48c", emissiveIntensity: 0.25 });
  for (let fila = 0; fila < (o.pisos || 2); fila++) for (let col = 0; col < (o.columnas || 4); col++) {
    const x = -an / 2 + (col + 0.5) * an / (o.columnas || 4), y = 1.9 + fila * 2.2;
    if (Math.abs(x) < 0.8 && fila === 0 && o.puerta !== false) continue;
    g.add(malla(caja_(1, 1.2, 0.1), ven, x, y, 0.22), malla(caja_(1.2, 0.1, 0.25), pinta("#d9d2c0"), x, y - 0.65, 0.26));
  }
  if (o.puerta !== false) g.add(malla(caja_(1.2, 2.1, 0.1), pinta(o.colorPuerta || "#2f7a6c"), 0, 1.05, 0.22));
  (o.padre || E.scene).add(g); return g;
}

// Ciudad de fondo: bloques morados con ventanitas encendidas, lejos y en la niebla.
export function ciudad(E, o = {}) {
  const g = new T.Group(), az = semilla(o.semilla || 3);
  const n = o.n || 9, z = o.z ?? -14, ancho = o.ancho || 22;
  for (let i = 0; i < n; i++) {
    const w = 1.6 + az() * 1.8, h = 4 + az() * 7, x = -ancho / 2 + (i + 0.5) * ancho / n;
    const color = ["#4b3a7a", "#5a4b8c", "#3c4f7a", "#6a5a8a"][i % 4];
    const tex = lienzo(128, 256, (c, W, H) => {
      c.fillStyle = color; c.fillRect(0, 0, W, H);
      for (let yy = 12; yy < H - 12; yy += 26) for (let xx = 10; xx < W - 14; xx += 24) if (az() < 0.35) { c.fillStyle = "#f5e3a0"; c.fillRect(xx, yy, 10, 12); }
    });
    const m = new T.Mesh(new T.BoxGeometry(w, h, 1.4), new T.MeshStandardMaterial({ map: tex, emissive: "#ffffff", emissiveMap: tex, emissiveIntensity: 0.25, roughness: 1 }));
    m.position.set(x, h / 2, z - az() * 3); g.add(m);
  }
  (o.padre || E.scene).add(g); return g;
}

export function arbol(E, pos = V(), o = {}) {
  const g = new T.Group();
  g.add(malla(new T.CylinderGeometry(0.12, 0.16, 1.4, 6), pinta(o.tronco || "#5b3a2a"), 0, 0.7, 0));
  g.add(malla(new T.IcosahedronGeometry(o.copa || 1.1, 0), pinta(o.color || "#2f6e4a"), 0, 1.9, 0));
  g.position.copy(pos); (o.padre || E.scene).add(g); return g;
}

// Pupitre y silla de colegio (o escritorio con o.ancho grande). La superficie del pupitre queda en y = 0.72.
export function pupitre(E, pos = V(), o = {}) {
  const g = new T.Group(), an = o.ancho || 0.9, fo = o.fondo || 0.6;
  g.add(malla(caja_(an, 0.06, fo), pinta(o.tapa || "#c9884e"), 0, 0.72, 0));
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(malla(new T.BoxGeometry(0.05, 0.7, 0.05), pinta(o.patas || "#5a5b7a"), x * (an / 2 - 0.06), 0.35, z * (fo / 2 - 0.06)));
  if (o.silla !== false) {
    const s = new T.Group(); s.position.set(0, 0, fo / 2 + 0.25);
    s.add(malla(caja_(0.42, 0.05, 0.4), pinta(o.silla || "#3d8f86"), 0, 0.42, 0), malla(caja_(0.42, 0.4, 0.05), pinta(o.silla || "#3d8f86"), 0, 0.65, 0.2));
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) s.add(malla(new T.BoxGeometry(0.04, 0.42, 0.04), pinta("#5a5b7a"), x * 0.18, 0.21, z * 0.17));
    g.add(s); g.userData.silla = s;
  }
  g.position.copy(pos); (o.padre || E.scene).add(g); return g;
}

// ---- Caras ----------------------------------------------------------------------------------------------------------
// Expresiones: normal, feliz, sonrisa, risa, triste, llora, sorpresa, duda, guiño, estrellas, enojo, nervioso, dormido.
export const EXPRESIONES = ["normal", "feliz", "sonrisa", "risa", "triste", "llora", "sorpresa", "duda", "guiño", "estrellas", "enojo", "nervioso", "dormido"];
function dibujarCara(g, w, h, expr, o) {
  g.clearRect(0, 0, w, h);
  if (o.pantalla) { g.fillStyle = "#fbf6ee"; g.fillRect(0, 0, w, h); }
  const cx = w / 2, ey = h * (o.pantalla ? 0.42 : 0.47), sep = w * (o.pantalla ? 0.17 : 0.13), my = h * (o.pantalla ? 0.66 : 0.73);
  const tinta = o.tinta || "#1e1a1c", lw = Math.round(h * 0.035);
  g.lineCap = g.lineJoin = "round"; g.strokeStyle = tinta; g.fillStyle = tinta; g.lineWidth = lw;
  const ojo = (x, tipo) => {
    g.beginPath();
    if (tipo === "cerrado") { g.arc(x, ey + h * 0.02, h * 0.05, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); return; }
    if (tipo === "abajo") { g.arc(x, ey - h * 0.02, h * 0.05, Math.PI * 0.15, Math.PI * 0.85); g.stroke(); return; }
    if (tipo === "estrella") { g.fillStyle = "#f7c53b"; estrella(g, x, ey, h * 0.08); g.fill(); g.fillStyle = tinta; return; }
    if (tipo === "grande") { g.ellipse(x, ey, h * 0.05, h * 0.065, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(x + h * 0.015, ey - h * 0.02, h * 0.015, 0, 7); g.fill(); g.fillStyle = tinta; return; }
    g.ellipse(x, ey, h * 0.035, h * 0.048, 0, 0, Math.PI * 2); g.fill();
  };
  const boca = (tipo) => {
    g.beginPath();
    if (tipo === "sonrisa") { g.arc(cx, my - h * 0.06, h * 0.07, Math.PI * 0.2, Math.PI * 0.8); g.stroke(); }
    else if (tipo === "abierta") { g.moveTo(cx - h * 0.08, my - h * 0.03); g.quadraticCurveTo(cx, my + h * 0.12, cx + h * 0.08, my - h * 0.03); g.closePath(); g.fillStyle = "#7a2630"; g.fill(); g.stroke(); g.fillStyle = tinta; }
    else if (tipo === "triste") { g.arc(cx, my + h * 0.05, h * 0.06, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); }
    else if (tipo === "o") { g.ellipse(cx, my, h * 0.035, h * 0.05, 0, 0, 7); g.fillStyle = "#7a2630"; g.fill(); g.stroke(); g.fillStyle = tinta; }
    else if (tipo === "llanto") { g.ellipse(cx, my, h * 0.06, h * 0.045, 0, 0, 7); g.fillStyle = "#7a2630"; g.fill(); g.stroke(); g.fillStyle = tinta; }
    else if (tipo === "zigzag") { for (let i = 0; i <= 4; i++) g.lineTo(cx - h * 0.08 + i * h * 0.04, my + (i % 2 ? -1 : 1) * h * 0.015); g.stroke(); }
    else if (tipo === "plana") { g.moveTo(cx - h * 0.05, my); g.lineTo(cx + h * 0.05, my); g.stroke(); }
    else { g.arc(cx, my - h * 0.03, h * 0.04, Math.PI * 0.25, Math.PI * 0.75); g.stroke(); }
  };
  const ceja = (x, ang, dy = 0) => { g.save(); g.translate(x, ey - h * 0.12 + dy); g.rotate(ang); g.beginPath(); g.moveTo(-h * 0.045, 0); g.lineTo(h * 0.045, 0); g.stroke(); g.restore(); };
  const P = {
    normal: ["punto", "punto", "chica"], feliz: ["cerrado", "cerrado", "sonrisa"], sonrisa: ["punto", "punto", "sonrisa"],
    risa: ["cerrado", "cerrado", "abierta"], triste: ["punto", "punto", "triste"], llora: ["cerrado", "cerrado", "llanto"],
    sorpresa: ["grande", "grande", "o"], duda: ["punto", "punto", "plana"], guiño: ["cerrado", "punto", "sonrisa"],
    estrellas: ["estrella", "estrella", "abierta"], enojo: ["punto", "punto", "zigzag"], nervioso: ["grande", "grande", "zigzag"],
    dormido: ["abajo", "abajo", "plana"],
  }[expr] || ["punto", "punto", "chica"];
  ojo(cx - sep, P[0]); ojo(cx + sep, P[1]); boca(P[2]);
  if (expr === "triste" || expr === "llora") { ceja(cx - sep, 0.35); ceja(cx + sep, -0.35); }
  if (expr === "enojo") { ceja(cx - sep, 0.4, h * 0.02); ceja(cx + sep, -0.4, h * 0.02); }
  if (expr === "duda") { ceja(cx + sep, -0.25, -h * 0.03); g.fillStyle = "#e0505c"; g.font = `bold ${Math.round(h * 0.2)}px "Patrick Hand", cursive`; g.fillText("?", cx + sep * 2.1, ey - h * 0.05); g.fillStyle = tinta; }
  if (!o.pantalla) { // rubor: rayitas rosas
    g.strokeStyle = "#e86a8a"; g.lineWidth = lw * 0.7;
    for (const lado of [-1, 1]) for (let i = 0; i < 3; i++) { const x = cx + lado * sep * 1.55 + (i - 1) * h * 0.022; g.beginPath(); g.moveTo(x + h * 0.01, my - h * 0.1); g.lineTo(x - h * 0.01, my - h * 0.06); g.stroke(); }
    g.strokeStyle = tinta; g.lineWidth = lw;
  }
  if (expr === "llora") { g.fillStyle = "#5fd0e6"; for (const lado of [-1, 1]) { g.beginPath(); g.ellipse(cx + lado * sep, ey + h * 0.13, h * 0.025, h * 0.09, 0, 0, 7); g.fill(); } g.fillStyle = tinta; }
  if (expr === "nervioso") { g.fillStyle = "#7fd6ee"; g.beginPath(); g.ellipse(cx + sep * 2, ey - h * 0.1, h * 0.025, h * 0.04, 0, 0, 7); g.fill(); g.fillStyle = tinta; }
  if (o.lentes) { g.lineWidth = lw * 0.8; for (const lado of [-1, 1]) { g.beginPath(); g.arc(cx + lado * sep, ey, h * 0.085, 0, 7); g.stroke(); } g.beginPath(); g.moveTo(cx - sep + h * 0.085, ey); g.lineTo(cx + sep - h * 0.085, ey); g.stroke(); g.lineWidth = lw; }
  if (o.barba) { g.fillStyle = "rgba(25,18,20,0.32)"; g.beginPath(); g.ellipse(cx, my - h * 0.02, sep * 1.45, h * 0.14, 0, 0.05, Math.PI - 0.05); g.fill(); g.fillStyle = tinta; }
  if (o.bigote) { g.beginPath(); g.ellipse(cx - h * 0.04, my - h * 0.07, h * 0.045, h * 0.02, 0.2, 0, 7); g.ellipse(cx + h * 0.04, my - h * 0.07, h * 0.045, h * 0.02, -0.2, 0, 7); g.fill(); }
}
function estrella(g, x, y, r) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); }

function nuevaCara(o) {
  const c = document.createElement("canvas"); c.width = 512; c.height = o.pantalla ? 384 : 288;
  const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 8;
  return { c, tex, o, ultima: null };
}
// Cambia la cara de un personaje o de una compu. Solo redibuja si cambia.
export function cara(quien, expr) {
  const k = quien.userData.cara; if (!k || k.ultima === expr) return;
  dibujarCara(k.c.getContext("2d"), k.c.width, k.c.height, expr, k.o); k.tex.needsUpdate = true; k.ultima = expr;
}
// La cara según el segundo: caraEn(nina, s, [[0, "feliz"], [C["llorosos"], "llora"]]).
export function caraEn(quien, s, lista) { let e = lista[0][1]; for (const [t, x] of lista) if (s >= t) e = x; cara(quien, e); }

// ---- Personajes -----------------------------------------------------------------------------------------------------
// persona(E, { piel, pelo, peinado: corto|melena|moño|calvo|pelon, ropa, pantalon, zapatos, lentes, bigote, barba, corbata,
// adulto, expr }). Cabeza enorme facetada, cuerpo de caja. Partes en p.userData: cabeza, cuerpo, brazoI, brazoD,
// piernaI, piernaD. El origen está en los pies. Mira hacia +z.
export function persona(E, o = {}) {
  const k = o.adulto ? 1.35 : 1, g = new T.Group(), u = g.userData;
  const piel = o.piel || "#f0c7a0", ropa = o.ropa || "#3f9f8f";
  const pierna = (x) => { const p = new T.Group(); p.position.set(x, 0.34 * k, 0); p.add(malla(caja_(0.17, 0.3 * k, 0.19, 0.05), pinta(o.pantalon || "#2d3550"), 0, -0.15 * k, 0), malla(caja_(0.19, 0.08, 0.26, 0.04), pinta(o.zapatos || "#1f1b22"), 0, -0.3 * k, 0.03)); g.add(p); return p; };
  u.piernaI = pierna(-0.12); u.piernaD = pierna(0.12);
  const yc = 0.34 * k + 0.26 * k;
  u.cuerpo = malla(caja_(0.56, 0.54 * k, 0.38, 0.12), pinta(ropa), 0, yc, 0); g.add(u.cuerpo);
  if (o.corbata) { u.cuerpo.add(malla(caja_(0.08, 0.3 * k, 0.03, 0.01), pinta(o.corbata), 0, 0.02, 0.2), malla(caja_(0.2, 0.28 * k, 0.02, 0.01), pinta("#f2efe8"), 0, 0.06, 0.19)); }
  const brazo = (lado) => { const p = new T.Group(); p.position.set(lado * 0.33, yc + 0.2 * k, 0); p.add(malla(new T.CapsuleGeometry(0.08, 0.28 * k, 3, 8), pinta(ropa), 0, -0.2 * k, 0), malla(new T.IcosahedronGeometry(0.085, 1), pinta(piel), 0, -0.4 * k, 0)); g.add(p); return p; };
  u.brazoI = brazo(-1); u.brazoD = brazo(1);
  const cab = new T.Group(); cab.position.y = yc + 0.27 * k + 0.4; g.add(cab); u.cabeza = cab;
  const R = 0.45;
  const craneo = malla(new T.IcosahedronGeometry(R, 2), pinta(piel)); craneo.scale.set(1.06, 0.96, 1); cab.add(craneo);
  // la cara: un trozo de esfera un pelo más grande que la cabeza, con la cara dibujada (transparente alrededor)
  const kc = nuevaCara({ lentes: o.lentes, bigote: o.bigote, barba: o.barba }); u.cara = kc;
  const fl = Math.PI * 0.8, geo = new T.SphereGeometry(R * 1.012, 32, 16, Math.PI / 2 - fl / 2, fl, Math.PI * 0.3, Math.PI * 0.45);
  const caraM = new T.Mesh(geo, new T.MeshStandardMaterial({ map: kc.tex, transparent: true, roughness: 0.9, depthWrite: false }));
  caraM.scale.copy(craneo.scale); cab.add(caraM);
  const pelo = pinta(o.pelo || "#2b2024"), pein = o.peinado || "corto";
  const casco = (tl, giro) => { const m = malla(new T.SphereGeometry(R * 1.07, 14, 8, 0, Math.PI * 2, 0, tl), pelo); m.rotation.x = giro; m.scale.set(1.06, 0.98, 1.02); cab.add(m); return m; };
  if (pein === "corto" || pein === "moño") casco(Math.PI * 0.42, -0.38);
  if (pein === "melena") { casco(Math.PI * 0.62, -0.75); }
  if (pein === "moño") cab.add(malla(new T.IcosahedronGeometry(0.17, 1), pelo, 0, R * 1.0, -R * 0.35));
  if (pein === "calvo") { const m = malla(new T.SphereGeometry(R * 1.05, 14, 8, Math.PI, Math.PI, Math.PI * 0.32, Math.PI * 0.26), pelo); cab.add(m); }
  if (o.lentes) cab.add(malla(new T.BoxGeometry(R * 2.1, 0.03, 0.03), pinta("#1e1a1c"), 0, -0.02, 0));
  cara(g, o.expr || "normal");
  g.userData.altura = cab.position.y + R;
  E.sombras(g); (o.padre || E.scene).add(g); return g;
}

// Una compu/robot con la cara en la pantalla (la IA, el asistente). cara(compu, "feliz") igual que una persona.
export function compu(E, o = {}) {
  const g = new T.Group(), color = o.color || "#d9634a";
  const cuerpo = malla(caja_(0.9, 0.78, 0.7, 0.1), pinta(color), 0, 0.39, 0); g.add(cuerpo);
  if (o.tapa !== false) { const tapa = malla(caja_(0.86, 0.7, 0.12, 0.06), pinta(color), 0, 0.78 + 0.35, -0.3); tapa.rotation.x = -0.12; g.add(tapa); g.userData.tapa = tapa; }
  const kc = nuevaCara({ pantalla: true }); g.userData.cara = kc;
  const pant = new T.Mesh(new T.PlaneGeometry(0.72, 0.56), new T.MeshStandardMaterial({ map: kc.tex, emissive: "#ffffff", emissiveMap: kc.tex, emissiveIntensity: 0.3, roughness: 0.7 }));
  pant.position.set(0, 0.4, 0.352); g.add(pant);
  cara(g, o.expr || "feliz");
  E.sombras(g); (o.padre || E.scene).add(g); return g;
}

// ---- Movimiento (todo desde el segundo s) ---------------------------------------------------------------------------
// Aparece creciendo con un pequeño rebote en t (nunca de 0 a 1 en un fotograma).
export function aparece(obj, s, t, dur = 0.35) {
  const base = obj.userData.escala ?? (obj.userData.escala = obj.scale.x);
  const u = lim((s - t) / dur); obj.visible = s >= t; obj.scale.setScalar(base * Math.max(0.001, sale(u)));
}
// Se va encogiendo en t.
export function desaparece(obj, s, t, dur = 0.25) {
  const base = obj.userData.escala ?? (obj.userData.escala = obj.scale.x);
  const u = lim((s - t) / dur); obj.visible = u < 1; if (s >= t) obj.scale.setScalar(base * Math.max(0.001, 1 - suave(0, 1, u)));
}
// Salto de alegría o de susto en t: devuelve cuánto sube (súmalo a position.y).
export const brinco = (s, t, alto = 0.25, dur = 0.38) => { const u = (s - t) / dur; return u > 0 && u < 1 ? Math.sin(Math.PI * u) * alto : 0; };
// Vida de maqueta: respira y ladea la cabeza un poco. fase distinta por personaje.
export function vive(p, s, fase = 0) {
  const u = p.userData; u.cuerpo.scale.y = 1 + Math.sin(s * 2.4 + fase) * 0.015;
  u.cabeza.rotation.z = Math.sin(s * 1.3 + fase) * 0.04; u.cabeza.rotation.x = Math.sin(s * 1.1 + fase * 2) * 0.03;
}
// Camina por puntos [[segundo, V(x, 0, z)], ...]: se mueve entre puntos, gira hacia donde va y balancea piernas y brazos.
export function camina(p, s, puntos) {
  let i = 0; while (i < puntos.length - 2 && s > puntos[i + 1][0]) i++;
  const [ta, a] = puntos[i], [tb, b] = puntos[Math.min(i + 1, puntos.length - 1)];
  const u = tb > ta ? suave(ta, tb, s) : 1; p.position.lerpVectors(a, b, u);
  const andando = s > ta && s < tb, d = b.clone().sub(a);
  if (andando && d.lengthSq() > 1e-4) p.rotation.y = Math.atan2(d.x, d.z);
  const paso = andando ? Math.sin(s * 11) * 0.5 * Math.min(1, (s - ta) * 4, (tb - s) * 4) : 0, us = p.userData;
  us.piernaI.rotation.x = paso; us.piernaD.rotation.x = -paso; us.brazoI.rotation.x = -paso * 0.8; us.brazoD.rotation.x = paso * 0.8;
  p.position.y = andando ? Math.abs(Math.sin(s * 11)) * 0.04 : 0;
}
// Levanta un brazo ("I" o "D") con peso 0..1 (que salga de suave()).
export function brazo(p, lado, peso) { const b = p.userData[lado === "I" ? "brazoI" : "brazoD"]; b.rotation.z = (lado === "I" ? -1 : 1) * 2.6 * peso; }
// Gira para mirar a algo, suave con un peso 0..1.
export function mira(p, objetivo, peso = 1) { const d = objetivo.clone().sub(p.position); const a = Math.atan2(d.x, d.z); p.rotation.y += (a - p.rotation.y) * peso; }

// Lluvia: rayitas que caen. lluvia(E, { n, x: [-6, 6], z: [-4, 6], alto: 7 }).poner(s)
export function lluvia(E, o = {}) {
  const n = o.n || 260, az = semilla(11), X = o.x || [-6, 6], Z = o.z || [-4, 6], H = o.alto || 7, L = o.largo || 0.35;
  const sem = Array.from({ length: n }, () => [X[0] + az() * (X[1] - X[0]), Z[0] + az() * (Z[1] - Z[0]), az()]);
  const pos = new Float32Array(n * 6), geo = new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(pos, 3));
  const lineas = new T.LineSegments(geo, new T.LineBasicMaterial({ color: o.color || "#dfe6ff", transparent: true, opacity: o.opacidad ?? 0.55 }));
  lineas.frustumCulled = false; E.scene.add(lineas);
  return { lineas, poner(s) {
    sem.forEach(([x, z, f], i) => { const y = H - ((s * (o.velocidad || 9) + f * H) % H); pos.set([x, y, z, x - 0.02, y + L, z], i * 6); });
    geo.attributes.position.needsUpdate = true;
  } };
}

// ---- Cámara: planos con acercamiento lento ---------------------------------------------------------------------------
// planos(E, s, [[segundo, desde, mira, hasta?], ...]): en cada segundo empieza un plano nuevo (corte seco) y dentro de él
// la cámara se acerca despacio de «desde» a «hasta» (por defecto un 8 % hacia adonde mira), como en la maqueta.
export function planos(E, s, lista) {
  let i = 0; while (i < lista.length - 1 && s >= lista[i + 1][0]) i++;
  const [t0, desde, mir, hasta] = lista[i], t1 = i + 1 < lista.length ? lista[i + 1][0] : t0 + 3;
  const fin = hasta || desde.clone().lerp(mir, 0.08), u = lim((s - t0) / Math.max(0.5, t1 - t0));
  E.camera.position.lerpVectors(desde, fin, u * (2 - u) * 0.85 + u * 0.15); E.mira.copy(mir);
}
