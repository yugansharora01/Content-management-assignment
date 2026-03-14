import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { services } from "../config/services.js";

const router = Router();

router.use(
  "/auth",
  createProxyMiddleware({
    target: services.auth,
    changeOrigin: true
  })
);

router.use(
  "/content",
  createProxyMiddleware({
    target: services.content,
    changeOrigin: true
  })
);

router.use(
  "/reports",
  createProxyMiddleware({
    target: services.report,
    changeOrigin: true
  })
);

router.use(
  "/audit",
  createProxyMiddleware({
    target: services.audit,
    changeOrigin: true
  })
);

router.use(
  "/notifications",
  createProxyMiddleware({
    target: services.notification,
    changeOrigin: true
  })
);

export default router;