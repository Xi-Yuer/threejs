import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import img from "../assets/image/001.jpg";

(function () {
  const csv = document.createElement("canvas");
  csv.id = "cvs";
  csv.width = 1000;
  csv.height = 1000;
  document.body.appendChild(csv);
})();

const cvs = document.getElementById("cvs") as HTMLCanvasElement;

const scene = new THREE.Scene();

const gridhelper = new THREE.GridHelper(100, 10, 0xff0000, 0x00ff00);

// 创建几何体
const geometry = new THREE.ConeGeometry(10, 32, 32); // 椎体:底部半径、高度、分段数
const sphere = new THREE.SphereGeometry(10, 20, 32); // 球体:半径、分段数、栈数
// 创建材质
const texture = new THREE.TextureLoader().load(img);
const material = new THREE.MeshPhongMaterial({
  map: texture,
  // emissive: 0xffff00, // 自发光颜色
});
// 几何体与材质结合
const mesh = new THREE.Mesh(geometry, material);
const sphereMesh = new THREE.Mesh(sphere, material);
mesh.position.set(20, 20, 0);
sphereMesh.position.set(-20, 20, 0);

const cube = new THREE.BoxGeometry(10, 10, 10);
const cubeMesh = new THREE.Mesh(cube, material);
cubeMesh.position.set(0, 20, 0);

// 平行光
{
  const color = 0xffffff;
  const intensity = 3;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);
}

// 环境光
{
  const color = 0xffffff;
  const intensity = 1;
  const light = new THREE.AmbientLight(color, intensity);
  scene.add(light);
}

scene.add(mesh, sphereMesh, cubeMesh, gridhelper);

const camera = new THREE.PerspectiveCamera(
  75,
  cvs.clientWidth / cvs.clientHeight,
  0.1,
  1000
);
camera.position.set(2, 100, 0);
camera.lookAt(0, 0, 0);

const orbitContr = new OrbitControls(camera, cvs);
orbitContr.enableDamping = true; // 启用阻尼,需要调用  orbitContr.update()
// 阻尼系数
orbitContr.dampingFactor = 0.03;

// 需要不断更新控制器，才能看到阻尼效果
function update() {
  requestAnimationFrame(update);
  orbitContr.update();
}
update();

const renderer = new THREE.WebGLRenderer({
  canvas: cvs,
  antialias: true,
});

(function animate() {
  requestAnimationFrame(animate);
  cubeMesh.rotation.x += 0.01;
  cubeMesh.rotation.y += 0.01;
  renderer.render(scene, camera);
})();
