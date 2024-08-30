import {Router} from "express";
import {SecurityMiddleware} from "../security.middleware";
import {SecurityAccountGroupService} from "./security-account-group.service";

const security = new SecurityMiddleware();
const service = new SecurityAccountGroupService();

// /api/security/security-account-security-group
export const securityAccountGroupController = Router()

securityAccountGroupController.post(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.post
);

securityAccountGroupController.delete(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.delete
);
