import * as THREE from "three";
import img from "../assets/image/001.jpg";

(function () {
  const csv = document.createElement("canvas");
  csv.id = "cvs";
  csv.width = 500;
  csv.height = 500;
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

/**
 * 手动实现相机跟随鼠标移动而移动
 */

let isDown = false; // 是否按下了鼠标
let startX = 0; // 鼠标按下的X坐标
csv.addEventListener("mousedown", (e) => {
  isDown = true;
  startX = e.clientX;
});
csv.addEventListener("mousemove", (e) => {
  if (isDown) {
    const distance = e.clientX - startX; // 鼠标移动的距离
    camera.position.x = 40 * Math.sin(-distance * 0.01);
    camera.position.z = 40 * Math.cos(-distance * 0.01);
    camera.lookAt(0, 0, 0); // 摄像机视角始终在(0,0,0)
  }
});
csv.addEventListener("mouseup", () => {
  isDown = false;
});
