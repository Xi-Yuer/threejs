import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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

  const gridHelper = new THREE.GridHelper(50, 50);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { canvas, scene, renderer, camera, controls, gridHelper };
}

function main() {
  const { scene, renderer, camera, controls, gridHelper } = init();
  const pointPosition = new THREE.Vector3(1, 10, 1);

  const geo = new THREE.SphereGeometry(3, 32, 32);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true,
  });
  const mesh = new THREE.Mesh(geo, mat);

  mesh.position.copy(pointPosition);
  scene.add(mesh);
  scene.add(gridHelper);

  function render() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
}

main();
