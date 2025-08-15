function getChunkedData(u8) {
  let crlfIndex = 0;
  let chunkLength = "";
  let chunkBuffer = new Uint8Array(0);
  crlfIndex = u8.findIndex((v, k, array) => v === 13 && array[k + 1] === 10);
  if (crlfIndex > -1) {
    chunkLength = parseInt(
      String.fromCodePoint(...u8.subarray(0, crlfIndex)),
      16,
    );
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

export { getChunkedData }
