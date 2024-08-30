import {logger} from "../../logger";
import {Request, Response} from "express";
import {prisma} from "../../prisma";

export class SecurityAccountGroupService {
    constructor() {
        logger.debug('SecurityAccountGroupService');
    }

    async post(req: Request, res: Response) {
        logger.debug('SecurityAccountGroupService.post');
        try {

            const {
                accountId,
                groupId,
            } = req.body;

            if (!accountId) {
                logger.error('"accountId" field required');
                return res.status(400).send('"accountId" field required');
            }
            if (!groupId) {
                logger.error('"groupId" field required');
                return res.status(400).send('"groupId" field required');
            }

            const response = await prisma.accountGroup.create({
                data: {
                    accountId,
                    groupId,
                },
            });

            return res.status(200).json(response);

        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    async delete(req: Request, res: Response) {
        logger.debug('SecurityAccountGroupService.delete');
        try {

            const {
                accountId,
                groupId,
            } = req.body;

            if (!accountId) {
                logger.error('"accountId" field required');
                return res.status(400).send('"accountId" field required');
            }
            if (!groupId) {
                logger.error('"groupId" field required');
                return res.status(400).send('"groupId" field required');
            }

            const response = await prisma.accountGroup.delete({
                where: {
                    accountId_groupId: {
                        accountId,
                        groupId,
                    },
                },
            });

            return res.status(200).json(response);

        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

}
