// For Firefox, which doesn't support upload streaming over HTTP/1.1
(async () => {
  var abortable = new AbortController();
  // To avoid request reaching write() mutiple times,
  // only because without delay part of the request body will
  // directly follow header in initial read of in WritableStream({write()})
  var data = new Uint8Array(65536 / 2).fill(255);
  var len = 0;
  return fetch("http://localhost:44818", {
      method: "post",
      // duplex: "half",
      body: data,
      signal: abortable.signal,
      // allowHTTP1ForStreamingUpload: true,
      headers: {}
    }).then((r) => {
      console.log(r);
      return r.body.pipeTo(
        new WritableStream({
          write(v) {
            console.log(len += v.length);
          },
          close() {
            console.log("close");
          },
          abort(reason) {
            console.log(reason);
          },
        }),
      );
    })
    .catch((e) => {
      console.log(e);
    })
    .then(() => {
      console.log("Done streaming");
    });

})().catch(console.log);
