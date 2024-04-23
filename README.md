## direct-sockets-http-ws-server
HTTP and WebSocket server run from Chromium and Chrome browsers using Direct Sockets `TCPServerSocket`.

## Synopsis

[WICG Direct Sockets](https://wicg.github.io/direct-sockets) specifies an API 
that provides `TCPSocket`, `UDPSocket`, and `TCPServerSocket`.

In Chromium based browsers, for example Chrome, this capability is exposed in
an [Isolated Web Apps](https://github.com/WICG/isolated-web-apps) (IWA).

Previously we have created an IWA that we launch from arbitrary Web sites
with [`open()`](https://html.spec.whatwg.org/multipage/window-object.html#dom-open-dev),
including [SDP](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols#sdp)
from a [`RTCDataChannel`](https://w3c.github.io/webrtc-pc/#rtcdatachannel) in query string of the URL,
created in the arbitrary Web page, and exchanged signals with the `RTCDataChannel`
created in the IWA `window` using [WICG File System Access](https://wicg.github.io/file-system-access/) for the
ability to send data to the IWA which is then passed to a `TCPSocket` instance for 
that sends the data to a Node.js, Deno, Bun, or txiki.js TCP socket server for processing, 
then sends the processed data back to the Web page using `RTCDataChannel`
in each `window`, see [telnet-client (user-defined-tcpsocket-controller-web-api branch)](https://github.com/guest271314/telnet-client), which is a
fork of [telnet-client](https://github.com/GoogleChromeLabs/telnet-client).

Now we will use the browser itself as a local HTTP and WebSocket server over the `TCPServerSocket` interface.

### HTTP server

> [Basic aspects of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview#basic_aspects_of_http)
>
> HTTP is simple
>
> HTTP is generally designed to be simple and human-readable, even with the added 
complexity introduced in HTTP/2 by encapsulating HTTP messages into frames. HTTP 
messages can be read and understood by humans, providing easier testing for developers, 
and reduced complexity for newcomers.

We'll also note this claim on the MDN Web Docs page from [Client: the user-agent](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview#client_the_user-agent)

> The browser is **always** the entity initiating the request. It is never the server (though some mechanisms have been added over the years to simulate server-initiated messages).

which is no longer the case, as we'll 
demonstrate below, in code.

Some further reading about HTTP can be found here [HTTP - Hypertext Transfer Protocol](https://www.w3.org/Protocols/).

The reason for and use of the `Access-Control-Request-Private-Network` and `Access-Control-Allow-Private-Network`
headers can be found here [Private Network Access: introducing preflights](https://developer.chrome.com/blog/private-network-access-preflight).

An article and example of a basic HTTP server with comments explaining what is going on, including comments in the code, written in C,
can be found here [Making a simple HTTP webserver in C](https://bruinsslot.jp/post/simple-http-webserver-in-c/). We have
previously used that example to create a simple HTTP Web server for QuickJS, which does
not include a built-in Web server in the compiled `qjs` executable, see [webserver-c (quickjs-webserver branch)](https://github.com/guest271314/webserver-c/tree/quickjs-webserver).

### WebSocket server

For the WebSocket implementation [WebSocket - binary broadcast example (pure NodeJs implementation without any dependency)](https://gist.github.com/robertrypula/b813ffe23a9489bae1b677f1608676c8) is used.

### Isolated Web App and Signed Web Bundle

- Substitute Web Cryptography API ([wbn-sign-webcrypto](https://github.com/guest271314/wbn-sign-webcrypto)) for `node:crypto` implementation of Ed25519 algorithm 
- Install and run same JavaScript source code in different JavaScript runtimes, e.g., `node`, `deno`, `bun`

### TODO

- Create valid close frame (server to client) for WebSocket server; currently we abort the request in the server with `AbortController` when the WebSocket client closes the connection
- TLS and HTTP/2 support
- Create Signed Web Bundle and Isolated Web App in the browser

## Building

### Fetch dependencies

Creates a `node_modules` folder containing dependencies

```
bun install
```

or 

```
npm install
```

or 

```
deno run -A deno_install.js
```

### Signed Web Bundle/Isolated Web App source files

Entry point is `assets` directory which contains `index.html`, `script.js`, `.well-known` directory with `manifest.webmanifest`, and any other scripts or resources to be bundled. 

### Generate private and public keys, write to file system 

This only has to be done once. `generateWebCryptoKeys.js` can be run with `node`, `deno`, or `bun`.

```
node --experimental-default-type=module generateWebCryptoKeys.js
```


### Build the Signed Web Bundle and Isolated Web App

Write `signed.swbn` to current directory

Node.js 
```
node --experimental-default-type=module index.js
```

Bun
```
bun run index.js
```

Deno
```
deno run --unstable-byonm -A index.js
```

#### Dynamically fetch dependencies without creating a `node_modules` folder and create the `.swbn` file and IWA.

```
deno run -A --unstable-byonm --import-map=import-map.json index.js
```

### Install Isolated Web App using Signed Web Bundle

Navigate to `chrome://web-app-internals/`, on the line beginning with `Install IWA from Signed Web Bundle:` click `Select file...` and select `signed.swbn`.

### Build/rebuild `wbn-bundle.js` from `src/index.ts` with `bun`

```
try {
  console.log(
    await Bun.build({
      entrypoints: ["./src/index.ts"],
      outdir: ".",
      sourcemap: "external",
      splitting: false,
      target: "bun" // or "node"
      format: "esm",
      // minify: true,
      external: ["mime", "base32-encode", "wbn-sign-webcrypto", "wbn"],
      naming: {
        entry: "[dir]/wbn-bundle.[ext]",
      },
    }),
  );
} catch (e) {
  console.log(e);
}
```
## Usage

See `https.js` and `ws.js` in `examples` directory.

We open the IWA `window` from arbitrary Web sites in DevTools `console` or Snippets with 

```
var iwa = open("isolated-app://<IWA_ID>");
```

### HTTP and WebSocket server

```
const socket = new TCPServerSocket("0.0.0.0", {
    localPort: 8080,
  });

  const {
    readable: server,
    localAddress,
    localPort,
  } = await socket.opened;

  console.log({ server });
  // TODO: Handle multiple connections
  await server.pipeTo(
    new WritableStream({
      async write(connection) {
        const {
          readable: client,
          writable,
          remoteAddress,
          remotePort,
        } = await connection.opened;
        console.log({ connection });
        const writer = writable.getWriter();
        console.log({
          remoteAddress,
          remotePort,
        });

        const abortable = new AbortController();
        const { signal } = abortable;
        // Text streaming
        // .pipeThrough(new TextDecoderStream())
        await client.pipeTo(
          new WritableStream({
            start(controller) {             
              console.log(controller);
            },
            async write(r, controller) {
              const request = decoder.decode(r);
              console.log(request);
              // HTTP and WebSocket request and response logic
              // TODO: Create and send valid WebSocket close frame to client
            },
            close: () => {
              console.log("Client closed");
            },
            abort(reason) {
              console.log(reason);
            },
          })
        , {signal}).catch(console.warn);
      },
      close() {
        console.log("Host closed");
      },
      abort(reason) {
        console.log("Host aborted", reason);
      },
    }),
  ).then(() => console.log("Server closed")).catch(console.warn);
};
```

### HTTP client

Using WHATWG Fetch

```
fetch("http://0.0.0.0:8080", {
  method: "post",
  body: "test",
  headers: {
    "Access-Control-Request-Private-Network": true,
  },
})
  .then((r) => r.text()).then((text) =>
    console.log({
      text,
    })
  ).catch(console.error);
```

### WebSocket client

```
var wss = new WebSocketStream("ws://0.0.0.0:8080");
console.log(wss);
wss.closed.catch((e) => {});
wss.opened.catch((e) => {});
var {
  readable,
  writable,
} = await wss.opened.catch(console.error);
var writer = writable.getWriter();
var abortable = new AbortController();
var {
  signal,
} = abortable;
// .pipeThrough(new TextDecoderStream())
var pipe = readable.pipeTo(
  new WritableStream({
    start(c) {
      console.log("Start", c);
    },
    async write(v) {
      console.log(v, decoder.decode(v));
    },
    close() {
      console.log("Socket closed");
    },
    abort(reason) {
      // console.log({ reason });
    },
  }),
  {
    signal,
  },
).then(() => ({ done: true, e: null })).catch((e) => ({ done: true, e }));

var encoder = new TextEncoder();
var decoder = new TextDecoder();
var encode = (text) => encoder.encode(text);
await writer.write(encode("X"));
// Later on close the WebSocketStream connection
await writer.close().catch(() => pipe).then(console.log);
```

## License

Do What the Fuck You Want to Public License [WTFPLv2](http://www.wtfpl.net/about/)
