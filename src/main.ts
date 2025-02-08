import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import {
    BufferAttribute,
    BufferGeometry,
    Clock, ConeGeometry, DirectionalLight, Group,
    Mesh,
    MeshToonMaterial, NearestFilter,
    PerspectiveCamera, Points, PointsMaterial,
    Scene, TextureLoader,
    TorusGeometry, TorusKnotGeometry,
    WebGLRenderer
} from "three";
import * as gsap from "gsap";

/**
 * Debug
 */
const gui = new GUI()

const parameters = {
    materialColor: '#ffeded'
}

gui.addColor(parameters, 'materialColor').onChange(() => {
    material.color.set(parameters.materialColor);
    particlesMaterial.color.set(parameters.materialColor);
})

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new Scene()

/**
 * Objects
 */
const textureLoader = new TextureLoader();
const gradientTexture = await textureLoader.loadAsync("/textures/gradients/3.jpg");
gradientTexture.magFilter = NearestFilter;

const material = new MeshToonMaterial({color: parameters.materialColor, gradientMap: gradientTexture})

const objectDistance = 4;

const mesh1 = new Mesh(
    new TorusGeometry(1, 0.4, 16, 60),
    material
);

const mesh2 = new Mesh(
    new ConeGeometry(1, 2, 32),
    material
);

const mesh3 = new Mesh(
    new TorusKnotGeometry(0.8, 0.35, 100, 16),
    material
);

mesh1.position.x = 2;
mesh1.position.y = -objectDistance * 0;
mesh1.scale.set(0.5, 0.5, 0.5);

mesh2.position.x = -2;
mesh2.position.y = -objectDistance * 1;
mesh2.scale.set(0.5, 0.5, 0.5);

mesh3.position.x = 2;
mesh3.position.y = -objectDistance * 2;
mesh3.scale.set(0.5, 0.5, 0.5);

scene.add(mesh1, mesh2, mesh3)

const sectionMeshes = [mesh1, mesh2, mesh3];

/**
 * Lights
 */
const directionalLight = new DirectionalLight("#ffffff", 3);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

/**
 * Particles
 */
// Geometry
const particlesCount = 200
const positions = new Float32Array(particlesCount * 3)

for(let i = 0; i < particlesCount; i++)
{
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] = objectDistance * 0.5 - Math.random() * objectDistance * sectionMeshes.length
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
}

const particlesGeometry = new BufferGeometry()
particlesGeometry.setAttribute('position', new BufferAttribute(positions, 3))

// Material
const particlesMaterial = new PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: true,
    size: 0.03
})

// Points
const particles = new Points(particlesGeometry, particlesMaterial)
scene.add(particles)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
const cameraGroup = new Group();
scene.add(cameraGroup);

// Base camera
const camera = new PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Scroll
 */
let scrollY = window.scrollY;
let currentSection = 0

window.addEventListener('scroll', () =>
{
    scrollY = window.scrollY
    const newSection = Math.round(scrollY / sizes.height)

    if(newSection != currentSection)
    {
        currentSection = newSection

        gsap.to(
            sectionMeshes[currentSection].rotation,
            {
                duration: 1.5,
                ease: 'power2.inOut',
                x: '+=6',
                y: '+=3',
                z: '+=1.5'
            }
        )
    }
})

/**
 * Cursor
 */
const cursor = {x: 0, y: 0};
cursor.x = 0;
cursor.y = 0;

window.addEventListener('mousemove', (event:MouseEvent) => {
    cursor.x = event.clientX / sizes.width - 0.5;
    cursor.y = event.clientY / sizes.height - 0.5;
})

/**
 * Animate
 */
const clock = new Clock()
let previousTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // Animate camera
    camera.position.y = - scrollY / sizes.height * objectDistance;

    const parallaxX = cursor.x;
    const parallaxY = -cursor.y;
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 3 * deltaTime;
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 3 * deltaTime;

    // Animate meshes
    for (const mesh of sectionMeshes) {
        mesh.rotation.x = scrollY * 0.1;
        mesh.rotation.y = scrollY * 0.12;
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()