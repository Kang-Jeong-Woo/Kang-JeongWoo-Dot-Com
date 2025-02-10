import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import {
    Clock, Mesh, PerspectiveCamera, Scene, WebGLRenderer
} from "three";
import FollowLights from "./components/env/FollowLights";
import SubParticles from "./components/mainMesh/SubParticles";
import MainMesh from "./components/mainMesh/MainMesh";
import ISizes from "./components/interfaces/ISizes";
import FollowScroll from "./components/env/FollowScroll";
import FollowCursor from "./components/env/FollowCursor";

//TODO
// 1. 각 카메라를 GUI 에 맞춰서 넣어주기
// 2. gsap 을 사용하여 카메라를 욺직여주기
// 3. gsap 과 jeasing 이 어떤 차이점이 있는지 알아보기
// 4. control 을 할 수 없도록 해야함. => 카메라를 고정해야함
// 5. object 에 카메라를 고정시키고 object 가 욺직이면 카메라가 각각의 스크롤Y 에 맞춰서 gsap 으로 위치를 이동해줘야함.
// 6.
// IDEA
// 1. html 에 내 자기소개를 적는다.
// 2. 각각의 section 에 내 이력서를 넣어준다.
// 3. css 와 ts 를 통하여 스크롤 위치에 맞춰서 나타나고 사라지는 로직을 넣어준다.
// 4.
// IDEA
// Main Mesh => Time machine
// 위에서 부터 아래로 내려가면서 => 자소서 표시
// 마지막 부분에 포트폴리오 => (회사에서 한 내용들 + )
// 각 페이지 별 (어려웠 던 점 => 해결 책들 => velog 링크)
// 1. only up => 캐릭터가 카메라를 뚫고 지나감. => like superman
// 2. yatch => Dice 가 위에서 아래로 떨어짐
// 3. Yut => yut 모형을 역동적이게 배치하여 위치.
// 4. 마지막으로 투명이 되면 내가 되고 싶은 개발자상을 넣기 포부 같은 거

/**
 * Debug
 */
const gui = new GUI()

/**
 * Base
 */
const sizes: ISizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new Scene()
// Camera
const camera = new PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6

const renderer = new WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Objects
 */
const mainDonut = new MainMesh(scene, camera, renderer);
await mainDonut.init(scene, camera, renderer, gui);
const sectionMeshes: Array<MainMesh> = [mainDonut];

/**
 * Lights
 */
new FollowLights(scene);

/**
 * Particles
 */
new SubParticles(mainDonut.objectDistance, sectionMeshes.length, scene);

/**
 * Scroll
 */
const followScroll = new FollowScroll(sizes, sectionMeshes);

/**
 * Cursor
 */
const followCursor = new FollowCursor(sizes);

/**
 * Animate
 */
const clock = new Clock()
let previousTime = 0

const animate = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // Animate camera
    mainDonut.followCamera.camera.position.y = -followScroll.scrollY / sizes.height * mainDonut.objectDistance;

    const parallaxX = followCursor.cursor.x;
    const parallaxY = -followCursor.cursor.y;

    mainDonut.followCamera.update(deltaTime, parallaxX, parallaxY)

    for (const mesh of sectionMeshes) {
        mesh.mainMesh.rotation.x = followScroll.scrollY * 0.1;
        mesh.mainMesh.rotation.y = followScroll.scrollY * 0.12;
        mesh.update(deltaTime, followScroll.scrollY);
    }

    renderer.render(scene, mainDonut.followCamera.camera)
    requestAnimationFrame(animate)
}

animate()