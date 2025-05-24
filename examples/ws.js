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
  delay: 2500,
  priority: "user-visible",
});
// Only aborts *before* the handshake
var abortable = new AbortController();
var { signal } = abortable;
var wss = new WebSocketStream("ws://127.0.0.1:44818", {
  signal,
});
console.log(wss);

var { readable, writable } = await wss.opened.catch(console.warn);

var connection = wss.closed.then(({ closeCode, reason }) => {
  return `WebSocketStream closed. closeCode: ${closeCode}, reason: ${reason}`;
}).catch((e) => {
  return e.message;
});

var writer = writable.getWriter();
var reader = readable.getReader();
var len = 0;
var encoder = new TextEncoder();
var decoder = new TextDecoder();
var data = new Uint8Array(1024 ** 2).fill(97);
var len = 0;
for (let i = 0; i < data.length; i += 65536) {
  try {
    await writer.ready;
    await writer.write(data.subarray(i, i + 65536));
    // console.log(writer.desiredSize);
    const { value: v, done } = await reader.read();
    if (typeof v === "string") {
      console.log(v);
    } else {
      const decoded = decoder.decode(v, {
        stream: true,
      });
      console.log(len += v.byteLength, v, [...decoded].every((s) => s === "a"));
    }
  } catch (e) {
    console.warn(e);
  }
}

console.assert(len === data.buffer.byteLength, [len, data.buffer.byteLength]);
console.log(len, data.buffer.byteLength);
await writer.ready;
await writer.write("Text").then(() => reader.read()).then(console.log).catch(
  console.warn,
);

try {
  writer.releaseLock();
  reader.releaseLock();
  wss.close({
    closeCode: 1000,
    reason: "Done streaming",
  });
  // await writer.close();
  // await writer.closed;
} catch {}

function handleClose(args) {
  return args;
}
await Promise.allSettled([
  reader.closed.then(
    handleClose.bind(null, `readable.locked ${readable.locked}`),
  ).catch(handleClose.bind(null, `readable.locked ${readable.locked}`)),
  writer.closed.then(
    handleClose.bind(null, `writable.locked ${writable.locked}`),
  ).catch(handleClose.bind(null, `writable.locked ${writable.locked}`)),
  connection,
]).then((result) => console.log(result));
