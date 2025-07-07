import * as THREE from 'three';

class Player {
    mesh: THREE.Mesh;
    dir = 0;
    speed = 0.3;

    constructor() {
        const box = new THREE.BoxGeometry(2, 2, 2);
        const mat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(box, mat);
        this.mesh.position.y = 1;
    }

    getForwardVector() {
        return new THREE.Vector3(Math.sin(this.dir), 0, Math.cos(this.dir));
    }

    private willCollide(nextPos: THREE.Vector3, obstacles: THREE.Object3D[]): boolean {
        const size = 2;
        const playerBox = new THREE.Box3().setFromCenterAndSize(
            nextPos.clone().add(new THREE.Vector3(0, size / 2, 0)),
            new THREE.Vector3(size, size, size)
        );
        for (const obs of obstacles) {
            const obsBox = new THREE.Box3().setFromObject(obs);
            if (playerBox.intersectsBox(obsBox)) {
                return true;
            }
        }
        return false;
    }

    update(keys: Record<string, boolean>, obstacles: THREE.Object3D[]): void {
        const nextPos = this.mesh.position.clone();

        // 旋转方向
        if (keys['KeyA']) this.dir += 0.05;
        if (keys['KeyD']) this.dir -= 0.05;

        const forward = this.getForwardVector();

        if (keys['KeyW']) nextPos.add(forward.clone().multiplyScalar(this.speed));
        if (keys['KeyS']) nextPos.add(forward.clone().multiplyScalar(-this.speed));

        // 碰撞检测，通过后才更新位置
        if (!this.willCollide(nextPos, obstacles)) {
            this.mesh.position.copy(nextPos);
        }

        this.mesh.rotation.y = -this.dir;
    }
}

class App {
    scene!: THREE.Scene;
    camera!: THREE.PerspectiveCamera;
    renderer!: THREE.WebGLRenderer;
    entity!: THREE.Object3D;
    player!: Player;
    obstacles: THREE.Mesh[] = [];
    keys: Record<string, boolean> = {};
    constructor() {
        this.initScene();
    }

    private initScene() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
        this.camera.position.set(0, 10, 30);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        this.scene.add(new THREE.DirectionalLight(0xffffff, 0.5));

        this.player = new Player();
        this.scene.add(this.player.mesh);

        for (let i = 0; i < 50; i++) {
            const w = THREE.MathUtils.randFloat(2, 6);
            const h = THREE.MathUtils.randFloat(1, 4);
            const d = THREE.MathUtils.randFloat(2, 6);
            const x = THREE.MathUtils.randFloatSpread(80);
            const z = THREE.MathUtils.randFloatSpread(80);
            if (Math.hypot(x, z) < 5) continue; // 避免出生点过近
            const box = new THREE.Mesh(
                new THREE.BoxGeometry(w, h, d),
                new THREE.MeshStandardMaterial({ color: 0x3333ff })
            );
            box.position.set(x, h / 2, z);
            box.castShadow = true;
            this.scene.add(box);
            this.obstacles.push(box);
        }

        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshStandardMaterial({ color: 0x4caf50 })
        );
        mesh.rotation.x = -Math.PI / 2;
        this.scene.add(mesh);

        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    private cameraFollowPlayer() {
        const forward = this.player.getForwardVector();
        const offset = forward.clone().multiplyScalar(-10).add(new THREE.Vector3(0, 5, 0));
        const target = this.player.mesh.position.clone().add(offset);
        this.camera.position.lerp(target, 0.1);
        this.camera.lookAt(this.player.mesh.position);
    }

    loop() {
        requestAnimationFrame(() => this.loop());
        this.player.update(this.keys, this.obstacles);
        this.cameraFollowPlayer();
        this.renderer.render(this.scene, this.camera);
    }
    start() {
        this.loop();
    }
}

const app = new App();
app.start();
