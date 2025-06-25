import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

(function () {
  const canvas = document.createElement("canvas");
  canvas.id = "cvs";
  canvas.width = 1000;
  canvas.height = 1000;
  document.body.appendChild(canvas);
})();

const canvas = document.getElementById("cvs") as HTMLCanvasElement;
const scene = new THREE.Scene();
let orbitControl: OrbitControls;

const camera = new THREE.PerspectiveCamera(
  75,
  canvas.width / canvas.height,
  0.1,
  1000
);
camera.position.z = 15;
camera.position.y = 20;
camera.position.x = 15;

// 相机轨道控制
{
  orbitControl = new OrbitControls(camera, canvas);
  orbitControl.enableDamping = true; // 启用阻尼
  orbitControl.dampingFactor = 0.05; // 阻尼惯性
}

// 物体
{
  const gridhelper = new THREE.GridHelper(100, 10, 0x00ff00, 0x0000ff);
  const geometry = new THREE.SphereGeometry(5, 64, 64); // 半径、水平分割数、垂直分割数
  const material = new THREE.MeshStandardMaterial({
    color: 0xff000, // 颜色
    roughness: 0.4, // 粗糙度
    metalness: 0.1, // 金属度
  });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube, gridhelper);
}

// 灯光
{
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // 环境光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(2, 2, 2);
  scene.add(ambientLight, directionalLight);
}

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});

function animate() {
  requestAnimationFrame(animate);
  orbitControl.update();
  renderer.render(scene, camera);
}
animate();
