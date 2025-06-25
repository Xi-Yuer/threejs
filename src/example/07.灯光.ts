import * as THREE from "three";

(function () {
  const csv = document.createElement("canvas");
  csv.id = "cvs";
  csv.width = 1000;
  csv.height = 1000;
  document.body.appendChild(csv);
})();
function main() {
  const canvas = document.querySelector("#cvs")!;
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  const fov = 75;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;

  const scene = new THREE.Scene();

  {
    const color = 0xffffff;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 }); // greenish blue

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  function render() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
