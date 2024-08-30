import express from "express";
import {router} from "../router";
import request from "supertest";
import {prisma} from "../prisma";
import {Account} from "@prisma/client";

const app = express();
app.use(express.json());
app.use('/api', router);

describe('security', () => {
    test('e2e', async () => {

        // get security-account
        const root = (await prisma.account.findUnique({
            where: {
                id: 1
            },
        })) as Account;
        expect(root).toBeDefined();

        // get token by credentials
        const response = await request(app)
            .post('/api/security')
            .send({
                username: 'root',
                password: 'root',
            })
            .expect('Content-Type', /json/)
            .expect(200);
        expect(response.body.token).toBeDefined();
        expect(response.body.account.id).toBe(1);
        const token = response.body.token;
        const headers = {'Authorization': `Bearer ${token}`}

        // get security-account by token
        const response2 = await request(app)
            .get('/api/security')
            .set(headers)
            .expect('Content-Type', /json/)
            .expect(200)
        expect(response2.body).toBeDefined();
        expect(response2.body.id).toBe(1);

    });

});
