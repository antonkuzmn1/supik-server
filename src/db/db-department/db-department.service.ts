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
import {CrudInterface} from "../../common/crud.interface";
import {Request, Response} from "express";
import {prisma} from "../../prisma";

const className = 'DbDepartmentService';

export class DbDepartmentService implements CrudInterface {

    constructor() {
        logger.debug(className);
    }

    get = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.get');
        try {
            if (req.query.id) {
                return this.findUnique(req, res);
            } else {
                return this.findMany(req, res);
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

    post = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.post');
        try {
            return this.create(req, res);
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

    put = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.put');
        try {
            return this.update(req, res);
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

    delete = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.delete');
        try {
            return this.softDelete(req, res);
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

    private findUnique = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.findUnique');
        try {

            const idRaw = req.query.id;
            logger.debug(`${className}.findUnique - Received ID: ${idRaw}`);

            const id = Number(idRaw);
            if (isNaN(id)) {
                logger.error(`${className}.findUnique - ID is not a number`);
                return res.status(400).send('ID is not a number');
            }

            if (id === 0) {
                logger.error(`${className}.findUnique - ID cannot be null`);
                return res.status(400).send('ID cannot be null');
            }

            try {

                const response = await prisma.department.findUnique({
                    where: {
                        id: id,
                        deleted: 0,
                    },
                    include: {
                        members: true,
                        leader: true,
                    },
                });

                if (!response) {
                    logger.error(`Entity with ID ${id} not found`);
                    return res.status(404).send(`Entity with ID ${id} not found`);
                }
                logger.debug(`Funded Entity with ID ${id}`);
                return res.status(200).json({department: response});

            } catch (error: unknown) {

                if (error instanceof Error) {
                    logger.error(error.message);
                    return res.status(500).send(`Prisma error: ${error.message}`);
                } else {
                    logger.error('Unexpected error');
                    return res.status(500).send('Unexpected error');
                }

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

    private findMany = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.findMany');
        try {
            logger.debug(`${className}.findMany - Received query params: ${req.query}`);

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

            const leaderId = req.query.leaderId as string
            if (leaderId) {
                where = {
                    ...where,
                    leaderId: {
                        in: leaderId.split(',').map(Number),
                    },
                }
            }

            logger.debug(`${className}.findMany - Parsed filter: ${where}`);

            try {

                const response = await prisma.department.findMany({
                    where,
                    include: {
                        leader: true,
                        members: true,
                    }
                });
                logger.debug(`${className}.findMany - ${response.length} departments found`);
                return res.status(200).json({departments: response});

            } catch (error: unknown) {
                if (error instanceof Error) {
                    logger.error(error.message);
                    return res.status(500).send(error.message);
                } else {
                    logger.error('Unexpected error');
                    return res.status(500).send('Unexpected error');
                }
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

    private create = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.create');
        try {
            const name = req.body.name;
            const title = req.body.title;
            const leaderId = req.body.leaderId;
            const data = {name, title, leaderId: leaderId ? Number(leaderId) : null};
            logger.debug(`${className}.create - Parsed data: ${data}`);
            try {
                const response = await prisma.department.create({data});
                try {
                    const log = await prisma.log.create({
                        data: {
                            action: 'create_department',
                            newValue: response,
                            initiatorId: req.body.account.id,
                            departmentId: response.id,
                        },
                    });
                    return res.status(200).json(log);
                } catch (error: unknown) {
                    if (error instanceof Error) {
                        logger.error(error.message);
                        return res.status(500).send('Prisma Error: ' + error.message);
                    } else {
                        logger.error('Unexpected error');
                        return res.status(500).send('Unexpected error');
                    }
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    logger.error(error.message);
                    return res.status(500).send('Prisma Error: ' + error.message);
                } else {
                    logger.error('Unexpected error');
                    return res.status(500).send('Unexpected error');
                }
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

    private update = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.update');
        try {
            const id = req.body.id;
            const name = req.body.name;
            const title = req.body.title;
            const leaderId = req.body.leaderId;
            const where = {id};
            const data = {name, title, leaderId: leaderId ? Number(leaderId) : null};
            console.log(data);
            logger.debug(`${className}.update - ID: ${id}, Parsed data: ${data}`);
            try {
                const response = await prisma.department.update({where, data});
                try {
                    const log = await prisma.log.create({
                        data: {
                            action: 'update_department',
                            newValue: response,
                            initiatorId: req.body.account.id,
                            departmentId: response.id,
                        },
                    });
                    return res.status(200).json(log);
                } catch (error: unknown) {
                    if (error instanceof Error) {
                        logger.error(error.message);
                        return res.status(500).send('Prisma Error: ' + error.message);
                    } else {
                        logger.error('Unexpected error');
                        return res.status(500).send('Unexpected error');
                    }
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    logger.error(error.message);
                    return res.status(500).send('Prisma Error: ' + error.message);
                } else {
                    logger.error('Unexpected error');
                    return res.status(500).send('Unexpected error');
                }
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

    private softDelete = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.softDelete');
        try {
            const id = req.body.id;
            const where = {id};
            const data = {deleted: 1};
            logger.debug(`${className}.softDelete - ID: ${id}`);
            try {
                const response = await prisma.department.update({where, data});
                try {
                    const log = await prisma.log.create({
                        data: {
                            action: 'delete_department',
                            newValue: response,
                            initiatorId: req.body.account.id,
                            departmentId: response.id,
                        },
                    });
                    return res.status(200).json(log);
                } catch (error: unknown) {
                    if (error instanceof Error) {
                        logger.error(error.message);
                        return res.status(500).send('Prisma Error: ' + error.message);
                    } else {
                        logger.error('Unexpected error');
                        return res.status(500).send('Unexpected error');
                    }
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    logger.error(error.message);
                    return res.status(500).send('Prisma Error: ' + error.message);
                } else {
                    logger.error('Unexpected error');
                    return res.status(500).send('Unexpected error');
                }
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

}
