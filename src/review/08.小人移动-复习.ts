import * as THREE from 'three';

class Player {
    mesh: THREE.Mesh;
    dir = 0;
    speed = 0.3;
    constructor() {
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 2),
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
            })
        );
        this.mesh.castShadow = true;
        this.mesh.position.set(0, 1, 0);
    }

    private willCollide(pos: THREE.Vector3, obstacle: THREE.Mesh[]) {
        const size = 2; // 玩家大小
        // 根据位置和玩家大小构建一个矩形，用于判断 obstacle 是否会与玩家发生碰撞
        const rect = new THREE.Box3(
            new THREE.Vector3(pos.x - size / 2, pos.y - size / 2, pos.z - size / 2),
            new THREE.Vector3(pos.x + size / 2, pos.y + size / 2, pos.z + size / 2)
        );
        for (let i = 0; i < obstacle.length; i++) {
            const obs = obstacle[i];
            const obsBox = new THREE.Box3().setFromObject(obs);
            if (rect.intersectsBox(obsBox)) {
                return true;
            }
        }
        return false;
    }

    update(keys: Record<string, boolean>, obstacle: THREE.Mesh[]) {
        const nextPos = this.mesh.position.clone();
        // 旋转方向
        if (keys['KeyA']) this.dir += 0.05;
        if (keys['KeyD']) this.dir -= 0.05;

        const forward = this.getForwardVector();
        if (keys['KeyW']) nextPos.add(forward.clone().multiplyScalar(this.speed))
        if (keys['KeyS']) nextPos.add(forward.clone().multiplyScalar(-this.speed))

        if (!this.willCollide(nextPos, obstacle)) {
            this.mesh.position.copy(nextPos);
        }


        this.mesh.rotation.y = this.dir;
    }

    getForwardVector() {
        return new THREE.Vector3(Math.sin(this.dir), 0, Math.cos(this.dir));
    }

    // 允许外部读取当前朝向角
    get directionAngle() {
        return this.dir;
    }
}



class Game {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private keys: Record<string, boolean> = {};
    private player: Player;
    private obstacles: THREE.Mesh[] = [];

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
        this.camera.position.set(0, 10, 30);

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const light = new THREE.DirectionalLight(0xffffff, 0.5);
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 100),
            new THREE.MeshStandardMaterial
                ({
                    color: 0x4caf50,
                })
        )
        mesh.rotateX(-Math.PI / 2);
        mesh.receiveShadow = true;
        light.position.set(0, 30, 100);
        light.castShadow = true;
        const lightHelper = new THREE.DirectionalLightHelper(light, 5);
        this.scene.add(light, lightHelper, mesh);
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


        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        window.addEventListener("keydown", e => this.keys[e.code] = true)
        window.addEventListener("keyup", e => this.keys[e.code] = false)
    }

    private cameraFollowPlayer() {
        // 基础偏移：后 10、上 5
        const offset = new THREE.Vector3(0, 5, -10);
        // 按角色方向旋转偏移向量
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.directionAngle);
        // 目标位置
        const target = this.player.mesh.position.clone().add(offset);
        // 平滑到目标
        this.camera.position.copy(target);
        // 始终看向角色
        this.camera.lookAt(this.player.mesh.position);
    }

    private loop() {
        requestAnimationFrame(() => this.loop());
        this.player.update(this.keys, this.obstacles);
        this.cameraFollowPlayer();
        this.renderer.render(this.scene, this.camera);
    }

    start() {
        this.loop();
    }
}

new Game().start()
