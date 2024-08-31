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

import {Router} from 'express';
import {securityController} from "./security/security.controller";
import {dbController} from "./db/db.controller";
import {routerOsController} from "./router-os/router-os.controller";

// /api
export const router = Router();

router.get('/', (_req, res) => res.status(200).json({status: 'server is working'}))

router.use('/security', securityController);
router.use('/db', dbController);
router.use('/router-os', routerOsController)
