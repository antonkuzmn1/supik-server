import express from "express";
import {router} from "../../router";
import request from "supertest";
import {prisma} from "../../prisma";
import {Account, Group} from "@prisma/client";
import {RouterExtended} from "../db-router/db-router.repository";

const app = express();
app.use(express.json());
app.use('/api', router);

const random: number = Math.floor(Math.random() * 100 * 100 * 100 * 100);

describe('db-router-group-editor', () => {
    test('e2e', async () => {

        // get account
        const root = (await prisma.account.findUnique({
            where: {
                id: 1
            },
        })) as Account;
        expect(root).toBeDefined();

        // get token by credentials
        const responseWithToken = await request(app)
            .post('/api/security')
            .send({
                username: 'root',
                password: 'root',
            })
            .expect('Content-Type', /json/)
            .expect(200);
        expect(responseWithToken.body.token).toBeDefined();
        expect(responseWithToken.body.account.id).toBe(1);
        const token = responseWithToken.body.token;
        const headers = {'Authorization': `Bearer ${token}`}

        // create test entity router
        const responseWithAccount = await request(app)
            .post('/api/db/router')
            .set(headers)
            .send({
                login: random.toString(),
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(responseWithAccount.body.login).toBe(random.toString());
        const router: RouterExtended = responseWithAccount.body;

        // create test entity group
        const responseWithGroup = await request(app)
            .post('/api/security/group')
            .set(headers)
            .send({
                name: random.toString(),
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(responseWithGroup.body.name).toBe(random.toString());
        const group: Group = responseWithGroup.body;

        // create new m2m relation
        const responseWithRelation = await request(app)
            .post('/api/db/router-group-editor')
            .set(headers)
            .send({
                routerId: router.id,
                groupId: group.id,
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(responseWithRelation.body.routerId).toBe(router.id);

        // delete m2m relation
        await request(app)
            .delete('/api/db/router-group-editor')
            .set(headers)
            .send({
                routerId: router.id,
                groupId: group.id,
            })
            .expect('Content-Type', /json/)
            .expect(200)

        // delete test entity security-account
        const responseWithDeletedRouter = await request(app)
            .delete('/api/db/router')
            .set(headers)
            .send({
                id: router.id,
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(responseWithDeletedRouter.body.deleted).toBe(1);

        // delete test entity security-group
        const responseWithDeletedGroup = await request(app)
            .delete('/api/security/group')
            .set(headers)
            .send({
                id: group.id,
            })
            .expect('Content-Type', /json/)
            .expect(200)
        expect(responseWithDeletedGroup.body.deleted).toBe(1);
    });

});
