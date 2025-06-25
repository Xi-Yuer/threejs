import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import earthMapTexture from "../assets/image/earth/world.200410.3x21600x10800.jpg";
import baseTexture from "../assets/image/route/Rocks004_1K-JPG_Color.jpg";
import ambienOcclusion from "../assets/image/route/Rocks004_1K-JPG_AmbientOcclusion.jpg";
import displacement from "../assets/image/route/Rocks004_1K-JPG_Displacement.jpg";
import normal from "../assets/image/route/Rocks004_1K-JPG_NormalDX.jpg";
import roughness from "../assets/image/route/Rocks004_1K-JPG_Roughness.jpg";

// 创建 canvas
const canvas = document.createElement("canvas");
canvas.id = "cvs";
document.body.appendChild(canvas);

// 场景、相机、控制器
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.set(0, 10, 10);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 渲染器配置
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
resizeRenderer();

// 更新渲染器尺寸
function resizeRenderer() {
  const size = Math.min(window.innerWidth, window.innerHeight);
  canvas.width = size;
  canvas.height = size;
  renderer.setSize(size, size);
  camera.aspect = size / size;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resizeRenderer);

// Helper
scene.add(new THREE.AxesHelper(5), new THREE.GridHelper(20, 20));

// 纹理统一加载
const textureLoader = new THREE.TextureLoader();
const textureMap = {
  base: textureLoader.load(baseTexture),
  ao: textureLoader.load(ambienOcclusion),
  disp: textureLoader.load(displacement),
  normal: textureLoader.load(normal),
  roughness: textureLoader.load(roughness),
  earth: textureLoader.load(earthMapTexture),
};

// 地球
const earth = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshPhongMaterial({ map: textureMap.earth })
);
earth.castShadow = true;
earth.position.set(0, 3, 0);
scene.add(earth);

// 地面
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    map: textureMap.base,
    aoMap: textureMap.ao,
    displacementMap: textureMap.disp,
    displacementScale: 0.2,
    normalMap: textureMap.normal,
    roughnessMap: textureMap.roughness,
  })
);
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
plane.position.y = 1;
scene.add(plane);

// 太阳
const sunMesh = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshStandardMaterial({
    color: 0xed732e,
    emissive: 0xed732e,
    emissiveIntensity: 5,
    metalness: 0.5,
    roughness: 0.3,
  })
);
sunMesh.position.set(0, 8, 0);
scene.add(sunMesh);

// 灯光
const ambiLight = new THREE.AmbientLight(0xffffff, 1.5);
const pointLight = new THREE.PointLight(0xffffff, 30, 0, 1.5);
pointLight.castShadow = true;
pointLight.shadow.mapSize.set(512, 512);
scene.add(ambiLight, pointLight);
const pointLightHelper = new THREE.PointLightHelper(pointLight);
scene.add(pointLightHelper);

// 主动画循环
function animate() {
  requestAnimationFrame(animate);

  // 地球自转
  earth.rotation.y += 0.005;

  // 太阳及光源围绕场景旋转
  const t = Date.now() * 0.001;
  const x = Math.sin(t) * 5;
  const z = Math.cos(t) * 5;
  sunMesh.position.set(x, 8, z);
  sunMesh.lookAt(0, 0, 0);
  pointLight.position.copy(sunMesh.position);
  pointLightHelper.update();

  controls.update();
  renderer.render(scene, camera);
}

animate();
