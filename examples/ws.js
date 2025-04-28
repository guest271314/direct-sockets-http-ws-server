function setTitle(data) {
  const title = document.title;
  document.title = title + data;
  document.title = title;
}
 
if (globalThis?.openIsolatedWebApp) {
  openIsolatedWebApp(`?name=TCPServerSocket`)
} else {
  setTitle(`?name=TCPServerSocket`);
}
await scheduler.postTask( () => {}
, {
  delay: 1700,
  priority: "user-visible"
});
// Only aborts *before* the handshake
var abortable = new AbortController();
var {signal, } = abortable;
var wss = new WebSocketStream("ws://0.0.0.0:44818",{
  signal
});
console.log(wss);
wss.closed.then( () => console.log("WebSocketStream closed.")).catch( (e) => {
  console.log(e)
}
);
var {readable, writable, } = await wss.opened.catch(console.error);
var writer = writable.getWriter();
var reader = readable.getReader();
var len = 0;
var encoder = new TextEncoder();
var decoder = new TextDecoder();
var data = new Uint8Array(1024 ** 2 * 7).fill(97);
var len = 0;
for (let i = 0; i < data.length; i += 65536) {
  await writer.ready;
  writer.write(data.subarray(i, i + 65536));
  // console.log(writer.desiredSize);
  const {value: v, done} = await reader.read();
  if (typeof v === "string") {
    console.log(v);
  } else {
    const decoded = decoder.decode(v, {
      stream: true
    });
    console.log(len += v.byteLength, v, [...decoded].every( (s) => s === "a"));
  }
}
console.assert(len === data.buffer.byteLength, [len, data.buffer.byteLength]);
console.log(len, data.buffer.byteLength);
await writer.write("Text").then( () => reader.read()).then(console.log);
await writer.close();
