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

import express, {Express} from 'express';
import cors from 'cors';
import {logger} from "./logger";
import {router} from "./router";
import * as dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import {startup} from "./startup";

dotenv.config();

const app: Express = express();
app.use(cors());
app.use(express.json({ limit: '10gb' }));
app.use(express.urlencoded({ limit: '10gb', extended: true }));
app.use('/api', router);

const version = '24.22.0';

const PORT: string | 3000 = process.env.PORT || 3000;

const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, async () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Version: ${version}`)

    await startup();
});
