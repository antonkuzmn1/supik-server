import {logger} from "../../logger";
import {CrudInterface} from "../../common/crud.interface";
import {Request, Response} from "express";
import {prisma} from "../../prisma";
import {RouterGroupViewer} from "@prisma/client";

const className = 'DbVpnService';

export class DbVpnService implements CrudInterface {
    constructor() {
        logger.debug(className);
    }

    get = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.get');
        try {
            if (req.query.id) {
                if (!req.body.account.admin) {
                    const vpnId = Number(req.query.id);
                    if (!vpnId) {
                        return res.status(400).send('Invalid VPN ID');
                    }
                    const groupsIds = req.body.account.groupIds;
                    const vpn = await prisma.vpn.findUnique({
                        where: {
                            id: vpnId,
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
            return this.create(req, res);
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    put = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.put');
        try {
            return this.update(req, res);
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    delete = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.delete');
        try {
            return this.softDelete(req, res);
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    private findUnique = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.findUnique');
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
    }

    private findMany = async (_req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.findMany');
        const response = await this.repository.findMany();
        return res.status(200).json(response);
    }

    private create = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.create');
        const {account, ...dataToCreate} = req.body;
        const response = await this.repository.create(dataToCreate);
        return res.status(200).json(response);
    }

    private update = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.update');
        const {account, ...dataToCreate} = req.body;
        const response = await this.repository.update(dataToCreate);
        return res.status(200).json(response);
    }

    private softDelete = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.softDelete');
        const response = await this.repository.delete(req.body.id);
        return res.status(200).json(response);
    }


}
