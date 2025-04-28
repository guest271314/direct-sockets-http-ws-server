// JavaScript runtime agnostic WebSocket server
//
// Fork of https://gist.github.com/d0ruk/3921918937e234988dfaccfdee781bd3
//
// The Definitive Guide to HTML5 WebSocket by Vanessa Wang, Frank Salim, and Peter Moskovits
// p. 51, Building a Simple WebSocket Server
//
// guest271314 2025 
// Do What the Fuck You Want to Public License WTFPLv2 http://www.wtfpl.net/about/
//
// Works as expected using node v24.0.0-nightly202504286cd1c09c10 and chrome (Chromium) 137.0.7147.0 
// deno 2.3.0-rc.3+229228a is *much* slower to process each write/read
// bun 1.2.11 halts after upgrade

class WebSocketConnection {
  readable;
  writable;
  writer;
  buffer = new Uint8Array(0);
  closed = !1;
  opcodes = { TEXT: 1, BINARY: 2, PING: 9, PONG: 10, CLOSE: 8 };
  constructor(readable, writable) {
    this.readable = readable;
    if (writable instanceof WritableStreamDefaultWriter)
      this.writer = writable;
    else if (writable instanceof WritableStream) {
      this.writable = writable;
      this.writer = this.writable.getWriter();
    }
  }
  async processWebSocketStream() {
    try {
      for await (const frame of this.readable) {
        const uint8 = new Uint8Array(this.buffer.length + frame.length);
        uint8.set(this.buffer, 0);
        uint8.set(frame, this.buffer.length);
        this.buffer = uint8;
        this.processFrame();
      }
      console.log("WebSocket connection closed.");
    } catch (e) {
      console.log(e);
      this.writer.close().catch(console.log);
    }
  }
  writeFrame(opcode, payload) {
    this.writer.write(this.encodeMessage(opcode, payload));
  }
  send(obj) {
    console.log({ obj });
    let opcode, payload;
    if (obj instanceof Uint8Array) {
      opcode = this.opcodes.BINARY;
      payload = obj;
    } else if (typeof obj == "string") {
      opcode = this.opcodes.TEXT;
      payload = obj;
    } else
      throw new Error("Cannot send object. Must be string or Uint8Array");
    this.writeFrame(opcode, payload);
  }
  close(code, reason) {
    const opcode = this.opcodes.CLOSE;
    let buffer;
    if (code) {
      buffer = new Uint8Array(reason.length + 2);
      var view = new DataView(buffer.buffer);
      view.setUint16(0, code, !1);
      buffer.set(reason, 2);
    } else
      buffer = new Uint8Array(0);
    console.log({ opcode, reason, buffer });
    this.writeFrame(opcode, buffer);
    this.writer.close();
    this.closed = !0;
  }
  processFrame() {
    let length, maskBytes;
    const buf = this.buffer, view = new DataView(buf.buffer);
    if (buf.length < 2)
      return !1;
    let idx = 2, b1 = view.getUint8(0), fin = b1 & 128, opcode = b1 & 15, b2 = view.getUint8(1), mask = b2 & 128;
    length = b2 & 127;
    if (length > 125) {
      if (buf.length < 8)
        return !1;
      if (length == 126) {
        length = view.getUint16(2, !1);
        idx += 2;
      } else if (length == 127) {
        if (view.getUint32(2, !1) != 0)
          this.close(1009, "");
        length = view.getUint32(6, !1);
        idx += 8;
      }
    }
    if (buf.length < idx + 4 + length)
      return !1;
    maskBytes = buf.slice(idx, idx + 4);
    idx += 4;
    let payload = buf.slice(idx, idx + length);
    payload = this.unmask(maskBytes, payload);
    this.handleFrame(opcode, payload);
    this.buffer = buf.slice(idx + length);
    if (this.buffer.length === 0) {
      console.log(`this.buffer.length: ${this.buffer.length}.`);
      return !1;
    }
    return !0;
  }
  handleFrame(opcode, buffer) {
    console.log({ opcode, length: buffer.length });
    const view = new DataView(buffer.buffer);
    let payload;
    switch (opcode) {
      case this.opcodes.TEXT:
        payload = buffer;
        this.writeFrame(opcode, payload);
        break;
      case this.opcodes.BINARY:
        payload = buffer;
        this.writeFrame(opcode, payload);
        break;
      case this.opcodes.PING:
        this.writeFrame(this.opcodes.PONG, buffer);
        break;
      case this.opcodes.PONG:
        break;
      case this.opcodes.CLOSE:
        let code, reason;
        if (buffer.length >= 2) {
          code = view.getUint16(0, !1);
          reason = (new TextDecoder()).decode(buffer);
        }
        this.close(code, reason);
        console.log("Close opcode.");
        break;
      default:
        this.close(1002, "unknown opcode");
    }
  }
  unmask(maskBytes2, data) {
    let payload = new Uint8Array(data.length);
    for (var i = 0;i < data.length; i++)
      payload[i] = maskBytes2[i % 4] ^ data[i];
    return payload;
  }
  encodeMessage(opcode, payload) {
    let buf, b1 = 128 | opcode, b2 = 0, length = payload.length;
    if (length < 126) {
      buf = new Uint8Array(payload.length + 2 + 0);
      const view = new DataView(buf.buffer);
      b2 |= length;
      view.setUint8(0, b1);
      view.setUint8(1, b2);
      buf.set(payload, 2);
    } else if (length < 65536) {
      buf = new Uint8Array(payload.length + 2 + 2);
      const view = new DataView(buf.buffer);
      b2 |= 126;
      view.setUint8(0, b1);
      view.setUint8(1, b2);
      view.setUint16(2, length);
      buf.set(payload, 4);
    } else {
      buf = new Uint8Array(payload.length + 2 + 8);
      const view = new DataView(buf.buffer);
      b2 |= 127;
      view.setUint8(0, b1);
      view.setUint8(1, b2);
      view.setUint32(2, 0, !1);
      view.setUint32(6, length, !1);
      buf.set(payload, 10);
    }
    return buf;
  }
  static KEY_SUFFIX = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
  static async hashWebSocketKey(secKeyWebSocket, writable) {
    const encoder = new TextEncoder, key = btoa([
      ...new Uint8Array(await crypto.subtle.digest("SHA-1", encoder.encode(`${secKeyWebSocket}${WebSocketConnection.KEY_SUFFIX}`)))
    ].map((s) => String.fromCodePoint(s)).join(""));
    return (new Response(`HTTP/1.1 101 Web Socket Protocol Handshake\r
Upgrade: WebSocket\r
Connection: Upgrade\r
sec-websocket-accept: ` + key + `\r
\r
`)).body.pipeTo(writable, { preventClose: !0 });
  }
}

export { WebSocketConnection };
