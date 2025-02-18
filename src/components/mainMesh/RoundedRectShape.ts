import {Vector3, Mesh, Shape, Scene, ExtrudeGeometry, MeshStandardMaterial, BoxGeometry} from "three";

export default class RoundedRectShape {
    meshes: Array<Mesh> = [];

    private width = 1;
    private height = 1;
    private radius = 0.5;
    private extrudeSettings = {
        depth: 0.2,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 2,
        bevelSize: 0.1,
        bevelThickness: 0.1
    };

    constructor(scene:Scene, position: Vector3) {
        const roundedRectShape = new Shape();
        roundedRectShape.moveTo(-this.width/2 + this.radius, -this.height/2);
        roundedRectShape.lineTo(this.width/2 - this.radius, -this.height/2);
        roundedRectShape.quadraticCurveTo(this.width/2, -this.height/2, this.width/2, -this.height/2 + this.radius);
        roundedRectShape.lineTo(this.width/2, this.height/2 - this.radius);
        roundedRectShape.quadraticCurveTo(this.width/2, this.height/2, this.width/2 - this.radius, this.height/2);
        roundedRectShape.lineTo(-this.width/2 + this.radius, this.height/2);
        roundedRectShape.quadraticCurveTo(-this.width/2, this.height/2, -this.width/2, this.height/2 - this.radius);
        roundedRectShape.lineTo(-this.width/2, -this.height/2 + this.radius);
        roundedRectShape.quadraticCurveTo(-this.width/2, -this.height/2, -this.width/2 + this.radius, -this.height/2);

        const containerGeometry = new ExtrudeGeometry(roundedRectShape, this.extrudeSettings);
        const containerMaterial = new MeshStandardMaterial({ color: 0x808080 });
        const mesh = new Mesh(containerGeometry, containerMaterial)

        mesh.scale.set(0.5, 0.5, 0.5);
        mesh.position.copy(position);
        this.meshes.push(mesh);
        // scene.add(mesh);

        const iconSize = 0.2;
        const iconGeometry = new BoxGeometry(iconSize, iconSize, iconSize);
        const icons = [
            { name: 'github', color: 0x333333, position: { x: position.x - 0.1, y: position.y, z: position.z } },
            { name: 'gmail', color: 0xDD4B3E, position: { x: position.x, y: position.y, z: position.z } },
            { name: 'phone', color: 0x4CAF50, position: { x: position.x + 0.1, y: position.y, z: position.z } }
        ];

        icons.map(icon => {
            const material = new MeshStandardMaterial({ color: icon.color });
            const mesh = new Mesh(iconGeometry, material);
            mesh.position.set(icon.position.x, icon.position.y, icon.position.z);
            this.meshes.push(mesh)
            scene.add(mesh);
        });
    }

    update() {
    }
}