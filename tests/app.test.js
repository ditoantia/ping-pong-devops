const request = require("supertest");
const app = require("../server");

describe("Ping Pong DevOps App", () => {
  test("GET / should return the game page", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Ping Pong DevOps App");
  });

  test("GET /health should return ok", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.app).toBe("ping-pong-devops");
  });

  test("GET /api/status should return app status", async () => {
    const response = await request(app).get("/api/status");

    expect(response.statusCode).toBe(200);
    expect(response.body.app).toBe("Ping Pong DevOps App");
    expect(response.body.version).toBe("1.0.0");
  });

  test("GET /metrics should return Prometheus metrics", async () => {
    const response = await request(app).get("/metrics");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("pingpong_http_requests_total");
  });
});