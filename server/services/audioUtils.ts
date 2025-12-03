// --- Audio Helper Functions ---

/**
 * Converts a base64 string into an ArrayBuffer.
 */
export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    // In Node.js, we can use Buffer.from
    const buffer = Buffer.from(base64, 'base64');
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
};

/**
 * Converts raw PCM audio data into a playable WAV file Blob.
 * Note: In Node.js server, we might return Buffer instead of Blob, but let's keep it compatible or return Buffer.
 * Since this is for sending to client, we can return Buffer or base64.
 * But the original code returns Blob which is browser specific.
 * We will modify this to return a Buffer representing the WAV file.
 */
export const pcmToWav = (pcmData: Int16Array, sampleRate: number): Buffer => {
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = pcmData.length * (bitsPerSample / 8);
    const wavHeaderSize = 44;
    const buffer = Buffer.alloc(wavHeaderSize + dataSize);

    // RIFF header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4); // file size - 8
    buffer.write('WAVE', 8);

    // FMT sub-chunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // sub-chunk size
    buffer.writeUInt16LE(1, 20); // audio format (1 = PCM)
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bitsPerSample, 34);

    // DATA sub-chunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    // Write PCM data
    let offset = wavHeaderSize;
    for (let i = 0; i < pcmData.length; i++, offset += 2) {
        buffer.writeInt16LE(pcmData[i], offset);
    }

    return buffer;
};
