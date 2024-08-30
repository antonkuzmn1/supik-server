import {Router} from "express";
import {SecurityMiddleware} from "../security.middleware";
import {AccountService} from "./account.service";

const security = new SecurityMiddleware();
const service = new AccountService();

// /api/security/account
export const accountController = Router();

accountController.get(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.get,
);

accountController.post(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.post,
);

accountController.put(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.put,
);

accountController.delete(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.delete,
);

