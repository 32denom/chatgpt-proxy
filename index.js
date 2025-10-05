import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

const TARGET = "https://chatgpt.com";

app.use(
  "/",
  createProxyMiddleware({
    target: TARGET,
    changeOrigin: true,
    secure: true,
    ws: true,
    onProxyReq: (proxyReq, req, res) => {
      proxyReq.setHeader("origin", TARGET);
      proxyReq.setHeader(
        "user-agent",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
      );
      proxyReq.setHeader("accept-language", "en-US,en;q=0.9");
    },
    onProxyRes: (proxyRes, req, res) => {
      // Убираем заголовки, которые мешают отображению
      delete proxyRes.headers["content-security-policy"];
      delete proxyRes.headers["x-frame-options"];
    },
    onError: (err, req, res) => {
      console.error("❌ Proxy error:", err.message);
      res.status(500).send("Proxy error: " + err.message);
    },
  })
);

app.get("*", (req, res) => {
  res.redirect(TARGET);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Proxy running on port ${PORT}`);
  console.log(`🌐 Forwarding to: ${TARGET}`);
});
