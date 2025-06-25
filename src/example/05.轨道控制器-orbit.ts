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

const csv = document.getElementById("cvs") as HTMLCanvasElement;

// 创建场景
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  csv.clientWidth / csv.clientHeight,
  0.1,
  1000
);

// 将相机的视角位于顶部
camera.position.set(2, 100, 0);
camera.lookAt(0, 0, 0);

// 创建控制器,用户控制摄像机位置
const orbitContr = new OrbitControls(camera, csv);

orbitContr.enableDamping = true; // 启用阻尼,需要调用  orbitContr.update()

// 需要不断更新控制器，才能看到阻尼效果
function update() {
  requestAnimationFrame(update);
  orbitContr.update();
}
update();

// 监听 orbit 控制器改变事件，需要手动重新渲染视图
orbitContr.addEventListener("change", () => {
  renderer.render(scene, camera);
});

// 立方体
const cube = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10));
cube.position.set(0, 0.5, 0);
// 网格
const gridhelper = new THREE.GridHelper(100, 10, 0xff0000, 0x00ff00); // 参数：网格大小，网格分段数，中线颜色，网格颜色

scene.add(cube, gridhelper);

const renderer = new THREE.WebGLRenderer({
  canvas: csv,
  antialias: true, // 抗锯齿
});

new THREE.TextureLoader().load(img, (data) => {
  cube.material = new THREE.MeshBasicMaterial({ map: data });
  renderer.render(scene, camera);
});

(function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
})();
