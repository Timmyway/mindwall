function center(): { x: number, y: number } {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    return { x: centerX, y: centerY };
}

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const randPos = (axis: string): number => {
    if (axis === 'x') {
        return Math.floor(Math.random() * window.innerWidth);
    } else {
        return Math.floor(Math.random() * window.innerHeight);
    }
}

export { center, randInt, randPos }
