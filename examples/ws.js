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
await scheduler.postTask(()=>{}
, {
  delay: 1500,
  priority: "user-visible"
});
var wss = new WebSocketStream("ws://0.0.0.0:44818");
console.log(wss);
wss.closed.catch((e)=>{}
);
wss.opened.catch((e)=>{}
);
var {readable, writable, } = await wss.opened.catch(console.error);
var writer = writable.getWriter();
var abortable = new AbortController();
var {signal, } = abortable;
// .pipeThrough(new TextDecoderStream())
var pipe = readable.pipeTo(new WritableStream({
  start(c) {
    console.log("Start", c);
  },
  async write(v) {
    console.log(v, decoder.decode(v));
  },
  close() {
    console.log("Socket closed");
  },
  abort(reason) {// console.log({ reason });
  },
}), {
  signal,
}, ).then(()=>({
  done: true,
  e: null
})).catch((e)=>({
  done: true,
  e
}));

var encoder = new TextEncoder();
var decoder = new TextDecoder();
var encode = (text)=>encoder.encode(text);
await writer.write(encode("X"));
// Later on close the WebSocketStream connection
// await writer.close();
