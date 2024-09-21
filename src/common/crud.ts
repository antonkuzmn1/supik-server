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
import {CrudInterface} from "./crud.interface";
import {Request, Response} from "express";
import {errorHandler} from "./errorHandler";

export abstract class Crud implements CrudInterface {
    protected className: string = '';

    protected constructor() {
        this.className = this.constructor.name;
        logger.debug(this.className);
    }

    get = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(this.className + '.get');
        try {
            if (req.query.id) {
                return this.findUnique(req, res);
            } else {
                return this.findMany(req, res);
            }
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

    post = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(this.className + '.post');
        try {
            return this.create(req, res);
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

    put = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(this.className + '.put');
        try {
            return this.update(req, res);
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

    delete = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(this.className + '.delete');
        try {
            return this.softDelete(req, res);
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

    protected findUnique = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(this.className + '.findUnique');
        try {
            return res.status(200).json();
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

    protected findMany = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(this.className + '.findMany');
        try {
            return res.status(200).json();
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

    protected create = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(this.className + '.create');
        try {
            return res.status(200).json();
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

    protected update = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(this.className + '.update');
        try {
            return res.status(200).json();
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

    protected softDelete = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(this.className + '.softDelete');
        try {
            return res.status(200).json();
        } catch (error: unknown) {
            return errorHandler(error, res);
        }
    }

}
