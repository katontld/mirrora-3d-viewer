/**
 * MirrOra 3D Interactive Web Viewer
 * Loaded with user's CAD Model: 3D_PCB1_autoroute_2026-10-15.obj (.mtl)
 * Calibrated specifically to match EasyEDA Pro lighting and material fidelity.
 */

(function () {
  'use strict';

  // --- DOM Elements ---
  const threeCanvas = document.getElementById('threeCanvas');
  const splineViewer = document.getElementById('viewer');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const loaderProgress = document.getElementById('loaderProgress');
  const loadingTitle = document.getElementById('loadingTitle');
  const loadingSubtext = document.getElementById('loadingSubtext');

  // HUD Elements
  const stageStatusPill = document.getElementById('stageStatusPill');
  const stageStatusText = document.getElementById('stageStatusText');
  const turntableBadge = document.getElementById('turntableBadge');
  const turntableBadgeText = document.getElementById('turntableBadgeText');

  // Controls Panel
  const btnPresetIso = document.getElementById('btnPresetIso');
  const btnPresetPort = document.getElementById('btnPresetPort');
  const btnResetView = document.getElementById('btnResetView');
  const btnToggleRotate = document.getElementById('btnToggleRotate');
  const rotateIcon = document.getElementById('rotateIcon');
  const rotateText = document.getElementById('rotateText');
  const btnRotateSpeed = document.getElementById('btnRotateSpeed');
  const rotateSpeedText = document.getElementById('rotateSpeedText');
  const btnToggleTour = document.getElementById('btnToggleTour');
  const tourText = document.getElementById('tourText');
  const btnToggleFullscreen = document.getElementById('btnToggleFullscreen');
  const fullscreenIconEnter = document.getElementById('fullscreenIconEnter');
  const fullscreenIconExit = document.getElementById('fullscreenIconExit');
  const fullscreenText = document.getElementById('fullscreenText');

  // Recording & Video Capture Elements
  const btnStartRecord = document.getElementById('btnStartRecord');
  const btnStopRecord = document.getElementById('btnStopRecord');
  const recordingHud = document.getElementById('recordingHud');
  const recTimer = document.getElementById('recTimer');
  const toastNotification = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMsg');

  // Top Right Actions & Background Controller
  const btnToggleBg = document.getElementById('btnToggleBg');
  const bgIcon = document.getElementById('bgIcon');
  const bgLabel = document.getElementById('bgLabel');
  const bgPickerDropdown = document.getElementById('bgPickerDropdown');
  const btnCloseBgPicker = document.getElementById('btnCloseBgPicker');
  const bgCustomColorInput = document.getElementById('bgCustomColorInput');
  const customColorDisc = document.getElementById('customColorDisc');
  const bgHexInput = document.getElementById('bgHexInput');
  const btnEyeDropper = document.getElementById('btnEyeDropper');
  const checkShowGrid = document.getElementById('checkShowGrid');
  const btnLoadModel = document.getElementById('btnLoadModel');
  const btnShortcuts = document.getElementById('btnShortcuts');
  const btnToggleEngine = document.getElementById('btnToggleEngine');
  const engineIcon = document.getElementById('engineIcon');
  const engineLabel = document.getElementById('engineLabel');
  const btnZenMode = document.getElementById('btnZenMode');
  const btnRestoreHud = document.getElementById('btnRestoreHud');
  const stageContainer = document.getElementById('stageContainer');

  // Inspector Card
  const inspectorCard = document.getElementById('inspectorCard');
  const btnToggleInspector = document.getElementById('btnToggleInspector');
  const inspectorTitle = document.getElementById('inspectorTitle');
  const specSubstrate = document.getElementById('specSubstrate');
  const specSoc = document.getElementById('specSoc');
  const specPower = document.getElementById('specPower');
  const specAngle = document.getElementById('specAngle');

  // Modals
  const loadModal = document.getElementById('loadModal');
  const btnCloseLoadModal = document.getElementById('btnCloseLoadModal');
  const inputSplineUrl = document.getElementById('inputSplineUrl');
  const btnApplySplineUrl = document.getElementById('btnApplySplineUrl');
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const btnReloadUserPcb = document.getElementById('btnReloadUserPcb');
  const loadModalStatus = document.getElementById('loadModalStatus');
  const shortcutsModal = document.getElementById('shortcutsModal');
  const btnCloseShortcuts = document.getElementById('btnCloseShortcuts');

  // Modal Tabs
  const tabBtnActiveModel = document.getElementById('tabBtnActiveModel');
  const tabBtnUrl = document.getElementById('tabBtnUrl');
  const tabBtnFile = document.getElementById('tabBtnFile');
  const tabContentActive = document.getElementById('tabContentActive');
  const tabContentUrl = document.getElementById('tabContentUrl');
  const tabContentFile = document.getElementById('tabContentFile');

  // Fallback Video Elements
  const fallbackContainer = document.getElementById('fallbackContainer');
  const fallbackVideo = document.getElementById('fallbackVideo');
  const fallbackTouchSurface = document.getElementById('fallbackTouchSurface');

  // --- State Variables ---
  let activeEngine = 'three'; // 'three', 'spline', 'video'
  let isAutoRotate = true;
  let isUserInteracting = false;
  let userInteractTimeout = null;
  let activePreset = 'iso';
  let tweenAnimationId = null;

  // Recording State
  let mediaRecorder = null;
  let recordedChunks = [];
  let recordTimerInterval = null;
  let recordSeconds = 0;
  let isRecording = false;
  let toastTimeout = null;

  // Three.js State
  let threeScene, threeCamera, threeRenderer, threeControls;
  let userPcbModelContainer = null;
  let gridHelper = null;

  // Rotation Speed Presets
  const ROTATION_SPEEDS = [
    { label: '0.5x', speed: 0.8 },
    { label: '1.0x', speed: 1.6 },
    { label: '2.0x (Cepat)', speed: 3.2 },
    { label: '3.5x (Super)', speed: 5.6 },
    { label: '5.0x (Turbo)', speed: 8.0 }
  ];
  let currentSpeedIndex = 4; // Default 5.0x (Turbo - 8.0 speed)

  // Background Modes
  const BG_MODES = [
    { id: 'dark', label: 'Dark Studio', icon: '🌑', color: 0x05070f, isTransparent: false, grid: true },
    { id: 'transparent', label: 'Transparan', icon: '🏁', color: null, isTransparent: true, grid: false },
    { id: 'green', label: 'Green Screen', icon: '🟢', color: 0x00ff00, isTransparent: false, grid: false },
    { id: 'white', label: 'Putih Solid (Canva)', icon: '⚪', color: 0xffffff, isTransparent: false, grid: false },
    { id: 'custom', label: 'Warna Bebas...', icon: '🎯', color: null, isTransparent: false, grid: false }
  ];
  let currentBgIndex = 0; // Default: Dark Studio

  // Auto-Tour State (Cinematic Canva Presentation Loop: Iso 360° ➔ Port 360° ➔ Loop)
  let isAutoTour = true;
  let tourStage = 'iso'; // 'iso' -> 'port' -> 'iso' ...
  let tourAccumulatedRad = 0;
  let lastAzimuthRad = null;
  let isTourTransitioning = false;

  // Smart Auto-Hide HUD State (Default hidden for clean presentation)
  let hudIdleTimeout = null;
  let isHoveringHud = false;
  let showHud = null;
  let hideHud = null;
  let wakeHud = null;
  let isReadyForHoverWake = false;

  // Camera Presets (Calibrated for 150mm x 60mm PCB)
  const CAM_PRESETS = {
    iso: {
      pos: { x: 115, y: 95, z: 115 },
      target: { x: 0, y: 0, z: 0 }
    },
    port: {
      pos: { x: -70, y: 32, z: 35 },
      target: { x: -42, y: 0, z: 0 }
    }
  };

  // Hardware Specs
  const angleSpecs = {
    iso: {
      title: 'MirrOra PCB Module (EasyEDA Pro)',
      substrate: '3D_PCB1_autoroute_2026-10-15.obj',
      soc: '149.5 mm × 59.7 mm (T: 13.1 mm)',
      power: 'EasyEDA Pro (Calibrated Solder Mask)',
      angle: 'Isometric 45° (Turntable Presentation)'
    },
    port: {
      title: 'Connectors & Peripheral Bus Focus',
      substrate: 'Edge Plated Shield Grounding & TVS ESD',
      soc: 'I/O Pin Headers & Communication Bus',
      power: 'USB-C Receptacle & DC 12V Barrel Jack',
      angle: 'Port Focus (Close-up Connector Inspection)'
    }
  };

  // ==========================================================================
  // Application Entry Point
  // ==========================================================================

  function init() {
    setupEventListeners();
    setupModals();
    setupFallbackVideoScrubbing();
    setupInspector();
    setupBackgroundController();
    setupSmartHudAutoHide();

    // Check if user specifically requested Spline URL
    const savedSplineUrl = localStorage.getItem('mirrora_spline_url');
    if (savedSplineUrl && savedSplineUrl.trim()) {
      inputSplineUrl.value = savedSplineUrl;
      initSpline(savedSplineUrl.trim());
    } else {
      // Default: Load user's actual EasyEDA 3D PCB OBJ Model
      initThreeJS();
      loadUserEasyEdaModel();
    }

    if (window.location.hash === '#load' || window.location.hash === '#open-modal') {
      openLoadModal();
    }
  }

  function dismissLoader() {
    loadingOverlay.classList.add('fade-out');
    loadingOverlay.style.pointerEvents = 'none';
    setTimeout(() => {
      loadingOverlay.style.display = 'none';
    }, 350);
  }

  // ==========================================================================
  // Three.js Engine & Scene Setup
  // ==========================================================================

  function initThreeJS() {
    if (threeRenderer) {
      threeCanvas.style.display = 'block';
      splineViewer.style.display = 'none';
      fallbackContainer.style.display = 'none';
      activeEngine = 'three';
      updateStageStatus('STAGE LIVE 3D');
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene with dark slate/black background (matching EasyEDA)
    threeScene = new THREE.Scene();
    threeScene.background = new THREE.Color(0x05070f);

    // Subtle dark grid
    gridHelper = new THREE.GridHelper(350, 35, 0x182030, 0x0a0f18);
    gridHelper.position.y = -18;
    threeScene.add(gridHelper);

    // Camera
    threeCamera = new THREE.PerspectiveCamera(38, width / height, 1, 2500);
    threeCamera.position.set(CAM_PRESETS.iso.pos.x, CAM_PRESETS.iso.pos.y, CAM_PRESETS.iso.pos.z);

    // Renderer calibrated to standard sRGB color gamut with drawing buffer preserved for video capture
    threeRenderer = new THREE.WebGLRenderer({
      canvas: threeCanvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    threeRenderer.setSize(width, height);
    threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // OrbitControls
    threeControls = new THREE.OrbitControls(threeCamera, threeRenderer.domElement);
    threeControls.enableDamping = true;
    threeControls.dampingFactor = 0.05;
    threeControls.maxDistance = 550;
    threeControls.minDistance = 20;
    threeControls.autoRotate = isAutoRotate;
    threeControls.autoRotateSpeed = ROTATION_SPEEDS[currentSpeedIndex].speed;
    threeControls.target.set(0, 0, 0);

    if (currentBgIndex !== 0) {
      applyBgMode(currentBgIndex);
    }

    // Auto-rotate keeps spinning smoothly without freeze during zoom in / zoom out

    // EasyEDA Neutral Studio Lights (No washed-out colored tint)
    setupThreeLights();

    // Container for User PCB model
    userPcbModelContainer = new THREE.Group();
    threeScene.add(userPcbModelContainer);

    // Start render loop
    animateThree();

    window.addEventListener('resize', onWindowResize);
    activeEngine = 'three';
    threeCanvas.style.display = 'block';
    splineViewer.style.display = 'none';
    fallbackContainer.style.display = 'none';
    updateStageStatus('STAGE LIVE 3D');
  }

  function setupThreeLights() {
    // Pure neutral ambient light calibrated for dark solder mask contrast
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.44);
    threeScene.add(ambientLight);

    // Main key light with neutral white specular definition
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
    keyLight.position.set(100, 180, 100);
    threeScene.add(keyLight);

    // Fill light from back-left
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.55);
    fillLight.position.set(-100, 100, -80);
    threeScene.add(fillLight);

    // Bottom fill for board underside visibility
    const bottomLight = new THREE.DirectionalLight(0xffffff, 0.25);
    bottomLight.position.set(0, -100, 50);
    threeScene.add(bottomLight);
  }

  // ==========================================================================
  // Loading the User's EasyEDA Pro OBJ + MTL Model
  // ==========================================================================

  function loadUserEasyEdaModel() {
    loadingOverlay.style.display = 'flex';
    loadingOverlay.classList.remove('fade-out');
    loadingTitle.textContent = 'Memuat Model 3D PCB MirrOra...';
    loadingSubtext.textContent = '3D_PCB1_autoroute_2026-10-15.obj';

    const mtlPath = './assets/model/3D_PCB1_autoroute_2026-10-15.mtl';
    const objPath = './assets/model/3D_PCB1_autoroute_2026-10-15.obj';

    const mtlLoader = new THREE.MTLLoader();
    mtlLoader.load(
      mtlPath,
      (materials) => {
        materials.preload();
        console.log('EasyEDA MTL materials loaded successfully.');

        // Calibrate materials to match EasyEDA Pro saturation & contrast exactly
        // 1. Solder Mask Green (Deep, saturated forest green matching EasyEDA)
        if (materials.materials['mtl7']) {
          materials.materials['mtl7'].color.setHex(0x135427); // Rich dark PCB green
        }
        if (materials.materials['mtl33']) {
          materials.materials['mtl33'].color.setHex(0x155d2b); // PCB top copper/mask
        }
        if (materials.materials['mtl35']) {
          materials.materials['mtl35'].color.setHex(0x115024); // PCB bottom copper/mask
        }

        // 2. Module PCB (Vivid saturated grass green matching EasyEDA)
        if (materials.materials['mtl3']) {
          materials.materials['mtl3'].color.setHex(0x009e25); // Bright green module
        }

        // 3. Black IC Packages & Chip bodies (Deep matte charcoal)
        if (materials.materials['mtl5']) {
          materials.materials['mtl5'].color.setHex(0x1e1e1e);
        }
        if (materials.materials['mtl1']) {
          materials.materials['mtl1'].color.setHex(0x282828);
        }
        if (materials.materials['mtl16']) {
          materials.materials['mtl16'].color.setHex(0x222222);
        }
        if (materials.materials['mtl17']) {
          materials.materials['mtl17'].color.setHex(0x353535);
        }
        if (materials.materials['mtl22']) {
          materials.materials['mtl22'].color.setHex(0x1c1c1c);
        }
        if (materials.materials['mtl30']) {
          materials.materials['mtl30'].color.setHex(0x282828);
        }

        // 4. Gold screw rings, pads & ENIG contacts (Rich metallic gold)
        if (materials.materials['mtl11']) {
          materials.materials['mtl11'].color.setHex(0xd4af37);
        }
        if (materials.materials['mtl2']) {
          materials.materials['mtl2'].color.setHex(0xe2be44);
        }
        if (materials.materials['mtl20']) {
          materials.materials['mtl20'].color.setHex(0xe2be44);
        }
        if (materials.materials['mtl23']) {
          materials.materials['mtl23'].color.setHex(0xdfba40);
        }

        // 5. Copper flex cable on screen edge (Warm rich copper amber)
        if (materials.materials['mtl26']) {
          materials.materials['mtl26'].color.setHex(0xc05818);
        }
        if (materials.materials['mtl27']) {
          materials.materials['mtl27'].color.setHex(0xaa4e16);
        }
        if (materials.materials['mtl14']) {
          materials.materials['mtl14'].color.setHex(0x9a4814);
        }

        // 6. Metals & shields (Clean specular silver)
        if (materials.materials['mtl4']) {
          materials.materials['mtl4'].color.setHex(0xbcc2cb);
        }
        if (materials.materials['mtl12']) {
          materials.materials['mtl12'].color.setHex(0xd6dbe2);
        }
        if (materials.materials['mtl15']) {
          materials.materials['mtl15'].color.setHex(0xa4abb5);
        }

        // 7. Crisp white silkscreen text & references
        if (materials.materials['mtl6']) {
          materials.materials['mtl6'].color.setHex(0xffffff);
        }
        if (materials.materials['mtl13']) {
          materials.materials['mtl13'].color.setHex(0xffffff);
        }
        if (materials.materials['mtl31']) {
          materials.materials['mtl31'].color.setHex(0xffffff);
        }
        if (materials.materials['mtl32']) {
          materials.materials['mtl32'].color.setHex(0xffffff);
        }

        // 8. Screen module
        if (materials.materials['mtl8']) {
          materials.materials['mtl8'].color.setHex(0xd2d9e2);
        }

        // Configure double side and specular shine
        for (const mat of Object.values(materials.materials)) {
          mat.side = THREE.DoubleSide;
          mat.shininess = 25;
        }

        const objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);

        objLoader.load(
          objPath,
          (object) => {
            console.log('EasyEDA OBJ model loaded successfully.');
            displayLoadedPcbObject(object);
          },
          (xhr) => {
            if (xhr.lengthComputable) {
              const percent = Math.round((xhr.loaded / xhr.total) * 100);
              loaderProgress.style.width = `${percent}%`;
              loadingSubtext.textContent = `Mengunduh mesh 3D: ${percent}%`;
            }
          },
          (err) => {
            console.error('Error loading OBJ with materials:', err);
            loadObjWithoutMtl(objPath);
          }
        );
      },
      (xhr) => {
        // MTL progress
      },
      (err) => {
        console.warn('Could not load MTL, loading OBJ directly:', err);
        loadObjWithoutMtl(objPath);
      }
    );
  }

  function loadObjWithoutMtl(objPath) {
    const objLoader = new THREE.OBJLoader();
    objLoader.load(
      objPath,
      (object) => {
        const defaultMat = new THREE.MeshStandardMaterial({
          color: 0x135427,
          roughness: 0.4,
          metalness: 0.2,
          side: THREE.DoubleSide
        });
        object.traverse((child) => {
          if (child.isMesh) {
            child.material = defaultMat;
          }
        });
        displayLoadedPcbObject(object);
      },
      null,
      (err) => {
        console.error('Failed to load OBJ file:', err);
        alert('Gagal memuat file 3D_PCB1_autoroute_2026-10-15.obj');
        dismissLoader();
      }
    );
  }

  function displayLoadedPcbObject(object) {
    // Clear previous children
    while (userPcbModelContainer.children.length > 0) {
      userPcbModelContainer.remove(userPcbModelContainer.children[0]);
    }

    // EasyEDA OBJ coordinate system: Z is height/thickness, X & Y are the board plane.
    // Rotate -90 degrees on X so Z-up becomes Y-up in Three.js
    object.rotation.x = -Math.PI / 2;

    // Enhance materials
    object.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.side = THREE.DoubleSide);
          } else {
            child.material.side = THREE.DoubleSide;
          }
        }
      }
    });

    // Compute bounding box and center precisely at (0, 0, 0)
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    object.position.x = -center.x;
    object.position.y = -center.y;
    object.position.z = -center.z;

    userPcbModelContainer.add(object);

    // Update camera presets target according to board center
    threeControls.target.set(0, 0, 0);

    // Update Inspector dimensions with actual measurements
    specSoc.textContent = `${size.x.toFixed(1)} mm × ${size.z.toFixed(1)} mm (T: ${size.y.toFixed(1)} mm)`;

    dismissLoader();
    applyPreset('iso');
  }

  function animateThree() {
    requestAnimationFrame(animateThree);

    if (activeEngine === 'three' && threeControls) {
      if (isAutoRotate && !tweenAnimationId) {
        threeControls.autoRotate = true;

        // Auto-Tour 360° Rotation Tracking (Iso 360° ➔ Port 360° ➔ Loop)
        if (isAutoTour && !isTourTransitioning) {
          const currentAzimuth = threeControls.getAzimuthalAngle();
          if (lastAzimuthRad !== null) {
            let delta = currentAzimuth - lastAzimuthRad;
            if (delta < -Math.PI) delta += 2 * Math.PI;
            if (delta > Math.PI) delta -= 2 * Math.PI;

            tourAccumulatedRad += Math.abs(delta);

            // 360 degrees is 2 * PI radians (~6.28)
            if (tourAccumulatedRad >= (2 * Math.PI - 0.05)) {
              tourAccumulatedRad = 0;
              lastAzimuthRad = null;
              advanceAutoTour();
            }
          }
          lastAzimuthRad = currentAzimuth;
        }
      } else {
        threeControls.autoRotate = false;
        lastAzimuthRad = null;
      }
      threeControls.update();
      threeRenderer.render(threeScene, threeCamera);
    }
  }

  function onWindowResize() {
    if (threeCamera && threeRenderer) {
      threeCamera.aspect = window.innerWidth / window.innerHeight;
      threeCamera.updateProjectionMatrix();
      threeRenderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  // ==========================================================================
  // Camera Presets & Smooth Tweening
  // ==========================================================================

  function applyPreset(presetName) {
    activePreset = presetName;

    // Update preset button active states
    [btnPresetIso, btnPresetPort].forEach((btn) => {
      if (!btn) return;
      if (btn.dataset.preset === presetName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Hardware Inspector Card
    const spec = angleSpecs[presetName] || angleSpecs.iso;
    inspectorTitle.textContent = spec.title;
    specSubstrate.textContent = spec.substrate;
    specPower.textContent = spec.power;
    specAngle.textContent = spec.angle;

    const preset = CAM_PRESETS[presetName] || CAM_PRESETS.iso;

    if (activeEngine === 'three' && threeCamera && threeControls) {
      animateThreeCamera(preset.pos, preset.target, 800);
    } else if (activeEngine === 'spline' && splineViewer._spline) {
      animateSplineCamera(preset.pos, preset.target, 800);
    }
  }

  function resetView() {
    applyPreset('iso');
  }

  function animateThreeCamera(targetPos, targetLook, durationMs) {
    if (tweenAnimationId) {
      cancelAnimationFrame(tweenAnimationId);
      tweenAnimationId = null;
    }

    const startPos = { x: threeCamera.position.x, y: threeCamera.position.y, z: threeCamera.position.z };
    const startTarget = { x: threeControls.target.x, y: threeControls.target.y, z: threeControls.target.z };
    const startTime = performance.now();

    function tweenStep(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1.0);
      const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease out

      threeCamera.position.x = startPos.x + (targetPos.x - startPos.x) * ease;
      threeCamera.position.y = startPos.y + (targetPos.y - startPos.y) * ease;
      threeCamera.position.z = startPos.z + (targetPos.z - startPos.z) * ease;

      threeControls.target.x = startTarget.x + (targetLook.x - startTarget.x) * ease;
      threeControls.target.y = startTarget.y + (targetLook.y - startTarget.y) * ease;
      threeControls.target.z = startTarget.z + (targetLook.z - startTarget.z) * ease;

      threeControls.update();

      if (progress < 1.0) {
        tweenAnimationId = requestAnimationFrame(tweenStep);
      } else {
        tweenAnimationId = null;
      }
    }

    tweenAnimationId = requestAnimationFrame(tweenStep);
  }

  function animateSplineCamera(targetPos, targetLook, durationMs) {
    const spline = splineViewer._spline;
    if (!spline || !spline._camera) return;

    const cam = spline._camera;
    const controls = spline._controls?.orbitControls;
    const startPos = { x: cam.position.x, y: cam.position.y, z: cam.position.z };
    const startTime = performance.now();

    function tweenStep(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1.0);
      const ease = 1 - Math.pow(1 - progress, 3);

      cam.position.x = startPos.x + (targetPos.x - startPos.x) * ease;
      cam.position.y = startPos.y + (targetPos.y - startPos.y) * ease;
      cam.position.z = startPos.z + (targetPos.z - startPos.z) * ease;

      if (controls) {
        controls.target.set(targetLook.x, targetLook.y, targetLook.z);
        controls.update();
      } else {
        cam.lookAt(targetLook.x, targetLook.y, targetLook.z);
      }

      spline.requestRender?.();

      if (progress < 1.0) {
        tweenAnimationId = requestAnimationFrame(tweenStep);
      } else {
        tweenAnimationId = null;
      }
    }

    tweenAnimationId = requestAnimationFrame(tweenStep);
  }

  // ==========================================================================
  // Turntable Auto-Rotate Toggle
  // ==========================================================================

  function setAutoRotate(enabled) {
    isAutoRotate = enabled;
    if (isAutoRotate) {
      btnToggleRotate.classList.add('active');
      rotateIcon.textContent = '⏸️';
      rotateText.textContent = 'Auto-Rotate';
      turntableBadge.classList.add('active');
      turntableBadgeText.textContent = 'TURNTABLE: ON';
    } else {
      btnToggleRotate.classList.remove('active');
      rotateIcon.textContent = '▶️';
      rotateText.textContent = 'Play Rotate';
      turntableBadge.classList.remove('active');
      turntableBadgeText.textContent = 'TURNTABLE: PAUSED';
    }

    if (activeEngine === 'video') {
      if (isAutoRotate) {
        fallbackVideo.play().catch(() => {});
      } else {
        fallbackVideo.pause();
      }
    }
  }

  function toggleAutoRotate() {
    setAutoRotate(!isAutoRotate);
  }

  // ==========================================================================
  // Turntable Speed Control
  // ==========================================================================

  function cycleRotationSpeed(direction = 1) {
    currentSpeedIndex = (currentSpeedIndex + direction + ROTATION_SPEEDS.length) % ROTATION_SPEEDS.length;
    const current = ROTATION_SPEEDS[currentSpeedIndex];

    if (threeControls) {
      threeControls.autoRotateSpeed = current.speed;
    }
    if (rotateSpeedText) {
      rotateSpeedText.textContent = current.label.split(' ')[0];
    }

    if (!isAutoRotate) {
      setAutoRotate(true);
    }

    showToast(`Kecepatan putar: ${current.label}`);
  }

  // ==========================================================================
  // Auto-Tour Presentation Choreo (Iso 360° ➔ Port Focus 360° ➔ Loop)
  // ==========================================================================

  function advanceAutoTour() {
    if (!isAutoTour) return;
    isTourTransitioning = true;

    if (tourStage === 'iso') {
      tourStage = 'port';
      applyPreset('port');
      showToast('🎬 Tour: Fokus Area Port & Konektor (360°)');
    } else {
      tourStage = 'iso';
      applyPreset('iso');
      showToast('🎬 Tour: Tampilan Isometrik Board (360°)');
    }

    setTimeout(() => {
      isTourTransitioning = false;
      if (threeControls) {
        lastAzimuthRad = threeControls.getAzimuthalAngle();
      }
    }, 1200);
  }

  function toggleAutoTour(enable) {
    if (enable === undefined) enable = !isAutoTour;
    isAutoTour = enable;
    tourAccumulatedRad = 0;
    lastAzimuthRad = null;
    isTourTransitioning = false;

    if (btnToggleTour) {
      btnToggleTour.classList.toggle('active', isAutoTour);
      if (tourText) tourText.textContent = isAutoTour ? 'Auto-Tour' : 'Tour Off';
    }

    if (isAutoTour) {
      if (!isAutoRotate) setAutoRotate(true);
      showToast('🎬 Auto-Tour Aktif: Iso 360° ➔ Port 360°');
    } else {
      showToast('Auto-Tour Dijeda');
    }
  }

  // ==========================================================================
  // Smart Auto-Hide HUD (Default Clean Mode for Canva Embed & Presentation)
  // ==========================================================================

  function setupSmartHudAutoHide() {
    // Default: HUD 100% tersembunyi untuk Canva Embed
    document.body.classList.remove('hud-visible');
    document.body.classList.remove('hud-idle');

    // Beri jeda 1.8 detik sebelum mouse hover zone aktif agar synthetic (0,0) browser tidak memicu HUD
    isReadyForHoverWake = false;
    setTimeout(() => {
      isReadyForHoverWake = true;
    }, 1800);

    showHud = function () {
      if (isRecording || (loadModal && loadModal.style.display === 'flex') || (shortcutsModal && shortcutsModal.style.display === 'flex')) {
        return;
      }

      document.body.classList.add('hud-visible');

      if (hudIdleTimeout) clearTimeout(hudIdleTimeout);
      if (isHoveringHud) return;

      // Auto-hide setelah 2.5 detik jika kursor keluar dari area kontrol
      hudIdleTimeout = setTimeout(() => {
        if (!isHoveringHud && !isRecording && loadModal.style.display !== 'flex' && shortcutsModal.style.display !== 'flex') {
          if (bgPickerDropdown && bgPickerDropdown.style.display === 'block') return;
          document.body.classList.remove('hud-visible');
        }
      }, 2500);
    };

    wakeHud = showHud;

    hideHud = function () {
      if (isHoveringHud || isRecording) return;
      if (loadModal && loadModal.style.display === 'flex') return;
      if (shortcutsModal && shortcutsModal.style.display === 'flex') return;
      if (bgPickerDropdown && bgPickerDropdown.style.display === 'block') return;
      document.body.classList.remove('hud-visible');
    };

    // Bangunkan HUD HANYA saat kursor mendekati zona kontrol atas atau bawah
    // Saat kursor berinteraksi / orbit / zoom 3D di area tengah, HUD tetap 100% tersembunyi!
    function onPointerMove(e) {
      if (!isReadyForHoverWake) return;
      if (e.clientX === 0 && e.clientY === 0) return; // Abaikan synthetic pointer event awal

      const topZone = 70;
      const bottomZone = window.innerHeight - 80;

      if (e.clientY <= topZone || e.clientY >= bottomZone) {
        showHud();
      } else {
        if (!isHoveringHud && document.body.classList.contains('hud-visible')) {
          if (hudIdleTimeout) clearTimeout(hudIdleTimeout);
          hudIdleTimeout = setTimeout(hideHud, 700);
        }
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Jangan sembunyikan jika kursor sedang aktif di atas panel HUD
    const hudPanels = [
      document.getElementById('hudHeader'),
      document.getElementById('hudTopRight'),
      document.getElementById('controlsPanel'),
      document.getElementById('inspectorCard'),
      bgPickerDropdown
    ];

    hudPanels.forEach((panel) => {
      if (!panel) return;
      panel.addEventListener('mouseenter', () => {
        isHoveringHud = true;
        if (hudIdleTimeout) clearTimeout(hudIdleTimeout);
        document.body.classList.add('hud-visible');
      });
      panel.addEventListener('mouseleave', () => {
        isHoveringHud = false;
        showHud();
      });
    });
  }

  // ==========================================================================
  // Interactive Background Controller & Custom Color Palette System
  // ==========================================================================

  let currentBgColorHex = '#05070f';
  let isBgTransparent = false;

  function toggleBgPopover(show) {
    if (!bgPickerDropdown) return;
    if (show === undefined) {
      show = bgPickerDropdown.style.display === 'none';
    }
    bgPickerDropdown.style.display = show ? 'block' : 'none';
  }

  function applyCustomColor(hex, updateInputs = true) {
    if (!hex.startsWith('#')) hex = '#' + hex;
    currentBgColorHex = hex;
    isBgTransparent = false;

    const colorVal = parseInt(hex.replace('#', '0x'), 16);
    if (!isNaN(colorVal)) {
      if (threeScene) {
        threeScene.background = new THREE.Color(colorVal);
        if (threeRenderer) threeRenderer.setClearColor(colorVal, 1);
      }
    }

    if (stageContainer) {
      stageContainer.className = 'stage-container';
      stageContainer.style.background = hex;
    }

    // Grid contrast and visibility
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    if (gridHelper) {
      gridHelper.visible = checkShowGrid ? checkShowGrid.checked : true;
      if (luminance > 0.6) {
        gridHelper.material.color.setHex(0xcfd4dc);
      } else {
        gridHelper.material.color.setHex(0x182030);
      }
    }

    if (luminance > 0.6) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }

    // Sync input fields
    if (updateInputs) {
      if (bgCustomColorInput) bgCustomColorInput.value = hex;
      if (customColorDisc) customColorDisc.style.background = hex;
      if (bgHexInput) bgHexInput.value = hex.replace('#', '').toUpperCase();
    }

    if (bgIcon) bgIcon.textContent = '🎨';
    if (bgLabel) {
      const hexUpper = hex.toUpperCase();
      if (hexUpper === '#05070F') bgLabel.textContent = 'BG: Dark';
      else if (hexUpper === '#00FF00') bgLabel.textContent = 'BG: Green';
      else if (hexUpper === '#FFFFFF') bgLabel.textContent = 'BG: White';
      else bgLabel.textContent = hexUpper;
    }

    // Highlight active preset button if match
    document.querySelectorAll('.swatch-btn').forEach((btn) => {
      if (btn.dataset.color && btn.dataset.color.toLowerCase() === hex.toLowerCase()) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    showToast(`Background: ${hex.toUpperCase()}`);
  }

  function applyTransparentMode() {
    isBgTransparent = true;
    if (threeScene) {
      threeScene.background = null;
      if (threeRenderer) threeRenderer.setClearColor(0x000000, 0);
    }
    if (gridHelper) {
      gridHelper.visible = false;
    }
    if (stageContainer) {
      stageContainer.style.background = '';
      stageContainer.className = 'stage-container bg-transparent';
    }
    document.body.classList.remove('light-theme');

    if (bgIcon) bgIcon.textContent = '🏁';
    if (bgLabel) bgLabel.textContent = 'Transparan';

    document.querySelectorAll('.swatch-btn').forEach((btn) => {
      if (btn.dataset.mode === 'transparent') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    showToast('Background: Transparan (Alpha)');
  }

  function setupBackgroundController() {
    // Toggle popover on button click
    if (btnToggleBg) {
      btnToggleBg.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleBgPopover();
      });
    }

    if (btnCloseBgPicker) {
      btnCloseBgPicker.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleBgPopover(false);
      });
    }

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (bgPickerDropdown && bgPickerDropdown.style.display !== 'none') {
        if (!bgPickerDropdown.contains(e.target) && e.target !== btnToggleBg && !btnToggleBg.contains(e.target)) {
          toggleBgPopover(false);
        }
      }
    });

    // Preset Swatches
    const swatchBtns = document.querySelectorAll('.swatch-btn');
    swatchBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        const color = btn.dataset.color;
        if (mode === 'transparent') {
          applyTransparentMode();
        } else if (color) {
          applyCustomColor(color);
        }
      });
    });

    // Native Color Input Picker
    if (bgCustomColorInput) {
      bgCustomColorInput.addEventListener('input', (e) => {
        applyCustomColor(e.target.value);
      });
    }

    // Hex Text Input
    if (bgHexInput) {
      bgHexInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
        bgHexInput.value = val;
        if (val.length === 6) {
          applyCustomColor('#' + val, false);
          if (bgCustomColorInput) bgCustomColorInput.value = '#' + val;
          if (customColorDisc) customColorDisc.style.background = '#' + val;
        }
      });
    }

    // EyeDropper API (Chromium screen dropper to sample color directly from Canva)
    if (btnEyeDropper) {
      if (!window.EyeDropper) {
        btnEyeDropper.style.display = 'none';
      } else {
        btnEyeDropper.addEventListener('click', async () => {
          try {
            const eyeDropper = new window.EyeDropper();
            const result = await eyeDropper.open();
            if (result && result.sRGBHex) {
              applyCustomColor(result.sRGBHex);
            }
          } catch (err) {
            // Cancelled
          }
        });
      }
    }

    // Grid Checkbox
    if (checkShowGrid) {
      checkShowGrid.addEventListener('change', () => {
        if (gridHelper) {
          gridHelper.visible = checkShowGrid.checked;
        }
      });
    }
  }

  // ==========================================================================
  // Fullscreen Management
  // ==========================================================================

  function toggleFullscreen() {
    const isFull = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );

    if (!isFull) {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  function onFullscreenChange() {
    const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (isFull) {
      fullscreenIconEnter.style.display = 'none';
      fullscreenIconExit.style.display = 'inline-block';
      fullscreenText.textContent = 'Exit Fullscreen';
    } else {
      fullscreenIconEnter.style.display = 'inline-block';
      fullscreenIconExit.style.display = 'none';
      fullscreenText.textContent = 'Fullscreen';
    }
  }

  // ==========================================================================
  // Engine Switcher: 3D vs Offline Video Fallback
  // ==========================================================================

  function toggleEngine() {
    if (activeEngine === 'video') {
      fallbackContainer.style.display = 'none';
      fallbackVideo.pause();
      engineIcon.textContent = '📹';
      engineLabel.textContent = 'Video Fallback';
      initThreeJS();
    } else {
      if (threeCanvas) threeCanvas.style.display = 'none';
      if (splineViewer) splineViewer.style.display = 'none';
      fallbackContainer.style.display = 'flex';
      fallbackVideo.play().catch(() => {});
      activeEngine = 'video';
      engineIcon.textContent = '⚡';
      engineLabel.textContent = '3D PCB';
      updateStageStatus('STAGE OFFLINE TURNTABLE', '#fb923c', 'rgba(234, 88, 12, 0.2)');
    }
  }

  function updateStageStatus(text, color = '#34d399', bg = 'rgba(16, 185, 129, 0.12)') {
    stageStatusText.textContent = text;
    stageStatusPill.style.color = color;
    stageStatusPill.style.backgroundColor = bg;
  }

  // Fallback video interactive touch & scrub
  function setupFallbackVideoScrubbing() {
    let isScrubbing = false;
    let startX = 0;
    let startTime = 0;

    fallbackTouchSurface.addEventListener('pointerdown', (e) => {
      isScrubbing = true;
      startX = e.clientX;
      startTime = fallbackVideo.currentTime || 0;
      fallbackVideo.pause();
      setAutoRotate(false);
    });

    window.addEventListener('pointermove', (e) => {
      if (!isScrubbing || !fallbackVideo.duration) return;
      const deltaX = e.clientX - startX;
      const duration = fallbackVideo.duration;
      const scrubOffset = (deltaX / 400) * duration;
      let targetTime = (startTime + scrubOffset) % duration;
      if (targetTime < 0) targetTime += duration;
      fallbackVideo.currentTime = targetTime;
    });

    window.addEventListener('pointerup', () => {
      isScrubbing = false;
    });
  }

  // ==========================================================================
  // Modals & User Actions
  // ==========================================================================

  function openLoadModal() {
    loadModal.style.display = 'flex';
    loadModalStatus.textContent = 'Model aktif: 3D_PCB1_autoroute_2026-10-15.obj';
  }

  function closeLoadModal() {
    loadModal.style.display = 'none';
  }

  function toggleShortcutsModal(show) {
    if (show === undefined) {
      show = shortcutsModal.style.display === 'none';
    }
    shortcutsModal.style.display = show ? 'flex' : 'none';
  }

  function toggleZenMode() {
    const isHidden = document.body.classList.toggle('hud-hidden');
    btnRestoreHud.style.display = isHidden ? 'block' : 'none';
  }

  function setupInspector() {
    btnToggleInspector.addEventListener('click', () => {
      const isMin = inspectorCard.classList.toggle('minimized');
      btnToggleInspector.textContent = isMin ? '+' : '−';
    });
  }

  function setupModals() {
    // Open/Close
    btnLoadModel.addEventListener('click', openLoadModal);
    btnCloseLoadModal.addEventListener('click', closeLoadModal);
    loadModal.addEventListener('click', (e) => {
      if (e.target === loadModal) closeLoadModal();
    });

    btnShortcuts.addEventListener('click', () => toggleShortcutsModal(true));
    btnCloseShortcuts.addEventListener('click', () => toggleShortcutsModal(false));
    shortcutsModal.addEventListener('click', (e) => {
      if (e.target === shortcutsModal) toggleShortcutsModal(false);
    });

    // Modal Tabs
    const tabs = [
      { btn: tabBtnActiveModel, content: tabContentActive },
      { btn: tabBtnUrl, content: tabContentUrl },
      { btn: tabBtnFile, content: tabContentFile }
    ];

    tabs.forEach(({ btn, content }) => {
      btn.addEventListener('click', () => {
        tabs.forEach((t) => {
          t.btn.classList.remove('active');
          t.content.style.display = 'none';
        });
        btn.classList.add('active');
        content.style.display = 'block';
      });
    });

    // Reload User PCB button
    btnReloadUserPcb.addEventListener('click', () => {
      localStorage.removeItem('mirrora_spline_url');
      initThreeJS();
      loadUserEasyEdaModel();
      closeLoadModal();
    });

    // Apply Spline URL
    btnApplySplineUrl.addEventListener('click', () => {
      const url = inputSplineUrl.value.trim();
      if (!url) {
        alert('Silakan masukkan tautan URL .splinecode terlebih dahulu.');
        return;
      }
      localStorage.setItem('mirrora_spline_url', url);
      closeLoadModal();
      initSpline(url);
    });

    // Drag & Drop Handling
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelection(files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
      }
    });

    // Window level Drag & Drop
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });
  }

  function handleFileSelection(file) {
    const name = file.name.toLowerCase();
    if (name.endsWith('.obj')) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const objLoader = new THREE.OBJLoader();
        const object = objLoader.parse(e.target.result);
        const defaultMat = new THREE.MeshStandardMaterial({
          color: 0x135427,
          roughness: 0.4,
          metalness: 0.2,
          side: THREE.DoubleSide
        });
        object.traverse((child) => {
          if (child.isMesh) child.material = defaultMat;
        });
        initThreeJS();
        displayLoadedPcbObject(object);
        closeLoadModal();
      };
      reader.readAsText(file);
    } else if (name.endsWith('.glb') || name.endsWith('.gltf')) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const loader = new THREE.GLTFLoader();
        loader.parse(e.target.result, '', (gltf) => {
          initThreeJS();
          displayLoadedPcbObject(gltf.scene);
          closeLoadModal();
        });
      };
      reader.readAsArrayBuffer(file);
    } else if (name.endsWith('.splinecode')) {
      const blobUrl = URL.createObjectURL(file);
      closeLoadModal();
      initSpline(blobUrl);
    } else {
      alert('Format berkas tidak didukung. Harap gunakan berkas .obj, .glb, .gltf, atau .splinecode');
    }
  }

  function initSpline(url) {
    activeEngine = 'spline';
    threeCanvas.style.display = 'none';
    fallbackContainer.style.display = 'none';
    splineViewer.style.display = 'block';

    splineViewer.setAttribute('url', url);
    updateStageStatus('STAGE SPLINE 3D');

    splineViewer.addEventListener('load-complete', () => {
      dismissLoader();
      console.log('Custom Spline scene loaded successfully:', url);
    }, { once: true });

    splineViewer.addEventListener('error', (err) => {
      console.error('Failed to load Spline URL:', err);
      loadModalStatus.textContent = 'Gagal memuat URL Spline. Beralih ke model OBJ.';
      initThreeJS();
      loadUserEasyEdaModel();
    }, { once: true });
  }

  // ==========================================================================
  // 3D Canvas Video Recording & UI Pinggir Minggir Mode
  // ==========================================================================

  function getSupportedMimeType() {
    const types = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4;codecs=avc1',
      'video/mp4'
    ];
    for (const type of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  }

  function formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function startRecording() {
    if (isRecording) {
      stopRecording();
      return;
    }

    // Capture clean 60FPS video stream from active 3D canvas
    let stream = null;
    try {
      if (activeEngine === 'three' && threeCanvas) {
        stream = threeCanvas.captureStream ? threeCanvas.captureStream(60) : null;
      } else if (activeEngine === 'spline' && splineViewer) {
        const internalCanvas = splineViewer.shadowRoot
          ? splineViewer.shadowRoot.querySelector('canvas')
          : splineViewer.querySelector('canvas');
        if (internalCanvas && internalCanvas.captureStream) {
          stream = internalCanvas.captureStream(60);
        } else if (threeCanvas.captureStream) {
          stream = threeCanvas.captureStream(60);
        }
      } else if (activeEngine === 'video' && fallbackVideo) {
        if (fallbackVideo.captureStream) {
          stream = fallbackVideo.captureStream(60);
        }
      }
    } catch (err) {
      console.warn('captureStream error:', err);
    }

    if (!stream) {
      alert('Browser belum mendukung perekaman langsung pada canvas 3D ini.');
      return;
    }

    const mimeType = getSupportedMimeType();
    const options = mimeType
      ? { mimeType, videoBitsPerSecond: 10000000 }
      : { videoBitsPerSecond: 10000000 };

    recordedChunks = [];
    try {
      mediaRecorder = new MediaRecorder(stream, options);
    } catch (e) {
      console.warn('MediaRecorder with options failed, fallback to default:', e);
      mediaRecorder = new MediaRecorder(stream);
    }

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const chosenType = mediaRecorder.mimeType || 'video/webm';
      const extension = chosenType.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(recordedChunks, { type: chosenType });
      const url = URL.createObjectURL(blob);

      const now = new Date();
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
      const filename = `MirrOra_PCB_3D_${timestamp}.${extension}`;

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);

      showToast(`Video rekaman 3D (${formatTime(recordSeconds)}) berhasil disimpan ke folder Downloads!`);
    };

    mediaRecorder.start(250);
    isRecording = true;

    // Pastikan Auto-Rotate aktif agar hasil rekaman turntable berputar mulus
    if (!isAutoRotate) {
      setAutoRotate(true);
    }

    // UI pinggir minggir semua dengan animasi halus!
    toggleBgPopover(false);
    document.body.classList.add('recording-active');
    if (recordingHud) recordingHud.style.display = 'flex';

    // Start timer counter
    recordSeconds = 0;
    if (recTimer) recTimer.textContent = '00:00';
    if (recordTimerInterval) clearInterval(recordTimerInterval);
    recordTimerInterval = setInterval(() => {
      recordSeconds++;
      if (recTimer) recTimer.textContent = formatTime(recordSeconds);
    }, 1000);
  }

  function stopRecording() {
    if (!isRecording || !mediaRecorder) return;

    isRecording = false;
    if (recordTimerInterval) clearInterval(recordTimerInterval);

    if (mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }

    // Kembalikan UI pinggir
    document.body.classList.remove('recording-active');
    if (recordingHud) recordingHud.style.display = 'none';
  }

  function showToast(message) {
    if (!toastNotification) return;
    // Jangan tampilkan toast jika HUD sedang tersembunyi (agar slide Canva bersih dari popup)
    if (!document.body.classList.contains('hud-visible')) {
      return;
    }
    if (toastMsg) toastMsg.textContent = message;
    toastNotification.style.display = 'flex';

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastNotification.style.display = 'none';
    }, 4500);
  }

  // ==========================================================================
  // Event Listeners & Shortcuts
  // ==========================================================================

  function setupEventListeners() {
    // Tombol Rekam Video
    if (btnStartRecord) btnStartRecord.addEventListener('click', startRecording);
    if (btnStopRecord) btnStopRecord.addEventListener('click', stopRecording);

    // Kecepatan Putar & Auto-Tour
    if (btnRotateSpeed) btnRotateSpeed.addEventListener('click', () => cycleRotationSpeed(1));
    if (btnToggleTour) btnToggleTour.addEventListener('click', () => toggleAutoTour());

    // Presets
    btnPresetIso.addEventListener('click', () => {
      applyPreset('iso');
      tourStage = 'iso';
    });
    btnPresetPort.addEventListener('click', () => {
      applyPreset('port');
      tourStage = 'port';
    });
    btnResetView.addEventListener('click', resetView);

    // Turntable & Fullscreen
    btnToggleRotate.addEventListener('click', toggleAutoRotate);
    btnToggleFullscreen.addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);

    // Engine & Zen Mode
    btnToggleEngine.addEventListener('click', toggleEngine);
    btnZenMode.addEventListener('click', toggleZenMode);
    btnRestoreHud.addEventListener('click', toggleZenMode);

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();

      if (key === 'v') {
        if (isRecording) {
          stopRecording();
        } else {
          startRecording();
        }
      } else if (key === 't') {
        toggleAutoTour();
      } else if (key === 'b') {
        toggleBgPopover();
      } else if (key === '+' || key === '=' || key === ']') {
        cycleRotationSpeed(1);
      } else if (key === '-' || key === '_' || key === '[') {
        cycleRotationSpeed(-1);
      } else if (e.code === 'Space') {
        e.preventDefault();
        toggleAutoRotate();
      } else if (key === '1') {
        applyPreset('iso');
        tourStage = 'iso';
      } else if (key === '2') {
        applyPreset('port');
        tourStage = 'port';
      } else if (key === 'r') {
        resetView();
      } else if (key === 'm') {
        openLoadModal();
      } else if (key === 'f') {
        toggleFullscreen();
      } else if (key === 'h') {
        if (document.body.classList.contains('hud-visible')) {
          hideHud();
        } else {
          showHud();
        }
      } else if (key === '?' || (e.shiftKey && key === '/')) {
        toggleShortcutsModal();
      } else if (e.key === 'Escape') {
        if (isRecording) {
          stopRecording();
        }
        toggleBgPopover(false);
        closeLoadModal();
        toggleShortcutsModal(false);
        hideHud();
      }
    });

    // Expose programmatic controls to window for automation, tests, & Canva embed
    window.__mirroraViewer = {
      applyPreset,
      toggleAutoRotate,
      toggleAutoTour,
      advanceAutoTour,
      cycleRotationSpeed,
      applyCustomColor,
      applyTransparentMode,
      showHud,
      hideHud,
      wakeHud: () => { if (showHud) showHud(); },
      isHudVisible: () => document.body.classList.contains('hud-visible'),
      getAzimuthalAngle: () => (threeControls ? threeControls.getAzimuthalAngle() : 0),
      getControls: () => threeControls,
      getActivePreset: () => activePreset,
      isTourActive: () => isAutoTour,
      getTourStage: () => tourStage
    };
    window.advanceAutoTour = advanceAutoTour;
    window.toggleAutoTour = toggleAutoTour;
    window.applyPreset = applyPreset;
    window.showHud = () => { if (showHud) showHud(); };
    window.hideHud = () => { if (hideHud) hideHud(); };
    window.wakeHud = () => { if (showHud) showHud(); };
  }

  // Start app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
