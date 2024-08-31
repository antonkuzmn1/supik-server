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
