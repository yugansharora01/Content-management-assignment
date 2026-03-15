import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { verifyToken } from "../middleware/auth.middleware.js";
import { services } from "../config/services.js";

const router = Router();

// Shared proxy error handler — prevents silent "pending" hangs when an
// upstream service is unreachable (http-proxy-middleware v3 requirement).
const onProxyError = (err, req, res) => {
  console.error(`[Proxy Error] ${req.method} ${req.path} →`, err.message);
  if (!res.headersSent) {
    res.status(502).json({ error: "Bad Gateway", message: err.message });
  }
};

router.use(
  "/auth",
  createProxyMiddleware({
    target: services.auth,
    changeOrigin: true,
    pathRewrite: {
      "^/auth": ""
    },
    on: { error: onProxyError, }
  })
);

router.use(
  "/content",
  verifyToken,
  createProxyMiddleware({
    target: services.content,
    changeOrigin: true,
    pathRewrite: {
      "^/content": ""
    },
    on: { error: onProxyError }
  })
);

router.use(
  "/reports",
  verifyToken,
  createProxyMiddleware({
    target: services.report,
    changeOrigin: true,
    pathRewrite: {
      "^/reports": ""
    },
    on: { error: onProxyError }
  })
);

router.use(
  "/audit",
  verifyToken,
  createProxyMiddleware({
    target: services.audit,
    changeOrigin: true,
    pathRewrite: {
      "^/audit": ""
    },
    on: { error: onProxyError }
  })
);

router.use(
  "/notifications",
  verifyToken,
  createProxyMiddleware({
    target: services.notification,
    changeOrigin: true,
    pathRewrite: {
      "^/notifications": ""
    },
    on: { error: onProxyError }
  })
);

export default router;