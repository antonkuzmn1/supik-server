/*

Copyright 2024 Anton Kuzmin (https://github.com/antonkuzmn1)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import {Router} from "express";
import {SecurityMiddleware} from "../../security/security.middleware";
import {DbMailService} from "./db-mail.service";
import {checkForAccess} from "../../common/checkForAccess";

const security = new SecurityMiddleware();
const service = new DbMailService();

// /api/db/mail
export const dbMailController = Router()

dbMailController.get(
    '/',
    security.getAccountFromToken,
    (req, res, next) => checkForAccess(req, res, next, 'accessMails', 'viewer'),
    service.get,
);

dbMailController.post(
    '/',
    security.getAccountFromToken,
    (req, res, next) => checkForAccess(req, res, next, 'accessMails', 'editor'),
    service.post,
);

dbMailController.put(
    '/',
    security.getAccountFromToken,
    (req, res, next) => checkForAccess(req, res, next, 'accessMails', 'editor'),
    service.put,
);

dbMailController.delete(
    '/',
    security.getAccountFromToken,
    (req, res, next) => checkForAccess(req, res, next, 'accessMails', 'editor'),
    service.delete,
);

dbMailController.get(
    '/sync/',
    security.getAccountFromToken,
    (req, res, next) => checkForAccess(req, res, next, 'accessMails', 'editor'),
    service.syncAccounts,
);
