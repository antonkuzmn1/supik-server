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

import {logger} from "../../logger";
import {Request, Response} from "express";
import {prisma} from "../../prisma";
import bcrypt from "bcrypt";

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
        } catch (error: unknown) {
            if (error instanceof Error) {
                logger.error(error.message);
                return res.status(500).send(error.message);
            } else {
                logger.error('Unexpected error');
                return res.status(500).send('Unexpected error');
            }
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

            const passwordEncrypted = await bcrypt.hash(password, 10);

            const response = await prisma.account.create({
                data: {
                    username,
                    password: passwordEncrypted,
                    fullname,
                    title,
                    admin,
                    disabled,
                },
            });

            await prisma.log.create({
                data: {
                    action: 'create_account',
                    newValue: response,
                    initiatorId: req.body.account.id,
                    accountId: response.id,
                },
            });

            return res.status(200).json(response);

        } catch (error: unknown) {
            if (error instanceof Error) {
                logger.error(error.message);
                return res.status(500).send(error.message);
            } else {
                logger.error('Unexpected error');
                return res.status(500).send('Unexpected error');
            }
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

            const passwordEncrypted = await bcrypt.hash(password, 10);

            const response = await prisma.account.update({
                where: {
                    id,
                },
                data: {
                    username,
                    password: passwordEncrypted,
                    fullname,
                    title,
                    admin,
                    disabled,
                },
            });

            await prisma.log.create({
                data: {
                    action: 'update_account',
                    newValue: response,
                    initiatorId: req.body.account.id,
                    accountId: response.id,
                },
            });

            return res.status(200).json(response);

        } catch (error: unknown) {
            if (error instanceof Error) {
                logger.error(error.message);
                return res.status(500).send(error.message);
            } else {
                logger.error('Unexpected error');
                return res.status(500).send('Unexpected error');
            }
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

            await prisma.log.create({
                data: {
                    action: 'delete_account',
                    newValue: response,
                    initiatorId: req.body.account.id,
                    accountId: response.id,
                },
            });

            return res.status(200).json(response);

        } catch (error: unknown) {
            if (error instanceof Error) {
                logger.error(error.message);
                return res.status(500).send(error.message);
            } else {
                logger.error('Unexpected error');
                return res.status(500).send('Unexpected error');
            }
        }
    }

}
