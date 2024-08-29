import {Router} from 'express';

// /api
export const router = Router();

router.get('/', (_req, res) => {
    res.status(200).json({status: 'server is working'});
})

// router.use('/security', securityController);
// router.use('/contractor', contractorController);
// router.use('/initiator', initiatorController);
// router.use('/table/main', tableMainController);
// router.use('/table/all', tableAllController);
