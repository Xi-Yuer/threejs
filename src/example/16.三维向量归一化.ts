import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 20);

const stats = new Stats();
document.body.appendChild(stats.dom);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 控制器
new OrbitControls(camera, renderer.domElement);

// 坐标点 A 和 B
const pointA = new THREE.Vector3(0, 0, 0);
const pointB = new THREE.Vector3(1, 1, 1);

// 小球
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
sphere.position.copy(pointA);
scene.add(sphere);

// 可视化方向向量（用箭头表示）
const direction = pointB.clone().sub(pointA).normalize();
const arrowHelper = new THREE.ArrowHelper(direction, pointA, 10, 0x00ff00);
scene.add(arrowHelper);

// 地面参考线
const gridHelper = new THREE.GridHelper(20, 20);
scene.add(gridHelper);

// 动画
const speed = 0.05;
const moveVector = direction.clone().multiplyScalar(speed);

function animate() {
  requestAnimationFrame(animate);
  stats.update();
  // 移动小球
  sphere.position.add(moveVector);

  renderer.render(scene, camera);
}

animate();