import {Router} from "express";
import {SecurityMiddleware} from "../../security/security.middleware";
import {DbRouterMiddleware} from "../db-router/db-router.middleware";
import {DbRouterGroupEditorService} from "./db-router-group-editor.service";
import {DbRouterGroupEditorRepository} from "./db-router-group-editor.repository";

const security = new SecurityMiddleware();
const middleware = new DbRouterMiddleware();
const service = new DbRouterGroupEditorService(new DbRouterGroupEditorRepository());

// /api/db/router-group-editor
export const dbRouterGroupEditorController = Router()

dbRouterGroupEditorController.post(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeEditor,
    service.post,
);

dbRouterGroupEditorController.delete(
    '/',
    security.getAccountFromToken,
    middleware.accountShouldBeEditor,
    service.delete,
);
