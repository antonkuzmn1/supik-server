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
import {Request, Response} from "express";
import {DbRouterGroupEditorRepository} from "./db-router-group-editor.repository";

const className = 'DbRouterGroupEditorService';

export class DbRouterGroupEditorService {

    constructor(
        private readonly repository: DbRouterGroupEditorRepository,
    ) {
        logger.debug(className);
    }


    post = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.post');
        try {
            return this.create(req, res);
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    delete = async(req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.delete');
        try {
            return this.trueDelete(req, res);
        } catch (error) {
            console.error(error);
            logger.error('Internal Server Error');
            return res.status(500).send('Internal Server Error');
        }
    }

    private create = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.create');
        const response = await this.repository.create(req.body.routerId, req.body.groupId);
        return res.status(200).json(response);
    }

    private trueDelete = async (req: Request, res: Response): Promise<Response> => {
        logger.debug(className + '.trueDelete');
        const response = await this.repository.delete(req.body.routerId, req.body.groupId);
        return res.status(200).json(response);
    }
}
