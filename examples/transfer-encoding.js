var abortable = new AbortController();

var { readable, writable } = new TransformStream({
  async transform(v, c) {
    for (let i = 0; i < v.length; i+= 8192) {
      c.enqueue(v.subarray(i, i + 8192));
      await scheduler.postTask(() => {}, {delay:30});
    }
  }, 
  flush() {
    console.log("flush");
    abortable.abort("");
  }
}, {highWaterMark:1});
var writer = writable.getWriter();
var response = fetch("http://localhost:44818", {
  method: "post",
  duplex: "half",
  body: readable,
  signal: abortable.signal,
  allowHTTP1ForStreamingUpload: true
}).then((r) => {
  console.log(...r.headers);
  return r.body.pipeTo(
    new WritableStream({
      write(v) {
        console.log(v);
      },
      close() {
        console.log("close");
      }
    })
  )
})
  .catch((e) => {
    console.log(e);
  })
.then(() => {
  console.log("Done streaming");
})
.catch(console.log);
await scheduler.postTask(() => {}, {delay:45});
await writer.write(new Uint8Array(1024**2*5).fill(1));
await writer.ready;
await writer.close();
