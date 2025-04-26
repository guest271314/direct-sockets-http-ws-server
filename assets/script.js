// https://github.com/lsert/websocketparser
function wsparser(d) {
  const tArr = d;
  const group0 = tArr[0];
  const FIN = group0 >> 7;
  const RSV1 = (group0 & 64) >> 6;
  const RSV2 = (group0 & 32) >> 5;
  const RSV3 = (group0 & 16) >> 4;
  const opcode = group0 & 15;

  const group1 = tArr[1];
  const group2 = tArr[2];
  const group3 = tArr[3];

  // 计算数据开始点
  let counter = 2;

  const mask = group1 >> 7;
  const payloadLens = group1 & 127;
  let realLens = payloadLens;
  if (payloadLens === 126) {
    realLens = (group2 << 8) | group3;
    counter += 2;
  } else if (payloadLens === 127) {
    const ab = new ArrayBuffer(8);
    const dv = new DataView(ab);
    for (let i = 0; i < 8; i++) {
      dv.setUint8(i, tArr[i + 2]);
    }
    realLens = dv.getBigUint64(0, false);
    counter += 8;
  }

  let data;
  if (mask === 1) {
    const maskKeyArr = tArr.slice(counter, counter + 4);
    counter += 4;

    // 解掩码
    data = tArr.slice(counter).map((item, index) => {
      const j = index % 4;
      return item ^ maskKeyArr[j];
    });
  } else {
    data = tArr.slice(counter);
  }
  let arr = {
    FIN,
    mask,
    RSV1,
    RSV2,
    RSV3,
    opcode,
    realLens,
    data: new Uint8Array(data),
  };
  return arr;
}

// https://gist.github.com/robertrypula/b813ffe23a9489bae1b677f1608676c8
const createWebSocketFrame = (payload) => {
  const payloadLengthByteCount = payload.length < 126 ? 0 : 2;
  const buffer = new ArrayBuffer(2 + payloadLengthByteCount + payload.length);
  const view = new DataView(buffer);
  let payloadOffset = 2;
  console.log(payload.length, payloadLengthByteCount);
  // TODO: Handle greater than 65536 input ArrayBuffer byteLength (guest271314)
  if (payload.length >= Math.pow(2, 16)) {
    throw new Error("Payload equal or bigger than 64 KiB is not supported");
  }

  view.setUint8(0, 0b10000010);
  view.setUint8(1, payload.length < 126 ? payload.length : 126);
  if (payloadLengthByteCount > 0) {
    view.setUint16(2, payload.length, false);
    payloadOffset += payloadLengthByteCount;
  }

  for (let i = 0, j = payloadOffset; i < payload.length; i++, j++) {
    view.setUint8(j, payload[i]);
  }
  return buffer;
};

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
  // TODO:
  // Handle multiple connections
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
              console.log(controller);
              this.fragments = [];
            },
            write: async (r, controller) => {
              const request = decoder.decode(r);
              // console.log(request);
              // Handle WebSocket
              if (!/(GET|POST|HEAD|OPTIONS|QUERY)/i.test(request)) {
                let parsed = wsparser(r);
                console.log(
                  {
                    r,
                  },
                  parsed.data.length,
                  parsed.realLens,
                );
                // Handle fragmented frames up to 65536 byteLength
                // from input ArrayBuffer
                if (parsed.data.length < parsed.realLens) {
                  this.fragments.push(parsed.data);
                  console.log(this.fragments);
                  return;
                }
                if (this.fragments.length) {
                  const data = [];
                  do {
                    for (let i = 0; i < this.fragments.length; i++) {
                      data.push(...this.fragments.shift());
                    }
                  } while (this.fragments.length);
                  parsed.data = new Uint8Array([...data, ...r]);
                  console.log({
                    parsed,
                  });
                }
                // Handle client closing WebSocket
                if (parsed.opcode === 0x8 && parsed.data.length === 0) {
                  console.log(parsed.opcode, parsed.data);
                  await writer.write(new Uint8Array([0x88, 0x00]));
                  // 136, 0
                  await writer.close();
                  return await writer.closed;
                }
                // Write 16384 bytes
                for (let i = 0; i < parsed.data.length; i += 16384) {
                  await writer.write(
                    createWebSocketFrame(parsed.data.subarray(i, i + 16384)),
                  );
                }
                // Don't close WebSocket
                // await writer.close();
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
                // Don't close WebSocket
                // await writer.close();
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
