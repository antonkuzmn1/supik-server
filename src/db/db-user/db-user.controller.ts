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
import {DbUserMiddleware} from "./db-user.middleware";
import {DbUserService} from "./db-user.service";
import {DbUserRepository} from "./db-user.repository";

const security = new SecurityMiddleware();
const middleware = new DbUserMiddleware();
const service = new DbUserService(new DbUserRepository());

// /api/db/user
export const dbUserController = Router()

dbUserController.get(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeViewer,
    service.get,
);

dbUserController.post(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeEditor,
    service.post,
);

dbUserController.put(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeEditor,
    service.put,
);

dbUserController.delete(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeEditor,
    service.delete,
);
