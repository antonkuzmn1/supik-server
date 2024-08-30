import {Router} from "express";
import {DbRouterService} from "./db-router.service";
import {SecurityMiddleware} from "../../security/security.middleware";
import {DbRouterRepository} from "./db-router.repository";
import {DbRouterMiddleware} from "./db-router.middleware";

const security = new SecurityMiddleware();
const middleware = new DbRouterMiddleware();
const service = new DbRouterService(new DbRouterRepository());

// /api/db/router
export const dbRouterController = Router()

dbRouterController.get(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeViewer,
    service.get,
);

dbRouterController.post(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeEditor,
    service.post,
);

dbRouterController.put(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeEditor,
    service.put,
);

dbRouterController.delete(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeEditor,
    service.delete,
);
