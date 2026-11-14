// Datum landing page: a 6" Class 300 weld-neck flange joint (ASME B16.5 proportions, values
// from Datum's own data) choreographed by scroll: assembled -> exploded -> section cut with
// live dimensions -> the flange face settling onto the datum triangle (the app icon).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const root = document.documentElement;
const still = root.classList.contains('still') || matchMedia('(prefers-reduced-motion: reduce)').matches;
if (still) root.classList.add('still');

/* ---------- page chrome (works without WebGL) ---------- */
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('solid', scrollY > 40), { passive: true });

const hasGsap = !!window.gsap && !!window.ScrollTrigger;
if (hasGsap) gsap.registerPlugin(ScrollTrigger);

function reveals() {
  if (!hasGsap || still) { document.querySelectorAll('.reveal').forEach(e => { e.style.opacity = 1; e.style.transform = 'none'; }); return; }
  gsap.utils.toArray('.reveal').forEach((el, i) => gsap.to(el, {
    opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: (i % 3) * .08,
    scrollTrigger: { trigger: el, start: 'top 86%' },
  }));
}

function searchDemo() {
  const q = '4 inch 600# blind rtj';
  const out = document.getElementById('typed');
  const chips = document.querySelectorAll('.chip'), rows = document.querySelectorAll('.res li');
  const show = () => { out.textContent = q; chips.forEach(c => { c.style.opacity = 1; c.style.transform = 'none'; }); rows.forEach(r => { r.style.opacity = 1; r.style.transform = 'none'; }); };
  if (!hasGsap || still) return show();
  let played = false;
  ScrollTrigger.create({ trigger: '#search', start: 'top 60%', onEnter: () => {
    if (played) return; played = true;
    let i = 0;
    const t = setInterval(() => {
      out.textContent = q.slice(0, ++i);
      if (i === 6) gsap.to(chips[0], { opacity: 1, scale: 1, duration: .35, ease: 'back.out(2)' });
      if (i === 11) gsap.to(chips[1], { opacity: 1, scale: 1, duration: .35, ease: 'back.out(2)' });
      if (i === q.length) {
        clearInterval(t);
        gsap.to(chips[2], { opacity: 1, scale: 1, duration: .35, ease: 'back.out(2)' });
        gsap.to(rows, { opacity: 1, y: 0, duration: .5, stagger: .12, ease: 'power2.out', delay: .2 });
      }
    }, 70);
  } });
}

function deck() {
  const box = document.getElementById('deck'), nav2 = document.getElementById('deckNav');
  const cards = [...box.querySelectorAll('.shot')];
  let cur = 0, timer = null;
  const place = () => cards.forEach((c, i) => {
    const k = (i - cur + cards.length) % cards.length;           // 0 = front
    const tf = `translate(-50%,-50%) translate3d(${k * 54}px, ${-k * 30}px, ${-k * 160}px) rotateY(${k ? -14 : -4}deg) rotateX(${k ? 6 : 2}deg)`;
    c.style.transition = still ? 'none' : 'transform .9s cubic-bezier(.2,.8,.2,1), opacity .9s, filter .9s';
    c.style.transform = tf; c.style.zIndex = String(cards.length - k);
    c.style.opacity = k > 3 ? 0 : 1 - k * .18; c.style.filter = k ? `brightness(${1 - k * .18})` : 'none';
    nav2.children[i]?.classList.toggle('on', i === cur);
  });
  cards.forEach((c, i) => {
    const b = document.createElement('button'); b.textContent = c.querySelector('figcaption').textContent;
    b.onclick = () => { cur = i; place(); restart(); }; nav2.append(b);
    c.addEventListener('click', () => { cur = (cur + 1) % cards.length; place(); restart(); });
  });
  const restart = () => { clearInterval(timer); if (!still) timer = setInterval(() => { cur = (cur + 1) % cards.length; place(); }, 4200); };
  place(); restart();
}

function tilt() {
  if (still || !matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('.feat').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(6px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

reveals(); searchDemo(); deck(); tilt();

/* ---------- the 3D stage ---------- */
const canvas = document.getElementById('gl');
const acts = [...document.querySelectorAll('.act')];
const dots = [...document.querySelectorAll('.progress b')];
const S = .01;                                   // mm -> scene units

function showActs(p) {
  const win = [[-1, .12], [.17, .37], [.43, .66], [.74, 2]];
  acts.forEach((a, i) => {
    const [a0, a1] = win[i];
    const o = Math.max(0, Math.min(1, Math.min((p - a0) / .05, (a1 - p) / .05)));
    a.style.opacity = o;
    a.style.transform = innerWidth > 900 ? `translateY(calc(-50% + ${(1 - o) * 24}px))` : `translateY(${(1 - o) * 24}px)`;
    a.classList.toggle('on', o > .5);
  });
  const idx = p < .145 ? 0 : p < .4 ? 1 : p < .7 ? 2 : 3;
  dots.forEach((d, i) => d.classList.toggle('on', i === idx));
}

let renderer;
try {
  if (still) throw new Error('still');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch {
  root.classList.add('nogl');
  acts[0].style.opacity = 1;
}

if (renderer) build();

function build() {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x050b18, 15, 34);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), .04).texture;

  const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);

  // lights: studio key, cyan rim, amber kicker at the joint
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(4, 6, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x3fb6e8, 3.2); rim.position.set(-6, 2, -5); scene.add(rim);
  const amberLight = new THREE.PointLight(0xffb02e, 0, 6, 1.6); amberLight.position.set(0, 0, 0); scene.add(amberLight);
  scene.add(new THREE.HemisphereLight(0x8fbfff, 0x0a1428, .35));

  // section cut: everything with x > cut is removed; cut faces glow blueprint cyan
  const cutPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 10);
  const sectioned = mat => {
    mat.clippingPlanes = [cutPlane];
    mat.side = THREE.DoubleSide;
    mat.onBeforeCompile = sh => {
      sh.fragmentShader = sh.fragmentShader.replace('#include <dithering_fragment>',
        '#include <dithering_fragment>\n if (!gl_FrontFacing) { gl_FragColor = vec4(0.16, 0.55, 0.78, gl_FragColor.a); }');
    };
    return mat;
  };
  const steel = () => sectioned(new THREE.MeshStandardMaterial({ color: 0xcfdbe7, metalness: .9, roughness: .3, transparent: true }));
  const darkSteel = () => sectioned(new THREE.MeshStandardMaterial({ color: 0x3b4552, metalness: .75, roughness: .42, transparent: true }));

  // ---- geometry (mm, ASME B16.5 6" Class 300 weld neck, Sch STD) ----
  const D = { od: 318, thk: 35.1, rf: 215.9, rfh: 1.6, bc: 269.7, holes: 12, hole: 22.4, hub: 97, hubBase: 206, hubWeld: 168.3, bore: 154.08, stud: 19.05, studLen: 120, nutAF: 31.75, gasket: 4.5 };
  const R = v => v / 2 * S;
  const g2 = D.gasket / 2 * S;

  function annulus(ro, ri, holes = []) {
    const s = new THREE.Shape(); s.absarc(0, 0, ro, 0, Math.PI * 2, false);
    const h = new THREE.Path(); h.absarc(0, 0, ri, 0, Math.PI * 2, true); s.holes.push(h);
    for (const [x, y, r] of holes) { const p = new THREE.Path(); p.absarc(x, y, r, 0, Math.PI * 2, true); s.holes.push(p); }
    return s;
  }
  const boltXY = k => { const a = (k + .5) * Math.PI * 2 / D.holes; return [Math.cos(a) * R(D.bc), Math.sin(a) * R(D.bc)]; };

  function flange() {
    const g = new THREE.Group(), m = steel();
    const ringDepth = (D.thk - D.rfh) * S;
    const holes = Array.from({ length: D.holes }, (_, k) => [...boltXY(k), R(D.hole)]);
    const ring = new THREE.Mesh(new THREE.ExtrudeGeometry(annulus(R(D.od), R(D.bore), holes), { depth: ringDepth, bevelEnabled: true, bevelThickness: .012, bevelSize: .012, bevelSegments: 2, curveSegments: 72 }), m);
    ring.position.z = -D.thk * S;                                             // back face .. RF step
    const rf = new THREE.Mesh(new THREE.ExtrudeGeometry(annulus(R(D.rf), R(D.bore)), { depth: D.rfh * S, bevelEnabled: false, curveSegments: 72 }), m);
    rf.position.z = -D.rfh * S;
    const hubPts = [[R(D.bore), -D.hub], [R(D.hubWeld), -D.hub], [R(D.hubBase), -D.thk], [R(D.bore), -D.thk], [R(D.bore), -D.hub]].map(([r, z]) => new THREE.Vector2(r, z * S));
    const hubGeo = new THREE.LatheGeometry(hubPts, 96); hubGeo.rotateX(Math.PI / 2);
    const hub = new THREE.Mesh(hubGeo, m);
    const pipePts = [[R(D.bore), -D.hub], [R(D.hubWeld), -D.hub], [R(D.hubWeld), -D.hub - 230], [R(D.bore), -D.hub - 230], [R(D.bore), -D.hub]].map(([r, z]) => new THREE.Vector2(r, z * S));
    const pipeGeo = new THREE.LatheGeometry(pipePts, 96); pipeGeo.rotateX(Math.PI / 2);
    const pipe = new THREE.Mesh(pipeGeo, sectioned(new THREE.MeshStandardMaterial({ color: 0x8796a8, metalness: .8, roughness: .45, transparent: true })));
    // weld bead between hub and pipe
    const weld = new THREE.Mesh(new THREE.TorusGeometry(R(D.hubWeld), .035, 12, 96), darkSteel());
    weld.position.z = -D.hub * S;
    g.add(ring, rf, hub, pipe, weld);
    g.userData.mats = [m, pipe.material, weld.material];
    return g;
  }

  const assembly = new THREE.Group(); scene.add(assembly);
  const left = flange(); left.position.z = -g2; assembly.add(left);
  const right = flange(); right.rotation.y = Math.PI; right.position.z = g2; assembly.add(right);

  // spiral-wound gasket: winding, inner ring, amber centering ring
  const gasket = new THREE.Group();
  const gm = sectioned(new THREE.MeshStandardMaterial({ color: 0xffb02e, metalness: .55, roughness: .35, emissive: 0xff8a1f, emissiveIntensity: .15, transparent: true }));
  const wm = sectioned(new THREE.MeshStandardMaterial({ color: 0xe7eef5, metalness: .95, roughness: .22, transparent: true }));
  const centering = new THREE.Mesh(new THREE.ExtrudeGeometry(annulus(R(D.bc) - R(D.stud) - .02, 98.4 * S), { depth: 3 * S, bevelEnabled: false, curveSegments: 72 }), gm);
  const winding = new THREE.Mesh(new THREE.ExtrudeGeometry(annulus(98.4 * S, 85.7 * S), { depth: D.gasket * S, bevelEnabled: false, curveSegments: 72 }), wm);
  const inner = new THREE.Mesh(new THREE.ExtrudeGeometry(annulus(85.7 * S, 78.6 * S), { depth: 3 * S, bevelEnabled: false, curveSegments: 72 }), wm);
  centering.position.z = -1.5 * S; inner.position.z = -1.5 * S; winding.position.z = -g2;
  gasket.add(centering, winding, inner); assembly.add(gasket);

  // stud bolts and heavy hex nuts
  const studs = new THREE.Group(), nutsL = new THREE.Group(), nutsR = new THREE.Group();
  const sm = darkSteel(), nm = darkSteel();
  const studGeo = new THREE.CylinderGeometry(R(D.stud), R(D.stud), D.studLen * S, 20); studGeo.rotateX(Math.PI / 2);
  const nutGeo = new THREE.CylinderGeometry(D.nutAF / Math.sqrt(3) * S, D.nutAF / Math.sqrt(3) * S, D.stud * S, 6); nutGeo.rotateX(Math.PI / 2);
  const nutZ = (D.thk * S + g2) + D.stud * S / 2;
  for (let k = 0; k < D.holes; k++) {
    const [x, y] = boltXY(k);
    const s = new THREE.Mesh(studGeo, sm); s.position.set(x, y, 0); studs.add(s);
    const a = new THREE.Mesh(nutGeo, nm); a.position.set(x, y, -nutZ); a.rotation.z = Math.PI / 6; nutsL.add(a);
    const b = new THREE.Mesh(nutGeo, nm); b.position.set(x, y, nutZ); b.rotation.z = Math.PI / 6; nutsR.add(b);
  }
  assembly.add(studs, nutsL, nutsR);

  // datum triangle + datum line (the app icon's mark), revealed at the end
  const datum = new THREE.Group();
  const triShape = new THREE.Shape(); triShape.moveTo(0, 0); triShape.lineTo(.62, -1.02); triShape.lineTo(-.62, -1.02); triShape.closePath();
  const am = new THREE.MeshStandardMaterial({ color: 0xffa424, emissive: 0xff8a1f, emissiveIntensity: .75, metalness: .2, roughness: .35, transparent: true, opacity: 0, toneMapped: false });
  const tri = new THREE.Mesh(new THREE.ExtrudeGeometry(triShape, { depth: .12, bevelEnabled: true, bevelSize: .02, bevelThickness: .02 }), am);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(2.5, .2, .12), am); bar.position.y = -1.22;
  datum.add(tri, bar); datum.position.set(0, -R(D.od) - .12, -g2 - .06); scene.add(datum);

  // blueprint floor
  const grid = new THREE.GridHelper(40, 80, 0x3fb6e8, 0x1b3a5c);
  grid.position.y = -2.6; grid.material.transparent = true; grid.material.opacity = .28; scene.add(grid);

  const fadeables = [right, studs, nutsL, nutsR, gasket];
  const setOpacity = (obj, o) => obj.traverse(n => { if (n.material) { n.material.opacity = o; n.visible = o > .01; } });

  // ---- dimension overlay (act 2) ----
  const svg = document.getElementById('dims');
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, cls) => { const e = document.createElementNS(NS, tag); if (cls) e.setAttribute('class', cls); svg.append(e); return e; };
  const dims = [
    { label: 'Ø318 OD', a: [0, R(D.od), -g2 - .05], b: [0, -R(D.od), -g2 - .05], off: [0, 0, .95] },
    { label: 'Ø215.9 RF', a: [0, R(D.rf), -g2], b: [0, -R(D.rf), -g2], off: [0, 0, .45] },
    { label: '35.1', a: [0, R(D.od), -g2], b: [0, R(D.od), -D.thk * S - g2], off: [0, .38, 0] },
    { label: '97 through hub', a: [0, -R(D.od), -g2], b: [0, -R(D.hubWeld), -D.hub * S - g2], off: [0, -.5, 0], flat: true },
    { label: 'Ø154.08 bore', a: [0, R(D.bore), -D.hub * S - g2 - .5], b: [0, -R(D.bore), -D.hub * S - g2 - .5], off: [0, 0, 0] },
  ].map(d => ({ ...d, ext1: mk('line', 'ext'), ext2: mk('line', 'ext'), line: mk('line', 'd'), t1: mk('path', 'd'), t2: mk('path', 'd'), text: mk('text') }));
  const v = new THREE.Vector3();
  const toScreen = (p, w, h) => { v.set(...p).applyMatrix4(assembly.matrixWorld).project(camera); return [(v.x + 1) / 2 * w, (1 - v.y) / 2 * h]; };
  function drawDims(k, w, h) {
    svg.style.opacity = k;
    if (k <= 0) return;
    for (const d of dims) {
      const pa = toScreen(d.a, w, h), pb = toScreen(d.b, w, h);
      const qa = toScreen([d.a[0] + d.off[0], d.a[1] + d.off[1], d.a[2] + d.off[2]], w, h);
      const qb = toScreen([d.b[0] + d.off[0], (d.flat ? d.a[1] : d.b[1]) + d.off[1], d.b[2] + d.off[2]], w, h);
      const len = Math.hypot(qb[0] - qa[0], qb[1] - qa[1]) * k;
      const ang = Math.atan2(qb[1] - qa[1], qb[0] - qa[0]);
      const end = [qa[0] + Math.cos(ang) * len, qa[1] + Math.sin(ang) * len];
      const set = (e, x1, y1, x2, y2) => { e.setAttribute('x1', x1); e.setAttribute('y1', y1); e.setAttribute('x2', x2); e.setAttribute('y2', y2); };
      set(d.ext1, pa[0], pa[1], qa[0], qa[1]); set(d.ext2, pb[0], pb[1], qb[0], qb[1]); set(d.line, qa[0], qa[1], end[0], end[1]);
      const arrow = (e, p, dir) => { const a1 = dir + 2.7, a2 = dir - 2.7; e.setAttribute('d', `M${p[0] + Math.cos(a1) * 9},${p[1] + Math.sin(a1) * 9}L${p[0]},${p[1]}L${p[0] + Math.cos(a2) * 9},${p[1] + Math.sin(a2) * 9}`); };
      arrow(d.t1, qa, ang + Math.PI); arrow(d.t2, end, ang); d.t2.style.opacity = k > .98 ? 1 : 0;
      const mid = [(qa[0] + qb[0]) / 2, (qa[1] + qb[1]) / 2];
      const vertical = Math.abs(Math.sin(ang)) > .7;
      d.text.setAttribute('x', mid[0] + (vertical ? 10 : 0)); d.text.setAttribute('y', mid[1] + (vertical ? 4 : -9));
      d.text.setAttribute('text-anchor', vertical ? 'start' : 'middle'); d.text.textContent = d.label; d.text.style.opacity = k > .6 ? (k - .6) / .4 : 0;
    }
  }

  // ---- labels (act 1) ----
  const hint = document.querySelector('.scrollhint');
  const tagBox = document.getElementById('tags');
  const tags = [['Weld-neck flange', () => [0, R(D.od) + .15, left.position.z - .5]], ['Spiral-wound gasket', () => [0, R(D.bc) - .1, gasket.position.z]], ['Stud bolts · 2H nuts', () => [0, R(D.bc) + .3, studs.position.z + .9]]]
    .map(([t, at]) => { const e = document.createElement('div'); e.className = 'tag'; e.textContent = t; tagBox.append(e); return { e, at }; });

  // ---- scroll progress ----
  let target = 0, P = 0;
  const fixed = new URLSearchParams(location.search).get('p');   // ?p=0.6 freezes the story (screenshots)
  if (fixed != null) { P = target = Math.min(1, Math.max(0, +fixed || 0)); }
  else if (hasGsap) ScrollTrigger.create({ trigger: '#stage', start: 'top top', end: 'bottom bottom', onUpdate: s => { target = s.progress; } });
  else addEventListener('scroll', () => { const st = document.getElementById('stage'); target = Math.min(1, Math.max(0, scrollY / (st.offsetHeight - innerHeight))); }, { passive: true });

  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const L3 = (a, b, t) => a.map((x, i) => lerp(x, b[i], t));
  const shots = [
    { p: 0, pos: [8.6, 3.6, 9.8], tgt: [0, -.1, -.2] },
    { p: .3, pos: [15.5, 5.2, 6.2], tgt: [0, -.1, 0] },
    { p: .56, pos: [9.6, .25, -.45], tgt: [0, 0, -.45] },
    { p: .7, pos: [9.6, .25, -.45], tgt: [0, 0, -.45] },
    { p: .9, pos: [0, .1, 13.5], tgt: [0, -.8, 0] },
    { p: 1, pos: [0, .1, 12.8], tgt: [0, -.8, 0] },
  ];
  function cam(p) {
    let i = 0; while (i < shots.length - 2 && p > shots[i + 1].p) i++;
    const a = shots[i], b = shots[i + 1], t = ss(a.p, b.p, p);
    return { pos: L3(a.pos, b.pos, t), tgt: L3(a.tgt, b.tgt, t) };
  }

  let w = 0, h = 0, visible = true, t0 = performance.now();
  function resize() {
    w = canvas.clientWidth; h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // on wide screens keep the model to the right of the copy
    if (w > 900) camera.setViewOffset(w, h, -w * .2, 0, w, h);
    else camera.setViewOffset(w, h, 0, h * .2, w, h);              // phones: model in the upper half, copy below
    camera.fov = w > 900 ? 32 : 44;
    camera.updateProjectionMatrix();
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  }
  addEventListener('resize', resize); resize();
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) return;
    P += (target - P) * .085;
    const p = P, time = (now - t0) / 1000;
    const explode = ss(.12, .33, p) * (1 - ss(.42, .54, p));
    const cut = ss(.42, .56, p) * (1 - ss(.7, .8, p));
    const dimK = ss(.5, .64, p) * (1 - ss(.68, .72, p));
    const fin = ss(.72, .92, p);

    // idle motion in the hero, settling as the story starts
    const idle = 1 - ss(0, .12, p);
    assembly.rotation.z = time * .18 * idle + (1 - idle) * 0;
    assembly.rotation.y = Math.sin(time * .35) * .08 * idle;
    assembly.position.y = Math.sin(time * .8) * .04 * idle;

    left.position.z = -g2 - explode * 1.25;
    right.position.z = g2 + explode * 1.25;
    gasket.position.z = 0; gasket.position.y = explode * .25;
    studs.position.z = explode * 2.5;
    nutsL.position.z = -explode * 1.9; nutsR.position.z = explode * 3.4;
    amberLight.intensity = explode * 9 + fin * 5;
    key.intensity = 2.2 + fin * 1.4;
    renderer.toneMappingExposure = 1.05 + fin * .25;
    gm.emissiveIntensity = .15 + explode * .9;

    cutPlane.constant = lerp(10, 0, cut);
    const away = Math.max(ss(.4, .5, p), fin);          // section and datum show the flange alone
    fadeables.forEach(o => setOpacity(o, 1 - away));
    am.opacity = ss(.8, .95, p);
    datum.position.y = -R(D.od) - .12 - (1 - am.opacity) * .4;
    grid.material.opacity = .28 * (1 - fin * .6);

    const c = cam(p);
    camera.position.set(...c.pos); camera.lookAt(...c.tgt);
    renderer.render(scene, camera);

    assembly.updateMatrixWorld();
    drawDims(dimK, w, h);
    const tagK = ss(.24, .3, p) * (1 - ss(.36, .4, p));
    for (const tg of tags) {
      const [x, y] = toScreen(tg.at(), w, h);
      tg.e.style.opacity = tagK; tg.e.style.transform = `translate(${x}px, ${y - 30}px) translate(-50%, -100%)`;
    }
    showActs(p);
    hint.style.opacity = 1 - ss(.01, .04, p);
  }
  requestAnimationFrame(frame);
}
