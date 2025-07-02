import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import px from "../assets/image/env/px.jpg";
import nx from "../assets/image/env/nx.jpg";
import py from "../assets/image/env/py.jpg";
import ny from "../assets/image/env/ny.jpg";
import pz from "../assets/image/env/pz.jpg";
import nz from "../assets/image/env/nz.jpg";
// 加载环境贴图（立方体贴图）以作为玻璃的反射环境
// 请将六张贴图放在目录下，文件名分别为 px.jpg, nx.jpg, py.jpg, ny.jpg, pz.jpg, nz.jpg
const envMap = new THREE.CubeTextureLoader().load([px, nx, py, ny, pz, nz]);

function init() {
  const cvs = document.createElement("canvas");
  cvs.id = "cvs";
  cvs.width = window.innerWidth;
  cvs.height = window.innerHeight;
  document.body.appendChild(cvs);

  const canvas = document.getElementById("cvs") as HTMLCanvasElement;
  const scene = new THREE.Scene();
  // 将环境贴图同时用作全局环境光源和背景，以增强玻璃反射效果
  scene.environment = envMap;
  scene.background = envMap;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio); // ✅ 提升渲染性能
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // ✅ 柔和阴影（可选）

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 10, 30);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.03;

  const gridHelper = new THREE.GridHelper(50, 50);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { canvas, scene, renderer, camera, controls, gridHelper };
}

const createGlass = () => {
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
      color: 0x1e1f33,
      envMap,
      envMapIntensity: 1.5,
      roughness: 0,
      opacity: 0.8,
      transparent: true,
      metalness: 0.3,
      side: THREE.DoubleSide,
    })
  );
  glass.castShadow = true;
  glass.position.y = 5;
  glass.rotateX(-Math.PI / 3);

  return { glass };
};

const createlight = () => {
  const light = new THREE.PointLight(0xffffff, 1);
  const lightHelper = new THREE.PointLightHelper(light, 5);
  light.position.set(10, 25, 10);
  light.rotateZ(-Math.PI / 1);
  light.castShadow = true; // ✅ 提升渲染性能
  light.shadow.mapSize.set(1024, 1024); // 提升阴影质量
  return {
    light,
    lightHelper,
  };
};

const createPlane = () => {
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
    })
  );
  plane.rotateX(-Math.PI / 2);
  plane.position.y = -10;
  plane.receiveShadow = true;
  return { plane };
};

function main() {
  const { scene, renderer, camera, controls, gridHelper } = init();
  const { glass } = createGlass();
  const { light, lightHelper } = createlight();
  const { plane } = createPlane();
  light.lookAt(glass.position);
  scene.add(glass, light, lightHelper, plane);

  function render() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
}

main();
