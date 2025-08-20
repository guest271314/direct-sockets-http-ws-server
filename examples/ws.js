function setTitle(data) {
  const title = document.title;
  document.title = title + data;
  document.title = title;
}

if (globalThis?.openIsolatedWebApp) {
  openIsolatedWebApp(`?name=TCPServerSocket`);
} else {
  setTitle(`?name=TCPServerSocket`);
}
await scheduler.postTask(() => {}, {
  delay: 3000,
  priority: "user-visible",
});

var decoder = new TextDecoder();
var encoder = new TextEncoder();

var wss = new WebSocketStream("ws://127.0.0.1:44818");
console.log(wss);

var {readable, writable} = await wss.opened.catch(console.warn);

var reader = readable.getReader();
var writer = writable.getWriter();

Promise.allSettled([writable.closed, readable.closed, wss.closed])
  .then( ([,,{value: {closeCode, reason}}]) => console.log({
  closeCode,
  reason
}));

async function write(data) {
  const len = 65536/2;
  let bytes = 0;
  if (typeof data === "string") {
    for (let i = 0; i < data.length; i += len) {
      await writer.ready;
      await writer.write(data.slice(i, i + len));
      const {value, done} = await reader.read();
      console.log(value, bytes += value.length);
    }
  } else {
    for await(const value of new Response(data).body) {
      for (let i = 0; i < data.length; i += len) {
        await writer.ready;
        await writer.write(data.subarray(i, i + len));
        const {value, done} = await reader.read();
        console.log(value, bytes += value.byteLength);
      }
    }
  }
  return bytes;
}

var x = await write(new Uint8Array(1024 ** 2 * 10));
// var z = await write("x".repeat(1024**2));

console.log(x);

await writer.close();
