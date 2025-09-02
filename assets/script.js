import { WebSocketConnection } from "./websocket-server.js";
import { getChunkData } from "./get-chunked-data.js";
// Get Request-Line and Headers
// TODO: Get request line URI, protocol
function getHeaders(r) {
  const header = r.match(/.+/g).map((line) => line.split(/:\s|\s\/\s/)).filter((h) => h.length > 1);
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
  const currentHeaders = new Headers();
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
        const requestAbortController = new AbortController();
        console.log({
          remoteAddress,
          remotePort,
        });
        // Transfer-Encoding: chunked 
        const closeChunkData = new Uint8Array([48, 13, 10, 13, 10]);
        let pendingChunkLength = 0;
        let len = 0;

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
              // Handle Transfer-Encoding: chunked streaming request
              if (!/(GET|POST|HEAD|OPTIONS|QUERY)/i.test(request) && !this.ws) {
                if (len === 0) {
                  // Handle Deno WebSocket client sending 22 (extra) bytes after WebSocket is closed
                  if (!globalThis.currentHeaders.get("transfer-encoding")) {
                    console.table([...globalThis.currentHeaders]);
                    console.log(r);
                    return;
                  }
                }
                if (pendingChunkLength) {
                  const pendingChunkData = r.subarray(0, pendingChunkLength);
                  len += pendingChunkData.length;
                  // console.log(pendingChunkData, len);
                  let {
                    crlfIndex,
                    chunkLength,
                    chunkBuffer,
                    inputBufferLength,
                  } = getChunkedData(r.subarray(pendingChunkLength - 1));
                  if (chunkBuffer && chunkBuffer.length) {
                    len += chunkBuffer.length;
                    // console.log(chunkBuffer, len);
                  }
                  pendingChunkLength = 0;
                  return;
                }
                let {
                  crlfIndex,
                  chunkLength,
                  chunkBuffer,
                  inputBufferLength,
                } = getChunkedData(r);

                if (
                  chunkBuffer.length === 0 &&
                  chunkBuffer.buffer.byteLength === closeChunkData.buffer.byteLength
                ) {
                  const buffer = new Uint8Array(chunkBuffer.buffer);
                  // Close data
                  const closeBytes = closeChunkData.every((v, k) =>
                    v === buffer[k]
                  );
                  // console.log({ closeBytes, buffer });
                  // console.groupEnd("chunked");
                  await writer.write(
                    encode(
                      "HTTP/1.1 200 OK\r\n" +
                        "Content-Type: application/octet-stream\r\n" +
                        "Access-Control-Allow-Origin: *\r\n" +
                        "Access-Control-Allow-Private-Network: true\r\n" +
                        "Access-Control-Allow-Headers: Access-Control-Request-Private-Network\r\n" +
                        "Cache-Control: no-cache\r\n" +
                        "Connection: keepalive\r\n" +
                        "Transfer-Encoding: chunked\r\n\r\n",
                    ),
                  );
                  const message = `Received ${len} bytes from client`;
                  const chunk = encode(message);
                  const size = chunk.buffer.byteLength.toString(16);
                  await writer.write(encode(`${size}\r\n`));
                  await writer.write(chunk.buffer);
                  await writer.write(encode("\r\n"));
                  await writer.write(encode("0\r\n"));
                  await writer.write(encode("\r\n"));
                  await writer.close();
                  await writer.closed;
                  requestAbortController.abort("Transfer-Encoding: chunked request aborted");
                  console.log(message);
                  return;
                } else {
                  len += chunkBuffer.length;
                }
                // console.log(chunkBuffer, len);
                if (chunkBuffer.length < chunkLength) {
                  pendingChunkLength = chunkLength - chunkBuffer.length;
                }
              }          
              // Handle WebSocket request
              if (/^GET/.test(request) && /websocket/i.test(request)) {
                const { headers, method, uri, servertype } = getHeaders(
                  request,
                );
                const key = headers.get("sec-websocket-key");
                await WebSocketConnection.hashWebSocketKey(
                  key,
                  writer,
                );
                this.ws = new WebSocketConnection(this.wsReadable, writer);
                this.ws.processWebSocketStream().catch((e) => {
                  throw e;
                });
                console.log(this.ws);
                // Keep track of current request headers to handle Deno sending 22 extra bytes after WebSocket close
                for (const k of globalThis.currentHeaders.keys()) {
                  globalThis.currentHeaders.delete(k);
                };
                for (const [k, v] of headers) {
                  globalThis.currentHeaders.set(k, v);
                };
                this.ws.incomingStream.pipeTo(
                  new WritableStream({
                    write: async ({ opcode, payload }) => {
                      // console.log({opcode, payload});
                      if (opcode === this.ws.opcodes.CLOSE && payload.buffer.byteLength === 0) {
                        return await this.ws.close(
                            1000,
                            payload,
                          );
                      }
                      await this.ws.writeFrame(opcode, payload);
                    },
                  }),
                ).catch(() => {
                  console.log(`Incoming WebSocketStream closed`, this.ws);
                  if (!this.ws.closed) {
                    Promise.allSettled([
                      this.ws?.writable?.close(),
                      this.ws.writer.close(),
                      this.ws.readable.cancel(),
                      this.ws.close(),
                    ]).catch(console.log);
                  }
                });
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
                const { headers, method, uri, servertype } = getHeaders(
                  request,
                );
                // Handle Deno WebSocket client sending 22 (extra) bytes after WebSocket is closed, e.g., 
                // [136, 144, 234, 110, 246, 61, 249, 233, 178, 82, 132, 11, 214, 78, 158, 28, 147, 92, 135, 7, 152, 90]
                // [136, 144, 51, 194, 179, 223, 32, 69, 247, 176, 93, 167, 147, 172, 71, 176, 214, 190, 94, 171, 221, 184]
                // which can wind up in Transfer-Encoding: chunked parsing block
                for (const k of globalThis.currentHeaders.keys()) {
                  globalThis.currentHeaders.delete(k);
                };
                for (const [k, v] of headers) {
                  globalThis.currentHeaders.set(k, v);
                };
                // Handle Firefox Transfer-Encoding: chunked POST request, and Chromium
                // which does not provide HTTP/1.1 streaming upload as
                // Chromium with `duplex: "half", body: readable, allowHTTP1ForStreamingUpload: true`
                if (globalThis.currentHeaders.has("content-length")) {
                  try {
                    const body = r.subarray(
                      -(globalThis.currentHeaders.get("content-length")),
                    );
                    // const [body] = request.match(
                    //  (?<=\r\n\r\n)[a-zA-Z\d\s\r\n-:;=]+/igm,
                    // );
                    console.log({
                      body,
                    });
                    await writer.ready;
                    await writer.write(
                      encode(
                        "HTTP/1.1 200 OK\r\n" +
                          "Content-Type: application/octet-stream\r\n" +
                          "Access-Control-Allow-Origin: *\r\n" +
                          "Access-Control-Allow-Private-Network: true\r\n" +
                          "Access-Control-Allow-Headers: Access-Control-Request-Private-Network\r\n" +
                          "Cache-Control: no-cache\r\n" +
                          "Connection: keepalive\r\n" +
                          "Transfer-Encoding: chunked\r\n\r\n",
                      ),
                    );
                    // Streaming response to fetch() => Response.body
                    for (let i = 0; i < body.length; i += 4096) {
                      const chunk = body.subarray(i, i + 4096);
                      const size = chunk.length.toString(16);
                      await writer.write(encode(`${size}\r\n`));
                      await writer.write(chunk);
                      await writer.write(encode("\r\n"));
                    }

                    await writer.write(encode("0\r\n"));
                    await writer.write(encode("\r\n"));
                    await writer.close();
                    globalThis.currentHeaders.delete("content-length");
                    requestAbortController.abort("Transfer-Encoding: chunked request aborted");
                  } catch (e) {
                    console.log(e);
                    console.table([...headers]);
                  }
                }
              }
            },
            close: () => {
              console.log("Client closed");
            },
            abort(reason) {
              console.log(reason);
            },
          }),
          { signal: requestAbortController.signal },
        ).catch((e) => e?.message || e).then((message) =>
          console.log("Client closed", message)
        );
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
