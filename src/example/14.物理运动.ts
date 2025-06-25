import * as THREE from "three";
import * as CANNON from "cannon"; // 物理引擎
import textureMap from "../assets/image/earth/夜景地球16384x8192.jpg";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

(function () {
  const canvas = document.createElement("canvas");
  canvas.id = "cvs";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
})();

const canvas = document.getElementById("cvs") as HTMLCanvasElement;
const scene = new THREE.Scene();
const loader = new THREE.TextureLoader();
scene.castShadow = true;
scene.background = new THREE.Color(0xcccccc);
let orbitControl: OrbitControls;

const camera = new THREE.PerspectiveCamera(
  75,
  canvas.width / canvas.height,
  0.1,
  1000
);
camera.position.z = 20;
camera.position.y = 1;

// 相机轨道控制
{
  orbitControl = new OrbitControls(camera, canvas);
  orbitControl.enableDamping = true; // 启用阻尼
  orbitControl.dampingFactor = 0.05; // 阻尼惯性
}

{
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
}


// 灯光
{
  const ambientLight = new THREE.DirectionalLight(0xffffff, 1);
  const directionalLight = new THREE.AmbientLight(0xffffff, 0.3);
  ambientLight.position.set(30, 5, 0);
  ambientLight.castShadow = true;
  ambientLight.shadow.mapSize.set(1024, 1024);
  ambientLight.rotation.x = Math.PI / 2;
  scene.add(ambientLight, directionalLight);
}

const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const sphereMaterial = new THREE.MeshStandardMaterial({
  map: loader.load(textureMap),
});
const planeMaterial = new THREE.MeshPhongMaterial({
  color: 0xffffff,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true;
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.castShadow = true;

plane.rotation.x = -Math.PI / 2;
sphere.position.y = 10;
sphere.position.x = -10;
scene.add(plane, sphere);

// 创建物理世界，在世界中的物体都会有现实中的物理属性，比如重力、弹性、摩擦力
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // 设置重力,分别为x、y、z轴的重力大小，现实生活中重力大小为9.8m/s2

// 创建物理材质
const planeWorldMaterial = new CANNON.Material("planeMaterial"); // 地面
const sphereWorldMaterial = new CANNON.Material("sphereMaterial"); // 球体

// 说明两个物理材质之间的碰撞属性
const planeSphereContactMaterial = new CANNON.ContactMaterial(
  planeWorldMaterial,
  sphereWorldMaterial,
  { friction: 0.7, restitution: 0.7 } // 摩擦系数(0-1)，弹力系数(0-1)
); // 碰撞材质

// 将材质添加到物理世界，以便 cannon.js 可以根据材质属性计算碰撞
world.addContactMaterial(planeSphereContactMaterial);

// 创建物理刚体地面
const planeBody = new CANNON.Body({
  mass: 0, // 质量为0，表示这个物体是固定的，不能移动
  shape: new CANNON.Plane(),
  material: planeWorldMaterial, // 设置物理材质
});
planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2); // 设置旋转

// 创建物理球体
const sphereBody = new CANNON.Body({
  mass: 1, // 质量
  shape: new CANNON.Sphere(1),
  position: new CANNON.Vec3(-10, 10, 0), // 设置位置
  material: sphereWorldMaterial,
  velocity: new CANNON.Vec3(0, 0, 0), // 设置初始速度
  // linearDamping 表示物体在运动过程中因空气、流体等介质产生的线性速度衰减，属于非接触型阻力。
  linearDamping: 0.2, // 线性阻力，范围 0 ~ 1，建议 0.01~0.2
});
// sphereBody.position.set(-10, 10, 0); // 设置初始位置
sphereBody.applyLocalForce(
  new CANNON.Vec3(100, 0, 0), // 施加力:表示往右推
  new CANNON.Vec3(1, 1, 1) // 质点:力作用在物体的t质点
);

world.addBody(planeBody); // 添加刚体
world.addBody(sphereBody); // 添加刚体

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});

renderer.shadowMap.enabled = true;

function render() {
  orbitControl.update();
  world.step(1 / 60); // 每帧调用一次，用于模拟物理世界，更新模拟结果
  sphere.position.copy(sphereBody.position); // 模拟结果更新球体位置
  sphere.quaternion.copy(sphereBody.quaternion); // 模拟结果更新球体旋转
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();

/**
 * ✅ 最小可运行逻辑总结
*  // 1. 定义材质
    const matA = new CANNON.Material("A");
    const matB = new CANNON.Material("B");

    // 2. 定义它们之间的碰撞行为
    const contactAB = new CANNON.ContactMaterial(matA, matB, {
    friction: 0.5,
    restitution: 0.1,
    });
    world.addContactMaterial(contactAB);

    // 3. 应用到刚体
    const bodyA = new CANNON.Body({ mass: 0, shape: ..., material: matA });
    const bodyB = new CANNON.Body({ mass: 5, shape: ..., material: matB });

    world.addBody(bodyA);
    world.addBody(bodyB);

    // 同步物理状态 → Three.js 模型
    world.step(1 / 60); // 推进物理时间
    sphere.position.copy(sphereBody.position);
    sphere.quaternion.copy(sphereBody.quaternion);
 */
