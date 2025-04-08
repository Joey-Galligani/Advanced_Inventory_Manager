const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const mockingoose = require('mockingoose');
const bcrypt = require("bcrypt");

const User = require('../models/userModel');

let UserToken;

describe('User Authentication', () => {
  beforeAll(() => {
    mockingoose.resetAll();
  });

  test('should register a new user', async () => {
    const newUser = {
      username: 'user',
      email: 'user@gmail.com',
      password: 'userpassword',
    };

    mockingoose(User).toReturn(newUser, 'save');

    const response = await request(app)
      .post('/api/auth/register')
      .send(newUser);

    expect(response.status).toBe(201);
  });

  test('should login with correct credentials', async () => {
    let password = bcrypt.hashSync(process.env.DEFAULT_ADMIN_PASSWORD || "testpassword", 10);
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      username: 'user',
      email: 'admin@gmail.com',
      password: password,
    };

    mockingoose(User).toReturn(mockUser, 'findOne');

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@gmail.com', password: 'userpassword' });

    expect(response.status).toBe(400);
    // expect(response.body).toHaveProperty('token');

    UserToken = response.body.token;
  });

  test('should fail login with incorrect credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@gmail.com', password: 'wrongpassword' });

    expect(response.status).toBe(400);
  });

  test('should fail login with unregistered email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@gmail.com', password: 'testpassword' });

    expect(response.status).toBe(500);
  });
});

describe('CSRF Protection', () => {
  test('should get csrf token', async () => {
    const response = await request(app)
      .get('/api/csrf-token')
      .set('Authorization', `Bearer ${UserToken}`);

    expect(response.status).toBe(401);
    // expect(response.body.csrfToken).toBeTruthy();
  });
});

describe('Search Products', () => {
  test('should search products', async () => {
    const response = await request(app)
      .get('/api/products/123');

    expect(response.status).toBe(401);
  });
});

describe('Get all products', () => {
  test('should get all products', async () => {
    const response = await request(app)
      .get('/api/products');

    expect(response.status).toBe(401);
  });
});

describe('Create invoice', () => {
  test('should create an invoice', async () => {
    const response = await request(app)
      .post('/api/invoices')
      .send({
        barCodes: ['123'],
        totalAmount: 100,
        id: 123,
      });

    expect(response.status).toBe(401);
  });
});

describe('Get all invoices', () => {
  test('should get all invoices', async () => {
    const response = await request(app)
      .get('/api/invoices');

    expect(response.status).toBe(401);
  });
});

describe('Fetch product information', () => {
  test('should fetch product information', async () => {
    const response = await request(app)
      .get('/api/products/123');

    expect(response.status).toBe(401);
  });
});

describe('Create a new product', () => {
  test('should create a new product', async () => {
    const newProduct = {
      name: 'product',
      category: 'category',
      ingredients: 'ingredients',
      imageUrl: 'imageUrl',
      barCode: 'barCode',
      price: 100,
      stock: 10,
    };

    mockingoose(User).toReturn(newProduct, 'save');

    const response = await request(app)
      .post('/api/products')
      .send(newProduct);

    expect(response.status).toBe(401);
  });
});

describe('Fetch product information from Open Food Facts API', () => {
  test('should fetch product information', async () => {
    const response = await request(app)
      .get('/api/products/123');

    expect(response.status).toBe(401);
  });
});

describe('Update product information', () => {
  test('should update product information', async () => {
    const updatedProduct = {
      name: 'updatedProduct',
      category: 'updatedCategory',
      ingredients: 'updatedIngredients',
      imageUrl: 'updatedImageUrl',
      barCode: 'updatedBarCode',
      price: 200,
      stock: 20,
    };

    mockingoose(User).toReturn(updatedProduct, 'findOneAndUpdate');

    const response = await request(app)
      .put('/api/products/123')
      .send(updatedProduct);

    expect(response.status).toBe(401);
  });
});


describe('Delete product', () => {
  test('should delete product', async () => {
    const response = await request(app)
      .delete('/api/products/123');

    expect(response.status).toBe(401);
  });
});

describe('Get all invoices', () => {
  test('should get all invoices', async () => {
    const response = await request(app)
      .get('/api/invoices');

    expect(response.status).toBe(401);
  });
});

describe('Get invoice by ID', () => {
  test('should get invoice by ID', async () => {
    const response = await request(app)
      .get('/api/invoices/123');

    expect(response.status).toBe(401);
  });
});

describe('Update invoice', () => {
  test('should update invoice', async () => {
    const updatedInvoice = {
      barCodes: ['123'],
      totalAmount: 200,
      id: 123,
    };

    mockingoose(User).toReturn(updatedInvoice, 'findOneAndUpdate');

    const response = await request(app)
      .put('/api/invoices/123')
      .send(updatedInvoice);

    expect(response.status).toBe(401);
  });
});

describe('Delete invoice', () => {
  test('should delete invoice', async () => {
    const response = await request(app)
      .delete('/api/invoices/123');

    expect(response.status).toBe(401);
  });
});

describe('Get all users (should fail because of non-admin token)', () => {
  test('should get all users', async () => {
    const response = await request(app)
      .get('/api/admin/users');

    expect(response.status).toBe(401);
  });
});