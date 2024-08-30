import {Router} from "express";
import {dbRouterController} from "./db-router/db-router.controller";
import {dbRouterGroupViewerController} from "./db-router-group-viewer/db-router-group-viewer.controller";
import {dbRouterGroupEditorController} from "./db-router-group-editor/db-router-group-editor.controller";
import {dbUserController} from "./db-user/db-user.controller";
import {dbVpnController} from "./db-vpn/db-vpn.controller";

// /api/db
export const dbController = Router()

dbController.use('/router', dbRouterController);
dbController.use('/router-group-viewer', dbRouterGroupViewerController);
dbController.use('/groups-group-editor', dbRouterGroupEditorController);
dbController.use('/user', dbUserController);
dbController.use('/vpn', dbVpnController);
