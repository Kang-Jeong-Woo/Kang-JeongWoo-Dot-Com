import {gsap} from "gsap";
import ISizes from "../interfaces/ISizes";
import {Mesh} from "three";
import MainMesh from "../mainMesh/MainMesh";

export default class FollowScroll {
    scrollY = window.scrollY;
    currentSection = 0;
    isAnimating = false;

    constructor(sizes: ISizes, sectionMeshes: Array<MainMesh>) {
        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY
            const newSection = Math.round(this.scrollY / sizes.height)

            if (newSection != this.currentSection && !this.isAnimating) {
                // 각 섹션별로 위치 지정
                this.currentSection = newSection
                this.isAnimating = true;
                gsap.to(sectionMeshes[0].mainMesh.rotation, {
                    duration: 1.5,
                    ease: 'power2.inOut',
                    x: '+=6',
                    y: '+=3',
                    z: '+=1.5',
                    onComplete: () => {
                        this.isAnimating = false;
                    }
                })
            }
        })
    }
}