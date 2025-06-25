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

// 创建出来的物体位置默认是原点位置，这里物体的位置和相机在同一个位置，如果不移动物体的位置的话，物体是没有出现在摄像机的视角范围内的，所以看不到物体

// 设置相机的位置
camera.position.z = 2; // z轴
camera.position.y = 0; // x轴

// camera.position.set(x,y,z) // 相机位置

// 设置相机的朝向
camera.lookAt(0, 0, 0); // 设置相机的朝向,分别为x,y,z轴
// 创建一个渲染器
const renderer = new THREE.WebGLRenderer();

// 设置渲染器的尺寸,指的是画布的宽高
renderer.setSize(window.innerWidth, window.innerHeight);

// 把渲染器添加到画布中
document.body.appendChild(renderer.domElement);

// 更改场景的背景色，默认是黑色
// scene.background = new THREE.Color(0xc8910b1);
// scene.background = new THREE.Color("rgb(176, 240, 175)"); // 颜色背景

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

function animate() {
  requestAnimationFrame(animate);

  // 旋转立方体
  cube.rotation.x += 0.01;
  cube.rotation.z += 0.01;

  // 渲染场景
  renderer.render(scene, camera);
}
animate();
