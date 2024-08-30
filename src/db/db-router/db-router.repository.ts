import {Router, RouterGroupEditor, RouterGroupViewer, VPN} from "@prisma/client";
import {logger} from "../../logger";
import {prisma} from "../../prisma";

const className = 'DbRouterRepository'

export interface RouterExtended extends Router {
    vpns: VPN[],
    routerGroupViewer: RouterGroupViewer[],
    routerGroupEditor: RouterGroupEditor[],
}

export class DbRouterRepository {
    constructor() {
        logger.debug(className);
    }

    findUnique = async (id: number): Promise<RouterExtended | null> => {
        logger.debug(className + '.findUnique');
        return prisma.router.findUnique({
            where: {
                id: id,
                deleted: 0,
            },
            include: {
                vpns: true,
                routerGroupViewer: {
                    include: {
                        group: true,
                    },
                },
                routerGroupEditor: {
                    include: {
                        group: true,
                    },
                },
            },
        });
    }

    findMany = async (): Promise<RouterExtended[]> => {
        logger.debug(className + '.findMany');
        return prisma.router.findMany({
            where: {
                deleted: 0,
            },
            include: {
                vpns: true,
                routerGroupViewer: {
                    include: {
                        group: true,
                    },
                },
                routerGroupEditor: {
                    include: {
                        group: true,
                    },
                },
            },
        });
    }

    create = async (data: {
        login: string,
        password: string,
        localAddress: string,
        remoteAddress: string,
        name: string,
        title: string,
        disabled: 0 | 1,
        certificate: Buffer | null,
        l2tpKey: string,
    }): Promise<RouterExtended> => {
        logger.debug(className + '.create');
        return prisma.router.create({
            data: data,
            include: {
                vpns: true,
                routerGroupViewer: {
                    include: {
                        group: true,
                    },
                },
                routerGroupEditor: {
                    include: {
                        group: true,
                    },
                },
            },
        });
    }

    update = async (data: {
        id: number,
        login: string,
        password: string,
        localAddress: string,
        remoteAddress: string,
        name: string,
        title: string,
        disabled: 0 | 1,
        certificate: Buffer | null,
        l2tpKey: string,
    }): Promise<RouterExtended> => {
        logger.debug(className + '.update');
        return prisma.router.update({
            where: {id: data.id},
            data: data,
            include: {
                vpns: true,
                routerGroupViewer: {
                    include: {
                        group: true,
                    },
                },
                routerGroupEditor: {
                    include: {
                        group: true,
                    },
                },
            },
        });
    }

    delete = async (id: number): Promise<RouterExtended> => {
        logger.debug(className + '.delete');
        return prisma.router.update({
            where: {
                id,
            },
            data: {
                deleted: 1,
            },
            include: {
                vpns: true,
                routerGroupViewer: {
                    include: {
                        group: true,
                    },
                },
                routerGroupEditor: {
                    include: {
                        group: true,
                    },
                },
            },
        });
    }
}
