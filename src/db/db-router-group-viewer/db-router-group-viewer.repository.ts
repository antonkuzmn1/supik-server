import {RouterGroupViewer} from "@prisma/client";
import {logger} from "../../logger";
import {prisma} from "../../prisma";

const className = 'DbRouterGroupViewerRepository'

export class DbRouterGroupViewerRepository {
    constructor() {
        logger.debug(className);
    }

    create = async (routerId: number, groupId: number): Promise<RouterGroupViewer> => {
        logger.debug(className + '.create');
        return prisma.routerGroupViewer.create({
            data: {
                routerId,
                groupId,
            },
        });
    }

    delete = async (routerId: number, groupId: number): Promise<RouterGroupViewer> => {
        logger.debug(className + '.delete');
        return prisma.routerGroupViewer.delete({
            where: {
                routerId_groupId: {
                    routerId,
                    groupId,
                }
            },
        });
    }
}
