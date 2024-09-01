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
import {DbVpnRepository} from "./db-vpn.repository";
import {RouterOSAPI} from "node-routeros";
import {RouterOsRepository} from "../../router-os/router-os.repository";

const className = 'DbVpnService';

export class DbVpnService implements CrudInterface {
    constructor(
        private readonly repository: DbVpnRepository,
        private readonly routerOsRepository: RouterOsRepository,
    ) {
        logger.debug(className);
    }

    get = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.get');
        try {
            if (req.query.id && req.query.routerId) {
                if (!req.body.account.admin) {
                    const vpnId = req.query.id as string;
                    if (!vpnId) {
                        return res.status(400).send('Invalid VPN ID');
                    }
                    const routerId = Number(req.query.routerId);
                    if (!routerId) {
                        return res.status(400).send('Invalid Router ID');
                    }
                    const groupsIds = req.body.account.groupIds;
                    const vpn = await prisma.vpn.findUnique({
                        where: {
                            id_routerId: {
                                id: vpnId,
                                routerId: routerId,
                            },
                            deleted: 0,
                        },
                        include: {
                            router: {
                                include: {
                                    routerGroupViewer: true,
                                    routerGroupEditor: true,
                                },
                            },
                        },
                    });
                    if (!vpn) {
                        return res.status(404).send('VPN not found')
                    }
                    const routerGroupViewer = vpn.router.routerGroupViewer;
                    const routerGroupEditor = vpn.router.routerGroupEditor;

                    const accountIsViewer = groupsIds.some((groupId: number) => {
                        return routerGroupViewer.some(routerGroupViewer => {
                            return routerGroupViewer.groupId === groupId;
                        })
                    });
                    const accountIsEditor = groupsIds.some((groupId: number) => {
                        return routerGroupEditor.some(routerGroupEditor => {
                            return routerGroupEditor.groupId === groupId;
                        })
                    });

                    if (accountIsViewer || accountIsEditor) {
                        return this.findUnique(req, res);
                    } else {
                        return res.status(403).send('Account is not a viewer or editor');
                    }
                } else {
                    return this.findUnique(req, res);
                }
            } else {
                if (!req.body.account.admin) {
                    const groupIds = req.body.account.groupIds;
                    const vpns = await prisma.vpn.findMany({
                        where: {
                            deleted: 0,
                            router: {
                                deleted: 0,
                                OR: [
                                    {
                                        routerGroupViewer: {
                                            some: {
                                                groupId: {
                                                    in: groupIds,
                                                },
                                            },
                                        },
                                    },
                                    {
                                        routerGroupEditor: {
                                            some: {
                                                groupId: {
                                                    in: groupIds,
                                                },
                                            },
                                        },
                                    },
                                ],
                            }
                        }
                    });
                    return res.status(200).json(vpns);
                } else {
                    return this.findMany(req, res);
                }
            }
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    post = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.post');
        try {
            if (!req.body.account.admin) {
                const groupsIds = req.body.account.groupIds;
                const routerId = req.body.routerId;
                const router = await prisma.router.findUnique({
                    where: {
                        id: routerId,
                        deleted: 0,
                    },
                    include: {
                        routerGroupViewer: true,
                        routerGroupEditor: true,
                    },
                });
                if (!router) {
                    return res.status(404).send(`Router with ID ${routerId} not found`);
                }
                const routerGroupEditor = router.routerGroupEditor;
                const accountIsEditor = groupsIds.some((groupId: number) => {
                    return routerGroupEditor.some(routerGroupEditor => {
                        return routerGroupEditor.groupId === groupId;
                    })
                });
                if (!accountIsEditor) {
                    return res.status(403).send('Account is not an editor');
                }
                return this.create(req, res);
            } else {
                return this.create(req, res);
            }
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    put = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.put');
        try {
            if (!req.body.account.admin) {
                const groupsIds = req.body.account.groupIds;
                const vpnId = req.body.id;
                const routerId = req.body.routerId;
                const vpn = await this.repository.findUnique(vpnId, routerId);
                if (!vpn) {
                    return res.status(404).send(`VPN with ID ${vpnId} not found`);
                }
                const router = await prisma.router.findUnique({
                    where: {
                        id: routerId,
                        deleted: 0,
                    },
                    include: {
                        routerGroupViewer: true,
                        routerGroupEditor: true,
                    },
                });
                if (!router) {
                    return res.status(404).send(`Router with ID ${routerId} not found`);
                }
                const routerGroupEditor = router.routerGroupEditor;
                const accountIsEditor = groupsIds.some((groupId: number) => {
                    return routerGroupEditor.some(routerGroupEditor => {
                        return routerGroupEditor.groupId === groupId;
                    })
                });
                if (!accountIsEditor) {
                    return res.status(403).send('Account is not an editor');
                }
                return this.update(req, res);
            } else {
                return this.update(req, res);
            }
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    delete = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.delete');
        try {
            if (!req.body.account.admin) {
                const groupsIds = req.body.account.groupIds;
                const vpnId = req.body.id;
                const routerId = req.body.routerId;
                const vpn = await this.repository.findUnique(vpnId, routerId);
                if (!vpn) {
                    return res.status(404).send(`VPN with ID ${vpnId} not found`);
                }
                const router = await prisma.router.findUnique({
                    where: {
                        id: routerId,
                        deleted: 0,
                    },
                    include: {
                        routerGroupViewer: true,
                        routerGroupEditor: true,
                    },
                });
                if (!router) {
                    return res.status(404).send(`Router with ID ${routerId} not found`);
                }
                const routerGroupEditor = router.routerGroupEditor;
                const accountIsEditor = groupsIds.some((groupId: number) => {
                    return routerGroupEditor.some(routerGroupEditor => {
                        return routerGroupEditor.groupId === groupId;
                    })
                });
                if (!accountIsEditor) {
                    return res.status(403).send('Account is not an editor');
                }
                return this.softDelete(req, res);
            } else {
                return this.softDelete(req, res);
            }
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    private findUnique = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.findUnique');

        const id = req.query.id;
        if (!id) {
            logger.error('ID is undefined');
            return res.status(403).send('ID is undefined');
        }
        if (typeof id !== 'string') {
            logger.error(`ID is not a string`);
            return res.status(403).send('ID is not a string');
        }

        const routerId = Number(req.query.routerId);
        if (!routerId) {
            logger.error('Router ID is undefined');
            return res.status(403).send('Router ID is undefined');
        }

        const vpn = await this.repository.findUnique(id, routerId);
        if (!vpn) {
            logger.error(`Entity with ID ${id} not found`);
            return res.status(403).send(`Entity with ID ${id} not found`);
        }

        return res.status(200).json(vpn);
    }

    private findMany = async (_req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.findMany');
        const response = await this.repository.findMany();
        return res.status(200).json(response);
    }

    private create = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.create');
        try {

            const routerId = Number(req.body.routerId);
            if (!routerId) {
                logger.error('Router ID is undefined');
                return res.status(403).send('Router ID is undefined');
            }
            logger.debug(`Router ID: ${routerId}`);

            const router = await prisma.router.findUnique({
                where: {
                    id: routerId,
                    deleted: 0,
                },
            });
            if (!router) {
                logger.error('Router not found');
                return res.status(400).send('Router not found');
            }
            logger.debug(`Founded router name: ${router.name}`);

            console.log('Before Router OS Connect:', router);
            const routerOSAPI = new RouterOSAPI({
                host: router.localAddress,
                user: router.login,
                password: router.password,
                port: Number(process.env.TEST_ROUTER_PORT),
                timeout: Number(process.env.TEST_ROUTER_TIMEOUT),
            });
            const api = await routerOSAPI.connect();
            if (!api.connected) {
                logger.error('Connection failed');
                return res.status(400).send('Connection failed');
            } else {
                logger.info('Successfully connected');
            }

            console.log('Before Router OS Create:', req.body);
            const raw = await this.routerOsRepository.create(
                api,
                req.body.name,
                req.body.password,
                req.body.profile,
                req.body.remoteAddress,
                req.body.service,
                req.body.disabled ? 'yes' : 'no',
            );
            const vpn = (await this.routerOsRepository.findUnique(api, raw[0].ret as any as string))[0];
            if (!vpn) {
                logger.error('VPN not created by Router OS');
                return res.status(403).send('VPN not created by Router OS');
            } else {
                logger.debug('VPN successfully created by Router OS')
            }

            console.log('Before Prisma Create', vpn);
            const response = await this.repository.create({
                id: vpn['.id'],
                name: vpn.name,
                password: vpn.password,
                profile: vpn.profile,
                remoteAddress: vpn['remote-address'],
                service: vpn.service,
                disabled: vpn.disabled === 'true' ? 1 : 0,
                title: req.body.title,
                routerId: routerId,
                userId: req.body.userId > 0 ? req.body.userId : null,
            });
            console.log('Response Prisma:', response);

            return res.status(200).json(response);
        } catch (error: any) {
            console.error(error);
            const message = error.message ? error.message : 'Internal Server Error';
            logger.error(message);
            return res.status(500).send(message);
        }
    }

    private update = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.update');
        try {
            const routerId = Number(req.body.routerId);
            if (!routerId) {
                logger.error('Router ID is undefined');
                return res.status(403).send('Router ID is undefined');
            }
            logger.debug(`Router ID: ${routerId}`);

            const id = req.body.id;
            if (!id) {
                logger.error('ID is undefined');
                return res.status(403).send('ID is undefined');
            }
            logger.debug(`VPN ID: ${routerId}`);

            const router = await prisma.router.findUnique({
                where: {
                    id: routerId,
                    deleted: 0,
                },
            });
            if (!router) {
                logger.error('Router not found');
                return res.status(400).send('Router not found');
            }
            logger.debug(`Founded router name: ${router.name}`);

            console.log('Before Router OS Connect:', router);
            const routerOSAPI = new RouterOSAPI({
                host: router.localAddress,
                user: router.login,
                password: router.password,
                port: Number(process.env.TEST_ROUTER_PORT),
                timeout: Number(process.env.TEST_ROUTER_TIMEOUT),
            });
            const api = await routerOSAPI.connect();
            if (!api.connected) {
                return res.status(400).send('Connection failed');
            }
            logger.info(`Successfully connected to: ${router.localAddress}`);

            console.log('Before Router OS Update:', req.body);
            await this.routerOsRepository.update(
                api,
                id,
                req.body.name,
                req.body.password,
                req.body.profile,
                req.body.remoteAddress,
                req.body.service,
                req.body.disabled ? 'yes' : 'no',
            );
            const vpn = (await this.routerOsRepository.findUnique(api, id))[0];
            if (!vpn) {
                logger.error('VPN not updated by Router OS');
                return res.status(403).send('VPN not updated by Router OS');
            } else {
                logger.debug('VPN successfully updated by Router OS');
            }

            console.log('Before Prisma Update (RouterOS)', vpn);
            console.log('Before Prisma Update (Request):', req.body);
            const response = await this.repository.update({
                id: vpn['.id'],
                name: vpn.name,
                password: vpn.password,
                profile: vpn.profile,
                remoteAddress: vpn['remote-address'],
                service: vpn.service,
                disabled: vpn.disabled === 'true' ? 1 : 0,
                title: req.body.title,
                routerId: routerId,
                userId: req.body.userId > 0 ? req.body.userId : null,
            });
            console.log('Response Prisma:', response);

            return res.status(200).json(response);
        } catch (error: any) {
            console.error(error);
            const message = error.message ? error.message : 'Internal Server Error';
            logger.error(message);
            return res.status(500).send(message);
        }
    }

    private softDelete = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.softDelete');
        try {

            const routerId = Number(req.body.routerId);
            if (!routerId) {
                logger.error('Router ID is undefined');
                return res.status(403).send('Router ID is undefined');
            }
            logger.debug(`Router ID: ${routerId}`);

            const id = req.body.id;
            if (!id) {
                logger.error('ID is undefined');
                return res.status(403).send('ID is undefined');
            }
            logger.debug(`VPN ID: ${routerId}`);

            const router = await prisma.router.findUnique({
                where: {
                    id: routerId,
                },
            });
            if (!router) {
                logger.error('Router not found');
                return res.status(400).send('Router not found');
            }
            if (router.deleted === 1) {
                const response = await this.repository.delete(
                    id,
                    routerId,
                );

                return res.status(200).json(response);
            }

            const routerOSAPI = new RouterOSAPI({
                host: router.localAddress,
                user: router.login,
                password: router.password,
                port: Number(process.env.TEST_ROUTER_PORT),
                timeout: Number(process.env.TEST_ROUTER_TIMEOUT),
            });
            const api = await routerOSAPI.connect();
            if (!api.connected) {
                return res.status(400).send('Connection failed');
            }

            await this.routerOsRepository.delete(
                api,
                id,
            );

            const response = await this.repository.delete(
                id,
                routerId,
            );

            return res.status(200).json(response);
        } catch (error: any) {
            console.error(error);
            const message = error.message ? error.message : 'Internal Server Error';
            logger.error(message);
            return res.status(500).send(message);
        }
    }


}
