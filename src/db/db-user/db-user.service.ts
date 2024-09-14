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
import {CrudInterface} from "../../common/crud.interface";
import {DbUserRepository} from "./db-user.repository";
import {prisma} from "../../prisma";

const className = 'DbUserService';

export class DbUserService implements CrudInterface {

    constructor(
        private readonly repository: DbUserRepository,
    ) {
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
            const id = Number(req.query.id);
            if (!id) {
                logger.error('ID is undefined');
                return res.status(403).send('ID is undefined');
            }
            const response = await this.repository.findUnique(id);
            if (!response) {
                logger.error(`Entity with ID ${id} not found`);
                return res.status(403).send(`Entity with ID ${id} not found`);
            }
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

    private findMany = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.findMany');
        try {
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

            const surname = req.query.surname;
            if (surname) {
                where = {
                    ...where,
                    surname: {
                        contains: surname,
                    },
                }
            }

            const patronymic = req.query.patronymic;
            if (patronymic) {
                where = {
                    ...where,
                    patronymic: {
                        contains: patronymic,
                    },
                }
            }

            const fullname = req.query.fullname;
            if (fullname) {
                where = {
                    ...where,
                    fullname: {
                        contains: fullname,
                    },
                }
            }

            const department = req.query.department;
            if (department) {
                where = {
                    ...where,
                    department: {
                        contains: department,
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

            const login = req.query.login;
            if (login) {
                where = {
                    ...where,
                    login: {
                        contains: login,
                    },
                }
            }

            const password = req.query.password;
            if (password) {
                where = {
                    ...where,
                    password: {
                        contains: password,
                    },
                }
            }

            const disabled = req.query.disabled;
            if (disabled !== undefined) {
                where = {
                    ...where,
                    disabled: disabled === 'true' ? 1 : 0,
                }
            }

            console.log('Filter:', where)
            const response = await this.repository.findMany(where);
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

    private create = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.create');
        try {
            const {account, ...dataToCreate} = req.body;
            const response = await this.repository.create(dataToCreate);
            await prisma.log.create({
                data: {
                    action: 'create_user',
                    newValue: response,
                    initiatorId: req.body.account.id,
                    userId: response.id,
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

    private update = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.update');
        try {
            const {account, ...dataToCreate} = req.body;
            const response = await this.repository.update(dataToCreate);
            await prisma.log.create({
                data: {
                    action: 'update_user',
                    newValue: response,
                    initiatorId: req.body.account.id,
                    userId: response.id,
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

    private softDelete = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.softDelete');
        try {
            const response = await this.repository.delete(req.body.id);
            await prisma.log.create({
                data: {
                    action: 'delete_user',
                    newValue: response,
                    initiatorId: req.body.account.id,
                    userId: response.id,
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
