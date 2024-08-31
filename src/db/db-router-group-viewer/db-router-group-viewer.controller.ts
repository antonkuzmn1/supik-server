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

import {SecurityMiddleware} from "../../security/security.middleware";
import {DbRouterMiddleware} from "../db-router/db-router.middleware";
import {Router} from "express";
import {DbRouterGroupViewerService} from "./db-router-group-viewer.service";
import {DbRouterGroupViewerRepository} from "./db-router-group-viewer.repository";

const security = new SecurityMiddleware();
const middleware = new DbRouterMiddleware();
const service = new DbRouterGroupViewerService(new DbRouterGroupViewerRepository());

// /api/db/router-group-viewer
export const dbRouterGroupViewerController = Router()

dbRouterGroupViewerController.post(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeEditor,
    service.post,
);

dbRouterGroupViewerController.delete(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeEditor,
    service.delete,
);
