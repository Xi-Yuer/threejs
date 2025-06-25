import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import texture from "../assets/image/earth.jpg";

// 初始化 Canvas
const canvas = document.createElement("canvas");
canvas.id = "cvs";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

// 初始化 Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;

// 初始化 Scene、Camera、Controls
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcccccc);
const camera = new THREE.PerspectiveCamera(
  75,
  canvas.width / canvas.height,
  0.1,
  1000
);
camera.position.set(0, 5, 20);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const loader = new THREE.TextureLoader();

// Axes Helper
scene.add(new THREE.AxesHelper(5));

// 灯光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(30, 10, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
scene.add(ambientLight, directionalLight);

// 地面 - Three
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -Math.PI / 2;
planeMesh.receiveShadow = true;
scene.add(planeMesh);

// 地面 - Cannon
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
const planePhysMat = new CANNON.Material("ground");
const spherePhysMat = new CANNON.Material("sphere");

// 显示指定地面材质与球体材质的碰撞效果
world.addContactMaterial(
  new CANNON.ContactMaterial(planePhysMat, spherePhysMat, {
    friction: 0.4,
    restitution: 0.2,
  })
);

// 显示指定球体材质与球体材质的碰撞效果
world.addContactMaterial(
  new CANNON.ContactMaterial(spherePhysMat, spherePhysMat, {
    friction: 0.4,
    restitution: 0.6,
  })
);

const planeBody = new CANNON.Body({
  mass: 0,
  shape: new CANNON.Plane(),
  material: planePhysMat,
});
planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // 旋转平面
world.addBody(planeBody);

// 小球实体列表
const sphereMeshList: THREE.Mesh[] = []; //  小球物理列表
const sphereBodyList: CANNON.Body[] = []; // 小球渲染列表

// 材质
const spherePhysMaterial = new THREE.MeshBasicMaterial({
  map: loader.load(texture),
});

// 鼠标点击生成小球
canvas.addEventListener("click", (e: MouseEvent) => {
  // 1. 获取鼠标点击点在地面上的三维坐标
  const mouse = new THREE.Vector2(
    (e.clientX / canvas.clientWidth) * 2 - 1,
    -(e.clientY / canvas.clientHeight) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(planeMesh);

  if (intersects.length === 0) return;

  const targetPoint = intersects[0].point; // 鼠标点在地面的世界坐标
  // 2. 球的初始位置（鼠标点击位置）
  const startPosition = new THREE.Vector3(
    targetPoint.x,
    targetPoint.y,
    targetPoint.z
  );

  // 3. 球飞行方向（从摄像机 → 鼠标点击点）
  const direction = new THREE.Vector3()
    .subVectors(targetPoint, startPosition)
    .normalize();

  // 4. 创建 Three.js 球体
  const radius = 1;
  const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
  const sphereMesh = new THREE.Mesh(sphereGeo, spherePhysMaterial);
  sphereMesh.castShadow = true;
  sphereMesh.position.copy(startPosition);
  scene.add(sphereMesh);

  // 5. 创建 Cannon.js 刚体并施加初速度
  const sphereBody = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Sphere(radius),
    material: spherePhysMat,
    position: new CANNON.Vec3(
      startPosition.x,
      startPosition.y,
      startPosition.z
    ),
  });

  const launchSpeed = 10;
  sphereBody.velocity.set(
    direction.x * launchSpeed,
    direction.y * launchSpeed,
    direction.z * launchSpeed
  );

  // 添加力
  sphereBody.applyLocalForce(
    new CANNON.Vec3(100, 0, 0), // 施加力:表示往右推
    new CANNON.Vec3(1, 1, 1) // 质点:力作用在物体的t质点
  );

  world.addBody(sphereBody);

  // 6. 存入同步队列
  sphereMeshList.push(sphereMesh);
  sphereBodyList.push(sphereBody);
});

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  world.step(1 / 60);

  // 同步所有球体位置
  for (let i = 0; i < sphereMeshList.length; i++) {
    sphereMeshList[i].position.copy(
      sphereBodyList[i].position as unknown as THREE.Vector3
    );
    sphereMeshList[i].quaternion.copy(
      sphereBodyList[i].quaternion as unknown as THREE.Quaternion
    );
  }

  renderer.render(scene, camera);
}

animate();
