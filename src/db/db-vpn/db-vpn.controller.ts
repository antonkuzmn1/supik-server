import {Router} from "express";
import {SecurityMiddleware} from "../../security/security.middleware";
import {DbVpnService} from "./db-vpn.service";
import {DbVpnRepository} from "./db-vpn.repository";

const security = new SecurityMiddleware();
const service = new DbVpnService(new DbVpnRepository());

// /api/db/vpn
export const dbVpnController = Router()

dbVpnController.get(
    '/',
    security.getAccountFromToken,
    service.get,
);

dbVpnController.post(
    '/',
    security.getAccountFromToken,
    service.post,
);

dbVpnController.put(
    '/',
    security.getAccountFromToken,
    service.put,
);

dbVpnController.delete(
    '/',
    security.getAccountFromToken,
    service.delete,
);
