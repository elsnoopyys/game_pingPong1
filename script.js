

// ===================== SETUP =====================
const scene = new THREE.Scene();
 
// gradient sky via canvas texture
function makeSkyTexture() {
  const c = document.createElement('canvas');
  c.width = 2; c.height = 256;
  const ctx = c.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#1a2740');
  grad.addColorStop(0.45, '#0d1424');
  grad.addColorStop(1, '#05070b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.LinearFilter;
  return tex;
}
scene.background = makeSkyTexture();
scene.fog = new THREE.Fog(0x0a0e14, 13, 30);
 
const camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set(0, 5.4, 8.6);
camera.lookAt(0, 0.3, -2);
 
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
 
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
 
// ===================== LIGHTING =====================
scene.add(new THREE.AmbientLight(0x8899bb, 0.55));
 
const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
keyLight.position.set(3, 9, 4);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -8;
keyLight.shadow.camera.right = 8;
keyLight.shadow.camera.top = 8;
keyLight.shadow.camera.bottom = -8;
scene.add(keyLight);
 
const rimLight = new THREE.PointLight(0x4fa8ff, 0.9, 22);
rimLight.position.set(-4.5, 3, -6);
scene.add(rimLight);
 
const rimLight2 = new THREE.PointLight(0xff5468, 0.8, 22);
rimLight2.position.set(4.5, 3, 6);
scene.add(rimLight2);
 
// dramatic overhead spotlight on the table
const spot = new THREE.SpotLight(0xffffff, 1.4, 26, Math.PI/5, 0.4, 1.2);
spot.position.set(0, 8.5, 0);
spot.target.position.set(0, 0, 0);
spot.castShadow = true;
spot.shadow.mapSize.set(1024, 1024);
scene.add(spot);
scene.add(spot.target);
 
// ===================== TABLE =====================
const TABLE_W = 5.2;      // width (x)
const TABLE_L = 10.2;     // length (z)
const TABLE_Y = 0;        // table surface height
 
const tableGeo = new THREE.BoxGeometry(TABLE_W, 0.25, TABLE_L);
const tableMat = new THREE.MeshStandardMaterial({ color: 0x0e7a5a, roughness: 0.22, metalness: 0.25, envMapIntensity: 1.2 });
const table = new THREE.Mesh(tableGeo, tableMat);
table.position.y = TABLE_Y - 0.125;
table.receiveShadow = true;
scene.add(table);
 
// glowing edge trim around the table for a premium look
const trimMat = new THREE.MeshStandardMaterial({ color: 0x0a0e14, roughness: 0.3, metalness: 0.6, emissive: 0x2255ff, emissiveIntensity: 0.15 });
const trim = new THREE.Mesh(new THREE.BoxGeometry(TABLE_W + 0.14, 0.06, TABLE_L + 0.14), trimMat);
trim.position.y = TABLE_Y - 0.02;
scene.add(trim);
 
// soft glow ring on the floor beneath the table
const glowRing = new THREE.Mesh(
  new THREE.RingGeometry(3.2, 6.2, 48),
  new THREE.MeshBasicMaterial({ color: 0x2a5cff, transparent: true, opacity: 0.08, side: THREE.DoubleSide })
);
glowRing.rotation.x = -Math.PI/2;
glowRing.position.y = -2.39;
scene.add(glowRing);
 
// table lines
function addLine(w, h, x, z, rotY=0) {
  const g = new THREE.PlaneGeometry(w, h);
  const m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
  const line = new THREE.Mesh(g, m);
  line.rotation.x = -Math.PI/2;
  line.rotation.z = rotY;
  line.position.set(x, TABLE_Y + 0.001, z);
  scene.add(line);
}
addLine(TABLE_W - 0.1, 0.06, 0, TABLE_L/2 - 0.05);   // far edge
addLine(TABLE_W - 0.1, 0.06, 0, -TABLE_L/2 + 0.05);  // near edge
addLine(0.06, TABLE_L - 0.1, TABLE_W/2 - 0.05, 0);   // right edge
addLine(0.06, TABLE_L - 0.1, -TABLE_W/2 + 0.05, 0);  // left edge
addLine(0.05, TABLE_L - 0.1, 0, 0);                  // center line
 
// net
const netGroup = new THREE.Group();
const netMat = new THREE.MeshStandardMaterial({ color: 0x1c2433, transparent: true, opacity: 0.75, side: THREE.DoubleSide });
const netMesh = new THREE.Mesh(new THREE.PlaneGeometry(TABLE_W + 0.1, 0.5), netMat);
netMesh.position.set(0, TABLE_Y + 0.25, 0);
netGroup.add(netMesh);
const netPostGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.55, 8);
const netPostMat = new THREE.MeshStandardMaterial({ color: 0x333f54 });
[-TABLE_W/2 - 0.05, TABLE_W/2 + 0.05].forEach(px => {
  const post = new THREE.Mesh(netPostGeo, netPostMat);
  post.position.set(px, TABLE_Y + 0.27, 0);
  netGroup.add(post);
});
scene.add(netGroup);
 
// legs
const legMat = new THREE.MeshStandardMaterial({ color: 0x222a38 });
[[-TABLE_W/2+0.2, -TABLE_L/2+0.4], [TABLE_W/2-0.2, -TABLE_L/2+0.4], [-TABLE_W/2+0.2, TABLE_L/2-0.4], [TABLE_W/2-0.2, TABLE_L/2-0.4]].forEach(([x,z]) => {
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.2, 0.15), legMat);
  leg.position.set(x, TABLE_Y - 1.25, z);
  leg.castShadow = true;
  scene.add(leg);
});
 
// floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshStandardMaterial({ color: 0x0d1420, roughness: 0.9 })
);
floor.rotation.x = -Math.PI/2;
floor.position.y = -2.4;
floor.receiveShadow = true;
scene.add(floor);
 
// ===================== PADDLES =====================
function makePaddle(color) {
  const group = new THREE.Group();
  const face = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.08, 24),
    new THREE.MeshStandardMaterial({ color, roughness: 0.4 })
  );
  face.rotation.x = Math.PI/2;
  face.castShadow = true;
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.035, 8, 24),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
  );
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.08, 0.5, 10),
    new THREE.MeshStandardMaterial({ color: 0x3a2a1a })
  );
  handle.position.y = -0.55;
  group.add(face, rim, handle);
  return group;
}
 
const PADDLE_Z_PLAYER = TABLE_L/2 - 0.9;
const PADDLE_Z_AI = -TABLE_L/2 + 0.9;
const PADDLE_Y = TABLE_Y + 0.5;
const PADDLE_X_LIMIT = TABLE_W/2 - 0.2;
 
const playerPaddle = makePaddle(0xff5468);
playerPaddle.position.set(0, PADDLE_Y, PADDLE_Z_PLAYER);
scene.add(playerPaddle);
 
const aiPaddle = makePaddle(0x4fa8ff);
aiPaddle.position.set(0, PADDLE_Y, PADDLE_Z_AI);
scene.add(aiPaddle);
 
// player paddle allowed z-range (forward/back)
const PLAYER_Z_MIN = TABLE_L/2 - 2.4;
const PLAYER_Z_MAX = TABLE_L/2 - 0.3;
 
// ===================== BALL =====================
const BALL_R = 0.14;
const ball = new THREE.Mesh(
  new THREE.SphereGeometry(BALL_R, 24, 24),
  new THREE.MeshStandardMaterial({ color: 0xfff6e0, roughness: 0.15, metalness: 0.05, emissive: 0xffb347, emissiveIntensity: 0.35 })
);
ball.castShadow = true;
scene.add(ball);
 
// small point light glued to the ball so it feels "hot" when fast
const ballGlow = new THREE.PointLight(0xffb347, 0.8, 3.5);
ball.add(ballGlow);
 
// ball shadow blob (fake, cheap contact shadow)
const shadowBlob = new THREE.Mesh(
  new THREE.CircleGeometry(BALL_R, 16),
  new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 })
);
shadowBlob.rotation.x = -Math.PI/2;
scene.add(shadowBlob);
 
// ===== motion trail =====
const TRAIL_COUNT = 10;
const trailMeshes = [];
for (let i = 0; i < TRAIL_COUNT; i++) {
  const t = new THREE.Mesh(
    new THREE.SphereGeometry(BALL_R * (1 - i/TRAIL_COUNT * 0.7), 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.28 * (1 - i/TRAIL_COUNT) })
  );
  t.visible = false;
  scene.add(t);
  trailMeshes.push(t);
}
const trailHistory = [];
 
let ballPos, ballVel;
let servingTo = 'ai'; // which side the serve goes toward first
 
function resetBall(serverSide) {
  // serverSide = 'player' or 'ai' — this side throws/serves the ball,
  // starting from their own end of the table with a real thrown arc
  const serverIsPlayer = serverSide === 'player';
  const startZ = serverIsPlayer ? (PADDLE_Z_PLAYER - 0.8) : (PADDLE_Z_AI + 0.8);
  const dirZ = serverIsPlayer ? -1 : 1;
  ballPos = new THREE.Vector3((Math.random()-0.5)*1.0, TABLE_Y + 0.65, startZ);
  ballVel = new THREE.Vector3((Math.random()-0.5)*1.0, 3.0, dirZ * 5.2);
  rallyCount = 0;
  updateRallyHud();
  trailHistory.length = 0;
}
 
const GRAVITY = -10.5;
let lastHitBy = null; // 'player' or 'ai'
let rallyCount = 0;
const MAX_SPEED = 17;
 
const rallyValEl = document.getElementById('rallyVal');
const speedBarEl = document.getElementById('speedBar');
function updateRallyHud() {
  rallyValEl.textContent = rallyCount;
  const speedFrac = THREE.MathUtils.clamp(ballVel ? ballVel.length() / MAX_SPEED : 0.2, 0.08, 1);
  speedBarEl.style.width = (speedFrac * 100) + '%';
}
 
resetBall('player');
 
// ===================== INPUT =====================
const keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
 
function handlePlayerInput(dt) {
  const speed = 5.2;
  if (keys['arrowleft'] || keys['a']) playerPaddle.position.x -= speed * dt;
  if (keys['arrowright'] || keys['d']) playerPaddle.position.x += speed * dt;
  if (keys['arrowup'] || keys['w']) playerPaddle.position.z -= speed * dt;
  if (keys['arrowdown'] || keys['s']) playerPaddle.position.z += speed * dt;
  playerPaddle.position.x = THREE.MathUtils.clamp(playerPaddle.position.x, -PADDLE_X_LIMIT, PADDLE_X_LIMIT);
  playerPaddle.position.z = THREE.MathUtils.clamp(playerPaddle.position.z, PLAYER_Z_MIN, PLAYER_Z_MAX);
}
 
// ===================== AI =====================
let aiTargetX = 0;
let aiUpdateTimer = 0;
function updateAI(dt) {
  // only recompute the target occasionally (not every frame) so the paddle
  // glides smoothly instead of trembling toward a constantly-shifting point
  aiUpdateTimer -= dt;
  if (ballVel.z < 0 && aiUpdateTimer <= 0) {
    aiUpdateTimer = 0.18;
    // predict roughly where the ball will be when it reaches the AI's line
    const timeToReach = Math.max((aiPaddle.position.z - ballPos.z) / ballVel.z, 0);
    const predictedX = ballPos.x + ballVel.x * timeToReach;
    aiTargetX = THREE.MathUtils.clamp(predictedX + (Math.random()-0.5)*0.25, -PADDLE_X_LIMIT, PADDLE_X_LIMIT);
  }
  // smooth, non-jittery glide toward the target
  aiPaddle.position.x = THREE.MathUtils.lerp(aiPaddle.position.x, aiTargetX, 1 - Math.pow(0.0025, dt));
  aiPaddle.position.x = THREE.MathUtils.clamp(aiPaddle.position.x, -PADDLE_X_LIMIT, PADDLE_X_LIMIT);
}
 
// ===================== SCORE =====================
let youScore = 0, aiScore = 0;
const youScoreEl = document.getElementById('youScore');
const aiScoreEl = document.getElementById('aiScore');
const banner = document.getElementById('banner');
 
function showBanner(text, color) {
  banner.textContent = text;
  banner.style.color = color;
  banner.classList.add('show');
  setTimeout(() => banner.classList.remove('show'), 900);
}
 
function scorePoint(who) {
  if (who === 'player') { youScore++; youScoreEl.textContent = youScore; showBanner('POIN!', '#ff5468'); }
  else { aiScore++; aiScoreEl.textContent = aiScore; showBanner('CPU POIN', '#4fa8ff'); }
 
  if (youScore >= 7 || aiScore >= 7) {
    const winner = youScore >= 7 ? 'KAMU MENANG! 🏓' : 'CPU MENANG';
    setTimeout(() => {
      showBanner(winner, youScore >= 7 ? '#5dffa0' : '#4fa8ff');
    }, 950);
    youScore = 0; aiScore = 0;
    youScoreEl.textContent = 0; aiScoreEl.textContent = 0;
  }
 
  setTimeout(() => resetBall(who), 700);
}
 
// ===================== PHYSICS =====================
let netClipTimer = 0;
 
function updateBall(dt) {
  ballVel.y += GRAVITY * dt;
 
  // never let the ball crawl forward slowly like it's "walking" - keep a
  // strong minimum throw speed at all times, EXCEPT for a brief moment
  // right after clipping the net (otherwise the min-speed rule fights the
  // net's slow-down and the ball ends up flinging back and forth forever
  // right at the net instead of actually crossing it)
  const MIN_Z_SPEED = 4.6;
  if (netClipTimer > 0) {
    netClipTimer -= dt;
  } else if (Math.abs(ballVel.z) < MIN_Z_SPEED) {
    ballVel.z = (ballVel.z >= 0 ? 1 : -1) * MIN_Z_SPEED;
  }
 
  ballPos.addScaledVector(ballVel, dt);
 
  // side wall bounce (x)
  if (ballPos.x > TABLE_W/2 - BALL_R) { ballPos.x = TABLE_W/2 - BALL_R; ballVel.x *= -0.85; }
  if (ballPos.x < -TABLE_W/2 + BALL_R) { ballPos.x = -TABLE_W/2 + BALL_R; ballVel.x *= -0.85; }
 
  const onTableXZ = Math.abs(ballPos.x) < TABLE_W/2 && Math.abs(ballPos.z) < TABLE_L/2;
 
  // table bounce — kept lively so the ball keeps carrying speed and
  // "jumps" far across the table instead of dying out
  if (ballPos.y - BALL_R <= TABLE_Y && onTableXZ && ballVel.y < 0) {
    ballPos.y = TABLE_Y + BALL_R;
    ballVel.y *= -0.86;
    if (Math.abs(ballVel.y) < 1.1) ballVel.y = 1.1;
    if (netClipTimer <= 0) {
      ballVel.z *= 1.02;
      ballVel.z = THREE.MathUtils.clamp(ballVel.z, -MAX_SPEED, MAX_SPEED);
    }
  }
 
  // net collision — only blocks shots that are genuinely too low to clear
  // the net's top edge. A clipped shot just loses most of its forward
  // speed and drops (like a real net-cord fault) instead of bouncing back
  // and forth — that "instead" is exactly what caused the ball to appear
  // stuck smashing right behind the net.
  const NET_TOP = TABLE_Y + 0.42;
  if (Math.abs(ballPos.z) < 0.15 && ballPos.y < NET_TOP && netClipTimer <= 0) {
    ballVel.z *= 0.12;
    ballVel.y = Math.max(ballVel.y, 0.4);
    netClipTimer = 0.45;
  }
 
  // paddle collisions
  checkPaddleHit(playerPaddle, PADDLE_Z_PLAYER, 'player', 1);
  checkPaddleHit(aiPaddle, PADDLE_Z_AI, 'ai', -1);
 
  // out of bounds -> scoring
  if (ballPos.z > TABLE_L/2 + 1.2) {
    scorePoint('ai'); // player missed
  } else if (ballPos.z < -TABLE_L/2 - 1.2) {
    scorePoint('player'); // ai missed
  } else if (ballPos.y < -2.2) {
    // fell off somewhere odd, safety reset
    scorePoint(lastHitBy === 'player' ? 'player' : 'ai');
  }
 
  ball.position.copy(ballPos);
  shadowBlob.position.set(ballPos.x, TABLE_Y + 0.002, ballPos.z);
  const shrink = THREE.MathUtils.clamp(1 - (ballPos.y - TABLE_Y) * 0.25, 0.25, 1);
  shadowBlob.scale.set(shrink, shrink, shrink);
 
  // update speed bar continuously
  const speedFrac = THREE.MathUtils.clamp(ballVel.length() / MAX_SPEED, 0.08, 1);
  speedBarEl.style.width = (speedFrac * 100) + '%';
  ballGlow.intensity = 0.5 + speedFrac * 1.6;
 
  // record trail history
  trailHistory.unshift(ballPos.clone());
  if (trailHistory.length > TRAIL_COUNT) trailHistory.pop();
  for (let i = 0; i < trailMeshes.length; i++) {
    if (trailHistory[i]) {
      trailMeshes[i].visible = true;
      trailMeshes[i].position.copy(trailHistory[i]);
    } else {
      trailMeshes[i].visible = false;
    }
  }
}
 
function checkPaddleHit(paddle, paddleZ, who, forwardDir) {
  const dz = ballPos.z - paddle.position.z;
  const approaching = who === 'player' ? ballVel.z > 0 : ballVel.z < 0;
  if (!approaching) return;
  if (Math.abs(dz) > 0.35) return;
 
  const dx = ballPos.x - paddle.position.x;
  const dy = ballPos.y - PADDLE_Y;
  if (Math.abs(dx) < 0.48 && Math.abs(dy) < 0.55) {
    rallyCount++;
    // ball gets faster and faster the longer the rally goes, up to a cap
    const speedUp = 1.09 + Math.min(rallyCount, 12) * 0.012;
    ballVel.z = -forwardDir * Math.abs(ballVel.z) * speedUp - forwardDir * 0.45;
    ballVel.z = THREE.MathUtils.clamp(ballVel.z, -MAX_SPEED, MAX_SPEED);
    ballVel.x += dx * 2.6;
    ballVel.y = Math.abs(ballVel.y) * 0.6 + 2.1 + Math.random()*0.9;
    lastHitBy = who;
    updateRallyHud();
    triggerShake(0.06);
 
    // little paddle "hit" pulse
    paddle.scale.set(1.18, 1.18, 1.18);
    setTimeout(() => paddle.scale.set(1,1,1), 90);
  }
}
 
// ===== screen shake =====
let shakeTime = 0, shakeStrength = 0;
function triggerShake(strength) {
  shakeTime = 0.18;
  shakeStrength = strength;
}
 
// ===================== MAIN LOOP =====================
let lastTime = performance.now();
let running = false;
const BASE_CAM_POS = new THREE.Vector3(0, 5.4, 8.6);
 
function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;
 
  if (running) {
    handlePlayerInput(dt);
    updateAI(dt);
    updateBall(dt);
 
    // subtle paddle tilt for visual life
    playerPaddle.rotation.x = THREE.MathUtils.lerp(playerPaddle.rotation.x, (ballVel.z > 0 ? 0.15 : 0), 0.1);
    aiPaddle.rotation.x = THREE.MathUtils.lerp(aiPaddle.rotation.x, (ballVel.z < 0 ? -0.15 : 0), 0.1);
 
    // camera shake on hits, plus a very subtle idle sway for a "live" feel
    let camX = BASE_CAM_POS.x, camY = BASE_CAM_POS.y, camZ = BASE_CAM_POS.z;
    if (shakeTime > 0) {
      shakeTime -= dt;
      camX += (Math.random() - 0.5) * shakeStrength;
      camY += (Math.random() - 0.5) * shakeStrength;
    }
    camX += Math.sin(now * 0.0004) * 0.05;
    camera.position.set(camX, camY, camZ);
    camera.lookAt(0, 0.3, -2);
  }
 
  renderer.render(scene, camera);
}
animate();
 
// ===================== START SCREEN =====================
document.getElementById('startBtn').addEventListener('click', () => {
  document.getElementById('startScreen').style.display = 'none';
  running = true;
  lastTime = performance.now();
});
 
