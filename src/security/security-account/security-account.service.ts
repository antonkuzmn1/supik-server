import {logger} from "../../logger";
import {Request, Response} from "express";
import {prisma} from "../../prisma";

export class SecurityAccountService {
    constructor() {
        logger.debug('SecurityAccountService');
    }

    async get(req: Request, res: Response) {
        logger.debug('SecurityAccountService.get');
        try {
            if (req.query.id) {

                const id = Number(req.query.id);
                if (!id) {
                    logger.error('ID is undefined');
                    return res.status(403).send('ID is undefined');
                }

                const response = await prisma.account.findUnique({
                    where: {
                        id: id,
                        deleted: 0,
                    },
                    include: {
                        accountGroups: {
                            include: {
                                group: {
                                    include: {
                                        routerGroupViewer: true,
                                        routerGroupEditor: true,
                                    },
                                },
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

                const response = await prisma.account.findMany({
                    where: {
                        deleted: 0,
                    },
                    include: {
                        accountGroups: {
                            include: {
                                group: {
                                    include: {
                                        routerGroupViewer: true,
                                        routerGroupEditor: true,
                                    },
                                },
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
        logger.debug('SecurityAccountService.post');
        try {

            const {
                username,
                password,
                fullname,
                title,
                admin,
                disabled,
            } = req.body;

            if (!username) {
                logger.error('"username" field required');
                return res.status(400).send('Username field required');
            }
            if (!password) {
                logger.error('"password" field required');
                return res.status(400).send('"password" field required');
            }

            const response = await prisma.account.create({
                data: {
                    username,
                    password,
                    fullname,
                    title,
                    admin,
                    disabled,
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
        logger.debug('SecurityAccountService.put');
        try {

            const id = Number(req.body.id);
            if (!id) {
                logger.error('ID is undefined');
                return res.status(403).send('ID is undefined');
            }

            const {
                username,
                password,
                fullname,
                title,
                admin,
                disabled,
            } = req.body;

            const response = await prisma.account.update({
                where: {
                    id,
                },
                data: {
                    username,
                    password,
                    fullname,
                    title,
                    admin,
                    disabled,
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
        logger.debug('SecurityAccountService.delete');
        try {

            const id = Number(req.body.id);
            if (!id) {
                logger.error('ID is undefined');
                return res.status(403).send('ID is undefined');
            }

            const response = await prisma.account.update({
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
