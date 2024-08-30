import {logger} from "../../logger";
import {Request, Response} from "express";
import {prisma} from "../../prisma";

export class SecurityGroupService {
    constructor() {
        logger.debug('SecurityGroupService');
    }

    async get(req: Request, res: Response) {
        logger.debug('SecurityGroupService.get');
        try {
            if (req.query.id) {

                const id = Number(req.query.id);
                if (!id) {
                    logger.error('ID is undefined');
                    return res.status(403).send('ID is undefined');
                }

                const response = await prisma.group.findUnique({
                    where: {
                        id: id,
                        deleted: 0,
                    },
                    include: {
                        accountGroups: {
                            include: {
                                account: true,
                            },
                        },
                    },
                });
                if (!response) {
                    logger.error(`Entity with ID ${id} not found`);
                    return res.status(403).send(`Entity with ID ${id} not found`);
                }

                return res.status(200).json(response);

            } else {

                const response = await prisma.group.findMany({
                    where: {
                        deleted: 0,
                    },
                    include: {
                        accountGroups: {
                            include: {
                                account: true,
                            },
                        },
                    },
                });

                return res.status(200).json(response);

            }
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    async post(req: Request, res: Response) {
        logger.debug('SecurityGroupService.post');
        try {

            const {
                name,
                title,
                accessRouters,
                accessUsers,
                accountGroups,
            } = req.body;

            const response = await prisma.group.create({
                data: {
                    name,
                    title,
                    accessRouters,
                    accessUsers,
                    accountGroups,
                },
            });

            return res.status(200).json(response);

        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    async put(req: Request, res: Response) {
        logger.debug('SecurityGroupService.put');
        try {

            const id = Number(req.body.id);
            if (!id) {
                logger.error('ID is undefined');
                return res.status(403).send('ID is undefined');
            }

            const {
                name,
                title,
                accessRouters,
                accessUsers,
                accountGroups,
            } = req.body;

            const response = await prisma.group.update({
                where: {
                    id,
                },
                data: {
                    name,
                    title,
                    accessRouters,
                    accessUsers,
                    accountGroups,
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
        logger.debug('SecurityGroupService.delete');
        try {

            const id = Number(req.body.id);
            if (!id) {
                logger.error('ID is undefined');
                return res.status(403).send('ID is undefined');
            }

            const response = await prisma.group.update({
                where: {
                    id,
                },
                data: {
                    deleted: 1,
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
