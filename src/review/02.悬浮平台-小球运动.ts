import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
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
  renderer.setPixelRatio(window.devicePixelRatio); // ✅ 提升渲染性能
  renderer.setSize(window.innerWidth, window.innerHeight);

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

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { canvas, scene, renderer, camera, controls };
}

function createWorld() {
  const world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);
  return world;
}

function createBodyBox(width: number, height: number, depth: number) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshBasicMaterial({
    color: Math.random() * 0xffffff,
  });
  const mesh = new THREE.Mesh(geometry, material);

  const boxShape = new CANNON.Box(
    new CANNON.Vec3(width / 2, height / 2, depth / 2)
  );
  const bodyBoxMaterial = new CANNON.Material("box");

  const bodyBox = new CANNON.Body({
    mass: 0,
    shape: boxShape,
    material: bodyBoxMaterial,
  });

  bodyBox.position.y = 5;
  mesh.position.copy(bodyBox.position);
  mesh.quaternion.copy(bodyBox.quaternion);

  return {
    mesh,
    bodyBox,
    bodyBoxMaterial,
  };
}

function createBall(radius: number) {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(texture),
  });
  const mesh = new THREE.Mesh(geometry, material);

  const body = new CANNON.Sphere(radius);
  const bodyBallMaterial = new CANNON.Material("ball");
  const bodyBall = new CANNON.Body({
    mass: 1,
    shape: body,
    material: bodyBallMaterial,
  });

  bodyBall.linearDamping = 0.01;
  bodyBall.position.y = 15;

  // 给球体初速度
  bodyBall.applyLocalForce(
    new CANNON.Vec3(200, 200, 100),
    new CANNON.Vec3(0, 1, 0)
  );

  mesh.position.copy(bodyBall.position);

  return {
    mesh,
    bodyBall,
    bodyBallMaterial,
  };
}

function createGridHelper() {
  return new THREE.GridHelper(100, 100);
}

function main() {
  const { scene, renderer, camera, controls } = init();
  const world = createWorld();

  scene.add(createGridHelper());

  const { mesh: planMesh, bodyBox, bodyBoxMaterial } = createBodyBox(15, 1, 15);
  const {
    mesh: planMesh2,
    bodyBox: bodyBox2,
    bodyBoxMaterial: bodyBoxMaterial2,
  } = createBodyBox(40, 1, 40);

  bodyBox2.position.y = 1;
  planMesh2.position.copy(bodyBox2.position);

  const { mesh: ballMesh, bodyBall, bodyBallMaterial } = createBall(1);

  // ✅ 添加所有可能的 ContactMaterial 组合
  const contactMaterials = [
    [bodyBoxMaterial, bodyBallMaterial], // 盒子1-球体
    [bodyBoxMaterial2, bodyBallMaterial], // 盒子2-球体
  ];

  contactMaterials.forEach(([matA, matB]) => {
    const cm = new CANNON.ContactMaterial(matA, matB, {
      friction: 0.2,
      restitution: 0.9,
    });
    world.addContactMaterial(cm);
  });

  world.addBody(bodyBox);
  world.addBody(bodyBox2);
  world.addBody(bodyBall);

  scene.add(planMesh, planMesh2, ballMesh);

  function render() {
    world.step(1 / 60);
    ballMesh.position.copy(bodyBall.position);
    ballMesh.quaternion.copy(bodyBall.quaternion);
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
}

main();
