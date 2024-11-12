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
import {DbVpnService} from "./db-vpn.service";
import {DbVpnRepository} from "./db-vpn.repository";
import {RouterOsRepository} from "../../router-os/router-os.repository";

const security = new SecurityMiddleware();
const service = new DbVpnService(
    new DbVpnRepository(),
    new RouterOsRepository(),
);

// /api/db/vpn
export const dbVpnController = Router()

dbVpnController.get(
    '/',
    security.getAccountFromToken,
    service.get,
);

dbVpnController.post(
    '/',
    security.getAccountFromToken,
    service.post,
);

dbVpnController.put(
    '/',
    security.getAccountFromToken,
    service.put,
);

dbVpnController.delete(
    '/',
    security.getAccountFromToken,
    service.delete,
);

dbVpnController.get(
    '/get-archive',
    security.getAccountFromToken,
    service.getArchive,
);
