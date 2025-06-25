import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

(function () {
  const canvas = document.createElement("canvas");
  canvas.id = "cvs";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
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
camera.position.z = 10;
camera.position.y = 10;
camera.position.x = 0;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  camera.aspect = canvas.width / canvas.height;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.width, canvas.height);
});

// 相机轨道控制
{
  orbitControl = new OrbitControls(camera, canvas);
  orbitControl.enableDamping = true; // 启用阻尼
  orbitControl.dampingFactor = 0.05; // 阻尼惯性
}

{
  const gridHelper = new THREE.GridHelper(100, 100);
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(gridHelper, axesHelper);
}

const sphere = new THREE.SphereGeometry(2, 32, 32);
const material = new THREE.MeshBasicMaterial({
  color: 0xff0000,
});
const mesh1 = new THREE.Mesh(sphere, material.clone());
const mesh2 = new THREE.Mesh(sphere, material.clone());
const mesh3 = new THREE.Mesh(sphere, material.clone());
mesh1.position.x = -5;
mesh2.position.x = 5;
mesh3.position.y = 5;
scene.add(mesh1, mesh2, mesh3);

// 射线
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  // 归一化坐标，将屏幕坐标转换为归一化坐标
  mouse.x = (x / rect.width) * 2 - 1;
  mouse.y = -(y / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  // 射线检测
  const intersects = raycaster.intersectObjects(objects);
  // 重置颜色
  for (const obj of objects) {
    (obj.material as THREE.MeshBasicMaterial).color.set(0xff0000);
  }
  for (const i of intersects) {
    if (i.object instanceof THREE.Mesh) {
      (i.object.material as THREE.MeshBasicMaterial).color.set(0xffffff);
    }
  }
});

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});

const objects = [mesh1, mesh2, mesh3];
function render() {
  orbitControl.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();
