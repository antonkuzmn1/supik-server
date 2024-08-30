import {Router} from "express";
import {SecurityMiddleware} from "../security.middleware";
import {AccountGroupService} from "./account-group.service";

const security = new SecurityMiddleware();
const service = new AccountGroupService();

// /api/security/account-group
export const accountGroupController = Router()

accountGroupController.post(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.post
);

accountGroupController.delete(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.delete
);
