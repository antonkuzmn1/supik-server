import {logger} from "../../logger";
import {prisma} from "../../prisma";

const className = 'DbUserRepository'

export class DbUserRepository {
    constructor() {
        logger.debug(className);
    }

    findUnique = async (id: number): Promise<any> => {
        logger.debug(className + '.findUnique');
        return prisma.user.findUnique({
            where: {
                id: id,
                deleted: 0,
            },
            include: {
                vpns: true,
            },
        });
    }

    findMany = async (): Promise<any> => {
        logger.debug(className + '.findMany');
        return prisma.user.findMany({
            where: {
                deleted: 0,
            },
            include: {
                vpns: true,
            },
        });
    }

    create = async (data: {
        name: string,
        surname: string,
        patronymic: string,
        fullname: string,
        department: string,
        title: string,
        login: string,
        password: string,
        disabled: 0 | 1,
    }): Promise<any> => {
        logger.debug(className + '.create');
        return prisma.user.create({
            data: data,
            include: {
                vpns: true,
            },
        });
    }

    update = async (data: {
        id: number,
        name: string,
        surname: string,
        patronymic: string,
        fullname: string,
        department: string,
        title: string,
        login: string,
        password: string,
        disabled: 0 | 1,
    }): Promise<any> => {
        logger.debug(className + '.update');
        return prisma.user.update({
            where: {id: data.id},
            data: data,
            include: {
                vpns: true,
            },
        });
    }

    delete = async (id: number): Promise<any> => {
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
            },
        });
    }
}
