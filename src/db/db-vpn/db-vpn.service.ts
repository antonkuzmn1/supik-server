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
import archiver, {Archiver} from "archiver";
import JsPDF from 'jspdf';
import path from 'path';
import * as dns from 'node:dns';
import fs from 'fs';
import nodemailer, {Transporter} from "nodemailer";

const robotoNormalFontPath = path.join(__dirname, '../../assets/Roboto/Roboto-Regular.ttf');
const robotoBoldFontPath = path.join(__dirname, '../../assets/Roboto/Roboto-Bold.ttf');

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
            if (req.query.id) {
                if (!req.body.account.admin) {
                    const id = Number(req.query.id);
                    if (!id) {
                        return res.status(400).send('Invalid VPN ID');
                    }
                    const groupsIds = req.body.account.groupIds;
                    const vpn = await prisma.vpn.findUnique({
                        where: {
                            id: id,
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
                        },
                        include: {
                            router: true,
                            user: true,
                        }
                    });
                    return res.status(200).json(vpns);
                } else {
                    return this.findMany(req, res);
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
            if (!req.body.account.admin) {
                const groupsIds = req.body.account.groupIds;
                const id = Number(req.body.id);
                const vpn = await this.repository.findUnique(id);
                if (!vpn) {
                    return res.status(404).send(`VPN with ID ${id} not found`);
                }
                const router = await prisma.router.findUnique({
                    where: {
                        id: vpn.router.id,
                        deleted: 0,
                    },
                    include: {
                        routerGroupViewer: true,
                        routerGroupEditor: true,
                    },
                });
                if (!router) {
                    return res.status(404).send(`Router with ID ${vpn.router.id} not found`);
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
            if (!req.body.account.admin) {
                const groupsIds = req.body.account.groupIds;
                const id = Number(req.body.id);
                const vpn = await this.repository.findUnique(id);
                if (!vpn) {
                    return res.status(404).send(`VPN with ID ${id} not found`);
                }
                const router = await prisma.router.findUnique({
                    where: {
                        id: vpn.router.id,
                        deleted: 0,
                    },
                    include: {
                        routerGroupViewer: true,
                        routerGroupEditor: true,
                    },
                });
                if (!router) {
                    return res.status(404).send(`Router with ID ${vpn.router.id} not found`);
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

    getArchive = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.getArchive');
        try {
            const id = Number(req.query.id);

            const archive: Archiver | string = await this.generateArchive(id);
            if (typeof archive === 'string') {
                logger.error(archive);
                return res.status(500).send(archive);
            }

            archive.pipe(res);

            return res.status(200).attachment('files.zip');
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

    sendMail = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.sendMail');
        try {
            const host = (await prisma.settings.findUnique({where: {key: 'mailYandexTransporterHost'}}))?.value;
            if (!host) {
                return res.status(500).send('param MAIL_YANDEX_TRANSPORTER_HOST undefined');
            }

            const port = Number((await prisma.settings.findUnique({where: {key: 'mailYandexTransporterPort'}}))?.value);
            if (!port) {
                return res.status(500).send('param MAIL_YANDEX_TRANSPORTER_PORT undefined');
            }
            if (isNaN(Number(port))) {
                return res.status(500).send('param MAIL_YANDEX_TRANSPORTER_PORT is not a number');
            }

            const secure = Boolean((await prisma.settings.findUnique({where: {key: 'mailYandexTransporterSecure'}}))?.value);

            const user = (await prisma.settings.findUnique({where: {key: 'mailYandexTransporterAuthUser'}}))?.value;
            if (!user) {
                return res.status(500).send('param MAIL_YANDEX_TRANSPORTER_AUTH_USER undefined');
            }

            const pass = (await prisma.settings.findUnique({where: {key: 'mailYandexTransporterAuthPass'}}))?.value;
            if (!pass) {
                return res.status(500).send('param MAIL_YANDEX_TRANSPORTER_AUTH_PASS undefined');
            }

            const targetMail = req.body.targetMail;
            if (!targetMail) {
                return res.status(400).send('Target mail required');
            }

            if (typeof targetMail !== 'string') {
                return res.status(400).send('Target mail should be a string');
            }

            const id = Number(req.body.id);
            if (!id) {
                return res.status(400).send('ID required');
            }
            if (isNaN(id)) {
                return res.status(500).send('ID is not a number');
            }

            const transporter: Transporter = nodemailer.createTransport({
                host,
                port,
                secure,
                auth: {
                    user,
                    pass
                }
            });

            const archive: Archiver | string = await this.generateArchive(id);
            if (typeof archive === 'string') {
                logger.error(archive);
                return res.status(500).send(archive);
            }
            const tempFilePath = path.join(__dirname, `archive.zip`);
            const output = fs.createWriteStream(tempFilePath);
            archive.pipe(output);
            await new Promise((resolve, reject) => {
                output.on('finish', resolve);
                output.on('error', reject);
            });

            const mailOptions = {
                from: user,
                to: targetMail,
                subject: 'Корпоративный VPN',
                text: 'В архиве набор для подключения VPN',
                attachments: [
                    {
                        filename: 'archive.zip',
                        path: tempFilePath,
                    },
                ],
            };

            try {
                console.log('mailOptions:', mailOptions);
                await transporter.sendMail(mailOptions);
                return res.status(200).send('Success');
            } catch (error) {
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

    private findUnique = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.findUnique');
        try {

            const id = Number(req.query.id);
            if (!id) {
                logger.error('ID is undefined');
                return res.status(403).send('ID is undefined');
            }

            const vpn = await this.repository.findUnique(id);
            if (!vpn) {
                logger.error(`Entity with ID ${id} not found`);
                return res.status(403).send(`Entity with ID ${id} not found`);
            }

            return res.status(200).json(vpn);
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
                router: {
                    disabled: 0,
                }
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

            const password = req.query.password;
            if (password) {
                where = {
                    ...where,
                    password: {
                        contains: password,
                    },
                }
            }

            const service = req.query.service;
            if (service) {
                where = {
                    ...where,
                    service: {
                        contains: service,
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

            const routerId = req.query.routerId as string
            if (routerId) {
                where = {
                    ...where,
                    routerId: {
                        in: routerId.split(',').map(Number),
                    },
                }
            }

            const userId = req.query.userId as string
            if (userId) {
                where = {
                    ...where,
                    userId: {
                        in: userId.split(',').map(Number),
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

            const raw = await this.routerOsRepository.create(
                api,
                req.body.name,
                req.body.password,
                router.defaultProfile,
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

            const response = await this.repository.create({
                vpnId: vpn['.id'],
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
            await prisma.log.create({
                data: {
                    action: 'create_vpn',
                    newValue: response,
                    initiatorId: req.body.account.id,
                    vpnId: response.id,
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
            const id = req.body.id;
            if (!id) {
                logger.error('ID is undefined');
                return res.status(403).send('ID is undefined');
            }
            logger.debug(`VPN ID: ${id}`);

            const routerId = Number(req.body.routerId);
            if (!routerId) {
                logger.error('Router ID is undefined');
                return res.status(403).send('Router ID is undefined');
            }
            logger.debug(`Router ID: ${routerId}`);

            const vpnId = req.body.vpnId;
            if (!vpnId) {
                logger.error('ID is undefined');
                return res.status(403).send('ID is undefined');
            }
            logger.debug(`VPN ID: ${vpnId}`);

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

            const vpnsForCheck = await this.routerOsRepository.findMany(api);
            const vpnsWithDuplicateAddr = vpnsForCheck.filter((vpn: any) => {
                return vpn['remote-address'] === req.body.remoteAddress
            });
            if (vpnsWithDuplicateAddr.length > 0 &&
                (vpnsWithDuplicateAddr.length > 1 ||
                    vpnsWithDuplicateAddr[0]['.id'] !== req.body.vpnId)) {
                logger.error('Duplicate remote address');
                return res.status(400).send('Duplicate remote address');
            }

            await this.routerOsRepository.update(
                api,
                vpnId,
                req.body.name,
                req.body.password,
                router.defaultProfile,
                req.body.remoteAddress,
                req.body.service,
                req.body.disabled ? 'yes' : 'no',
            );
            const vpn = (await this.routerOsRepository.findUnique(api, vpnId))[0];
            if (!vpn) {
                logger.error('VPN not updated by Router OS');
                return res.status(403).send('VPN not updated by Router OS');
            } else {
                logger.debug('VPN successfully updated by Router OS');
            }

            const response = await this.repository.update({
                id: id,
                name: vpn.name,
                password: vpn.password,
                profile: vpn.profile,
                remoteAddress: vpn['remote-address'],
                service: vpn.service,
                disabled: vpn.disabled === 'true' ? 1 : 0,
                title: req.body.title,
                vpnId: vpn['.id'],
                routerId: routerId,
                userId: Number(req.body.userId) > 0 ? Number(req.body.userId) : null,
            });
            await prisma.log.create({
                data: {
                    action: 'update_vpn',
                    newValue: response,
                    initiatorId: req.body.account.id,
                    vpnId: response.id,
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
            const id = req.body.id;
            if (!id) {
                logger.error('ID is undefined');
                return res.status(403).send('ID is undefined');
            }
            logger.debug(`VPN ID: ${id}`);

            const routerId = Number(req.body.routerId);
            if (!routerId) {
                logger.error('Router ID is undefined');
                return res.status(403).send('Router ID is undefined');
            }
            logger.debug(`Router ID: ${routerId}`);

            const vpnId = req.body.vpnId;
            if (!vpnId) {
                logger.error('ID is undefined');
                return res.status(403).send('ID is undefined');
            }
            logger.debug(`VPN ID: ${vpnId}`);

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
                const response = await this.repository.delete(id);

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

            await this.routerOsRepository.delete(api, vpnId);

            const response = await this.repository.delete(id);
            await prisma.log.create({
                data: {
                    action: 'delete_vpn',
                    newValue: response,
                    initiatorId: req.body.account.id,
                    vpnId: response.id,
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

    private generateArchive = async (id: number): Promise<Archiver | string> => {
        const archive = archiver('zip', {
            zlib: {level: 9}
        });

        const vpn = await prisma.vpn.findUnique({
            where: {id},
            include: {
                router: true,
                user: {
                    include: {
                        mails: true,
                    }
                },
            }
        });
        if (!vpn) {
            logger.error(`Entity with ID ${id} not found`);
            return `Entity with ID ${id} not found`;
        }

        const certificate = vpn.router.certificate;
        if (!certificate) {
            return `Certificate not found`;
        }
        const certificateFileName = 'certificate.sstp.crt';
        archive.append(certificate, {name: certificateFileName});

        const localAddressParts = vpn.router.localAddress.split('.');
        const subnet = `${localAddressParts[0]}.${localAddressParts[1]}.${localAddressParts[2]}.0`;
        const codeCmd = `@echo off
setlocal
set "certFile=%~dp0${certificateFileName}"

:: Check if script is running with elevated privileges
reg query "HKU\\S-1-5-19\\Environment" >nul 2>&1
if not %errorlevel% EQU 0 (
    echo Running without elevated privileges. Restarting with elevated privileges.
    powershell.exe -windowstyle hidden -command "Start-Process '%~dpnx0' -ArgumentList '%certFile%' -Verb RunAs"
    exit /b
)

:: Proceed with the commands if running with elevated privileges
echo Running with elevated privileges. Proceeding with the commands.

:: add cert to root store
certutil -addstore Root "%certFile%"
::add route to network
route -p add ${subnet} mask 255.255.255.0 int_adress`;
        archive.append(codeCmd, {name: 'add_cert_and_route.cmd'});

        const user = vpn.user;
        if (!user) {
            return `User not found`;
        }

        const doc = new JsPDF({
            format: 'a4',
            unit: 'px',
        });
        doc.addFont(robotoNormalFontPath, 'Roboto', 'normal');
        doc.addFont(robotoBoldFontPath, 'Roboto', 'bold');
        doc.setFont('Roboto');
        doc.setFontSize(20);
        doc.text('Карточка сотрудника', 10, 30);
        doc.setFontSize(12);
        const data = [
            ['Фамилия', user.surname],
            ['Имя', user.name],
            ['Отчество', user.patronymic],
            ['Должность', user.title],
            ['Рабочее место', user.workplace],
            ['Внутренний номер', user.phone],
            ['Почтовый логин', user.mails[0]?.email || ''],
            ['Почтовый пароль', user.mails[0]?.password || ''],
            ['Системный логин', user.login],
            ['Системный пароль', user.password],
            ['Почтовый клиент', 'https://mail.yandex.ru'],
            ['Корпоративный мессенджер', 'Spark'],
            ['Руководство пользователя', 'http://info'],
        ];
        data.forEach((row, i) => {
            doc.text(row[0], 10, 60 + 20 * i);
            doc.text(row[1], 150, 60 + 20 * i);
            doc.line(10, 64 + 20 * i, 400, 64 + 20 * i);
        });
        const pdfArrayBuffer = doc.output('arraybuffer');
        const pdfBuffer = Buffer.from(pdfArrayBuffer);
        const pdfFileName = `${user.surname} ${user.name} ${user.patronymic}.pdf`
        archive.append(pdfBuffer, {name: pdfFileName});

        const rdpUsername = vpn.user?.login as string;
        const dnsAddress = (await prisma.settings.findUnique({where: {key: 'dnsServerAddress'}}))?.value
        dns.setServers([dnsAddress as string]);
        const localDomain = (await prisma.settings.findUnique({where: {key: 'localDomain'}}))?.value
        const vmName = `${vpn.user?.workplace}.${localDomain}`;
        const rdpAddress = await this.getRdpAddress(vmName);
        if (!rdpAddress) {
            return 'Address not found';
        }
        const codeRdp = `screen mode id:i:2
use multimon:i:1
desktopwidth:i:1920
desktopheight:i:1080
session bpp:i:32
full address:s:${rdpAddress}
username:s:${rdpUsername}`;
        archive.append(codeRdp, {name: `${vmName}.rdp`});

        const samplePdfPath = path.join(__dirname, '../../assets/sample.pdf');
        const samplePdfBuffer = fs.readFileSync(samplePdfPath);
        archive.append(samplePdfBuffer, {name: 'sample.pdf'});

        await archive.finalize();

        return archive;
    }

    private getRdpAddress = (hostname: string): Promise<string | null> => {
        return new Promise((resolve, reject) => {
            dns.resolve(hostname, (err, addresses) => {
                if (err) {
                    resolve(null);
                } else {
                    resolve(addresses[0]);
                }
            });
        });
    }
}
