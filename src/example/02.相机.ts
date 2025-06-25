import * as THREE from "three";
import bgImg from "../assets/image/001.jpg";

// 创建场景
const scene = new THREE.Scene();

// 创建相机（透视相机）
const camera = new THREE.PerspectiveCamera(
  75, // 视角
  window.innerWidth / window.innerHeight, // 宽高比
  // 摄像机距离场景的距离,物体必须在近平面和远平面之间才可以被渲染
  0.1, // 近平面
  1000 // 远平面
);
// 设置相机的位置
camera.position.z = 2; // z轴
camera.position.y = 0; // x轴

// 设置相机的朝向
camera.lookAt(0, 0, 0); // 设置相机的朝向,分别为x,y,z轴
// 创建一个渲染器
const renderer = new THREE.WebGLRenderer();

// 设置渲染器的尺寸,指的是画布的宽高
renderer.setSize(window.innerWidth, window.innerHeight);

// 把渲染器添加到画布中
document.body.appendChild(renderer.domElement);

// 纹理背景
new THREE.TextureLoader().load(bgImg, (texture) => {
  // new THREE.TextureLoader() 创建纹理加载器对象
  scene.background = texture; // 回调函数中，可以获取加载的纹理对象并设置给场景的背景，注意这个回调函数是异步的
  renderer.render(scene, camera);
}); // 纹理

// 创建一个白色的立方体
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);

scene.add(cube);

// 开始渲染
renderer.render(scene, camera);

// 设置相机绕着 y 轴运动
let angle = 0;
function animate() {
  requestAnimationFrame(animate);

  const radius = 5;
  angle += 0.01;
  /**
   * 三角函数知识点
   *  sin(角度) = 对边/斜边
   *  cos(角度) = 邻边/斜边
   *  现在知道角度和半径，就可以计算出相机的位置了
   *  相机的位置就是 x = 半径 * cos(角度)，z = 半径 * sin(角度)
   */
  camera.position.x = radius * Math.cos(angle);
  camera.position.z = radius * Math.sin(angle);
  camera.lookAt(0, 0, 0); // 摄像机视点

  // 渲染场景
  renderer.render(scene, camera);
}
animate();
