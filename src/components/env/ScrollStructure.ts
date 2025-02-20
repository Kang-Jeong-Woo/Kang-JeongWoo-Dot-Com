import {
    PerspectiveCamera,
    Scene, Vector3, WebGLRenderer
} from "three";
import FollowCamera from "./FollowCamera.ts";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import {World} from "@dimforge/rapier3d-compat";
import Wall from "./Wall.ts";
import ThoughtFace from "../mainMesh/ThoughtFace.ts";
import MacintoshPc from "../mainMesh/MacintoshPc.ts";
import CoinChart from "../mainMesh/CoinChart.ts";
import Awards from "../mainMesh/Awards.ts";
import BookShelf from "../mainMesh/BookShelf.ts";
import Loading from "../UI/Loading.ts";

export default class ScrollStructure {
    followCamera: FollowCamera;
    cameraPositions = new Vector3(-2.2, 10, -3);
    bookShelf: BookShelf;
    thoughtFace: ThoughtFace;
    pc: MacintoshPc;
    coinChart: CoinChart;
    awards: Awards;
    loadingStatus: Loading;

    constructor(scene: Scene, world:World, camera: PerspectiveCamera, renderer: WebGLRenderer, gui: GUI) {
        this.loadingStatus = new Loading();
        this.followCamera = new FollowCamera(scene, world, camera, this.cameraPositions, this.loadingStatus, gui);
        this.bookShelf = new BookShelf();
        this.thoughtFace = new ThoughtFace(new Vector3(-1.4, 11.9, 0));
        this.pc = new MacintoshPc(new Vector3(-1.9, 10.4, 0.4));
        this.coinChart = new CoinChart(new Vector3(0, 9.7, 0.2), camera, renderer);
        this.awards = new Awards(new Vector3(1.5, 7.8, -0.1));
    }

    async init(scene: Scene, world:World) {
        await this.followCamera.init();

        const floorHeight = 14;
        new Wall(scene, world, {
            width: 10, height: floorHeight, depth: 1
        }, new Vector3(0, floorHeight/2, -1.7));
        new Wall(scene, world, {
            width: 10, height: floorHeight, depth: 1
        }, new Vector3(0, floorHeight/2, 1.7));
        new Wall(scene, world, {
            width: 1, height: floorHeight, depth: 2
        }, new Vector3(-3.5, floorHeight/2, 0));
        new Wall(scene, world, {
            width: 1, height: floorHeight, depth: 2
        }, new Vector3(3.5, floorHeight/2, 0));

        await this.bookShelf.init(scene, world).then(()=>this.loadingStatus.updateProgress());
        await this.thoughtFace.init(scene).then(()=>this.loadingStatus.updateProgress());
        await this.pc.init(scene, world).then(()=>this.loadingStatus.updateProgress());
        await this.coinChart.init(scene).then(()=>this.loadingStatus.updateProgress());
        await this.awards.init(scene, world).then(()=>this.loadingStatus.updateProgress());
    }

    update(delta: number) {
        this.followCamera.update(delta);
        this.pc.update();
        this.awards.update();
    }
};