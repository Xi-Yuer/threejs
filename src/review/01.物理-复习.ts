import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from "three/addons/controls/OrbitControls.js"; // 引入轨道控制器
import texture from "../assets/image/grid/Net004A_1K-JPG_Opacity.jpg";

function init() {
  const cvs = document.createElement("canvas");
  cvs.id = "cvs";
  cvs.width = window.innerWidth;
  cvs.height = window.innerHeight;
  document.body.appendChild(cvs);

  const canvas = document.getElementById("cvs") as HTMLCanvasElement;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe1e1e2);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 30;
  camera.position.y = 10;
  camera.lookAt(0, 0, 0); // 确保相机看向原点

  const controls = new OrbitControls(camera, canvas); // 创建轨道控制器
  controls.enableDamping = true;
  controls.dampingFactor = 0.03;
  controls.update(); // 更新控制器状态

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  return {
    canvas,
    scene,
    renderer,
    camera,
    controls,
  };
}

function createSphereMeshAndBody(size: number, segments: number) {
  // 创建球体
  const geometry = new THREE.SphereGeometry(size, segments, segments);
  const loader = new THREE.TextureLoader();
  const material = new THREE.MeshBasicMaterial({ map: loader.load(texture) });
  const mesh = new THREE.Mesh(geometry, material);

  // 创建刚体物理小球
  const sphereWorldMaterial = new CANNON.Material("sphere");
  const sphereBody = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Sphere(size),
    material: sphereWorldMaterial,
    linearDamping: 0.2, // 线性阻力，范围 0 ~ 1，建议 0.01~0.2
  });

  // 给物理小球设置初始位置
  sphereBody.applyLocalForce(
    new CANNON.Vec3(100, 0, 0),
    new CANNON.Vec3(0, -5, 0)
  );

  return {
    mesh,
    sphereBody,
    sphereWorldMaterial,
  };
}

function createPlaneMeshAndBody(width: number, height: number) {
  const geometry = new THREE.PlaneGeometry(width, height);
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    })
  );
  mesh.rotation.x = -Math.PI / 2; // 调整平面方向

  const planeWorldMaterial = new CANNON.Material("plane");
  const planeBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Plane(),
    material: planeWorldMaterial,
  });

  return {
    mesh,
    planeBody,
    planeWorldMaterial,
  };
}

function createLight() {
  const light = new THREE.AmbientLight(0xffffff);
  return { light };
}

function main() {
  const { scene, renderer, camera, controls } = init();

  const { planeBody, planeWorldMaterial } = createPlaneMeshAndBody(100, 100);
  planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // 让物理平面与 Three.js 平面对齐
  const {
    mesh: sphereMesh,
    sphereBody,
    sphereWorldMaterial,
  } = createSphereMeshAndBody(1, 64);

  sphereBody.position.set(0, 10, 0);
  sphereMesh.position.copy(sphereBody.position);

  const { light } = createLight();

  scene.add(sphereMesh, light);

  const gridHelper = new THREE.GridHelper(100, 100);
  scene.add(gridHelper);

  const planeSphereContactMaterial = new CANNON.ContactMaterial(
    planeWorldMaterial,
    sphereWorldMaterial,
    { friction: 0.1, restitution: 0.7 }
  );

  const world = new CANNON.World();
  world.gravity.set(0, -9.82, 0); // 重力
  world.addContactMaterial(planeSphereContactMaterial);
  world.addBody(planeBody);
  world.addBody(sphereBody);

  function render() {
    world.step(1 / 60);
    sphereMesh.position.copy(sphereBody.position);
    sphereMesh.quaternion.copy(sphereBody.quaternion);
    controls.update(); // 更新控制器
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();
}

main();
