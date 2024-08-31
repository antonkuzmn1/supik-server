import {logger} from "../../logger";
import {prisma} from "../../prisma";

const className = 'DbVpnRepository'

export class DbVpnRepository {
    constructor() {
        logger.debug(className);
    }

    findUnique = async (id: string, routerId: number): Promise<any> => {
        logger.debug(className + '.findUnique');
        return prisma.vpn.findUnique({
            where: {
                id_routerId: {
                    id,
                    routerId,
                },
                deleted: 0,
            },
            include: {
                router: true,
                user: true,
            },
        });
    }

    findMany = async (): Promise<any> => {
        logger.debug(className + '.findMany');
        return prisma.vpn.findMany({
            where: {
                deleted: 0,
            },
            include: {
                router: true,
                user: true,
            },
        });
    }

    create = async (
        data: {
            id: string,
            name: string,
            password: string,
            profile: string,
            remoteAddress: string,
            service: string,
            disabled: 0 | 1,
            title: string,
            routerId: number,
            userId: number,
        }
    ): Promise<any> => {
        logger.debug(className + '.create');
        return prisma.vpn.create({
            data: data,
            include: {
                router: true,
                user: true,
            },
        });
    }

    update = async (
        data: {
            id: string,
            name: string,
            password: string,
            profile: string,
            remoteAddress: string,
            service: string,
            disabled: 0 | 1,
            title: string,
            routerId: number,
            userId: number,
        }
    ): Promise<any> => {
        logger.debug(className + '.update');
        return prisma.vpn.update({
            where: {
                id_routerId: {
                    id: data.id,
                    routerId: data.routerId,
                },
            },
            data: data,
            include: {
                router: true,
                user: true,
            },
        });
    }

    delete = async (id: string, routerId: number): Promise<any> => {
        logger.debug(className + '.delete');
        return prisma.vpn.update({
            where: {
                id_routerId: {
                    id,
                    routerId,
                },
            },
            data: {
                deleted: 1,
            },
            include: {
                router: true,
                user: true,
            },
        });
    }
}
