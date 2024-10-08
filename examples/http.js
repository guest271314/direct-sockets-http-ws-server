fetch("http://0.0.0.0:44818", {
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
