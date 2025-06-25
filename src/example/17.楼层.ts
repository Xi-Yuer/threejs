import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 100, 150);
scene.add(camera);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

new OrbitControls(camera, renderer.domElement);

// 批量创建多个长方体表示高层楼
const group1 = new THREE.Group(); //所有高层楼的父对象
group1.name = "高层";
for (let i = 0; i < 5; i++) {
  const geometry = new THREE.BoxGeometry(20, 60, 10);
  const material = new THREE.MeshLambertMaterial({
    color: 0x00ffff,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = i * 30; // 网格模型mesh沿着x轴方向阵列
  group1.add(mesh); //添加到组对象group1
  mesh.name = i + 1 + "号楼";
  // console.log('mesh.name',mesh.name);
}
group1.position.y = 30;

const group2 = new THREE.Group();
group2.name = "洋房";
// 批量创建多个长方体表示洋房
for (let i = 0; i < 5; i++) {
  const geometry = new THREE.BoxGeometry(20, 30, 10);
  const material = new THREE.MeshLambertMaterial({
    color: 0x00ffff,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = i * 30;
  group2.add(mesh); //添加到组对象group2
  mesh.name = i + 6 + "号楼";
}
group2.position.z = 50;
group2.position.y = 15;

const model = new THREE.Group();
model.name = "小区房子";
model.add(group1, group2);
model.position.set(-50, 0, -25);

scene.add(model);
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
