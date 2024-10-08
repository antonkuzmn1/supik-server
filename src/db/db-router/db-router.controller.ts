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
import {DbRouterService} from "./db-router.service";
import {SecurityMiddleware} from "../../security/security.middleware";
import {DbRouterRepository} from "./db-router.repository";
import {DbRouterMiddleware} from "./db-router.middleware";
import {RouterOsRepository} from "../../router-os/router-os.repository";

const security = new SecurityMiddleware();
const middleware = new DbRouterMiddleware();
const service = new DbRouterService(
    new DbRouterRepository(),
    new RouterOsRepository(),
);

// /api/db/router
export const dbRouterController = Router()

dbRouterController.get(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeViewer,
    service.get,
);

dbRouterController.post(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeEditor,
    service.post,
);

dbRouterController.put(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeEditor,
    service.put,
);

dbRouterController.delete(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeEditor,
    service.delete,
);

dbRouterController.post(
    '/test/',
    security.getAccountFromToken,
    middleware.accountShouldBeEditor,
    service.test,
);

dbRouterController.post(
    '/sync/',
    security.getAccountFromToken,
    middleware.accountShouldBeEditor,
    service.sync,
);
