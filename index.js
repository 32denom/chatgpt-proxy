import express from "express";
import fetch from "node-fetch";

const app = express();

// Логирование для отладки
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

app.use(async (req, res) => {
  try {
    // Блокируем прямой доступ к Render, чтобы не зацикливаться
    if (req.hostname.includes("onrender.com")) {
      return res.status(403).send("Direct access blocked. Use the proxy target domain.");
    }

    // Формируем адрес назначения (можно поменять на chatgpt.com)
    const target = "https://chat.openai.com" + req.url;

    // Преобразуем заголовки безопасным способом
    const safeHeaders = {};
    for (const [key, value] of Object.entries(req.headers)) {
      // Игнорируем проблемные служебные заголовки
      if (["host", "connection", "content-length"].includes(key.toLowerCase())) continue;
      safeHeaders[key] = value;
    }

    // Выполняем запрос к целевому серверу
    const response = await fetch(target, {
      method: req.method,
      headers: safeHeaders,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
    });

    // Пересылаем ответ клиенту
    res.status(response.status);
    for (const [name, value] of response.headers) {
      res.setHeader(name, value);
    }
    response.body.pipe(res);
  } catch (err) {
    console.error("❌ Proxy error:", err);
    res.status(500).send("Proxy error: " + err.message);
  }
});

// Render подставляет PORT сам
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Proxy running on port ${PORT}`));
