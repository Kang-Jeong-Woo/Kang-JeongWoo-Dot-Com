import {Group, Object3D, PerspectiveCamera, Scene, WebGLRenderer} from "three";
import {gsap} from "gsap";

export default class FollowCamera {
    camera: PerspectiveCamera
    cameraGroup: Group
    pivot = new Object3D()
    yaw = new Object3D()
    pitch = new Object3D()

    constructor(scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer) {
        this.camera = camera
        this.cameraGroup = new Group()

        scene.add(this.cameraGroup)
        this.cameraGroup.add(this.pivot)
        this.pivot.add(this.yaw)
        this.yaw.add(this.pitch)
        this.pitch.add(camera)

        this.yaw.position.y = 0.75

        renderer.domElement.addEventListener('wheel', this.onDocumentMouseWheel)

    }

    update(deltaTime: number, parallaxX: number, parallaxY: number) {
        this.cameraGroup.position.x += (parallaxX - this.cameraGroup.position.x) * 3 * deltaTime
        this.cameraGroup.position.y += (parallaxY - this.cameraGroup.position.y) * 3 * deltaTime
    }

    onDocumentMouseWheel = (e: WheelEvent) => {
        e.preventDefault()
        // 추후 스크롤 위치에 따라 카메라 위치 변경.
    }
}