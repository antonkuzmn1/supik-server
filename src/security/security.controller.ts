import {Router} from "express";
import {securityAccountController} from "./security-account/security-account.controller";
import {securityGroupController} from "./security-group/security-group.controller";
import {SecurityService} from "./security.service";
import {securityAccountGroupController} from "./security-account-group/security-account-group.controller";

const service = new SecurityService();

// /api/security
export const securityController = Router();

securityController.post('/', service.getTokenByCredentials);
securityController.get('/', service.getAccountByToken);

securityController.use('/account', securityAccountController);
securityController.use('/group', securityGroupController);
securityController.use('/account-group', securityAccountGroupController);
