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

import {logger} from "../logger";
import {RouterOSAPI} from "node-routeros";
import {IRosGenericResponse} from "node-routeros/dist/IRosGenericResponse";

const className = 'RouterOsRepository';

export class RouterOsRepository {
    constructor() {
        logger.debug(className);
    }

    findUnique = async (
        api: RouterOSAPI,
        id: string
    ): Promise<IRosGenericResponse> => {
        logger.debug(className + '.findUnique');

        return api.write('/ppp/secret/print', [`?.id=${id}`]);
    }

    findMany = async (
        api: RouterOSAPI
    ): Promise<IRosGenericResponse> => {
        logger.debug(className + '.findMany');

        return api.write('/ppp/secret/print');
    }

    create = async (
        api: RouterOSAPI,
        name: string,
        password: string,
        profile: string,
        remoteAddress: string,
        service: string = 'any',
        disabled: string = 'no',
    ): Promise<IRosGenericResponse> => {
        logger.debug(className + '.create');

        return api.write('/ppp/secret/add', [
            `=name=${name}`,
            `=password=${password}`,
            `=profile=${profile}`,
            `=remote-address=${remoteAddress}`,
            `=service=${service}`,
            `=disabled=${disabled}`,
        ]);
    }

    update = async (
        api: RouterOSAPI,
        id: string,
        name?: string,
        password?: string,
        profile?: string,
        remoteAddress?: string,
        service?: string,
        disabled?: string
    ): Promise<IRosGenericResponse> => {
        logger.debug(className + '.update');

        const params: string[] = [`=.id=${id}`];

        if (name !== undefined) params.push(`=name=${name}`);
        if (password !== undefined) params.push(`=password=${password}`);
        if (profile !== undefined) params.push(`=profile=${profile}`);
        if (remoteAddress !== undefined) params.push(`=remote-address=${remoteAddress}`);
        if (service !== undefined) params.push(`=service=${service}`);
        if (disabled !== undefined) params.push(`=disabled=${disabled}`);

        return api.write('/ppp/secret/set', params);
    }

    delete = async (
        api: RouterOSAPI,
        id: string,
    ): Promise<IRosGenericResponse> => {
        logger.debug(className + '.delete');

        return api.write('/ppp/secret/remove', [`=.id=${id}`]);
    }

    findProfiles = async (
        api: RouterOSAPI
    ): Promise<IRosGenericResponse> => {
        logger.debug(className + '.findProfiles');

        return api.write('/ppp/profile/print');
    }

}
