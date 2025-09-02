var abortable = new AbortController();

var { readable, writable } = new TransformStream({
  async transform(v, c) {
    for (let i = 0; i < v.length; i += 8192) {
      if (abortable.signal.aborted) {
        c.terminate();
        break;
      }
      c.enqueue(v.subarray(i, i + 8192));
      await scheduler.postTask(() => {}, { delay: 30 });
    }
  },
  flush() {
    console.log("flush");
  },
});
var writer = writable.getWriter();
var response = fetch("http://localhost:44818", {
  method: "post",
  duplex: "half",
  body: readable,
  signal: abortable.signal,
  allowHTTP1ForStreamingUpload: true,
}).then((r) => r.text())
  .catch((e) => {
    return e;
  });
// Use dealy here to avoid including part of body in initial WritableStream({write()}) read
await scheduler.postTask(() => {}, { delay: 45 });
await writer.write(new Uint8Array(1024 ** 2 * 7).fill(1));
await writer.ready
  .then(() => writer.close())
  .catch(() => {});
await response.then((response) => {
  console.log({ response });
});
