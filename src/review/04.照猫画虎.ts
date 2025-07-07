import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";
import * as CANNON from "cannon";
import texture from "../assets/image/grid/Net004A_1K-JPG_Opacity.jpg";

abstract class Entity {
  mesh: THREE.Object3D;
  body: CANNON.Body;
  constructor(mesh: THREE.Object3D, body: CANNON.Body) {
    this.mesh = mesh;
    this.body = body;
  }

  // 同步物理与渲染
  sync() {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }
}

class Plantform extends Entity {
  material: CANNON.Material;
  constructor(size: CANNON.Vec3, position: THREE.Vector3, color: THREE.Color) {
    /* Mesh */
    const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mat = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);

    /* Body */
    const material = new CANNON.Material(`platform-${Math.random()}`);
    const halfSize = new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2);
    const shape = new CANNON.Box(halfSize);
    const body = new CANNON.Body({
      mass: 0,
      shape,
      material,
    });
    body.position.set(position.x, position.y, position.z);
    mesh.position.copy(position);
    super(mesh, body);
    this.material = material;
  }

  rotateY(angle: number) {
    this.mesh.rotateY(angle);
    const q = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      angle
    );
    const cannonQuat = new CANNON.Quaternion(q.x, q.y, q.z, q.w);
    this.body.quaternion = this.body.quaternion.mult(cannonQuat);
  }
}

class Ball extends Entity {
  material: CANNON.Material;
  constructor(
    radius: number,
    color: THREE.Color,
    position: THREE.Vector3,
    force: CANNON.Vec3,
    localPoint: CANNON.Vec3
  ) {
    /* Mesh */
    const textureLoader = new THREE.TextureLoader();
    const map = textureLoader.load(texture);
    const geo = new THREE.SphereGeometry(radius, 32, 32);
    const mat = new THREE.MeshBasicMaterial({ color, map });
    const mesh = new THREE.Mesh(geo, mat);

    /* Body */
    const material = new CANNON.Material(`ball-${Math.random()}`);
    const shape = new CANNON.Sphere(1);
    const body = new CANNON.Body({
      mass: 1,
      shape,
      material,
      linearDamping: 0.01,
    });

    body.position.set(position.x, position.y, position.z);
    mesh.position.copy(body.position);
    body.applyLocalForce(force, localPoint);
    super(mesh, body);
    this.material = material;
  }
}

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

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    this.scene.add(new THREE.DirectionalLight(0xffffff, 0.5));
    this.scene.add(new THREE.GridHelper(100, 100));
  }

  private initPhysics() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);
  }

  contactMaterial(
    a: CANNON.Material,
    b: CANNON.Material,
    options: CANNON.IContactMaterialOptions
  ) {
    this.world.addContactMaterial(new CANNON.ContactMaterial(a, b, options));
  }

  addEntity(...entity: Entity[]) {
    entity.forEach((e) => {
      this.entities.push(e);
      this.scene.add(e.mesh);
      this.world.addBody(e.body);
    });
  }

  private loop = () => {
    requestAnimationFrame(this.loop);
    this.world.step(1 / 60);
    this.controls.update();
    this.entities.forEach((e) => {
      if (e instanceof Plantform) {
        e.rotateY(0.01);
      }
    });
    this.entities.forEach((e) => e.sync());

    this.renderer.render(this.scene, this.camera);
  };
  start() {
    this.loop();
  }
}

const game = new Game();

/* 实例化实体 */
const platform1 = new Plantform(
  new CANNON.Vec3(30, 1, 30),
  new THREE.Vector3(0, 1, 0),
  new THREE.Color(0x4caf50)
);
const platform2 = new Plantform(
  new CANNON.Vec3(15, 1, 15),
  new THREE.Vector3(0, 5, 0),
  new THREE.Color(0x90caf9)
);

const q = new THREE.Quaternion().setFromAxisAngle(
  new THREE.Vector3(0, 1, 0),
  Math.PI / 2
)

platform1.mesh.quaternion.copy(q);

const ball1 = new Ball(
  1,
  new THREE.Color(0xff5722),
  new THREE.Vector3(0, 10, 0),
  new CANNON.Vec3(Math.random() * 1000, 0, 0),
  new CANNON.Vec3(Math.random(), Math.random(), Math.random())
);
const ball2 = new Ball(
  1,
  new THREE.Color(0xdea223),
  new THREE.Vector3(-5, 10, 0),
  new CANNON.Vec3(Math.random() * 1000, 0, 0),
  new CANNON.Vec3(Math.random(), Math.random(), Math.random())
);

[
  [platform1, ball1],
  [platform2, ball1],
  [platform1, ball2],
  [platform2, ball2],
].forEach(([a, b]) =>
  game.contactMaterial(a.material, b.material, {
    friction: 0.5,
    restitution: 0.7,
  })
);
game.addEntity(platform1, platform2, ball1, ball2);

game.start();
