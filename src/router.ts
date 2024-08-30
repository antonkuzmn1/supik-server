import {Router} from 'express';
import {securityController} from "./security/security.controller";

// /api
export const router = Router();

router.get('/', (_req, res) => res.status(200).json({status: 'server is working'}))

router.use('/security', securityController);
