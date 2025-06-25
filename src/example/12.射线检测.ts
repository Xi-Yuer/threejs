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
camera.position.z = 10;
camera.position.y = 10;
camera.position.x = 0;

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
const raycaster = new THREE.Raycaster(
  new THREE.Vector3(-7, 0, 0), // 光线投射的原点向量
  new THREE.Vector3(1, 0, 0).normalize() // 向射线提供方向的方向向量
);

// 可视化射线：用一条直线表示
const rayOrigin = new THREE.Vector3(-7, 0, 0);
const rayDirection = new THREE.Vector3(1, 0, 0).normalize();
const rayLength = 20; // 射线长度

const rayLineGeometry = new THREE.BufferGeometry().setFromPoints([
  rayOrigin,
  rayOrigin.clone().add(rayDirection.clone().multiplyScalar(rayLength)),
]);

const rayLineMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff,
  linewidth: 20,
});
const rayLine = new THREE.Line(rayLineGeometry, rayLineMaterial);
scene.add(rayLine);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});

const objects = [mesh1, mesh2, mesh3];
function render() {
  // 重置颜色

  mesh1.position.y = Math.sin(Date.now() / 1000) * 4;
  mesh2.position.y = Math.sin(Date.now() / 1000) * 6;
  mesh3.position.y = Math.sin(Date.now() / 1000) * 9;
  for (const obj of objects) {
    (obj.material as THREE.MeshBasicMaterial).color.set(0xff0000);
  }

  // 射线检测
  const intersects = raycaster.intersectObjects(objects);
  for (const i of intersects) {
    if (i.object instanceof THREE.Mesh) {
      (i.object.material as THREE.MeshBasicMaterial).color.set(0xffffff);
    }
  }
  orbitControl.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();
