import express from "express";
import fetch from "node-fetch";

const app = express();

// Middleware для логирования
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

app.use(async (req, res) => {
  try {
    // Если кто-то случайно делает запрос прямо к Render — возвращаем 403
    if (req.hostname.includes("onrender.com")) {
      return res.status(403).send("Direct access blocked (use ChatGPT target)");
    }

    // Основная цель: проксировать к chat.openai.com
    const target = "https://chat.openai.com" + req.url;

    const response = await fetch(target, {
      method: req.method,
      headers: {
        ...Object.fromEntries(req.headers),
        host: "chat.openai.com",
      },
      body: req.method === "GET" ? undefined : req.body,
    });

    // Копируем ответ
    res.status(response.status);
    response.headers.forEach((v, n) => res.setHeader(n, v));
    response.body.pipe(res);
  } catch (err) {
    console.error("❌ Proxy error:", err);
    res.status(500).send("Proxy error: " + err.message);
  }
});

// Render подставит нужный порт
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Proxy running on port ${PORT}`));
