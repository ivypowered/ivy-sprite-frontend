/// Extracts the u64-le amount from a 32-byte ID
export function idExtractAmount(idHex: string): number {
    if (!idHex || idHex.length !== 64) {
        return 0;
    }
    const amountHex = idHex.slice(-16);
    const bytes = [];
    for (let i = 0; i < 16; i += 2) {
        bytes.push(parseInt(amountHex.substring(i, i + 2), 16));
    }
    // Convert little-endian bytes to number
    let value = 0;
    for (let i = 0; i < 8; i++) {
        value += bytes[i] * Math.pow(256, i);
    }
    return value / 1000000000;
}
