import {Router} from "express";
import {SecurityMiddleware} from "../security.middleware";
import {GroupService} from "./group.service";

const security = new SecurityMiddleware();
const service = new GroupService();

// /api/security/group
export const groupController = Router();

groupController.get(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.get,
);

groupController.post(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.post,
);

groupController.put(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.put,
);

groupController.delete(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.delete,
);
