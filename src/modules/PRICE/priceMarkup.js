export function applyPriceMarkup(priceMinor, percent = 0) {
    const minor = Number(priceMinor) || 0;
    const markup = Number(percent) || 0;
    return Math.round(minor * (1 + markup / 100)) / 100;
}
