import request from 'supertest';
import app from './backend.js';

// Mock user data for testing registration and login
const testUser = {
    username: 'testuser',
    password: 'testpassword',
    email: 'testuser@example.com',
};

describe('Backend Tests', () => {
    // Test registration endpoint
    describe('POST /register', () => {
        it('should register a new user', async () => {
            const response = await request(app)
                .post('/register')
                .send(testUser);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('User registered successfully');
            expect(response.body).toHaveProperty('token');
        });

        it('should return an error if the email is already registered', async () => {
            const response = await request(app)
                .post('/register')
                .send(testUser);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Email is already registered. Please Login');
        });
    });

    // Test login endpoint
    describe('POST /login', () => {
        it('should log in an existing user', async () => {
            const response = await request(app)
                .post('/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Login successful');
            expect(response.body).toHaveProperty('token');
        });

        it('should return an error for incorrect password', async () => {
            const response = await request(app)
                .post('/login')
                .send({
                    email: testUser.email,
                    password: 'incorrectpassword',
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Incorrect password.');
        });

        it('should return an error for a non-existing user', async () => {
            const response = await request(app)
                .post('/login')
                .send({
                    email: 'nonexistentuser@example.com',
                    password: 'somepassword',
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('User not found, please sign up.');
        });
    });
});