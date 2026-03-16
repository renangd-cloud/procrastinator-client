export const stringToColor = (str) => {
    if (!str) return '#ccc';

    // djb2 hash for better distribution
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
    }

    // Use HSL for better control over brightness/saturation
    // Hue: hash % 360
    // Saturation: 65% (slightly less intense)
    // Lightness: 45% (readable with white text)

    // Ensure positive hash
    hash = Math.abs(hash);

    const h = hash % 360;
    return `hsl(${h}, 65%, 45%)`;
};
