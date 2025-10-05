import express from "express";
import fetch from "node-fetch";
const app = express();

app.use(async (req, res) => {
  try {
    const target = "https://chat.openai.com" + req.url;
    const response = await fetch(target, {
      method: req.method,
      headers: req.headers,
      body: req.method === "GET" ? undefined : req.body,
    });

    res.status(response.status);
    response.headers.forEach((v, n) => res.setHeader(n, v));
    response.body.pipe(res);
  } catch (err) {
    res.status(500).send("Proxy error: " + err.message);
  }
});

app.listen(3000, () => console.log("Proxy running on port 3000"));
