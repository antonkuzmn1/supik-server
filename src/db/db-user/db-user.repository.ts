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
                department: true,
            },
        });
    }

    findMany = async (where: any): Promise<any> => {
        logger.debug(className + '.findMany');
        return prisma.user.findMany({
            where,
            include: {
                vpns: true,
                department: true,
            },
        });
    }

    create = async (data: {
        name: string,
        surname: string,
        patronymic: string,
        fullname: string,
        title: string,
        login: string,
        password: string,
        disabled: 0 | 1,
        departmentId: number,
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
        title: string,
        login: string,
        password: string,
        disabled: 0 | 1,
        departmentId: number,
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
        return prisma.user.update({
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
