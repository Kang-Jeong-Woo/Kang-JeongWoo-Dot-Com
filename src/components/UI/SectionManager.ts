import ISectionStyles from "../interfaces/ISectionStyles.ts";

export default class SectionManager {
    private currentSection: number;
    private isAnimating: boolean;
    private queuedSection: number | null;

    constructor() {
        this.currentSection = 1;
        this.isAnimating = false;
        this.queuedSection = null;
    }

    async updateSection(newSection: number) {
        if (this.isAnimating) {
            // 강도 테스트 결과 다음 스크롤의 섹션을 넣어둬야함.
            this.queuedSection = newSection;
            return;
        }

        this.isAnimating = true;
        this.currentSection = newSection;

        try {
            // 모든 section 숨김
            const sections = document.querySelectorAll('.section');
            const promises: Promise<void>[] = [];

            sections.forEach((section: Element) => {
                if (section instanceof HTMLElement) {
                    const styles = section.style as ISectionStyles;
                    if (styles.opacity === '1' || styles.display === 'block') {
                        promises.push(this.fadeOut(section));
                    }
                }
            });
            await Promise.all(promises);

            // 모든 섹션 삭제
            sections.forEach((section: Element) => {
                if (section instanceof HTMLElement) {
                    const styles = section.style as ISectionStyles;
                    styles.display = 'none';
                }
            });

            // 현재 섹션만 표출
            const targetSection = document.getElementById(`section${this.currentSection}`);
            if (targetSection) {
                const styles = targetSection.style as ISectionStyles;
                styles.display = 'block';
                targetSection.offsetHeight;
                await this.fadeIn(targetSection);
            }
        } finally {
            this.isAnimating = false;
            // 큐로 다음 스크롤 section 실행하기
            if (this.queuedSection !== null && this.queuedSection !== this.currentSection) {
                const nextSection = this.queuedSection;
                this.queuedSection = null;
                await this.updateSection(nextSection);
            }
        }
    }

    private fadeOut(element: HTMLElement): Promise<void> {
        return new Promise((resolve) => {
            const styles = element.style as ISectionStyles;
            styles.opacity = '0';
            setTimeout(() => {
                styles.visibility = 'hidden';
                resolve();
            }, 1000);
        });
    }

    private fadeIn(element: HTMLElement): Promise<void> {
        return new Promise((resolve) => {
            const styles = element.style as ISectionStyles;
            styles.visibility = 'visible';
            element.offsetHeight;
            styles.opacity = '1';
            setTimeout(() => {
                resolve();
            }, 1000);
        });
    }

    public initializeSections() {
        const sections = document.querySelectorAll('.section');
        sections.forEach((section: Element) => {
            if (section instanceof HTMLElement) {
                const styles = section.style as ISectionStyles;
                styles.opacity = '0';
                styles.visibility = 'hidden';
                styles.display = 'none';

                if (section.id === `section${this.currentSection}`) {
                    styles.display = 'block';
                    styles.visibility = 'visible';
                    styles.opacity = '1';
                }
            }
        });
    }

    public getCurrentSection(): number {
        return this.currentSection;
    }

    public isAnimatingSection(): boolean {
        return this.isAnimating;
    }
}