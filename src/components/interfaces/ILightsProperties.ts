import {Vector3} from "three";

export interface ILightsProperties {
    position: Vector3;
    target: Vector3;
    distance: number;
    decay: number;
    angle: number;
    penumbra: number;
    intensity: number;
}