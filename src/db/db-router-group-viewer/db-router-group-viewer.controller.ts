import {SecurityMiddleware} from "../../security/security.middleware";
import {DbRouterMiddleware} from "../db-router/db-router.middleware";
import {Router} from "express";
import {DbRouterGroupViewerService} from "./db-router-group-viewer.service";
import {DbRouterGroupViewerRepository} from "./db-router-group-viewer.repository";

const security = new SecurityMiddleware();
const middleware = new DbRouterMiddleware();
const service = new DbRouterGroupViewerService(new DbRouterGroupViewerRepository());

// /api/db/router-group-viewer
export const dbRouterGroupViewerController = Router()

dbRouterGroupViewerController.post(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeEditor,
    service.post,
);

dbRouterGroupViewerController.delete(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeEditor,
    service.delete,
);
