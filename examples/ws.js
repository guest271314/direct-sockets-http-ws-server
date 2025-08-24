function setTitle(data) {
  const title = document.title;
  document.title = title + data;
  document.title = title;
}

if (globalThis?.openIsolatedWebApp) {
  await openIsolatedWebApp(`?name=TCPServerSocket`);
} else {
  setTitle(`?name=TCPServerSocket`);
}

await scheduler.postTask(() => {}, {
  delay: 350,
});

var u8 = new Uint8Array(1024 ** 2 * 20).fill(1);
var decoder = new TextDecoder();
var encoder = new TextEncoder();

var wss = new WebSocketStream("ws://127.0.0.1:44818");
console.log(wss);

var { readable, writable } = await wss.opened.catch(console.warn);

var reader = readable.getReader();
var writer = writable.getWriter();

Promise.allSettled([writable.closed, readable.closed, wss.closed]).then((
  args,
) => console.log(args)).catch(console.error);

async function stream(data) {
  const len = 65536;
  let bytes = 0;

  if (typeof data === "string") {
    for (let i = 0; i < data.length; i += len) {
      await writer.ready;
      await writer.write(data.slice(i, i + len));
      const { value, done } = await reader.read();
      bytes += value.length;
    }
  } else {
    for (let i = 0; i < data.length; i += len) {
      const uint8 = data.subarray(i, i + len);
      await writer.ready;
      await writer.write(uint8);
      const { value, done } = await reader.read();
      bytes += value.byteLength;
    }
  }
  return bytes;
}

var binaryResult = await stream(u8).catch((e) => e);
var textResult = await stream("text").catch((e) => e);

console.log({
  binaryResult,
  textResult,
});

wss.close({
  closeCode: 4999,
  reason: "Done streaming",
});
/*
await writer.ready.catch(console.log);
await writer.close().catch(console.log);
await writer.closed.then( () => console.log("writer closed")).catch((e) => console.log(e));
await reader.closed.then( () => console.log("reader closed")).catch((e) => console.log(e));
*/
