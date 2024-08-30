import {Router} from "express";
import {SecurityMiddleware} from "../security.middleware";
import {SecurityGroupService} from "./security-group.service";

const security = new SecurityMiddleware();
const service = new SecurityGroupService();

// /api/security/security-group
export const securityGroupController = Router();

securityGroupController.get(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.get,
);

securityGroupController.post(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.post,
);

securityGroupController.put(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.put,
);

securityGroupController.delete(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.delete,
);
