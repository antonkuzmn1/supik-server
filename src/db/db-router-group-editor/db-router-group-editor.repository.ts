import {RouterGroupEditor} from "@prisma/client";
import {logger} from "../../logger";
import {prisma} from "../../prisma";

const className = 'DbRouterGroupEditorRepository'

export class DbRouterGroupEditorRepository {
    constructor() {
        logger.debug(className);
    }

    create = async (routerId: number, groupId: number): Promise<RouterGroupEditor> => {
        logger.debug(className + '.create');
        return prisma.routerGroupEditor.create({
            data: {
                routerId,
                groupId,
            },
        });
    }

    delete = async (routerId: number, groupId: number): Promise<RouterGroupEditor> => {
        logger.debug(className + '.delete');
        return prisma.routerGroupEditor.delete({
            where: {
                routerId_groupId: {
                    routerId,
                    groupId,
                }
            },
        });
    }
}
