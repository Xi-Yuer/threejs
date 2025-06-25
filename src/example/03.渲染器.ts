import * as THREE from "three";
import texture from "../assets/image/001.jpg";

(function init() {
  const csv = document.createElement("canvas");
  csv.id = "cvs";
  csv.width = 500;
  csv.height = 500;
  document.body.appendChild(csv);
})();

const cvs = document.querySelector("#cvs")!;
// 创建一个渲染器
const renderer = new THREE.WebGLRenderer({
  canvas: cvs!, // 这里可以指定渲染的canvas元素
  // 如果不指定 canvas 元素，则会创建一个新的 canvas 元素，并需要手动通过  document.body.appendChild(renderer.domElement) 添加到页面中
  antialias: true, // 开启抗锯齿
});

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);

// 创建纹理
new THREE.TextureLoader().load(texture, (texture) => {
  cube.material = new THREE.MeshBasicMaterial({ map: texture });
  renderer.render(scene, camera);
});

const scene = new THREE.Scene();
scene.background  = new THREE.Color("rgb(167, 175, 167)");

const camera = new THREE.PerspectiveCamera(
  75,
  // 设置 canvas 的宽高比，需要根据实际的 canvas 宽高来设置
  cvs.clientWidth / cvs.clientHeight,
  0.1,
  1000
);

camera.position.set(0, 0, 3);
camera.lookAt(0, 0, 0);

scene.add(cube);

renderer.render(scene, camera);

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
