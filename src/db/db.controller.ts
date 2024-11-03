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
import {dbRouterController} from "./db-router/db-router.controller";
import {dbRouterGroupViewerController} from "./db-router-group-viewer/db-router-group-viewer.controller";
import {dbRouterGroupEditorController} from "./db-router-group-editor/db-router-group-editor.controller";
import {dbUserController} from "./db-user/db-user.controller";
import {dbVpnController} from "./db-vpn/db-vpn.controller";
import {dbDepartmentController} from "./db-department/db-department.controller";
import {dbMailController} from "./db-mail/db-mail.controller";
import {dbMailGroupController} from "./db-mail-group/db-mail-group.controller";
import {dbMailMailGroupController} from "./db-mail-mail-group/db-mail-mail-group.controller";

// /api/db
export const dbController = Router()

dbController.use('/router', dbRouterController);
dbController.use('/router-group-viewer', dbRouterGroupViewerController);
dbController.use('/router-group-editor', dbRouterGroupEditorController);
dbController.use('/user', dbUserController);
dbController.use('/vpn', dbVpnController);
dbController.use('/department', dbDepartmentController);
dbController.use('/mail', dbMailController);
dbController.use('/mail-group', dbMailGroupController);
dbController.use('/mail-mail-group', dbMailMailGroupController);
