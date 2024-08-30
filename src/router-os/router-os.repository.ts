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
        logger.debug(className + '.getVpnAccountById');

        return api.write('/ppp/secret/print', [`?.id=${id}`]);
    }

    findMany = async (
        api: RouterOSAPI
    ): Promise<IRosGenericResponse> => {
        logger.debug(className + '.getVpnAccounts');

        return api.write('/ppp/secret/print');
    }

}
