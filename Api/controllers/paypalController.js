const axios = require('axios');
const { calculateTotalAmount, createInvoiceLogic, updateInvoiceLogic, populateInvoiceWithProducts } = require('./invoiceController');

const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET

async function getAccessToken() {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await axios.post('https://api-m.sandbox.paypal.com/v1/oauth2/token', 'grant_type=client_credentials', {
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    return response.data.access_token;
}

// Function to generate a unique reference_id
function generateReferenceId(userId) {
    const date = new Date();
    const timestamp = date.getTime(); // Number of milliseconds since January 1, 1970
    return `${userId}-${timestamp}`;
}


/**
 * @swagger
 * components:
 *   schemas:
 *     PayPalOrder:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The ID of the PayPal order
 *         status:
 *           type: string
 *           description: The status of the PayPal order
 *         purchase_units:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               amount:
 *                 type: object
 *                 properties:
 *                   currency_code:
 *                     type: string
 *                     description: The currency code of the amount
 *                   value:
 *                     type: string
 *                     description: The value of the amount
 *         links:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               href:
 *                 type: string
 *                 description: The URL of the link
 *               rel:
 *                 type: string
 *                 description: The relation type of the link
 *               method:
 *                 type: string
 *                 description: The HTTP method for the link
 *       required:
 *         - id
 *         - status
 *         - purchase_units
 *         - links
 *
 *     OrderStatus:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The ID of the order
 *         status:
 *           type: string
 *           description: The status of the order
 *         purchase_units:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               amount:
 *                 type: object
 *                 properties:
 *                   currency_code:
 *                     type: string
 *                     description: The currency code of the amount
 *                   value:
 *                     type: string
 *                     description: The value of the amount
 *         links:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               href:
 *                 type: string
 *                 description: The URL of the link
 *               rel:
 *                 type: string
 *                 description: The relation type of the link
 *               method:
 *                 type: string
 *                 description: The HTTP method for the link
 *       required:
 *         - id
 *         - status
 *         - purchase_units
 *         - links
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// Function to get the status of a PayPal order
/**
 * @swagger
 * /get-order-status/{orderId}:
 *   get:
 *     summary: Get the status of a PayPal order
 *     tags: [PayPal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the PayPal order
 *     responses:
 *       200:
 *         description: Successfully fetched the order status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderStatus'
 *       400:
 *         description: Invalid order ID
 *       401:
 *         description: Unauthorized, missing or invalid JWT token
 *       500:
 *         description: Internal server error
 */
async function getOrderStatus(req, res) {
    const { orderId } = req.params;

    try {
        const accessToken = await getAccessToken();
        const response = await axios.get(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        // 
        // Return the order status in the response
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching order status:', error);
        res.status(500).json({ error: 'Failed to fetch order status' });
    }
}
// Function to create a new PayPal order
/**
 * @swagger
 * /create-paypal-order:
 *   post:
 *     summary: Create a new PayPal order
 *     tags: [PayPal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               barCodes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: The bar code of the product
 *     responses:
 *       200:
 *         description: Successfully created a PayPal order
 *         content:
 *           application/json:
 *             schema:
 *               \$ref: '#/components/schemas/PayPalOrder'
 *       400:
 *         description: Bad request, missing barCodes parameter
 *       401:
 *         description: Unauthorized, missing or invalid JWT token
 *       500:
 *         description: Internal server error
 */
async function createPaypalOrder(req, res) {
    try {
        const { barCodes } = req.body;
        if (!barCodes || barCodes.length === 0) {
            return res.status(400).json({ error: 'The "barCodes" parameter is required.' });
        }
        
        const totalAmount = await calculateTotalAmount(barCodes);
        const accessToken = await getAccessToken();
        const referenceId = generateReferenceId(req.user.id);

        const response = await axios.post('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'EUR',
                    value: totalAmount.toFixed(2)
                },
                reference_id: referenceId,
            }],
            payment_source: {
                paypal: {
                    experience_context: {
                        payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
                        payment_method_selected: 'PAYPAL',
                        brand_name: 'Levrette',
                        locale: 'fr-FR',
                        landing_page: 'LOGIN',
                        shipping_preference: 'GET_FROM_FILE',
                        user_action: 'PAY_NOW',
                        return_url: 'mobilescanner://paypal-success',
                        cancel_url: 'mobilescanner://paypal-success'
                    }
                }
            }
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        

        // Create the invoice using the response.data.id
        await createInvoiceLogic(req, { barCodes, totalAmount, id: response.data.id });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Function to capture a PayPal payment
/**
 * @swagger
 * /capture-payment/{orderId}:
 *   post:
 *     summary: Capture a PayPal payment
 *     tags: [PayPal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the PayPal order to capture
 *     responses:
 *       200:
 *         description: Successfully captured the payment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CapturePaymentResponse'
 *       400:
 *         description: Invalid order ID
 *       401:
 *         description: Unauthorized, missing or invalid JWT token
 *       500:
 *         description: Internal server error
 */
async function capturePayment(req, res) {
    const { orderId } = req.params;

    try {
        const accessToken = await getAccessToken();
        const response = await axios.post(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {}, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(response.data.status);
        
        // Update the invoice status based on the response status
        const invoice = await updateInvoiceLogic({ id: orderId, status: response.data.status });

        res.json({...response.data, invoice: await populateInvoiceWithProducts(invoice)});
    } catch (error) {
        console.error('Error capturing payment:', error);
        res.status(500).json({ error: 'Failed to capture payment' });
    }
}


module.exports = {
    createPaypalOrder, getAccessToken, generateReferenceId,getOrderStatus, capturePayment
}