import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import monkey from "/monkey.gltf?url";

console.log(monkey);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 10, 20);

const ambienLight = new THREE.AmbientLight(0xffffff);
scene.add(ambienLight);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 控制器
new OrbitControls(camera, renderer.domElement);

// 创建GLTF加载器对象
const loader = new GLTFLoader();

loader.load(monkey, function (gltf) {
  scene.add(gltf.scene);
  console.log(gltf);
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
