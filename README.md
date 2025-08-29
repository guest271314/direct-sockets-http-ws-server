## direct-sockets-http-ws-server
HTTP and WebSocket server run from Chromium and Chrome browsers using Direct Sockets `TCPServerSocket`.

## Synopsis

[WICG Direct Sockets](https://wicg.github.io/direct-sockets) specifies an API 
that provides `TCPSocket`, `UDPSocket`, and `TCPServerSocket`. Prior art: [chrome.socket](https://developer.chrome.com/docs/apps/reference/socket).

In Chromium based browsers, for example Chrome, this capability is exposed in [Isolated Web Apps](https://github.com/WICG/isolated-web-apps) (IWA).

Previously we have created an IWA that we launch from arbitrary Web sites
with [`open()`](https://html.spec.whatwg.org/multipage/window-object.html#dom-open-dev),
including [SDP](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols#sdp)
from a [`RTCDataChannel`](https://w3c.github.io/webrtc-pc/#rtcdatachannel) in query string of the URL,
created in the Web page, and exchanged signals with the `RTCDataChannel`
created in the IWA `window` using [WICG File System Access](https://wicg.github.io/file-system-access/) for the
ability to send data to the IWA which is then passed to a `TCPSocket` instance for 
that sends the data to a Node.js, Deno, Bun, or txiki.js TCP socket server for processing, 
then sends the processed data back to the Web page using `RTCDataChannel`
in each `window`, see [telnet-client (user-defined-tcpsocket-controller-web-api branch)](https://github.com/guest271314/telnet-client), which is a
fork of [telnet-client](https://github.com/GoogleChromeLabs/telnet-client).

Now we will use the browser itself as a HTTP and WebSocket server over the `TCPServerSocket` interface.

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

is not technically accurate, as we'll demonstrate below, in code.

Some further reading about HTTP can be found here [HTTP - Hypertext Transfer Protocol](https://www.w3.org/Protocols/).

The reason for and use of the `Access-Control-Request-Private-Network` and `Access-Control-Allow-Private-Network`
headers can be found here [Private Network Access: introducing preflights](https://developer.chrome.com/blog/private-network-access-preflight).

An article and example of a basic HTTP server with comments explaining what is going on, including comments in the code, written in C,
can be found here [Making a simple HTTP webserver in C](https://bruinsslot.jp/post/simple-http-webserver-in-c/). We have
previously used that example to create a simple HTTP Web server for QuickJS, which does
not include a built-in Web server in the compiled `qjs` executable, see [webserver-c (quickjs-webserver branch)](https://github.com/guest271314/webserver-c/tree/quickjs-webserver).

### WebSocket server

For the WebSocket implementation [WebSocket - binary broadcast example (pure NodeJs implementation without any dependency)](https://gist.github.com/robertrypula/b813ffe23a9489bae1b677f1608676c8) is used.

### Chromium command-line switches

Launch Chromium or Chrome with 

```
--unsafely-treat-insecure-origin-as-secure=http://0.0.0.0:44818,ws://0.0.0.0:44818
```

to avoid Chromium rendering insecure connection notification in the address bar.

### Isolated Web App and Signed Web Bundle

- Substitute Web Cryptography API ([wbn-sign-webcrypto](https://github.com/guest271314/wbn-sign-webcrypto)) for `node:crypto` implementation of Ed25519 algorithm 
- Install and run same JavaScript source code in different JavaScript runtimes, e.g., `node`, `deno`, `bun`
- Integrity Block V2 supported

### TODO

- Create valid close frame (server to client) for WebSocket server; currently we abort the request in the server with `AbortController` when the WebSocket client closes the connection. Completed.
- Substitute `ArrayBuffer`, `DataView`, `TypedArray` for Node.js `Buffer` polyfill. Completed.
- TLS, HTTP/2, HTTP/3, WebTrasnport support
- Create Signed Web Bundle and Isolated Web App in the browser
- Improve HTTP and WebSocket header parsing

## Building

### Fetch dependencies

```
bun install
```

or 

```
npm install
```

or 

```
deno add npm:wbn
```

### Signed Web Bundle/Isolated Web App source files

Entry point is `assets` directory which contains `index.html`, `script.js`, `.well-known` directory with `manifest.webmanifest`, and any other scripts or resources to be bundled. 

### Generate private and public keys, write to file system 

This only has to be done once. `generateWebCryptoKeys.js` can be run with `node`, `deno`, or `bun`.

```
deno -A generateWebCryptoKeys.js
```


### Build the Signed Web Bundle and Isolated Web App

Write `signed.swbn` to current directory

Node.js 
```
node index.js
```

Bun
```
bun run index.js
```

Deno (Can be run without `node_modules` folder in current directory; fetches dependencies from https://esm.sh)
```
deno -A --import-map import-map.json index.js
```

### Build/rebuild `wbn-bundle.js` from `webbundle-plugins/packages/rollup-plugin-webbundle/src/index.ts` with `bun`


1. `git clone https://github.com/GoogleChromeLabs/webbundle-plugins`
2. `cd webbundle-plugins/packages/rollup-plugin-webbundle`
3. `bun install -p`
4. In `src/index.ts` comment line 18, `: EnforcedPlugin`, line 32 `const opts = await getValidatedOptionsWithDefaults(rawOpts);` and lines 65-121, because I will not be using Rollup
5. Bundle with Bun `bun build --target=node --format=esm --sourcemap=none --outfile=webpackage-bundle.js ./webbundle-plugins/packages/rollup-plugin-webbundle/src/index.ts`
6. Create reference to Web Cryptography API that will be used in the code in the bundled script instead of `node:crypto` directly `import { webcrypto } from "node:crypto";`
7. In `/node_modules/wbn-sign/lib/utils/utils.js` use `switch (key.algorithm.name) {`
8. `getRawPublicKey` becomes an `async` function for substituting `const exportedKey = await webcrypto.subtle.exportKey("spki", publicKey);` for `publicKey.export({ type: "spki", format: "der" });`
9. In `/node_modules/wbn-sign/lib/signers/integrity-block-signer.js` use `const publicKey = await signingStrategy.getPublicKey();` and `[getPublicKeyAttributeName(publicKey)]: await getRawPublicKey(publicKey)`; `verifySignature()` also becomes an `async` function where `const algorithm = { name: "Ed25519" }; const isVerified = await webcrypto.subtle.verify(algorithm, publicKey, signature, data);` is substituted for `const isVerified = crypto2.verify(undefined, data, publicKey, signature);`
10. In `/node_modules/wbn-sign/lib/web-bundle-id.js` `serialize()` function becomes `async` for `return base32Encode(new Uint8Array([...await getRawPublicKey(this.key), ...this.typeSuffix]), "RFC4648", { padding: false }).toLowerCase();`; and `serializeWithIsolatedWebAppOrigin()` becomes an `async` function for `return ${this.scheme}${await this.serialize()}/;`; `toString()` becomes an `async` function for `return Web Bundle ID: ${await this.serialize()} Isolated Web App Origin: ${await this.serializeWithIsolatedWebAppOrigin()};`
11. In `src/index.ts` `export {WebBundleId, bundleIsolatedWebApp};`
12. In `index.js`, the entry point for how I am creating the SWBN and IWA I get the public and private keys created with Web Cryptography API, and use Web Cryptography API to sign and verify

## Install Isolated Web App using Signed Web Bundle

Navigate to `chrome://web-app-internals/`, on the line beginning with `Install IWA from Signed Web Bundle:` click `Select file...` and select `signed.swbn`.

## Usage

See `https.js` and `ws.js` in `examples` directory.

We could recently open the IWA `window` from arbitrary Web sites in DevTools `console` or Snippets with 

```
var iwa = open("isolated-app://<IWA_ID>");
```

[iwa: Mark isolated-app: as being handled by Chrome](https://chromium-review.googlesource.com/c/chromium/src/+/5466063) evidently had the side effect of blocking that capability, see [window.open("isolated-app://<ID>") is blocked](https://issues.chromium.org/issues/339994757#comment6). [isolated-web-app-utilities](https://github.com/guest271314/isolated-web-app-utilities) provides approaches to open the IWA window from arbitrary Web sites, `chrome:`, `chrome-extension:` URL's.

### HTTP and WebSocket server

```
const socket = new TCPServerSocket("0.0.0.0", {
    localPort: 44818,
    // EtherNet/IP
  });
const { readable: server, localAddress, localPort } = await socket.opened;
const requests = [];
Object.assign(globalThis, { socket, server, abortable, requests });
await server.pipeTo(
  new WritableStream({
    async write(connection) {
      const { readable: client, writable, remoteAddress, remotePort } = await connection.opened;
      globalThis.requests.push({ remoteAddress, remotePort, client });
      client.pipeTo(
        new WritableStream({
          write(r) {
            const request = decoder.decode(r);
            // Handle Transfer-Encoding: chunked 
            if (!/(GET|POST|HEAD|OPTIONS|QUERY)/i.test(request) && !this.ws) {
              // ...
            }
            // Handle WebSocket request
            if (/^GET/.test(request) && /websocket/i.test(request)) {
              // ...
            }
            if (/^OPTIONS/.test(request)) {
              // ...
            }
            if (/^(POST|query)/i.test(request)) {
              // ...
            }
          }
        })
      )
    },
  })
)
```

### HTTP client

Using WHATWG Fetch, HTTP/1.1 `Transfer-Encoding: chunked` streaming request 

```
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
await scheduler.postTask(() => {}, { delay: 45 });
await writer.write(new Uint8Array(1024 ** 2 * 7).fill(1));
await writer.ready
  .then(() => writer.close())
  .catch(() => {});
await response.then((response) => {
  console.log(response);
});

```

### WebSocket client

```
var u8 = new Uint8Array(1024 ** 2 * 20).fill(1);

// Only aborts *before* the handshake
var abortable = new AbortController();
var {
  signal,
} = abortable;
var wss = new WebSocketStream("ws://127.0.0.1:44818", {
  signal
});
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

```

## License

Do What the Fuck You Want to Public License [WTFPLv2](http://www.wtfpl.net/about/)
