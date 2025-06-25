import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

(function () {
  const canvas = document.createElement("canvas");
  canvas.id = "cvs";
  canvas.width = 1000;
  canvas.height = 1000;
  document.body.appendChild(canvas);
})();

const canvas = document.getElementById("cvs") as HTMLCanvasElement;
const scene = new THREE.Scene();
let orbitControl: OrbitControls;

const camera = new THREE.PerspectiveCamera(
  75,
  canvas.width / canvas.height,
  0.1,
  1000
);
camera.position.z = 10;
camera.position.y = 10;
camera.position.x = 0;

// 相机轨道控制
{
  orbitControl = new OrbitControls(camera, canvas);
  orbitControl.enableDamping = true; // 启用阻尼
  orbitControl.dampingFactor = 0.05; // 阻尼惯性
}

// 物体
// {
const planeGeo = new THREE.PlaneGeometry(10, 10);
const boxGeo = new THREE.BoxGeometry(1, 1, 1);

const planMaterial = new THREE.MeshStandardMaterial({
  color: 0x00cf76,
  side: THREE.DoubleSide, // 双面:用于创建双面材质
});
const boxMaterial = new THREE.MeshStandardMaterial({
  color: 0x999999,
  side: THREE.DoubleSide, // 双面:用于创建双面材质
});

const planeMesh = new THREE.Mesh(planeGeo, planMaterial);
const boxMesh = new THREE.Mesh(boxGeo, boxMaterial);
planeMesh.receiveShadow = true;
boxMesh.castShadow = true;
planeMesh.rotateX(-Math.PI / 2);
boxMesh.position.set(0, 1, 0);
scene.add(planeMesh, boxMesh);
// }

// 光源
{
  const pointLight = new THREE.DirectionalLight(0xffffff, 1);
  const pointLightHelper = new THREE.DirectionalLightHelper(pointLight);
  pointLight.castShadow = true; // 允许阴影
  pointLight.shadow.mapSize.set(1024, 1024); // 设置阴影贴图的分辨率

  pointLight.position.set(5, 5, 0);
  pointLight.rotation.z = -45;

  /**
   *    new PointLight(color, intensity, distance, decay)
   *    color -（可选）一个表示颜色的 Color 的实例、字符串或数字，默认为一个白色（0xffffff）的 Color 对象。
        intensity -（可选）光照强度。默认值为 1。
        distance - 光源照射的最大距离。默认值为 0（无限远）。
        decay - 沿着光照距离的衰退量。默认值为 2。
   */
  const directionalLight = new THREE.PointLight(0xffffff, 200, 100, 2);
  const directionalLightHelper = new THREE.PointLightHelper(directionalLight);
  directionalLight.shadow.mapSize.set(1024, 1024); // 设置阴影贴图的分辨率
  directionalLight.position.set(0, 5, 0);
  directionalLight.castShadow = true; // 允许产生阴影

  scene.add(
    directionalLight,
    pointLight,
    directionalLightHelper,
    pointLightHelper
  );

  let angle = 360;
  function animate() {
    requestAnimationFrame(animate);
    // 修改灯光位置，模拟日出日落
    directionalLight.position.x = Math.sin(angle) * 8;
    directionalLight.position.z = Math.cos(angle) * 5;
    angle === 360 ? (angle = 0) : (angle -= 0.01);
    directionalLight.lookAt(0, 0, 0);
  }

  animate();
}

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.shadowMap.enabled = true; // 添加阴影
function render() {
  orbitControl.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();
