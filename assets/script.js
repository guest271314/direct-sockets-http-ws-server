// TODO: TLS, HTTP/2
const debugBuffer = (bufferName, buffer) => {
  const length = buffer ? buffer.length : "---";
  console.log(`:: DEBUG - ${bufferName} | ${length} | `, buffer, "\n");
};

/*
  https://tools.ietf.org/html/rfc6455#section-5.2
    0                   1                   2                   3
    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
   +-+-+-+-+-------+-+-------------+-------------------------------+
   |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
   |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
   |N|V|V|V|       |S|             |   (if payload len==126/127)   |
   | |1|2|3|       |K|             |                               |
   +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
   |     Extended payload length continued, if payload len == 127  |
   + - - - - - - - - - - - - - - - +-------------------------------+
   |                               |Masking-key, if MASK set to 1  |
   +-------------------------------+-------------------------------+
   | Masking-key (continued)       |          Payload Data         |
   +-------------------------------- - - - - - - - - - - - - - - - +
   :                     Payload Data continued ...                :
   + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
   |                     Payload Data continued ...                |
   +---------------------------------------------------------------+
  OpCode
    %x0 denotes a continuation frame
    %x1 denotes a text frame
    %x2 denotes a binary frame
    %x3–7 are reserved for further non-control frames
    %x8 denotes a connection close
    %x9 denotes a ping
    %xA denotes a pong
    %xB-F are reserved for further control frames
*/

// ---------------------------------------------------------

const createWebSocketFrame = (payload) => {
  const payloadLengthByteCount = payload.length < 126 ? 0 : 2;
  const buffer = new ArrayBuffer(2 + payloadLengthByteCount + payload.length);
  const view = new DataView(buffer);
  let payloadOffset = 2;

  if (payload.length >= Math.pow(2, 16)) {
    throw new Error("Payload equal or bigger than 64 KiB is not supported");
  }

  view.setUint8(0, 0b10000010);
  view.setUint8(1, payload.length < 126 ? payload.length : 126);
  if (payloadLengthByteCount > 0) {
    view.setUint16(2, payload.length);
    payloadOffset += payloadLengthByteCount;
  }

  for (let i = 0, j = payloadOffset; i < payload.length; i++, j++) {
    view.setUint8(j, payload[i]);
  }
  return buffer;
};

// ---------------------------------------------------------

const getParsedBuffer = (buffer) => {
  console.log({ buffer });
  const view = new DataView(buffer.buffer);
  let bufferRemainingBytes;
  let currentOffset = 0;
  let maskingKey;
  let payload;

  if (currentOffset + 2 > buffer.length) {
    return { payload: null, bufferRemainingBytes: buffer };
  }

  const firstByte = view.getUint8(currentOffset++);
  const secondByte = view.getUint8(currentOffset++)
  const isFinalFrame = !!((firstByte >>> 7) & 0x1);
  const opCode = firstByte & 0xf;
  const isMasked = !!((secondByte >>> 7) & 0x1); // https://security.stackexchange.com/questions/113297
  let payloadLength = secondByte & 0x7f;

  if (!isFinalFrame) {
    console.log("[not final frame detected]\n");
  }

  if (opCode === 0x8) {
    console.log("[connection close frame]\n");
    // TODO read payload, for example payload equal to <0x03 0xe9> means 1001:
    //   1001 indicates that an endpoint is "going away", such as a server
    //   going down or a browser having navigated away from a page.
    // More info here: https://tools.ietf.org/html/rfc6455#section-7.4
    return { payload: null, bufferRemainingBytes: null };
  }

  if (opCode !== 0x2 && opCode !== 0x0) {
    throw new Error("Only binary and continuation frames are supported");
  }

  if (payloadLength > 125) {
    if (payloadLength === 126) {
      if (currentOffset + 2 > buffer.length) {
        return { payload: null, bufferRemainingBytes: buffer };
      }
      payloadLength = view.getUint16(currentOffset);
      currentOffset += 2;
    } else {
      throw new Error("Payload equal or bigger than 64 KiB is not supported");
    }
  }

  if (isMasked) {
    if (currentOffset + 4 > buffer.length) {
      return { payload: null, bufferRemainingBytes: buffer };
    }
    maskingKey = view.getUint32(currentOffset);
    currentOffset += 4;
  }

  if (currentOffset + payloadLength > buffer.length) {
    console.log("[misalignment between WebSocket frame and NodeJs Buffer]\n");
    return { payload: null, bufferRemainingBytes: buffer };
  }

  payload = new Uint8Array(payloadLength);

  if (isMasked) {
    for (let i = 0, j = 0; i < payloadLength; ++i, j = i % 4) {
      const shift = j === 3 ? 0 : (3 - j) << 3;
      const mask = (shift === 0 ? maskingKey : maskingKey >>> shift) & 0xff;

      payload[i] = mask ^ view.getUint8(currentOffset++);
    }
  } else {
    for (let i = 0; i < payloadLength; i++) {
      payload[i] = view.getUint8(currentOffset++);
    }
  }

  bufferRemainingBytes = new Uint8Array(buffer.length - currentOffset);
  for (let i = 0; i < bufferRemainingBytes.length; i++) {
    bufferRemainingBytes[i] = view.getUint8(currentOffset++);
  }

  return { payload, bufferRemainingBytes };
};

function parseWebSocketFrame(buffer) {
  let bufferToParse = buffer;
  let parsedBuffer;
  do {
    parsedBuffer = getParsedBuffer(bufferToParse);
    debugBuffer("buffer", buffer);
    debugBuffer("bufferToParse", bufferToParse);
    debugBuffer("parsedBuffer.payload", parsedBuffer.payload);
    debugBuffer(
      "parsedBuffer.bufferRemainingBytes",
      parsedBuffer.bufferRemainingBytes,
    );
    if (parsedBuffer.payload === null) {
      return parsedBuffer.payload;
    }
    bufferToParse = parsedBuffer.bufferRemainingBytes;

    if (parsedBuffer.payload) {
      console.log(parsedBuffer);
      break;
    }
  } while (parsedBuffer.payload && parsedBuffer.bufferRemainingBytes.length);
  return createWebSocketFrame(parsedBuffer.payload);
}

// https://stackoverflow.com/a/77398427
async function digest(message, algo = "SHA-1") {
  const { promise, resolve } = Promise.withResolvers();
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.readAsDataURL(
    new Blob([
      new Uint8Array(
        await crypto.subtle.digest(
          algo,
          new TextEncoder().encode(
            `${message}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`,
          ),
        ),
      ),
    ]),
  );
  const result = await promise;
  return result.split(",").pop();
}
// Get Request-Line and Headers
function getHeaders(r) {
  console.log(r);
  const header = r.match(/.+/g).map((line) => line.split(/:\s|\s\/\s/));
  const [requestLine] = header.shift();
  const [method, uri, protocol] = requestLine.split(/\s/);
  const headers = new Headers(header);
  console.log({method, uri, protocol, headers});
  const url = new URL(uri, `http://${headers.get("host")}`);
  const { servertype } = Object.fromEntries(url.searchParams);
  return { headers, uri, protocol, servertype }; 
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
    localPort: 44818, // EtherNet/IP
  });

  const {
    readable: server,
    localAddress,
    localPort,
  } = await socket.opened;

  console.log({ server });
  // TODO:
  // Handle multiple connections
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
        document.body.textContent = JSON.stringify(
          { localAddress, localPort, remoteAddress, remotePort },
            null,
            2,
          );
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
              // Handle WebSocket
              if (!/(GET|POST|HEAD|OPTIONS|QUERY)/i.test(request)) {
                console.log({ data: r });
                const response = parseWebSocketFrame(r);
                console.log({ response });
                if (response === null) {
                  await writer.write(new Uint8Array([0x88, 0x00])); // 136, 0
                  await writer.close();
                  return await writer.closed;
                  // return abortable.abort("WebSocket closed by client, aborted in server");
                }
                await writer.write(response);
                // Don't close WebSocket
                // await writer.close();
              }
              if (/^GET/.test(request) && /websocket/i.test(request)) {
                const { headers, method, uri, servertype } = getHeaders(request);
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
                /*
                const response = await fetch("https://gist.githubusercontent.com/guest271314/73a50e9ebc6acaaff5d39f6fc7918ebf/raw/85bce58862fcf905ce7beba1a837a5c778ba8e47/http_over_tcp_browser_server.md");
                await response.body.pipeTo(
                  new WritableStream({
                    async write(chunk) {
                      const size = chunk.buffer.byteLength.toString(16);
                      // console.log(chunk.buffer.byteLength, size);
                      await writer.write(encode(`${size}\r\n`));
                      await writer.write(chunk.buffer);
                      await writer.write(encode("\r\n"));
                    },
                    close() {
                      console.log("Stream closed");
                    },
                  }),
                );
                */
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
