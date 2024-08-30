import {Router} from "express";
import {SecurityMiddleware} from "../../security/security.middleware";
import {DbUserMiddleware} from "./db-user.middleware";
import {DbUserService} from "./db-user.service";
import {DbUserRepository} from "./db-user.repository";

const security = new SecurityMiddleware();
const middleware = new DbUserMiddleware();
const service = new DbUserService(new DbUserRepository());

// /api/db/user
export const dbUserController = Router()

dbUserController.get(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeViewer,
    service.get,
);

dbUserController.post(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeEditor,
    service.post,
);

dbUserController.put(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeEditor,
    service.put,
);

dbUserController.delete(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeEditor,
    service.delete,
);
