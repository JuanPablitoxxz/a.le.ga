/**
 * main.js - Cosmos Viviente, Modo Video con Auto-Scroll Lento & Responsive
 * Compatible con Smartphone, Tablet, PC y Despliegue en Vercel
 */

// ========================================================
// 1. CONFIGURACIÓN DEL MOTOR 3D Y VARIABLES
// ========================================================

const canvas = document.getElementById('webgl-canvas');
let scene, camera, renderer;
let starField, cosmicRiver, nebulaCloud;
let constellationGroup, primaryPolyhedron, secondaryPolyhedron, goldenCrownPolyhedron;
let celebrationParticles = null;

// Interacción del cursor / Touch
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

// Touch Swipe para móvil/tablet
let touchStartX = 0;
let touchStartY = 0;

// Estado Narrativo
let currentChapter = 0;
const totalChapters = 5;

// ========================================================
// 2. MODO VIDEO & AUTO-AVANCE CON AUTO-SCROLL LENTO
// ========================================================

let isAutoPlay = true;
let chapterStartTime = performance.now();
// Duraciones calculadas para lectura pausada y cómoda (en ms)
const chapterDurations = [9500, 11500, 13000, 12000, 18000];
let scrollAnimFrame = null;
let autoAdvanceTimeout = null;

// Posiciones cinematográficas base de cámara
const cameraBasePositions = [
  { x: 0, y: 0, z: 27, lookAt: { x: 0, y: 0, z: 0 } },        // 0: Entrada Íntima
  { x: -6.5, y: 2.5, z: 18, lookAt: { x: -3.5, y: 1, z: 0 } },  // 1: Aula y Esfuerzo
  { x: 6.5, y: -2, z: 17, lookAt: { x: 3.5, y: -0.8, z: 0 } },  // 2: Mapas y Superación
  { x: 0, y: 0.5, z: 12.5, lookAt: { x: 0, y: 0, z: 0 } },    // 3: Sapo Verde - Ingeniera
  { x: 0, y: 3.8, z: 21, lookAt: { x: 0, y: 0, z: 0 } }       // 4: Momento de Graduación & Carta
];

function initCosmicScene() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.024);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(cameraBasePositions[0].x, cameraBasePositions[0].y, cameraBasePositions[0].z);

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 1);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const goldCenterLight = new THREE.PointLight(0xf8d77e, 3, 60);
  goldCenterLight.position.set(0, 3, 4);
  scene.add(goldCenterLight);

  const subtleVioletLight = new THREE.PointLight(0xa568ff, 1.8, 50);
  subtleVioletLight.position.set(-8, -4, 6);
  scene.add(subtleVioletLight);

  createInfiniteDeepStars();
  createContinuousCosmicRiver();
  createSwirlingNebulaStream();
  createDynamicConstellations();

  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  
  // Soporte de Swipe táctil para móvil y tablet
  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchmove', onDocumentTouchMove, { passive: true });
  document.addEventListener('touchend', onTouchEnd, { passive: true });
}

// ========================================================
// 3. SISTEMAS DE ESTRELLAS Y RÍO CÓSMICO EN MOVIMIENTO
// ========================================================

function createInfiniteDeepStars() {
  const starCount = 3800;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);

  const palette = [
    new THREE.Color(0xffffff),
    new THREE.Color(0xf8d77e),
    new THREE.Color(0xaae3ff),
    new THREE.Color(0xdfc2ff)
  ];

  for (let i = 0; i < starCount; i++) {
    const radius = 60 + Math.random() * 90;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.9,
    vertexColors: true,
    map: createGlowTexture(),
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  starField = new THREE.Points(geometry, material);
  scene.add(starField);
}

function createContinuousCosmicRiver() {
  const count = 1200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const initialData = [];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 6 + Math.random() * 22;
    const speed = 0.2 + Math.random() * 0.5;
    const yOffset = (Math.random() - 0.5) * 16;

    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = yOffset;
    positions[i * 3 + 2] = Math.sin(angle) * radius;

    initialData.push({
      angle: angle,
      radius: radius,
      speed: speed,
      yBase: yOffset,
      freq: 1 + Math.random() * 3
    });
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 0.65,
    color: 0xf8d77e,
    map: createGlowTexture(),
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  cosmicRiver = new THREE.Points(geometry, material);
  cosmicRiver.userData = { initialData: initialData };
  scene.add(cosmicRiver);
}

function createSwirlingNebulaStream() {
  const count = 550;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const colA = new THREE.Color(0x592882);
  const colB = new THREE.Color(0xb5821c);
  const colC = new THREE.Color(0x194d75);

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 40;
    const y = (Math.random() - 0.5) * 30;
    const z = (Math.random() - 0.5) * 35;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const r = Math.random();
    const c = r > 0.6 ? colB : (r > 0.3 ? colA : colC);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 5.5,
    vertexColors: true,
    map: createGlowTexture(true),
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  nebulaCloud = new THREE.Points(geometry, material);
  scene.add(nebulaCloud);
}

function createGlowTexture(isNebula = false) {
  const size = 64;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const half = size / 2;

  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);

  if (isNebula) {
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.25)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  } else {
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.25, 'rgba(255, 255, 255, 0.75)');
    grad.addColorStop(0.65, 'rgba(255, 255, 255, 0.18)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

// ========================================================
// 4. CONSTELACIONES DINÁMICAS
// ========================================================

function createDynamicPolyhedron(geometry, colorHex, size, sphereScale = 0.09) {
  const group = new THREE.Group();

  const edges = new THREE.EdgesGeometry(geometry);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: colorHex,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    linewidth: 1.5
  });
  const wireframe = new THREE.LineSegments(edges, lineMaterial);
  group.add(wireframe);

  const vertexPositions = geometry.attributes.position;
  const starGeo = new THREE.SphereGeometry(sphereScale, 10, 10);
  const starMat = new THREE.MeshBasicMaterial({ color: colorHex });

  const uniqueVerts = [];
  const p = new THREE.Vector3();

  for (let i = 0; i < vertexPositions.count; i++) {
    p.fromBufferAttribute(vertexPositions, i);
    const exists = uniqueVerts.some(v => v.distanceTo(p) < 0.01);
    if (!exists) {
      uniqueVerts.push(p.clone());
      const star = new THREE.Mesh(starGeo, starMat);
      star.position.copy(p);
      group.add(star);
    }
  }

  group.scale.set(size, size, size);
  return { group, wireframe, lineMaterial, baseScale: size };
}

function createDynamicConstellations() {
  constellationGroup = new THREE.Group();

  const icosaGeo = new THREE.IcosahedronGeometry(2.3, 0);
  primaryPolyhedron = createDynamicPolyhedron(icosaGeo, 0x82d8ff, 1.4, 0.11);
  primaryPolyhedron.group.position.set(-6, 2, -2);
  constellationGroup.add(primaryPolyhedron.group);

  const dodecaGeo = new THREE.DodecahedronGeometry(2.1, 0);
  secondaryPolyhedron = createDynamicPolyhedron(dodecaGeo, 0xcaa0ff, 1.3, 0.1);
  secondaryPolyhedron.group.position.set(6, -2, -3);
  constellationGroup.add(secondaryPolyhedron.group);

  const crownGroup = new THREE.Group();
  const innerIcosa = new THREE.IcosahedronGeometry(3.0, 1);
  const crownPoly = createDynamicPolyhedron(innerIcosa, 0xf8d77e, 1.05, 0.08);
  crownGroup.add(crownPoly.group);

  const ringGeo1 = new THREE.RingGeometry(3.9, 3.96, 64);
  const ringMat1 = new THREE.MeshBasicMaterial({
    color: 0xf8d77e,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
  });
  const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
  ring1.rotation.x = Math.PI / 2.3;
  crownGroup.add(ring1);

  const ringGeo2 = new THREE.RingGeometry(4.6, 4.65, 64);
  const ring2 = new THREE.Mesh(ringGeo2, ringMat1.clone());
  ring2.rotation.x = -Math.PI / 3.2;
  ring2.rotation.y = Math.PI / 5;
  crownGroup.add(ring2);

  goldenCrownPolyhedron = {
    group: crownGroup,
    ring1: ring1,
    ring2: ring2,
    poly: crownPoly
  };

  crownGroup.position.set(0, 0, 0);
  constellationGroup.add(crownGroup);

  scene.add(constellationGroup);
}

// ========================================================
// 5. CELEBRACIÓN DE GRADUACIÓN
// ========================================================

function launchCelebrationFireworks() {
  if (window.cosmicAudio) {
    window.cosmicAudio.playCelebrationSound();
  }

  if (celebrationParticles) {
    scene.remove(celebrationParticles);
  }

  const count = 800;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = [];

  for (let i = 0; i < count; i++) {
    positions[i * 3] = 0;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = 0;

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const speed = 0.2 + Math.random() * 0.5;

    velocities.push({
      x: speed * Math.sin(phi) * Math.cos(theta),
      y: speed * Math.sin(phi) * Math.sin(theta),
      z: speed * Math.cos(phi),
      life: 1.0,
      decay: 0.007 + Math.random() * 0.009
    });
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 0.95,
    color: 0xffea9f,
    map: createGlowTexture(),
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending
  });

  celebrationParticles = new THREE.Points(geometry, material);
  celebrationParticles.userData = { velocities: velocities };
  scene.add(celebrationParticles);

  const btn = document.getElementById('btn-fireworks');
  if (btn) {
    gsap.fromTo(btn, { scale: 0.92 }, { scale: 1.08, duration: 0.25, yoyo: true, repeat: 1 });
  }
}

// ========================================================
// 6. ANIMACIÓN CONTINUA & RENDER LOOP
// ========================================================

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  // Inercia de cursor
  mouseX += (targetMouseX - mouseX) * 0.045;
  mouseY += (targetMouseY - mouseY) * 0.045;

  // Actualizar Río Cósmico
  if (cosmicRiver) {
    const pos = cosmicRiver.geometry.attributes.position.array;
    const init = cosmicRiver.userData.initialData;

    for (let i = 0; i < init.length; i++) {
      const data = init[i];
      data.angle += delta * data.speed * 0.35;
      const currentRadius = data.radius + Math.sin(time * 0.5 + data.freq) * 1.2;
      pos[i * 3] = Math.cos(data.angle) * currentRadius;
      pos[i * 3 + 1] = data.yBase + Math.sin(data.angle * 2 + time) * 1.5;
      pos[i * 3 + 2] = Math.sin(data.angle) * currentRadius;
    }
    cosmicRiver.geometry.attributes.position.needsUpdate = true;
  }

  if (starField) {
    starField.rotation.y = time * 0.018;
    starField.rotation.x = Math.sin(time * 0.01) * 0.04;
  }

  if (nebulaCloud) {
    nebulaCloud.rotation.y = -time * 0.012;
    nebulaCloud.rotation.z = Math.cos(time * 0.015) * 0.05;
  }

  if (primaryPolyhedron) {
    primaryPolyhedron.group.rotation.x += delta * 0.3;
    primaryPolyhedron.group.rotation.y += delta * 0.4;
    const breath = 1 + Math.sin(time * 1.5) * 0.06;
    primaryPolyhedron.group.scale.set(
      primaryPolyhedron.baseScale * breath,
      primaryPolyhedron.baseScale * breath,
      primaryPolyhedron.baseScale * breath
    );
  }

  if (secondaryPolyhedron) {
    secondaryPolyhedron.group.rotation.y -= delta * 0.35;
    secondaryPolyhedron.group.rotation.z += delta * 0.25;
    const breath = 1 + Math.cos(time * 1.4) * 0.06;
    secondaryPolyhedron.group.scale.set(
      secondaryPolyhedron.baseScale * breath,
      secondaryPolyhedron.baseScale * breath,
      secondaryPolyhedron.baseScale * breath
    );
  }

  if (goldenCrownPolyhedron) {
    goldenCrownPolyhedron.group.rotation.y += delta * 0.22;
    goldenCrownPolyhedron.ring1.rotation.z += delta * 0.35;
    goldenCrownPolyhedron.ring2.rotation.z -= delta * 0.28;
    goldenCrownPolyhedron.group.position.y = Math.sin(time * 1.1) * 0.45;
  }

  if (celebrationParticles) {
    const pos = celebrationParticles.geometry.attributes.position.array;
    const vel = celebrationParticles.userData.velocities;
    let allDead = true;

    for (let i = 0; i < vel.length; i++) {
      if (vel[i].life > 0) {
        allDead = false;
        pos[i * 3] += vel[i].x;
        pos[i * 3 + 1] += vel[i].y;
        pos[i * 3 + 2] += vel[i].z;

        vel[i].x *= 0.985;
        vel[i].y *= 0.985;
        vel[i].z *= 0.985;
        vel[i].life -= vel[i].decay;
      }
    }

    celebrationParticles.geometry.attributes.position.needsUpdate = true;
    celebrationParticles.material.opacity = Math.max(0, vel[0].life);

    if (allDead) {
      scene.remove(celebrationParticles);
      celebrationParticles = null;
    }
  }

  // Movimiento perpetuo de cámara (Lissajous)
  const baseCam = cameraBasePositions[currentChapter];
  const perpetualX = Math.sin(time * 0.45) * 0.9;
  const perpetualY = Math.cos(time * 0.35) * 0.6;
  const perpetualZ = Math.sin(time * 0.25) * 0.5;

  const parallaxX = mouseX * 0.0016;
  const parallaxY = -mouseY * 0.0016;

  camera.position.x += (baseCam.x + perpetualX + parallaxX - camera.position.x) * 0.045;
  camera.position.y += (baseCam.y + perpetualY + parallaxY - camera.position.y) * 0.045;
  camera.position.z += (baseCam.z + perpetualZ - camera.position.z) * 0.045;

  camera.lookAt(baseCam.lookAt.x, baseCam.lookAt.y, baseCam.lookAt.z);

  // Actualizar barra de progreso tipo video en tiempo real
  updateVideoProgressBar();

  renderer.render(scene, camera);
}

// Handlers de Redimensión y Ratón
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(e) {
  targetMouseX = e.clientX - windowHalfX;
  targetMouseY = e.clientY - windowHalfY;
}

function onDocumentTouchMove(e) {
  if (e.touches.length > 0) {
    targetMouseX = (e.touches[0].clientX - windowHalfX) * 1.2;
    targetMouseY = (e.touches[0].clientY - windowHalfY) * 1.2;
  }
}

// Gestos Swipe para móvil y tablet
function onTouchStart(e) {
  if (e.touches.length > 0) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
}

function onTouchEnd(e) {
  if (e.changedTouches.length > 0) {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;

    // Detectar swipe horizontal significativo (más de 50px y predominante sobre el vertical)
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      if (deltaX < 0) {
        // Swipe hacia la izquierda: siguiente capítulo
        goToChapter(currentChapter + 1);
      } else {
        // Swipe hacia la derecha: capítulo anterior
        goToChapter(currentChapter - 1);
      }
    }
  }
}

// ========================================================
// 7. LÓGICA DE AUTO-SCROLL Y AVANCE TIPO VIDEO
// ========================================================

function startChapterAutoPlay(chapterIdx) {
  chapterStartTime = performance.now();
  cancelAnimationFrame(scrollAnimFrame);
  if (autoAdvanceTimeout) clearTimeout(autoAdvanceTimeout);

  const frame = document.getElementById(`scroll-frame-${chapterIdx}`);
  if (!frame) return;

  frame.scrollTop = 0;

  if (!isAutoPlay) return;

  const totalDuration = chapterDurations[chapterIdx] || 11000;
  const initialReadingPause = 1400; // ms antes de iniciar el scroll lento
  const finalReadingPause = 2500;   // ms tras terminar el scroll

  // Iniciar scroll lento tras la pausa inicial de lectura
  const scrollDuration = Math.max(1000, totalDuration - initialReadingPause - finalReadingPause);

  setTimeout(() => {
    if (!isAutoPlay || currentChapter !== chapterIdx) return;

    const maxScroll = frame.scrollHeight - frame.clientHeight;
    if (maxScroll <= 0) return;

    const scrollStart = performance.now();

    function stepScroll(now) {
      if (!isAutoPlay || currentChapter !== chapterIdx) return;

      const elapsed = now - scrollStart;
      const progress = Math.min(1, elapsed / scrollDuration);

      // Easing suave lineal/cuadrático para lectura descansada
      frame.scrollTop = maxScroll * progress;

      if (progress < 1) {
        scrollAnimFrame = requestAnimationFrame(stepScroll);
      }
    }

    scrollAnimFrame = requestAnimationFrame(stepScroll);
  }, initialReadingPause);

  // Programar transición automática al siguiente capítulo
  if (chapterIdx < totalChapters - 1) {
    autoAdvanceTimeout = setTimeout(() => {
      if (isAutoPlay && currentChapter === chapterIdx) {
        goToChapter(chapterIdx + 1);
      }
    }, totalDuration);
  }
}

function updateVideoProgressBar() {
  const currentDuration = chapterDurations[currentChapter] || 11000;
  const elapsed = performance.now() - chapterStartTime;
  const progressPercent = Math.min(100, (elapsed / currentDuration) * 100);

  for (let i = 0; i < totalChapters; i++) {
    const fill = document.getElementById(`seg-${i}`);
    if (!fill) continue;

    if (i < currentChapter) {
      fill.style.width = '100%';
    } else if (i === currentChapter) {
      if (currentChapter === totalChapters - 1 && elapsed >= currentDuration) {
        fill.style.width = '100%';
      } else {
        fill.style.width = isAutoPlay ? `${progressPercent}%` : `${progressPercent}%`;
      }
    } else {
      fill.style.width = '0%';
    }
  }
}

function toggleAutoPlay() {
  isAutoPlay = !isAutoPlay;

  const iconPause = document.getElementById('icon-pause');
  const iconPlay = document.getElementById('icon-play');
  const videoBtn = document.getElementById('video-mode-toggle');
  const videoTip = document.getElementById('video-tip');

  if (isAutoPlay) {
    if (iconPause) iconPause.classList.remove('hidden');
    if (iconPlay) iconPlay.classList.add('hidden');
    if (videoBtn) videoBtn.classList.add('active');
    if (videoTip) videoTip.textContent = 'Auto: Activo';
    startChapterAutoPlay(currentChapter);
  } else {
    if (iconPause) iconPause.classList.add('hidden');
    if (iconPlay) iconPlay.classList.remove('hidden');
    if (videoBtn) videoBtn.classList.remove('active');
    if (videoTip) videoTip.textContent = 'Auto: Pausado';
    cancelAnimationFrame(scrollAnimFrame);
    if (autoAdvanceTimeout) clearTimeout(autoAdvanceTimeout);
  }
}

// ========================================================
// 8. CONTROLADOR DE CAPÍTULOS
// ========================================================

function goToChapter(index) {
  if (index < 0 || index >= totalChapters) return;

  currentChapter = index;

  // 1. Alternar cápsulas activas en DOM
  const capsules = document.querySelectorAll('.liquid-capsule');
  capsules.forEach(c => c.classList.remove('active'));

  const nextCap = document.getElementById(`chapter-${index}`);
  if (nextCap) {
    nextCap.classList.add('active');
  }

  // 2. Actualizar puntos orbitales
  const dots = document.querySelectorAll('.liquid-orbit-nav .orbit-dot');
  dots.forEach(d => d.classList.remove('active'));
  if (dots[index]) {
    dots[index].classList.add('active');
  }

  // 3. Transición de cámara con GSAP
  const base = cameraBasePositions[index];
  gsap.to(camera.position, {
    x: base.x,
    y: base.y,
    z: base.z,
    duration: 1.8,
    ease: "power2.inOut"
  });

  // Si es capítulo de graduación, disparar destellos
  if (index === 3) {
    setTimeout(() => {
      launchCelebrationFireworks();
    }, 600);
  }

  // 4. Iniciar avance y scroll lento del nuevo capítulo
  startChapterAutoPlay(index);
}

// ========================================================
// 9. INICIALIZACIÓN DE INTERFACES Y LISTENERS
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  initCosmicScene();
  animate();
  startChapterAutoPlay(0);

  // Activación de música continua desde el inicio
  function activateMusic() {
    if (window.cosmicAudio) {
      window.cosmicAudio.start();
      updateAudioButtonUI(true);
    }
  }

  // Intento inmediato al cargar
  activateMusic();

  // Desbloqueo universal garantizado en la primera interacción en cualquier parte
  const unlockAudioEvents = ['click', 'touchstart', 'pointerdown', 'keydown', 'scroll'];
  const handleUserGesture = () => {
    activateMusic();
    unlockAudioEvents.forEach(evt => window.removeEventListener(evt, handleUserGesture, true));
  };
  unlockAudioEvents.forEach(evt => window.addEventListener(evt, handleUserGesture, { capture: true, passive: true }));

  // Botón Iniciar Recorrido
  const startBtn = document.getElementById('start-journey-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      activateMusic();
      goToChapter(1);
    });
  }

  // Botón Replay al final
  const replayBtn = document.getElementById('btn-replay');
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      goToChapter(0);
    });
  }

  // Botón Modo Video (Auto-avance)
  const videoToggleBtn = document.getElementById('video-mode-toggle');
  if (videoToggleBtn) {
    videoToggleBtn.addEventListener('click', toggleAutoPlay);
  }

  // Flechas globales laterales (Tablet y PC)
  const prevArrow = document.getElementById('global-prev');
  const nextArrow = document.getElementById('global-next');
  if (prevArrow) {
    prevArrow.addEventListener('click', () => {
      goToChapter(currentChapter - 1);
    });
  }
  if (nextArrow) {
    nextArrow.addEventListener('click', () => {
      goToChapter(currentChapter + 1);
    });
  }

  // Botones de Navegación de Cápsulas (data-target)
  document.querySelectorAll('[data-target]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = parseInt(e.currentTarget.getAttribute('data-target'), 10);
      goToChapter(target);
    });
  });

  // Paginador Orbital de Puntos
  document.querySelectorAll('.liquid-orbit-nav .orbit-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
      goToChapter(idx);
    });
  });

  // Botón de Celebración
  const celebrateBtn = document.getElementById('btn-fireworks');
  if (celebrateBtn) {
    celebrateBtn.addEventListener('click', launchCelebrationFireworks);
  }

  // Audio Toggle
  const audioBtn = document.getElementById('audio-toggle');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      if (window.cosmicAudio) {
        const isPlaying = window.cosmicAudio.toggle();
        updateAudioButtonUI(isPlaying);
      }
    });
  }

  // Pantalla Completa
  const fsBtn = document.getElementById('fullscreen-toggle');
  if (fsBtn) {
    fsBtn.addEventListener('click', toggleFullscreen);
  }

  // Lightbox
  setupLightbox();
});

// UI Helpers
function updateAudioButtonUI(isPlaying) {
  const audioBtn = document.getElementById('audio-toggle');
  if (!audioBtn) return;

  if (isPlaying) {
    audioBtn.classList.add('playing');
  } else {
    audioBtn.classList.remove('playing');
  }
}

function toggleFullscreen() {
  const iconEnter = document.getElementById('fs-icon-enter');
  const iconExit = document.getElementById('fs-icon-exit');

  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      if (iconEnter) iconEnter.classList.add('hidden');
      if (iconExit) iconExit.classList.remove('hidden');
    }).catch(err => console.warn('Fullscreen no disponible', err));
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => {
        if (iconEnter) iconEnter.classList.remove('hidden');
        if (iconExit) iconExit.classList.add('hidden');
      });
    }
  }
}

function setupLightbox() {
  const modal = document.getElementById('lightbox');
  const closeBtn = document.getElementById('lightbox-close');
  const backdrop = modal ? modal.querySelector('.lightbox-blur-bg') : null;

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  }
  if (backdrop) {
    backdrop.addEventListener('click', () => modal.classList.remove('open'));
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      modal.classList.remove('open');
    }
  });
}

function openLightboxFromSrc(src, caption) {
  const modal = document.getElementById('lightbox');
  const targetImg = document.getElementById('lightbox-img');
  const targetCaption = document.getElementById('lightbox-caption');

  if (modal && targetImg) {
    targetImg.src = src;
    if (targetCaption) targetCaption.textContent = caption || '';
    modal.classList.add('open');
  }
}
window.openLightboxFromSrc = openLightboxFromSrc;
