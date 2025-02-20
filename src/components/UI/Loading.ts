export default class Loading {
    private loadedItems = 0;
    private totalItems = 10;
    private loadingBar: HTMLElement | null;
    private loadingText: HTMLElement | null;
    private loadingScreen: HTMLElement | null;

    constructor() {
        this.loadingBar = document.getElementById('loading-bar');
        this.loadingText = document.getElementById('loading-text');
        this.loadingScreen = document.getElementById('loading-screen');
    }

    updateProgress() {
        this.loadedItems++;
        const progress = (this.loadedItems / this.totalItems) * 100;

        if (this.loadingBar) {
            this.loadingBar.style.width = `${progress}%`;
        }

        if (this.loadingText) {
            this.loadingText.textContent = `Loading: ${Math.round(progress)}%`;
        }

        if (progress === 100 && this.loadingScreen) {
            setTimeout(() => {
                this.loadingScreen!.style.opacity = '0';
                setTimeout(() => {
                    this.loadingScreen!.style.display = 'none';
                }, 500);
            }, 500);
        }
    }
}