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
import {SecurityMiddleware} from "../security.middleware";
import {SecurityGroupService} from "./security-group.service";

const security = new SecurityMiddleware();
const service = new SecurityGroupService();

// /api/security/group
export const securityGroupController = Router();

securityGroupController.get(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.get,
);

securityGroupController.post(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.post,
);

securityGroupController.put(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.put,
);

securityGroupController.delete(
    '/',
    security.getAccountFromToken,
    security.accountShouldBeAdmin,
    service.delete,
);
