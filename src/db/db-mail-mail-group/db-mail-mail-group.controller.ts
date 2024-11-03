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
import {checkForAccess} from "../../common/checkForAccess";
import {DbMailMailGroupService} from "./db-mail-mail-group.service";

const security = new SecurityMiddleware();
const service = new DbMailMailGroupService();

// /api/db/mail-mail-group
export const dbMailMailGroupController = Router()

dbMailMailGroupController.post(
    '/',
    security.getAccountFromToken,
    (req, res, next) => checkForAccess(req, res, next, 'accessMailGroups', 'editor'),
    service.post,
);

dbMailMailGroupController.delete(
    '/',
    security.getAccountFromToken,
    (req, res, next) => checkForAccess(req, res, next, 'accessMailGroups', 'editor'),
    service.delete,
);
