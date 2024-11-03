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

                let where: any = {
                    deleted: 0,
                }

                const createdGte = req.query.createdGte;
                if (createdGte) {
                    where = {
                        ...where,
                        created: {
                            gte: new Date(createdGte as string),
                        },
                    }
                }

                const createdLte = req.query.createdLte;
                if (createdLte) {
                    where = {
                        ...where,
                        created: {
                            lte: new Date(createdLte as string),
                        },
                    }
                }

                const updatedGte = req.query.updatedGte;
                if (updatedGte) {
                    where = {
                        ...where,
                        updated: {
                            gte: new Date(updatedGte as string),
                        },
                    }
                }

                const updatedLte = req.query.updatedLte;
                if (updatedLte) {
                    where = {
                        ...where,
                        updated: {
                            lte: new Date(updatedLte as string),
                        },
                    }
                }

                const name = req.query.name;
                if (name) {
                    where = {
                        ...where,
                        name: {
                            contains: name,
                        },
                    }
                }

                const title = req.query.title;
                if (title) {
                    where = {
                        ...where,
                        title: {
                            contains: title,
                        },
                    }
                }

                const accessRouters = req.query.accessRouters;
                if (accessRouters !== undefined) {
                    where = {
                        ...where,
                        accessRouters: accessRouters === 'editor' ? 2 : accessRouters === 'viewer' ? 1 : 0,
                    }
                }

                const accessUsers = req.query.accessUsers;
                if (accessUsers !== undefined) {
                    where = {
                        ...where,
                        accessUsers:  accessUsers === 'editor' ? 2 : accessUsers === 'viewer' ? 1 : 0,
                    }
                }

                const accessDepartments = req.query.accessDepartments;
                if (accessDepartments !== undefined) {
                    where = {
                        ...where,
                        accessDepartments:  accessDepartments === 'editor' ? 2 : accessDepartments === 'viewer' ? 1 : 0,
                    }
                }

                const accessMails = req.query.accessMails;
                if (accessMails !== undefined) {
                    where = {
                        ...where,
                        accessMails:  accessMails === 'editor' ? 2 : accessMails === 'viewer' ? 1 : 0,
                    }
                }

                const accessMailGroups = req.query.accessMailGroups;
                if (accessMails !== undefined) {
                    where = {
                        ...where,
                        accessMails:  accessMailGroups === 'editor' ? 2 : accessMailGroups === 'viewer' ? 1 : 0,
                    }
                }

                const response = await prisma.group.findMany({
                    where,
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
                accessDepartments,
                accessMails,
                accessMailGroups,
            } = req.body;

            const response = await prisma.group.create({
                data: {
                    name,
                    title,
                    accessRouters: Number(accessRouters),
                    accessUsers: Number(accessUsers),
                    accessDepartments: Number(accessDepartments),
                    accessMails: Number(accessMails),
                    accessMailGroups: Number(accessMailGroups),
                },
            });

            await prisma.log.create({
                data: {
                    action: 'create_group',
                    newValue: response,
                    initiatorId: req.body.account.id,
                    groupId: response.id,
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
                accessDepartments,
                accessMails,
                accessMailGroups,
            } = req.body;

            const response = await prisma.group.update({
                where: {
                    id,
                },
                data: {
                    name,
                    title,
                    accessRouters: Number(accessRouters),
                    accessUsers: Number(accessUsers),
                    accessDepartments: Number(accessDepartments),
                    accessMails: Number(accessMails),
                    accessMailGroups: Number(accessMailGroups),
                },
            });

            await prisma.log.create({
                data: {
                    action: 'update_group',
                    newValue: response,
                    initiatorId: req.body.account.id,
                    groupId: response.id,
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

            await prisma.log.create({
                data: {
                    action: 'delete_group',
                    newValue: response,
                    initiatorId: req.body.account.id,
                    groupId: response.id,
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
