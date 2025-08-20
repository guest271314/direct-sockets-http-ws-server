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
  delay: 4000,
  priority: "user-visible",
});

var u8 = new Uint8Array(1024 ** 2 * 10).fill(1);
var decoder = new TextDecoder();
var encoder = new TextEncoder();

var wss = new WebSocketStream("ws://127.0.0.1:44818");
console.log(wss);

var { readable, writable } = await wss.opened.catch(console.warn);

var reader = readable.getReader();
var writer = writable.getWriter();

Promise.allSettled([writable.closed, readable.closed, wss.closed]).then((
  args,
) => console.log(args));

async function write(data) {
  const len = 65536 / 2;
  let bytes = 0;

  if (typeof data === "string") {
    for (let i = 0; i < data.length; i += len) {
      await writer.ready;
      await writer.write(data.slice(i, i + len));
      const { value, done } = await reader.read();
      bytes += value.length;
    }
  } else {
    for await (const value of new Response(data).body) {
      for (let i = 0; i < data.length; i += len) {
        const d = data.subarray(i, i + len);
        await writer.ready;
        await writer.write(d);
        const { value, done } = await reader.read();
        bytes += value.byteLength;
      }
    }
  }
  reader.read().then(console.log);
  return bytes;
}

var x = await write(u8);
// var z = await write("x".repeat(1024**2));
console.log(x);

await writer.ready;
await writer.close();
await writer.closed.then(() => console.log("writer closed"));
await reader.closed.then(() => console.log("reader closed"));
