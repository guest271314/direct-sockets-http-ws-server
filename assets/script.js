import { WebSocketConnection } from "./websocket-server.js";
// Handle WebSocket handshake
// https://stackoverflow.com/a/77398427
async function digest(message, algo = "SHA-1") {
  return btoa(
    [
      ...new Uint8Array(
        await crypto.subtle.digest(
          algo,
          new TextEncoder().encode(
            `${message}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`,
          ),
        ),
      ),
    ].map((s) => String.fromCodePoint(s)).join(""),
  );
}
// Get Request-Line and Headers
// TODO: Get request line URI, protocol
function getHeaders(r) {
  const header = r.match(/.+/g).map((line) => line.split(/:\s|\s\/\s/));
  const [requestLine] = header.shift();
  const [method, uri, protocol] = requestLine.split(/\s/);
  const headers = new Headers(header);
  console.log({
    method,
    uri,
    protocol,
    headers,
  });
  const url = new URL(uri, `http://${headers.get("host")}`);
  const { servertype } = Object.fromEntries(url.searchParams);
  return {
    headers,
    uri,
    protocol,
    servertype,
  };
}
// IWA window
onload = async () => {
  resizeTo(300, 200);
  const USER_AGENT = "";
  console.log(USER_AGENT);

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const encode = (text) => encoder.encode(text);

  const socket = new TCPServerSocket("0.0.0.0", {
    localPort: 44818,
    // EtherNet/IP
  });

  const { readable: server, localAddress, localPort } = await socket.opened;
  const requests = [];
  const abortable = new AbortController();
  const { signal } = abortable;
  Object.assign(globalThis, { socket, server, abortable, requests });

  console.log({
    socket,
    server,
  });

  document.body.textContent = JSON.stringify(
    {
      localAddress,
      localPort,
    },
    null,
    2,
  );

  await server.pipeTo(
    new WritableStream({
      async write(connection) {
        const { readable: client, writable, remoteAddress, remotePort } =
          await connection.opened;
        globalThis.requests.push({ remoteAddress, remotePort, client });
        console.log({
          connection,
          requests,
        });

        const writer = writable.getWriter();
        globalThis.writer = writer;

        console.log({
          remoteAddress,
          remotePort,
        });

        // Don't await to handle multiple requests
        client.pipeTo(
          new WritableStream({
            start: (controller) => {
              this.ws = void 0;
              const { readable: wsReadable, writable: wsWritable } = new TransformStream, 
                wsWriter = wsWritable.getWriter();
              Object.assign(this, { wsReadable, wsWritable, wsWriter });
            },
            write: async (r, controller) => {
              const request = decoder.decode(r);
              // console.log(request);
              // Handle WebSocket
              if (!/(GET|POST|HEAD|OPTIONS|QUERY)/i.test(request)) {
                await this.wsWriter.ready;
                await this.wsWriter.write(r);
              }
              // Handle WebSocket request
              if (/^GET/.test(request) && /websocket/i.test(request)) {
                const { headers, method, uri, servertype } = getHeaders(
                  request,
                );
                const key = headers.get("sec-websocket-key");
                const accept = await digest(key);
                await writer.write(
                  encode("HTTP/1.1 101 Switching Protocols\r\n"),
                );
                await writer.write(encode("Upgrade: websocket\r\n"));
                await writer.write(encode("Connection: Upgrade\r\n"));
                await writer.write(
                  encode(`Sec-WebSocket-Accept: ${accept}\r\n\r\n`),
                );
                this.ws = new WebSocketConnection(this.wsReadable, writer)
                  .processWebSocketStream().catch((e) => {
                  throw e;
                });
                console.log(this.ws);
              }
              if (/^OPTIONS/.test(request)) {
                await writer.write(encode("HTTP/1.1 204 OK\r\n"));
                await writer.write(
                  encode(
                    "Access-Control-Allow-Headers: Access-Control-Request-Private-Network\r\n",
                  ),
                );
                await writer.write(
                  encode("Access-Control-Allow-Origin: *\r\n"),
                );
                await writer.write(
                  encode("Access-Control-Allow-Private-Network: true\r\n"),
                );
                await writer.write(
                  encode(
                    "Access-Control-Allow-Headers: Access-Control-Request-Private-Network\r\n\r\n",
                  ),
                );
                await writer.close();
              }
              // Handle POST, QUERY requests
              // Respond with Transfer-Encoding Content-Type
              // for uni-directional server to client streaming over HTTP/1.1
              if (/^(POST|query)/i.test(request)) {
                const [body] = request.match(
                  /(?<=\r\n\r\n)[a-zA-Z\d\s\r\n-:;=]+/igm,
                );
                console.log({
                  body,
                });
                await writer.write(encode("HTTP/1.1 200 OK\r\n"));
                await writer.write(
                  encode("Content-Type: application/octet-stream\r\n"),
                );
                await writer.write(
                  encode("Access-Control-Allow-Origin: *\r\n"),
                );
                await writer.write(
                  encode("Access-Control-Allow-Private-Network: true\r\n"),
                );
                await writer.write(
                  encode(
                    "Access-Control-Allow-Headers: Access-Control-Request-Private-Network\r\n",
                  ),
                );
                await writer.write(encode("Cache-Control: no-cache\r\n"));
                await writer.write(encode("Connection: close\r\n"));
                await writer.write(
                  encode("Transfer-Encoding: chunked\r\n\r\n"),
                );

                const chunk = encode(body.toUpperCase());
                const size = chunk.buffer.byteLength.toString(16);
                await writer.write(encode(`${size}\r\n`));
                await writer.write(chunk.buffer);
                await writer.write(encode("\r\n"));

                await writer.write(encode("0\r\n"));
                await writer.write(encode("\r\n"));
                await writer.close();
              }
            },
            close: () => {
              console.log("Client closed");
            },
            abort(reason) {
              console.log(reason);
            },
          }),
        ).catch(console.warn);
      },
      close() {
        console.log("Host closed");
      },
      abort(reason) {
        console.log("Host aborted", reason);
      },
    }),
    {
      signal,
    },
  ).then(() => console.log("Server closed")).catch(console.warn);
};
