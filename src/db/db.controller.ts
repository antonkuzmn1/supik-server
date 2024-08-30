import {Router} from "express";
import {dbRouterController} from "./router/router.controller";
import {dbRouterGroupViewerController} from "./router-group-viewer/router-group-viewer.controller";
import {dbRouterGroupEditorController} from "./router-group-editor/router-group-editor.controller";
import {dbUserController} from "./user/user.controller";
import {dbVpnController} from "./vpn/vpn.controller";

// /api/db
export const dbController = Router()

dbController.use('/router', dbRouterController);
dbController.use('/router-group-viewer', dbRouterGroupViewerController);
dbController.use('/groups-group-editor', dbRouterGroupEditorController);
dbController.use('/user', dbUserController);
dbController.use('/vpn', dbVpnController);
