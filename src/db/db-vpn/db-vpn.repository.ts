import {logger} from "../../logger";
import {prisma} from "../../prisma";

const className = 'DbVpnRepository'

export class DbVpnRepository {
    constructor() {
        logger.debug(className);
    }

    findUnique = async (id: number): Promise<any> => {
        logger.debug(className + '.findUnique');
        return prisma.vpn.findUnique({
            where: {
                id: id,
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

    create = async (data: {
        name: string,
        password: string,
        service: string,
        localAddress: string,
        remoteAddress: string,
        title: string,
        disabled: 0 | 1,
        routerId: number,
        userId: number,
    }): Promise<any> => {
        logger.debug(className + '.create');
        return prisma.vpn.create({
            data: data,
            include: {
                router: true,
                user: true,
            },
        });
    }

    update = async (data: {
        id: number,
        name: string,
        password: string,
        service: string,
        localAddress: string,
        remoteAddress: string,
        title: string,
        disabled: 0 | 1,
        routerId: number,
        userId: number,
    }): Promise<any> => {
        logger.debug(className + '.update');
        return prisma.vpn.update({
            where: {id: data.id},
            data: data,
            include: {
                router: true,
                user: true,
            },
        });
    }

    delete = async (id: number): Promise<any> => {
        logger.debug(className + '.delete');
        return prisma.vpn.update({
            where: {
                id,
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
