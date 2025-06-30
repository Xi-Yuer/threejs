/**
 * 03.悬浮平台-小球运动-OOP.ts
 * 面向对象版本：Entity 抽象、子类化实体、Game 控制器
 */
import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import textureImg from "../assets/image/grid/Net004A_1K-JPG_Opacity.jpg";

/* ---------- 抽象基类 ---------- */
abstract class Entity {
  mesh: THREE.Object3D;
  body: CANNON.Body;

  constructor(mesh: THREE.Object3D, body: CANNON.Body) {
    this.mesh = mesh;
    this.body = body;
  }

  /** 每帧同步物理与渲染 */
  sync() {
    this.mesh.position.copy(this.body.position as any);
    this.mesh.quaternion.copy(this.body.quaternion as any);
  }
}

/* ---------- 具体实体 ---------- */
class Platform extends Entity {
  static materialCounter = 0;
  material: CANNON.Material;

  constructor(size: THREE.Vector3, y = 0, color = 0xffffff) {
    /* Mesh */
    const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mat = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, y, 0);

    /* Body */
    const shape = new CANNON.Box(
      new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)
    );
    const material = new CANNON.Material(
      `platform-${Platform.materialCounter++}`
    );
    const body = new CANNON.Body({ mass: 0, shape, material });
    body.position.set(0, y, 0);

    super(mesh, body);
    this.material = material;
  }
}

class Ball extends Entity {
  material: CANNON.Material;

  constructor(radius: number, startY = 15) {
    /* Mesh */
    const geo = new THREE.SphereGeometry(radius, 32, 32);
    const tex = new THREE.TextureLoader().load(textureImg);
    const mat = new THREE.MeshBasicMaterial({ map: tex });
    const mesh = new THREE.Mesh(geo, mat);

    /* Body */
    const shape = new CANNON.Sphere(radius);
    const material = new CANNON.Material("ball");
    const body = new CANNON.Body({
      mass: 1,
      shape,
      material,
      linearDamping: 0.01,
    });
    body.position.set(0, startY, 0);
    body.applyLocalForce(
      new CANNON.Vec3(210, 0, 0),
      new CANNON.Vec3(0, -1, 0)
    );

    super(mesh, body);
    this.material = material;
  }
}

/* ---------- 游戏控制器 ---------- */
class Game {
  scene!: THREE.Scene;
  renderer!: THREE.WebGLRenderer;
  camera!: THREE.PerspectiveCamera;
  controls!: OrbitControls;
  world!: CANNON.World;
  entities: Entity[] = [];

  constructor() {
    this.initScene();
    this.initPhysics();
  }

  /* ---------- 初始化视图 ---------- */
  private initScene() {
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xe1e1e2);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 10, 30);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;

    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    this.scene.add(new THREE.GridHelper(100, 100));
  }

  /* ---------- 初始化物理 ---------- */
  private initPhysics() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);
  }

  /* ---------- 实体注册 ---------- */
  addEntity(e: Entity) {
    this.entities.push(e);
    this.scene.add(e.mesh);
    this.world.addBody(e.body);
  }

  /* ---------- 材质接触配置 ---------- */
  addContact(a: CANNON.Material, b: CANNON.Material, rest = 0.9) {
    this.world.addContactMaterial(
      new CANNON.ContactMaterial(a, b, {
        friction: 0.2,
        restitution: rest,
      })
    );
  }

  /* ---------- 游戏启动 ---------- */
  start() {
    /* 创建实体 */
    const platform1 = new Platform(new THREE.Vector3(15, 1, 15), 5, 0x4caf50);
    const platform2 = new Platform(new THREE.Vector3(50, 1, 40), 1, 0x90caf9);
    const ball = new Ball(1, 15);

    [platform1, platform2, ball].forEach((e) => this.addEntity(e));

    /* 碰撞材质 */
    this.addContact(platform1.material, ball.material);
    this.addContact(platform2.material, ball.material);

    /* 主循环 */
    this.loop();
  }

  private loop = () => {
    requestAnimationFrame(this.loop);
    this.world.step(1 / 60);

    this.entities.forEach((e) => e.sync());

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}

/* ---------- 启动游戏 ---------- */
new Game().start();
