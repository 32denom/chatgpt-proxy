import express from "express";
import fetch from "node-fetch";

const app = express();

app.use(async (req, res) => {
  try {
    // Убедимся, что проксируем только внешние запросы, а не сами себя
    const target = "https://chat.openai.com" + req.url;

    // Выполняем запрос к ChatGPT
    const response = await fetch(target, {
      method: req.method,
      headers: {
        ...Object.fromEntries(req.headers),
        host: "chat.openai.com",
      },
      body: req.method === "GET" ? undefined : req.body,
    });

    // Передаём ответ клиенту
    res.status(response.status);
    response.headers.forEach((v, n) => res.setHeader(n, v));
    response.body.pipe(res);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy error: " + err.message);
  }
});

// Render автоматически подставит нужный порт
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Proxy running on port ${PORT}`));
