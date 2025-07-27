// JavaScript runtime agnostic WebSocket server
//
// Fork of https://gist.github.com/d0ruk/3921918937e234988dfaccfdee781bd3
//
// The Definitive Guide to HTML5 WebSocket by Vanessa Wang, Frank Salim, and Peter Moskovits
// p. 51, Building a Simple WebSocket Server
//
// guest271314 2025
// Do What the Fuck You Want to Public License WTFPLv2 http://www.wtfpl.net/about/

class WebSocketConnection {
  readable;
  writable;
  writer;
  incomingStream = new ReadableStream({
    start: (_) => {
      return this.incomingStreamController = _;
    },
  });
  buffer = new ArrayBuffer(0, { maxByteLength: 1024 ** 2 });
  closed = !1;
  opcodes = { TEXT: 1, BINARY: 2, PING: 9, PONG: 10, CLOSE: 8 };
  constructor(readable, writable, abortController) {
    this.readable = readable;
    this.abortController = abortController;
    if (writable instanceof WritableStreamDefaultWriter) {
      this.writer = writable;
    } else if (writable instanceof WritableStream) {
      this.writable = writable;
      this.writer = this.writable.getWriter();
    }
  }
  async processWebSocketStream() {
    try {
      for await (const frame of this.readable) {
        if (!this.closed) {
          const { byteLength } = this.buffer;
          this.buffer.resize(byteLength + frame.length);
          const view = new DataView(this.buffer);
          for (let i = 0, j = byteLength; i < frame.length; i++, j++) {
            view.setUint8(j, frame.at(i));
          }
          await this.processFrame();
        } else {
          break;
        }
      }
      console.log("WebSocket connection closed.");
    } catch (e) {
      console.log(e);
      console.trace();
    }
  }
  async processFrame() {
    let length, maskBytes;
    const buffer = new Uint8Array(this.buffer),
      view = new DataView(buffer.buffer);
    if (buffer.length < 2) {
      return !1;
    }
    let idx = 2,
      b1 = view.getUint8(0),
      fin = b1 & 128,
      opcode = b1 & 15,
      b2 = view.getUint8(1),
      mask = b2 & 128;
    length = b2 & 127;
    if (length > 125) {
      if (buffer.length < 8) {
        return !1;
      }
      if (length == 126) {
        length = view.getUint16(2, !1);
        idx += 2;
      } else if (length == 127) {
        if (view.getUint32(2, !1) != 0) {
          await this.close(1009, "");
        }
        length = view.getUint32(6, !1);
        idx += 8;
      }
    }
    if (buffer.length < idx + 4 + length) {
      return !1;
    }
    maskBytes = buffer.subarray(idx, idx + 4);
    idx += 4;
    let payload = buffer.subarray(idx, idx + length);
    payload = this.unmask(maskBytes, payload);
    this.incomingStreamController.enqueue({ opcode, payload });
    if (this.buffer.byteLength === 0 && this.closed) {
      try {
        return !0;
      } catch (e) {
        console.log(e);
      }
    }
    if (idx + length === 0) {
      console.log(`this.buffer.length: ${this.buffer.byteLength}.`);
      return !1;
    }

    for (let i = 0, j = idx + length; j < this.buffer.byteLength; i++, j++) {
      view.setUint8(i, view.getUint8(j));
    }
    this.buffer.resize(this.buffer.byteLength - (idx + length));
    return !0;
  }
  async writeFrame(opcode, buffer) {
    await this.writer.ready;
    if (opcode === this.opcodes.TEXT) {
      return await this.writer.write(this.encodeMessage(opcode, buffer))
        .catch(console.log);
    }
    if (opcode === this.opcodes.BINARY) {
      return await this.writer.write(this.encodeMessage(opcode, buffer))
        .catch(console.log);
    }
    if (opcode === this.opcodes.PING) {
      return await this.writer.write(
        this.encodeMessage(this.opcodes.PONG, buffer),
      )
        .catch(console.log);
    }
    /*
      case this.opcodes.PONG:
        break;
    */
    if (opcode === this.opcodes.CLOSE) {
      const view = new DataView(buffer.buffer);
      let code, reason;
      if (buffer.length >= 2) {
        code = view.getUint16(0, !1);
        reason = buffer.subarray(2);
      }
      return await this.close(code, reason)
        .then(() =>
          console.log("Close opcode.", code, new TextDecoder().decode(reason))
        );
    } else {
      return await this.close(1002, "unknown opcode");
    }
  }
  async send(obj) {
    let opcode, payload;
    if (obj instanceof Uint8Array) {
      opcode = this.opcodes.BINARY;
      payload = obj;
    } else if (typeof obj == "string") {
      opcode = this.opcodes.TEXT;
      payload = new TextEncoder().encode(obj);
    } else {
      throw new Error("Cannot send object. Must be string or Uint8Array");
    }
    await this.writeFrame(opcode, payload);
  }
  async close(code, reason) {
    const opcode = this.opcodes.CLOSE;
    let buffer;
    if (code) {
      buffer = new Uint8Array(reason.length + 2);
      const view = new DataView(buffer.buffer);
      view.setUint16(0, code, !1);
      buffer.set(reason, 2);
    } else {
      buffer = new Uint8Array(0);
    }
    console.log({ opcode, reason, buffer }, new TextDecoder().decode(reason));
    this.incomingStreamController.close();
    await this.writer.write(this.encodeMessage(opcode, buffer))
      .catch(console.log);
    await this.writer.close();
    await this.writer.closed;
    this.buffer.resize(0);
    this.closed = !0;
  }
  unmask(maskBytes2, data) {
    let payload = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      payload[i] = maskBytes2[i % 4] ^ data[i];
    }
    return payload;
  }
  encodeMessage(opcode, payload) {
    let buffer, b1 = 128 | opcode, b2 = 0, length = payload.length;
    if (length < 126) {
      buffer = new Uint8Array(payload.length + 2 + 0);
      const view = new DataView(buffer.buffer);
      b2 |= length;
      view.setUint8(0, b1);
      view.setUint8(1, b2);
      buffer.set(payload, 2);
    } else if (length < 65536) {
      buffer = new Uint8Array(payload.length + 2 + 2);
      const view = new DataView(buffer.buffer);
      b2 |= 126;
      view.setUint8(0, b1);
      view.setUint8(1, b2);
      view.setUint16(2, length);
      buffer.set(payload, 4);
    } else {
      buffer = new Uint8Array(payload.length + 2 + 8);
      const view = new DataView(buffer.buffer);
      b2 |= 127;
      view.setUint8(0, b1);
      view.setUint8(1, b2);
      view.setUint32(2, 0, !1);
      view.setUint32(6, length, !1);
      buffer.set(payload, 10);
    }
    return buffer;
  }
  static KEY_SUFFIX = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
  static async hashWebSocketKey(secKeyWebSocket, writable) {
    // Use Web Cryptography API crypto.subtle where defined
    console.log(secKeyWebSocket, globalThis?.crypto?.subtle);
    const encoder = new TextEncoder();
    if (globalThis?.crypto?.subtle) {
      const key = btoa(
        [
          ...new Uint8Array(
            await crypto.subtle.digest(
              "SHA-1",
              encoder.encode(
                `${secKeyWebSocket}${WebSocketConnection.KEY_SUFFIX}`,
              ),
            ),
          ),
        ].map((s) => String.fromCodePoint(s)).join(""),
      );
      const header = `HTTP/1.1 101 Web Socket Protocol Handshake\r
Upgrade: WebSocket\r
Connection: Upgrade\r
sec-websocket-accept: ` + key + `\r
\r
`;
      return writable instanceof WritableStream
        ? (new Response(header)).body.pipeTo(writable, { preventClose: !0 })
        : writable.write(encoder.encode(header));
    } else {
      // txiki.js does not support Web Cryptography API crypto.subtle
      // Use txiki.js specific tjs:hashing or
      // https://raw.githubusercontent.com/kawanet/sha1-uint8array/main/lib/sha1-uint8array.ts
      const { createHash } = await import("./sha1-uint8array.min.js");
      const encoder = new TextEncoder();
      const hash = createHash("sha1").update(
        `${secKeyWebSocket}${WebSocketConnection.KEY_SUFFIX}`,
      ).digest();
      const key = btoa(
        String.fromCodePoint(...hash),
      );
      const header = "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" +
        "Upgrade: WebSocket\r\n" +
        "Connection: Upgrade\r\n" +
        "Sec-Websocket-Accept: " + key + "\r\n\r\n";
      const encoded = encoder.encode(header);
      return writable instanceof WritableStream
        ? new Response(encode).body.pipeTo(writable, { preventClose: !0 })
        : writable.write(encoded);
    }
  }
}

export { WebSocketConnection };
