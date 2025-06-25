import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import baseTexture from "../assets/image/route/Rocks004_1K-JPG_Color.jpg";
import ambienOcclusion from "../assets/image/route/Rocks004_1K-JPG_AmbientOcclusion.jpg";
import displacement from "../assets/image/route/Rocks004_1K-JPG_Displacement.jpg";
import normal from "../assets/image/route/Rocks004_1K-JPG_NormalDX.jpg";
import roughness from "../assets/image/route/Rocks004_1K-JPG_Roughness.jpg";
import earth from "../assets/image/earth/world.200409.3x21600x10800.jpg";

(function () {
  const canvas = document.createElement("canvas");
  canvas.id = "cvs";
  canvas.width = 1000;
  canvas.height = 1000;
  document.body.appendChild(canvas);
})();

const canvas = document.getElementById("cvs") as HTMLCanvasElement;
const loader = new THREE.TextureLoader();
const scene = new THREE.Scene();
let orbitControl: OrbitControls;

const camera = new THREE.PerspectiveCamera(
  75,
  canvas.width / canvas.height,
  0.1,
  1000
);
camera.position.z = 10;
camera.position.y = 20;
camera.position.x = 0;

// 相机轨道控制
{
  orbitControl = new OrbitControls(camera, canvas);
  orbitControl.enableDamping = true; // 启用阻尼
  orbitControl.dampingFactor = 0.05; // 阻尼惯性
}

// 物体
{
  const gridhelper = new THREE.GridHelper(100, 10, 0x00ff00, 0x0000ff);
  const geometry = new THREE.SphereGeometry(5, 64, 64); // 半径、水平分割数、垂直分割数
  const plan = new THREE.PlaneGeometry(20, 20);
  geometry.setAttribute(
    "uv2",
    new THREE.BufferAttribute(geometry.attributes.uv.array, 2)
  );

  const baseMap = loader.load(baseTexture);
  baseMap.wrapS = THREE.RepeatWrapping;
  baseMap.wrapT = THREE.RepeatWrapping;
  baseMap.repeat.set(20, 20);

  const aoMap = loader.load(ambienOcclusion);
  aoMap.wrapS = THREE.RepeatWrapping;
  aoMap.wrapT = THREE.RepeatWrapping;
  aoMap.repeat.set(20, 20);

  const displacementMapTex = loader.load(displacement);
  displacementMapTex.wrapS = THREE.RepeatWrapping;
  displacementMapTex.wrapT = THREE.RepeatWrapping;
  displacementMapTex.repeat.set(20, 20);

  const normalMapTex = loader.load(normal);
  normalMapTex.wrapS = THREE.RepeatWrapping;
  normalMapTex.wrapT = THREE.RepeatWrapping;
  normalMapTex.repeat.set(20, 20);

  const roughnessMapTex = loader.load(roughness);
  roughnessMapTex.wrapS = THREE.RepeatWrapping;
  roughnessMapTex.wrapT = THREE.RepeatWrapping;
  roughnessMapTex.repeat.set(20, 20);

  const material = new THREE.MeshStandardMaterial({
    map: baseMap,
    aoMap: aoMap,
    displacementMap: displacementMapTex,
    displacementScale: 1,
    normalMap: normalMapTex,
    roughnessMap: roughnessMapTex,
    metalness: 0.2,
    roughness: 1.0,
  });
  const earthMaterail = new THREE.MeshPhongMaterial({
    map: loader.load(earth),
    color: 0xffffff,
  });
  const cube = new THREE.Mesh(plan, material);
  const sphere = new THREE.Mesh(geometry, earthMaterail);
  cube.rotation.x = -Math.PI / 2;
  sphere.position.set(0, 6, 0);

  scene.add(cube, sphere, gridhelper);
}

// 灯光
{
  // const ambientLight = new THREE.AmbientLight(0xffffff);
  // const directionalLight = new THREE.DirectionalLight(0xffffff);
  // const directionHelper = new THREE.DirectionalLightHelper(directionalLight); // 方向光辅助
  // directionalLight.position.set(10, 10, 0);
  // directionalLight.target.position.set(0, 0, 0);
  // scene.add(ambientLight, directionalLight, directionHelper);

  // 点光源
  const pointLight = new THREE.PointLight(0xffffff, 300, 1000, 10); // 颜色，强度，距离，衰减
  pointLight.castShadow = true; // 允许产生阴影
  const lightHelper = new THREE.PointLightHelper(pointLight);
  pointLight.position.set(0, 15, 0);
  scene.add(pointLight, lightHelper);

  // 环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 4);
  scene.add(ambientLight);
}

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
function render() {
  orbitControl.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();
