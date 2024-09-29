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
import {DbRouterRepository} from "./db-router.repository";
import {RouterOSAPI} from "node-routeros";
import {prisma} from "../../prisma";
import {Router} from "@prisma/client";
import {RouterOsRepository} from "../../router-os/router-os.repository";

const className = 'DbRouterService';

export class DbRouterService implements CrudInterface {

    constructor(
        private readonly repository: DbRouterRepository,
        private readonly routerOsRepository: RouterOsRepository,
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

    test = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.test');
        try {
            return this.testConnection(req, res);
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

    sync = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.sync');
        try {
            return this.syncVpns(req, res);
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
            const router = await this.repository.findUnique(id);
            if (!router) {
                logger.error(`Entity with ID ${id} not found`);
                return res.status(403).send(`Entity with ID ${id} not found`);
            }
            const routerOSAPI = new RouterOSAPI({
                host: router.localAddress,
                user: router.login,
                password: router.password,
                port: Number(process.env.TEST_ROUTER_PORT),
                timeout: Number(process.env.TEST_ROUTER_TIMEOUT),
            });
            try {
                const api = await routerOSAPI.connect();
                logger.info('Successfully connected');
                const profiles = await this.routerOsRepository.findProfiles(api) as any;
                const assignedIps = await api.write('/ppp/secret/print');
                const poolsResult: { [p: string]: string[] } = {};
                for (const profile of profiles) {
                    if (profile['remote-address']) {
                        const pools = await api.write('/ip/pool/print', [`?name=${profile['remote-address']}`]);
                        const pool = pools[0];
                        const ipList = this.generateIpRange(pool.ranges);
                        const filteredIps = assignedIps.filter(secret => secret.profile === profile.name)
                        const usedIps = filteredIps.map(secret => secret['remote-address']);
                        poolsResult[profile.name] = ipList.filter(ip => !usedIps.includes(ip));
                    }
                }
                return res.status(200).json({
                    router,
                    profiles,
                    pools: poolsResult
                });
            } catch (error) {
                logger.error('Connection failed');
                return res.status(200).json({router});
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

            const localAddress = req.query.localAddress;
            if (localAddress) {
                where = {
                    ...where,
                    localAddress: {
                        contains: localAddress,
                    },
                }
            }

            const remoteAddress = req.query.remoteAddress;
            if (remoteAddress) {
                where = {
                    ...where,
                    remoteAddress: {
                        contains: remoteAddress,
                    },
                }
            }

            const defaultProfile = req.query.defaultProfile;
            if (defaultProfile) {
                where = {
                    ...where,
                    defaultProfile: {
                        contains: defaultProfile,
                    },
                }
            }

            const prefix = req.query.prefix;
            if (prefix) {
                where = {
                    ...where,
                    prefix: {
                        contains: prefix,
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

            const disabled = req.query.disabled;
            if (disabled !== undefined) {
                where = {
                    ...where,
                    disabled: disabled === 'true' ? 1 : 0,
                }
            }

            const l2tpKey = req.query.l2tpKey;
            if (l2tpKey) {
                where = {
                    ...where,
                    l2tpKey: {
                        contains: l2tpKey,
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
        const {account, ...dataToCreate} = req.body;
        let fileBuffer = null;
        if (dataToCreate.certificate) {
            const base64Data = dataToCreate.certificate.replace(/^data:.*;base64,/, '');
            fileBuffer = Buffer.from(base64Data, 'base64');
        }
        if (!dataToCreate.disabled && dataToCreate.remoteAddress.length < 7) {
            if (dataToCreate.remoteAddress.length === 0) {
                logger.error('External address required');
                return res.status(400).send('External address required');
            }
            logger.error('External address should be at least 7 characters long');
            return res.status(400).send('External address should be at least 7 characters long');
        }
        try {
            const response = await this.repository.create({
                login: dataToCreate.login,
                password: dataToCreate.password,
                localAddress: dataToCreate.localAddress,
                remoteAddress: dataToCreate.remoteAddress,
                defaultProfile: dataToCreate.defaultProfile,
                prefix: dataToCreate.prefix,
                name: dataToCreate.name,
                title: dataToCreate.title,
                disabled: dataToCreate.disabled,
                certificate: fileBuffer,
                l2tpKey: dataToCreate.l2tpKey,
            });
            await prisma.log.create({
                data: {
                    action: 'create_router',
                    newValue: response as Router,
                    initiatorId: req.body.account.id,
                    routerId: response.id,
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
        const {account, ...dataToCreate} = req.body;
        let fileBuffer = null;
        if (dataToCreate.certificate) {
            const base64Data = dataToCreate.certificate.replace(/^data:.*;base64,/, ''); // Удаление префикса
            fileBuffer = Buffer.from(base64Data, 'base64');
        }
        if (!dataToCreate.disabled && dataToCreate.remoteAddress.length < 7) {
            if (dataToCreate.remoteAddress.length === 0) {
                logger.error('External address required');
                return res.status(400).send('External address required');
            }
            logger.error('External address should be at least 7 characters long');
            return res.status(400).send('External address should be at least 7 characters long');
        }
        try {
            const response = await this.repository.update({
                id: dataToCreate.id,
                login: dataToCreate.login,
                password: dataToCreate.password,
                localAddress: dataToCreate.localAddress,
                remoteAddress: dataToCreate.remoteAddress,
                defaultProfile: dataToCreate.defaultProfile,
                prefix: dataToCreate.prefix,
                name: dataToCreate.name,
                title: dataToCreate.title,
                disabled: dataToCreate.disabled,
                certificate: fileBuffer,
                l2tpKey: dataToCreate.l2tpKey,
            });
            await prisma.log.create({
                data: {
                    action: 'update_router',
                    newValue: response as Router,
                    initiatorId: req.body.account.id,
                    routerId: response.id,
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
                    action: 'delete_router',
                    newValue: response as Router,
                    initiatorId: req.body.account.id,
                    routerId: response.id,
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

    private testConnection = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.testConnection');
        try {
            const host = req.body.host as string;
            if (!host) {
                return res.status(400).send('"host" field is required');
            }
            const user = req.body.user as string;
            if (!user) {
                return res.status(400).send('"user" field is required');
            }
            const password = req.body.password as string;
            if (!password) {
                return res.status(400).send('"password" field is required');
            }
            const port = process.env.TEST_ROUTER_PORT as any as number;
            const timeout = process.env.TEST_ROUTER_TIMEOUT as any as number;

            const routerOSAPI = new RouterOSAPI({
                host,
                user,
                password,
                port,
                timeout,
            });
            const api = await routerOSAPI.connect();
            if (!api.connected) {
                return res.status(400).send('Connection failed');
            }
            return res.status(200).json(true);
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

    private syncVpns = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.syncVpns');
        try {
            const routerId = req.body.routerId;
            if (!routerId) {
                logger.error('"routerId" field is required');
                return res.status(400).send('"routerId" field is required');
            }
            logger.debug(`Received router ID: ${routerId}`);

            const router = await prisma.router.findUnique({
                where: {
                    id: routerId,
                },
            });
            if (!router) {
                logger.error(`Router with ID ${routerId} not found`);
                return res.status(403).send(`Router with ID ${routerId} not found`);
            }
            logger.debug(`Founded router: ${router.name} (${router.localAddress})`);
            try {
                const host = router.localAddress;
                if (!host) {
                    return res.status(400).send('"host" field is required');
                }
                logger.debug(`Received Host: ${host}`);
                const user = router.login;
                if (!user) {
                    return res.status(400).send('"user" field is required');
                }
                logger.debug(`Received User: ${user}`);
                const password = router.password;
                if (!password) {
                    return res.status(400).send('"password" field is required');
                }
                logger.debug(`Received Password: ${password}`);
                const port = process.env.TEST_ROUTER_PORT as any as number;
                logger.debug(`Received Port: ${port}`);
                const timeout = process.env.TEST_ROUTER_TIMEOUT as any as number;
                logger.debug(`Received Timeout: ${timeout}`);
                try {
                    const routerOSAPI = new RouterOSAPI({
                        host,
                        user,
                        password,
                        port,
                        timeout,
                    });
                    const api = await routerOSAPI.connect();
                    if (!api.connected) {
                        return res.status(400).send('Connection failed');
                    }
                    logger.debug(`Successfully connected: ${host}`);
                    try {
                        const vpnsFromRouterOS = await api.write('/ppp/secret/print');
                        logger.debug(`Founded ${vpnsFromRouterOS.length} rows of VPN accounts by Router ${host}`);
                        for (const vpnFromRouterOS of vpnsFromRouterOS) {
                            logger.debug('');
                            logger.debug(`Check VPN with name: ${vpnFromRouterOS.name}`);
                            try {
                                logger.debug(`vpnId: ${vpnFromRouterOS['.id']}, routerId: ${routerId}`);
                                const vpnFromDB = await prisma.vpn.findFirst({
                                    where: {
                                        vpnId: vpnFromRouterOS['.id'],
                                        routerId: routerId,
                                        deleted: 0,
                                    },
                                });
                                if (!vpnFromDB) {
                                    logger.debug(`VPN ${vpnFromRouterOS.name} (${vpnFromRouterOS['.id']}) is not exists`);
                                    try {
                                        const response = await prisma.vpn.create({
                                            data: {
                                                name: vpnFromRouterOS.name,
                                                password: vpnFromRouterOS.password,
                                                profile: vpnFromRouterOS.profile,
                                                remoteAddress: vpnFromRouterOS['remote-address'],
                                                service: vpnFromRouterOS.service,
                                                disabled: vpnFromRouterOS.disabled === 'true' ? 1 : 0,
                                                vpnId: vpnFromRouterOS['.id'],
                                                routerId: routerId,
                                                userId: req.body.userId > 0 ? req.body.userId : null,
                                            }
                                        });
                                        await prisma.log.create({
                                            data: {
                                                action: 'sync_create_vpn',
                                                newValue: response,
                                                initiatorId: req.body.account.id,
                                                vpnId: response.id,
                                            },
                                        });
                                    } catch (error: unknown) {
                                        if (error instanceof Error) {
                                            logger.error(error.message);
                                            return res.status(500).send(error.message);
                                        } else {
                                            logger.error('Unexpected error');
                                            return res.status(500).send('Unexpected error');
                                        }
                                    }
                                } else {
                                    logger.debug(`Founded ${vpnFromDB.name} (VPN ID: ${vpnFromDB.vpnId}) (ID: ${vpnFromDB.id})`);
                                    try {
                                        const response = await prisma.vpn.update({
                                            where: {
                                                id: vpnFromDB.id,
                                            },
                                            data: {
                                                name: vpnFromRouterOS.name,
                                                password: vpnFromRouterOS.password,
                                                profile: vpnFromRouterOS.profile,
                                                remoteAddress: vpnFromRouterOS['remote-address'],
                                                service: vpnFromRouterOS.service,
                                                disabled: vpnFromRouterOS.disabled === 'true' ? 1 : 0,
                                                vpnId: vpnFromRouterOS['.id'],
                                                routerId: routerId,
                                                userId: req.body.userId > 0 ? req.body.userId : null,
                                            }
                                        });
                                        await prisma.log.create({
                                            data: {
                                                action: 'sync_update_vpn',
                                                newValue: response,
                                                initiatorId: req.body.account.id,
                                                vpnId: response.id,
                                            },
                                        });
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
                        return res.status(200).json(vpnsFromRouterOS);
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

    private generateIpRange = (range: any) => {
        const [start, end] = range.split('-');
        let currentIp = this.ipToLong(start);
        const lastIp = this.ipToLong(end);
        const ips = [];

        while (currentIp <= lastIp) {
            ips.push(this.longToIp(currentIp));
            currentIp++;
        }

        return ips;
    }

    private ipToLong = (ip: any) => {
        return ip.split('.').reduce((acc: any, octet: any) => (acc << 8) + parseInt(octet, 10), 0);
    }

    private longToIp = (long: any) => {
        return [
            (long >>> 24) & 255,
            (long >>> 16) & 255,
            (long >>> 8) & 255,
            long & 255
        ].join('.');
    }

}
