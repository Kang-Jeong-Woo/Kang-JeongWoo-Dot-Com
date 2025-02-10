import ICursor from "../interfaces/ICursor";
import ISizes from "../interfaces/ISizes";

export default class FollowCursor {
    cursor: ICursor = {x: 0, y: 0};

    constructor(sizes: ISizes) {
        this.cursor.x = 0;
        this.cursor.y = 0;

        window.addEventListener('mousemove', (event: MouseEvent) => {
            this.cursor.x = event.clientX / sizes.width - 0.5;
            this.cursor.y = event.clientY / sizes.height - 0.5;
        })
    }
}