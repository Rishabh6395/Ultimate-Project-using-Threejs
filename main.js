import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { log } from 'three/webgpu';
import gsap from 'gsap'
import LocomotiveScroll from 'locomotive-scroll';

const locomotiveScroll = new LocomotiveScroll();


// scene
const scene = new THREE.Scene();
// camera
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3.5

// renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputEncoding = THREE.sRGBEncoding;

// PMREM generator
const pmreGenerator = new THREE.PMREMGenerator(renderer);
pmreGenerator.compileEquirectangularShader();

let model;


// const controls = new OrbitControls(camera, renderer.domElement)
// controls.enableDamping = true

// Post-processing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0032; // Adjust the RGB shift amount
composer.addPass(rgbShiftPass);



// Load HDRI environment
const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/rosendal_park_sunset_2k.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularRefractionMapping;
  // scene.background = texture;
  scene.environment = texture;
}, undefined, (error) => {
  console.error('Error loading HDRI:', error);
});

// Load GLTF model
const loader = new GLTFLoader();
loader.load('./DamagedHelmet.gltf', (gltf) => {
  model = gltf.scene
  scene.add(model);
}, undefined, (error) => {
  console.error('Error loading GLTF model:', error);
});

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// This piece of code will follow your cursor
window.addEventListener('mousemove', (e)=>{
  if(model){
    const rotationX = (e.clientX / window.innerWidth - .5) * (Math.PI * .12)
    const rotationY = (e.clientY / window.innerHeight - .5) * (Math.PI * .12)
    gsap.to(model.rotation,
      { y: rotationX, x: rotationY, duration: 0.5 });
  }
})

window.addEventListener('resize', () =>{
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
})

// render
function animate() {
  requestAnimationFrame(animate);
  // controls.update();
  composer.render(); // Use composer to render with post-processing
}
animate();