import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { verifyToken } from "../middleware/auth.middleware.js";
import { services } from "../config/services.js";

const router = Router();

router.use(
  "/auth",
  createProxyMiddleware({
    target: services.auth,
    changeOrigin: true,
    pathRewrite: {
      "^/auth": ""
    }
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
    }
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
    }
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
    }
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
    }
  })
);

export default router;