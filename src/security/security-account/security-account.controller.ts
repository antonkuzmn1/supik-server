import {Router} from "express";
import {SecurityMiddleware} from "../security.middleware";
import {SecurityAccountService} from "./security-account.service";

const security = new SecurityMiddleware();
const service = new SecurityAccountService();

// /api/security/security-account
export const securityAccountController = Router();

securityAccountController.get(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.get,
);

securityAccountController.post(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.post,
);

securityAccountController.put(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.put,
);

securityAccountController.delete(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.delete,
);

