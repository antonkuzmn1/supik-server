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
import {DbItemService} from "./db-item.service";

const security = new SecurityMiddleware();
const service = new DbItemService();

// /api/db/item
export const dbItemController = Router()

dbItemController.get(
    '/',
    security.getAccountFromToken,
    (req, res, next) => checkForAccess(req, res, next, 'accessItems', 'viewer'),
    service.get,
);

dbItemController.post(
    '/',
    security.getAccountFromToken,
    (req, res, next) => checkForAccess(req, res, next, 'accessItems', 'editor'),
    service.post,
);

dbItemController.put(
    '/',
    security.getAccountFromToken,
    (req, res, next) => checkForAccess(req, res, next, 'accessItems', 'editor'),
    service.put,
);

dbItemController.delete(
    '/',
    security.getAccountFromToken,
    (req, res, next) => checkForAccess(req, res, next, 'accessItems', 'editor'),
    service.delete,
);
