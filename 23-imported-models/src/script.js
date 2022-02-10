import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { AnimationActionLoopStyles } from 'three';

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
// const options = {
//   animation1: false,
//   animation2: false,
//   animation3: false,
// };
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * MODELS
 */
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

let mixer = null;
const options = {
  // este es para el check
  action1: false,
  action2: false,
  action3: false,
};
let gltfStopper = null;
gltfLoader.load('/models/Fox/glTF/Fox.gltf', async (gltfResponse) => {
  mixer = new THREE.AnimationMixer(gltfResponse.scene);
  gltfStopper = gltfResponse;
  gui.add(options, 'action1').onChange((event) => {
    changeAnimation(
      event,
      mixer.clipAction(gltfResponse.animations[0]),
      'action1'
    ); // tengo que pasar el action que este vinculado a esa animation
  });
  gui.add(options, 'action2').onChange((event) => {
    changeAnimation(
      event,
      mixer.clipAction(gltfResponse.animations[1]),
      'action2'
    );
  });
  gui.add(options, 'action3').onChange((event) => {
    changeAnimation(
      event,
      mixer.clipAction(gltfResponse.animations[2]),
      'action3'
    );
  });
  gltfResponse.scene.scale.set(0.025, 0.025, 0.025);
  scene.add(gltfResponse.scene);
});
/**
 * @param {*event from onChange } event 
 * @param {*action created from mixed element of array} action 
 * @param {* number to know which one is active.} number 
 */
const changeAnimation = (event, action, number) => {
  event === true ? action.play() : action.stop();
  if (number === 'action1') {
    mixer.clipAction(gltfStopper.animations[1]).stop();
    mixer.clipAction(gltfStopper.animations[2]).stop();
    options.action2 = false;
    options.action3 = false;
  } else if (number === 'action2') {
    mixer.clipAction(gltfStopper.animations[0]).stop();
    mixer.clipAction(gltfStopper.animations[2]).stop();
    options.action1 = false;
    options.action3 = false;
  } else {
    mixer.clipAction(gltfStopper.animations[0]).stop();
    mixer.clipAction(gltfStopper.animations[1]).stop();
    options.action1 = false;
    options.action2 = false;
  }

  for (var i in gui.controllers) {
    gui.controllers[i].updateDisplay();
  }
};

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: '#444444',
    metalness: 0,
    roughness: 0.5,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(2, 2, 2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  //update mixer
  if (mixer != null) {
    mixer.update(deltaTime);
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
