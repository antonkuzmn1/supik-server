import {logger} from "../logger";
import {RouterOSAPI} from "node-routeros";
import {IRosGenericResponse} from "node-routeros/dist/IRosGenericResponse";

const className = 'RouterOsRepository';

const port = 8728;
const timeout = 30000;

export class RouterOsRepository {
    constructor() {
        logger.debug(className);
    }

    getVpnAccounts = async (
        api: RouterOSAPI
    ): Promise<IRosGenericResponse> => {
        logger.debug(className + '.getVpnAccounts');

        return api.write('/ppp/secret/print');
    }

    getVpnAccountById = async (
        api: RouterOSAPI,
        id: string
    ): Promise<IRosGenericResponse> => {
        logger.debug(className + '.getVpnAccountById');

        return api.write('/ppp/secret/print', [`?.id=${id}`]);
    }

    getApi = (
        host: string,
        user: string,
        password: string,
    ): RouterOSAPI => {
        logger.debug(className + '.getApi');

        return new RouterOSAPI({
            host,
            user,
            password,
            port,
            timeout,
        });
    }

}
