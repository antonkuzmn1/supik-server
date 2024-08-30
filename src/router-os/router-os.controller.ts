import {Router} from "express";
import {SecurityMiddleware} from "../security/security.middleware";
import {RouterOsService} from "./router-os.service";
import {RouterOsRepository} from "./router-os.repository";
import {RouterOsMiddleware} from "./router-os.middleware";

const security = new SecurityMiddleware();
const middleware = new RouterOsMiddleware();
const service = new RouterOsService(new RouterOsRepository());

// /api/router-os
export const routerOsController = Router()

routerOsController.get(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    middleware.connectToRouter,
    service.get,
);

routerOsController.post(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    middleware.connectToRouter,
    service.post,
);

routerOsController.put(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    middleware.connectToRouter,
    service.put,
);

routerOsController.delete(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    middleware.connectToRouter,
    service.delete,
);
