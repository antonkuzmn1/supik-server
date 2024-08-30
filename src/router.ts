import {Router} from 'express';
import {securityController} from "./security/security.controller";
import {dbController} from "./db/db.controller";

// /api
export const router = Router();

router.get('/', (_req, res) => res.status(200).json({status: 'server is working'}))

router.use('/security', securityController);
router.use('/db', dbController);
