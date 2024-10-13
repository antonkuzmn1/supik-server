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
import {RouterOSAPI} from "node-routeros";
import axios, {AxiosError} from "axios";

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

            const workplace = req.query.workplace;
            if (workplace) {
                where = {
                    ...where,
                    workplace: {
                        contains: workplace,
                    },
                }
            }

            const localWorkplace = req.query.localWorkplace;
            if (localWorkplace) {
                where = {
                    ...where,
                    localWorkplace: {
                        contains: localWorkplace,
                    },
                }
            }

            const phone = req.query.phone;
            if (phone) {
                where = {
                    ...where,
                    phone: {
                        contains: phone,
                    },
                }
            }

            const cellular = req.query.cellular;
            if (cellular) {
                where = {
                    ...where,
                    cellular: {
                        contains: cellular,
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

            const departmentId = req.query.departmentId as string
            if (departmentId) {
                where = {
                    ...where,
                    departmentId: {
                        in: departmentId.split(',').map(Number),
                    },
                }
            }

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
            const duplicateLogins = await prisma.user.findMany({
                where: {
                    login: dataToCreate.login
                }
            });
            if (duplicateLogins.length > 0) {
                return res.status(400).send('Login already exists');
            }
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
            const duplicateLogins = await prisma.user.findMany({
                where: {
                    id: {
                        not: dataToCreate.id
                    },
                    login: dataToCreate.login
                }
            });
            if (duplicateLogins.length > 0) {
                return res.status(400).send('Login already exists');
            }
            const old = await this.repository.findUnique(dataToCreate.id);
            const response = await this.repository.update(dataToCreate);
            await prisma.log.create({
                data: {
                    action: 'update_user',
                    newValue: response,
                    initiatorId: req.body.account.id,
                    userId: response.id,
                },
            });
            if (old.disabled === 0 && response.disabled === 1) {
                for (const vpn of response.vpns) {
                    const vpnWithRouter = await prisma.vpn.findUnique({
                        where: {
                            id: vpn.id,
                            deleted: 0,
                        },
                        include: {
                            router: true,
                        },
                    });
                    if (vpnWithRouter) {
                        const routerOSAPI = new RouterOSAPI({
                            host: vpnWithRouter.router.localAddress,
                            user: vpnWithRouter.router.login,
                            password: vpnWithRouter.router.password,
                            port: Number(process.env.TEST_ROUTER_PORT),
                            timeout: Number(process.env.TEST_ROUTER_TIMEOUT),
                        });
                        try {
                            const api = await routerOSAPI.connect();
                            logger.info(`Successfully connected to: ${vpnWithRouter.router.localAddress}`);
                            const params: string[] = [`=.id=${vpn.vpnId}`];
                            params.push(`=disabled=yes`);
                            console.log(params);
                            await api.write('/ppp/secret/set', params);
                            logger.info(`VPN updated in RouterOSAPI`);
                            const disabledVpn = await prisma.vpn.update({
                                where: {
                                    id: vpn.id,
                                },
                                data: {
                                    disabled: 1,
                                },
                            });
                            logger.info('VPN disabled in DB');
                            await prisma.log.create({
                                data: {
                                    action: 'update_vpn',
                                    newValue: disabledVpn,
                                    initiatorId: req.body.account.id,
                                    vpnId: disabledVpn.id,
                                },
                            });
                            logger.info('new log: "update_vpn"');
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
                for (const mail of response.mails) {
                    try {
                        const mailYandexToken = process.env.MAIL_YANDEX_TOKEN;
                        const mailYandexOrgId = process.env.MAIL_YANDEX_ORG_ID;
                        const mailId = mail.mailId;
                        logger.debug(`Before disable Mail for Yandex: ${mail.id}`);
                        await axios.patch(
                            `https://api360.yandex.net/directory/v1/org/${mailYandexOrgId}/users/${mailId}`,
                            {
                                isEnabled: false,
                            },
                            {
                                headers: {
                                    'Authorization': `OAuth ${mailYandexToken}`,
                                    'Content-Type': 'application/json',
                                },
                            }
                        );
                        logger.debug(`Successfully disabled: ${mail.id}`);
                        try {
                            const where = {id: mail.id};
                            const data = {isEnabled: 0};
                            const newValue = await prisma.mail.update({where, data});

                            await prisma.log.create({
                                data: {
                                    action: 'update_mail',
                                    newValue: newValue,
                                    initiatorId: req.body.account.id,
                                    mailId: newValue.id,
                                },
                            })
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
                        console.error((error as AxiosError).response?.data);
                        if (error instanceof AxiosError) {
                            logger.error(error.response?.data.message);
                            return res.status(500).send(error.response?.data.message);
                        } else {
                            logger.error('Unexpected error');
                            return res.status(500).send('Unexpected error');
                        }
                    }
                }
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
