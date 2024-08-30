import {Router} from "express";
import {SecurityMiddleware} from "../../security/security.middleware";
import {DbVpnMiddleware} from "./db-vpn.middleware";

const security = new SecurityMiddleware();
const middleware = new DbVpnMiddleware();

// /api/db/vpn
export const dbVpnController = Router()

dbVpnController.get(
    '/',
    security.getAccountFromToken,
    // security.accountShouldBeAdmin,
);

dbVpnController.post(
    '/',
    security.getAccountFromToken,
    // security.accountShouldBeAdmin,
);

dbVpnController.put(
    '/',
    security.getAccountFromToken,
    // security.accountShouldBeAdmin,
);

dbVpnController.delete(
    '/',
    security.getAccountFromToken,
    // security.accountShouldBeAdmin,
);
