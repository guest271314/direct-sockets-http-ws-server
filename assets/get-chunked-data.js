function getChunkedData(u8) {
  // https://codereview.stackexchange.com/a/297911
  const CR = 13;
  const LF = 10;
  let crlfIndex = 0;
  let chunkLength = 0;
  let chunkBuffer = new Uint8Array(0);
  crlfIndex = u8.findIndex((v, k, array) => v === CR && array[k + 1] === LF);
  if (crlfIndex > -1) {
    // https://gist.github.com/guest271314/d6e932154e11fffb75fd7d1a4b25f4f5
    for (let i = 0; i < crlfIndex; i++) {
      const hex = u8[i];
      let intVal = hex & 0xF;
      if (hex > 64) intVal += 9;
      chunkLength = intVal + (chunkLength << 4);
    }
    chunkBuffer = u8.subarray(crlfIndex + 2, crlfIndex + chunkLength + 2);
    crlfIndex += chunkLength + 4;
  }
  if (crlfIndex === -1) {
    console.log({
      crlfIndex,
      chunkLength,
      chunkBuffer,
      inputBufferLength: u8.length,
    });
  }
  return {
    crlfIndex,
    chunkLength,
    chunkBuffer,
    inputBufferLength: u8.length,
  };
}
