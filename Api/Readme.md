# Set your jwt secret
In a .env at the root of the project you have to set this variable:
```
JWT_SECRET = you_jwt_secret
DEFAULT_ADMIN_PASSWORD=adminpassword
CLIENT_ID=client_id
CLIENT_SECRET=client_secret
```
## First start 
```bash
sudo docker build -t express-api .
sudo docker compose up --build -d
```
# Now you can acceed to the swagger api
http://localhost:8080/api-docs