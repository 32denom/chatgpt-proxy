import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

// основной целевой сайт
const TARGET = "https://chatgpt.com"; // можно заменить на "https://chat.openai.com"

app.use(
  "/",
  createProxyMiddleware({
    target: TARGET,
    changeOrigin: true,
    ws: true,
    secure: true,
    onProxyReq(proxyReq, req, res) {
      proxyReq.setHeader("origin", TARGET);
    },
    onError(err, req, res) {
      console.error("❌ Proxy error:", err.message);
      res.status(500).send("Proxy error: " + err.message);
    },
  })
);

// если пользователь зашёл напрямую — перекидываем на целевой сайт
app.get("*", (req, res) => {
  res.redirect(TARGET);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Proxy running on port ${PORT}`);
  console.log(`🌐 Forwarding to: ${TARGET}`);
});
