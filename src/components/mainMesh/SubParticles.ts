import {BufferAttribute, BufferGeometry, Points, PointsMaterial, Scene} from "three";

export default class SubParticles {
    private particlesCount = 200
    private positions = new Float32Array(this.particlesCount * 3)

    constructor(objectDistance: number, sectionMeshesLength: number, scene: Scene) {
        for (let i = 0; i < this.particlesCount; i++) {
            this.positions[i * 3 + 0] = (Math.random() - 0.5) * 10
            this.positions[i * 3 + 1] = objectDistance * 0.5 - Math.random() * objectDistance * sectionMeshesLength
            this.positions[i * 3 + 2] = (Math.random() - 0.5) * 10
        }

        const particlesGeometry = new BufferGeometry()
        particlesGeometry.setAttribute('position', new BufferAttribute(this.positions, 3))

        const particlesMaterial = new PointsMaterial({
            color: "#ffffff",
            sizeAttenuation: true,
            size: 0.03
        })

        const particles = new Points(particlesGeometry, particlesMaterial)
        scene.add(particles)
    }
}