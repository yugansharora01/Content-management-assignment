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
    changeOrigin: true
  })
);

router.use(
  "/reports",
  verifyToken,
  createProxyMiddleware({
    target: services.report,
    changeOrigin: true
  })
);

router.use(
  "/audit",
  verifyToken,
  createProxyMiddleware({
    target: services.audit,
    changeOrigin: true
  })
);

router.use(
  "/notifications",
  verifyToken,
  createProxyMiddleware({
    target: services.notification,
    changeOrigin: true
  })
);

export default router;