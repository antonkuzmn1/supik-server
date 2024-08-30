import {Router} from "express";
import {RouterService} from "./router.service";
import {SecurityMiddleware} from "../../security/security.middleware";
import {RouterRepository} from "./router.repository";
import {RouterMiddleware} from "./router.middleware";

const security = new SecurityMiddleware();
const middleware = new RouterMiddleware();
const service = new RouterService(new RouterRepository());

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
    middleware.accountShouldBeViewer,
    service.post,
);

dbRouterController.put(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeViewer,
    service.put,
);

dbRouterController.delete(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeViewer,
    service.delete,
);
