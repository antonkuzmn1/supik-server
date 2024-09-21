import {Router} from "express";
import {SecurityMiddleware} from "../../security/security.middleware";
import {DbMailService} from "./db-mail.service";

const security = new SecurityMiddleware();
const service = new DbMailService();

// /api/db/mail
export const dbMailController = Router()

dbMailController.get(
    '/',
    security.getAccountFromToken,
    service.get,
);

dbMailController.post(
    '/',
    security.getAccountFromToken,
    service.post,
);

dbMailController.put(
    '/',
    security.getAccountFromToken,
    service.put,
);

dbMailController.delete(
    '/',
    security.getAccountFromToken,
    service.delete,
);
