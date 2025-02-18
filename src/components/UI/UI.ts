import gsap from "gsap";

export default class UI {
    startIcon: HTMLSpanElement;
    originalText: string;
    letters: HTMLElement[] = [];

    constructor() {
        this.startIcon = document.getElementById("break-through") as HTMLSpanElement;
        this.originalText = this.startIcon.innerText;

        this.splitText();
        this.addHoverEffect();
    }

    splitText() {
        this.letters = [];
        const text = this.originalText.split("");
        this.startIcon.innerHTML = "";

        text.forEach((char) => {
            const span = document.createElement("span");
            span.innerText = char;
            span.style.display = "inline-block";
            this.startIcon.appendChild(span);
            this.letters.push(span);
        });
    }

    addHoverEffect() {
        this.startIcon.addEventListener("mouseenter", () => {this.scatterText()});
        this.startIcon.addEventListener("mouseleave", () => {this.resetText()});
    }

    scatterText() {
        this.letters.forEach((letter, index) => {
            gsap.to(letter, {
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200,
                rotation: (Math.random() - 0.5) * 360,
                duration: 0.2,
                ease: "power2.out",
                delay: index * 0.02,
            });
        });
    }

    resetText() {
        this.letters.forEach((letter, index) => {
            gsap.to(letter, {
                x: 0,
                y: 0,
                rotation: 0,
                duration: 0.2,
                ease: "power2.inOut",
                delay: index * 0.02,
            });
        });
    }

    setBirthDate() {
        const birth = new Date('1996-02-15')
        const today = new Date();
        const difference = today.getTime() - birth.getTime();
        const daysSinceBirth = Math.floor(difference / (1000 * 60 * 60 * 24));
        console.log(daysSinceBirth);
    }
}
