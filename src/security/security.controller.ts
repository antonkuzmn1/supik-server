import {Router} from "express";
import {accountController} from "./account/account.controller";
import {groupController} from "./group/group.controller";
import {SecurityService} from "./security.service";
import {accountGroupController} from "./account-group/account-group.controller";

const service = new SecurityService();

// /api/security
export const securityController = Router();

securityController.post('/', service.getTokenByCredentials);
securityController.get('/', service.getAccountByToken);

securityController.use('/account', accountController);
securityController.use('/group', groupController);
securityController.use('/account-group', accountGroupController);
