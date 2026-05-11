const express = require("express");
const path = require("path");
const client = require("prom-client");

const app = express();
const PORT = process.env.PORT || 5000;
const startTime = Date.now();

client.collectDefaultMetrics();

const httpRequestsTotal = new client.Counter({
  name: "pingpong_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: "pingpong_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

const appUptimeSeconds = new client.Gauge({
  name: "pingpong_app_uptime_seconds",
  help: "Application uptime in seconds",
});

app.use((req, res, next) => {
  const start = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9;
    const route = req.route ? req.route.path : req.path;

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
    });

    httpRequestDurationSeconds.observe(
      {
        method: req.method,
        route,
        status_code: res.statusCode,
      },
      duration
    );
  });

  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    app: "ping-pong-devops",
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    app: "Ping Pong DevOps App",
    version: "1.0.0",
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
  });
});

app.get("/metrics", async (req, res) => {
  appUptimeSeconds.set(Math.floor((Date.now() - startTime) / 1000));
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ping Pong app running on http://0.0.0.0:${PORT}`);
  });
}

module.exports = app;