<div align="center">
    <img
      src="https://github.com/user-attachments/assets/b5d64eaf-c8c3-4c63-ab9d-625221f06fa4"
      alt="Hoppscotch"
      height="64"
    />
</div>

# beresin-express-backend-app

## Backend of BeresIn

This is an [Express.js](https://expressjs.com) project, written in [TypeScript](https://www.typescriptlang.org), with a [PostgreSQL](https://www.postgresql.org) database using [Knex.js](https://knexjs.org) for query building.

The project provides a backend for the BeresIn platform, featuring user authentication, admin and user services management, and category CRUD operations, with a focus on secure data handling and a well-structured API.
## Authors

- [@beresindev](https://github.com/beresindev)
- [@teamberesin](https://github.com/teamberesin)

### Meet Beresin Team

**Product Owner:**
- [Muhammad Farhan Mustafa](github.com/farhanmustafa15)

**UI/UX Design:**
- Danny Kurniawan
- Azmi Nadhia Asyarifa

**Fullstack Website:**
- [Muhammad Daniel Krisna Halim Putra](https://github.com/bforbilly24)

**Frontend Mobile:**
- [Adam Ghazy Al Falah](https://github.com/Adam-Ghazy)
- [Habibi Daffa Filzana Nurus Syahada](https://github.com/habibidaffaa)

## Tech Stack

- **Programming Language / Superset:** [Typescript](https://www.typescriptlang.org)
- **Runtime Environment:** [Node.js](https://nodejs.org)
- **Framework:** [Express](https://expressjs.com)
- **Query Builder:** [Knex](https://knexjs.org)
- **RDBMS:** [PostgreSQL](https://www.postgresql.org)
- **Authentication / Authorization:** [JWT](https://jwt.io/) 

### Installation Guide for `beresindev-beresin-express-backend-app`

#### **Step 1: Clone the Project**

```bash
# Clone the repository from GitHub
git clone https://github.com/beresindev/beresindev-beresin-express-backend-app.git

# Change into the project directory
cd beresindev-beresin-express-backend-app
```

---

#### **Step 2: Install Dependencies**

```bash
# Install all required npm packages
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

---

#### **Step 3: Configure Environment Variables**

1. Copy the example environment file to create a local environment file:
    ```bash
    cp .env.local.example .env.local
    ```

2. Update the `.env.local` file with your specific configuration:

```env
DB_NAME=TOBEMODIFIED
DB_HOST=TOBEMODIFIED
DB_PORT=TOBEMODIFIED
DB_USER=TOBEMODIFIED
DB_PASSWORD=TOBEMODIFIED
PORT=TOBEMODIFIED

JWT_SECRET=TOBEMODIFIED
```

---

#### **Step 4: Knex Migrations**

**Rollback Migrations** (Optional if you need to reset):

```bash
npx knex migrate:rollback --specific 20241101145250_create_category_services_table.ts
npx knex migrate:rollback --specific 20241101145251_create_service_table.ts
```

**Run Migrations**:

```bash
npx knex migrate:up 20241101074044_create_users_table.ts --knexfile knexfile.ts
npx knex migrate:up 20241101145250_create_category_services_table.ts --knexfile knexfile.ts
npx knex migrate:up 20241101145223_create_service_table.ts --knexfile knexfile.ts
npx knex migrate:up 20241101145304_create_sub_category_table.ts --knexfile knexfile.ts
```

---

#### **Step 5: Seed Database**

```bash
# Populate the database with an admin user
npx knex seed:run --specific=create_admin_user.ts
```

---

#### **Step 6: Start the Application**

```bash
# Start the Express server
npm start
# Access the API at http://localhost:3000
```

---

This guide provides full setup instructions for the backend application using **Express**, **JWT** for authentication, **Knex** for database migrations, and **PostgreSQL** as the database. Ensure **PostgreSQL** is configured and running.
## Deployment

To deploy this project run

### 1. Copy .env.example into .env
```bash
cp .env.example .env
```
### 2. Generate JWT_SECRET
```bash
openssl rand -base64 32
```

*Output must be like this:*
**3y9KcY0Dl1KzT9frFyM7hO0NBWwO3F5yPiB3uF9xUho=**

### 3. Update src/index.ts for production
```bash
import dotenv from 'dotenv';
import app from './app';

dotenv.config({ path: '.env' });

const PORT = parseInt(process.env.PORT || '3000', 10); // Konversi PORT ke number
const HOST = '0.0.0.0'; // Dengarkan di semua alamat IP agar dapat diakses secara publik

app.listen(PORT, HOST, () => {
	console.log(`Server running on http://${HOST}:${PORT}`);
});
```

### 4. add in package.json
```bash
"scripts": {
    "start": "node dist/index.js"
}
```
### 5. Rename Configuration ecosystem.config.js.example into ecosystem.config.js

The ecosystem.config.js file is used with PM2 (a process manager for Node.js applications) to manage and automate various aspects of running your application in production. Then fill as needed.
```bash
module.exports = {
  apps: [
    {
      name: "beresin-express-backend-app",
      script: "dist/index.js",
      env: {
        DB_HOST: "TOBEMODIFIED",
        DB_USER: "TOBEMODIFIED",
        DB_PASSWORD: "TOBEMODIFIED",
        DB_NAME: "TOBEMODIFIED",
        DB_PORT: TOBEMODIFIED,
        PORT: TOBEMODIFIED,
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
};
```

### 6. Install dependencies for production

To run Node.js applications (including compiled TypeScript applications) on a VPS continuously, you can use PM2, which is designed to run Node.js applications in production mode, keeping them running even after a server crash or restart. Here are the complete steps:

### 7. Install PM2
```bash
npm install -g pm2
```

### 8. Compile the application to JavaScript first:
```bash
npx tsc
```

### 9. using TypeScript and the entry point file is directly in src/index.js, run:
```bash
pm2 start dist/index.js --name "my-app"
```

### 10. To ensure the application continues running after a VPS restart, enable the PM2 startup feature:
```bash
pm2 startup
```

## API Reference

### 0. Miscellaneous

#### **Endpoint: GET /profile**

| Parameter | Type     | Description               |
| --------- | -------- | ------------------------- |
| None      | -        | No parameters required    |

Health check to verify database connection, size, latency, and errors.

#### **Example Response**:
```json
{
  "status": "success",
  "message": "Database connected successfully",
  "database": {
    "ready": true,
    "size": "9329 kB",
    "latency": "31 ms"
  }
}
```

### 1. Authentication

#### **Endpoint: POST /v1/auth/login**

| Parameter      | Type     | Description                    |
| -------------- | -------- | ------------------------------ |
| `email`        | `string` | **Required**. User's email     |
| `password`     | `string` | **Required**. User's password  |

#### **Example Request Body**:
```json
{
  "email": "firstadmin@mail.com",
  "password": "Admin123,"
}
```

#### **Example Response**:
```json
{
  "status": "success",
  "message": "Login successful",
  "token": "your_jwt_token",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "firstadmin@mail.com",
    "role": "admin"
  }
}
```

---

#### **Endpoint: POST /v1/auth/register**

| Parameter        | Type     | Description                    |
| ---------------- | -------- | ------------------------------ |
| `username`       | `string` | **Required**. User's username  |
| `name`           | `string` | **Required**. User's full name |
| `email`          | `string` | **Required**. User's email     |
| `phone`          | `string` | **Required**. User's phone     |
| `password`       | `string` | **Required**. User's password  |

#### **Example Request Body**:
```json
{
  "username": "testuser2",
  "name": "Test User 2",
  "email": "testuser2@example.com",
  "phone": "123456789",
  "password": "testpassword"
}
```

#### **Example Response**:
```json
{
  "status": "success",
  "message": "User registered successfully",
  "token": "your_jwt_token",
  "user": {
    "id": 3,
    "username": "testuser2",
    "name": "Test User 2",
    "email": "testuser2@example.com",
    "phone": "123456789",
    "role": "User",
    "created_at": "2024-11-02T18:49:15.231Z",
    "updated_at": "2024-11-02T18:49:15.231Z"
  }
}
```

### 2. Admin

#### **Endpoint: GET /v1/admin/services**

Displays all services regardless of status (`accept`, `pending`, `decline`).

| Parameter  | Type     | Description                   |
| ---------- | -------- | ----------------------------- |
| `api_key`  | `string` | **Required**. Admin API key   |

#### **Example Response**:
```json
{
  "status": "success",
  "services": [
    {
      "id": 1,
      "created_at": "2024-11-01T18:36:42.777Z",
      "updated_at": "2024-11-01T18:36:42.777Z",
      "user_id": 2,
      "isSubscription": true,
      "name_of_service": "Jasa Design",
      "category_id": 1,
      "description": "Jasa design web dan aplikasi",
      "status": "decline"
    },
    {
      "id": 2,
      "created_at": "2024-11-02T19:19:18.752Z",
      "updated_at": "2024-11-02T19:19:18.752Z",
      "user_id": 3,
      "isSubscription": true,
      "name_of_service": "Jasa Laundry",
      "category_id": 2,
      "description": "Laundry Baju, Kemeja kecuali CD",
      "status": "pending"
    }
  ]
}
```

---

#### **Endpoint: PATCH /v1/admin/services/:id/status**

| Parameter    | Type     | Description                          |
| ------------ | -------- | ------------------------------------ |
| `api_key`    | `string` | **Required**. Admin API key          |
| `status`     | `string` | **Required**. Status: accept, decline, or pending |

#### **Example Request Body**:
```json
{
  "status": "accept"
}
```

#### **Example Response**:
```json
{
  "status": "success",
  "service": {
    "id": 1,
    "created_at": "2024-11-01T18:36:42.777Z",
    "updated_at": "2024-11-01T18:36:42.777Z",
    "user_id": 2,
    "isSubscription": true,
    "name_of_service": "Jasa Design",
    "category_id": 1,
    "description": "Jasa design web dan aplikasi",
    "status": "accept"
  }
}
```

---

#### **Endpoint: DELETE /v1/admin/services/:id**

| Parameter  | Type     | Description                   |
| ---------- | -------- | ----------------------------- |
| `api_key`  | `string` | **Required**. Admin API key   |

#### **Example Response**:
```json
{
  "status": "success",
  "message": "Service deleted successfully"
}
```

---

#### **Endpoint: GET /v1/admin/category**

| Parameter  | Type     | Description                   |
| ---------- | -------- | ----------------------------- |
| `api_key`  | `string` | **Required**. Admin API key   |

#### **Example Response**:
```json
{
  "status": "success",
  "category": [
    {
      "id": 1,
      "name_of_category": "Technology"
    },
    {
      "id": 2,
      "name_of_category": "Household"
    },
    {
      "id": 3,
      "name_of_category": "Uncategories"
    }
  ]
}
```

---

#### **Endpoint: POST /v1/admin/category**

| Parameter            | Type     | Description                        |
| -------------------- | -------- | ---------------------------------- |
| `api_key`            | `string` | **Required**. Admin API key        |
| `name_of_category`   | `string` | **Required**. Category name        |

#### **Example Request Body**:
```json
{
  "name_of_category": "Technology"
}
```

#### **Example Response**:
```json
{
  "status": "success",
  "category": {
    "id": 1,
    "name_of_category": "Technology"
  }
}
```

---

#### **Endpoint: PUT /v1/admin/category/:id**

| Parameter            | Type     | Description                        |
| -------------------- | -------- | ---------------------------------- |
| `api_key`            | `string` | **Required**. Admin API key        |
| `name_of_category`   | `string` | **Required**. New category name    |

#### **Example Request Body**:
```json
{
  "name_of_category": "Uncategories"
}
```

#### **Example Response**:
```json
{
  "status": "success",
  "category": {
    "id": 3,
    "name_of_category": "Uncategories"
  }
}
```

---

#### **Endpoint: DELETE /v1/admin/category/:id**

| Parameter  | Type     | Description                   |
| ---------- | -------- | ----------------------------- |
| `api_key`  | `string` | **Required**. Admin API key   |

#### **Example Response**:
```json
{
  "status": "success",
  "message": "Category deleted successfully"
}
```

### 3. User

### **Endpoint: GET /v1/user/profile**

| Parameter  | Type     | Description                   |
| ---------- | -------- | ----------------------------- |
| `api_key`  | `string` | **Required**. User API key   |

Retrieves the profile information of the authenticated user.

#### **Example Response**:
```json
{
  "status": "success",
  "message": "User profile retrieved successfully",
  "user": {
    "id": 2,
    "username": "testuser",
    "name": "Test User",
    "email": "testuser@example.com",
    "phone": "1234567890",
    "role": "User",
    "created_at": "2024-11-01T17:51:43.312Z",
    "updated_at": "2024-11-01T17:51:43.312Z"
  }
}
```

#### **Endpoint: GET /v1/user/services**

| Parameter  | Type     | Description                   |
| ---------- | -------- | ----------------------------- |
| `api_key`  | `string` | **Required**. User API key   |

Returns all services belonging to the authenticated user, unique to each user.

#### **Example Response**:
```json
{
  "status": "success",
  "services": [
    {
      "id": 1,
      "created_at": "2024-11-01T18:36:42.777Z",
      "updated_at": "2024-11-01T18:36:42.777Z",
      "user_id": 2,
      "isSubscription": true,
      "name_of_service": "Jasa Design",
      "category_id": 1,
      "description": "Jasa design web dan aplikasi",
      "status": "accept",
      "images": [
        "services/uploads/images/1730568201772-WhatsApp Image 2024-11-02 at 17.58.44.jpeg",
        "services/uploads/images/1730568201773-ttd-halim.png"
      ]
    }
  ]
}
```

---

#### **Endpoint: POST /v1/user/services**

| Parameter            | Type     | Description                        |
| -------------------- | -------- | ---------------------------------- |
| `api_key`            | `string` | **Required**. User API key         |
| `name_of_service`    | `string` | **Required**. Name of the service  |
| `category_id`        | `integer`| **Required**. ID of the category   |
| `description`        | `string` | **Required**. Description of service |
| `images`     | `String`| **Required**. Images of service  |

**Note**: This endpoint requires `multipart/form-data` for file upload. The `images` field accepts up to 2 image files.

**Example Request Body**:
```json
{
  "name_of_service": " Jasa Mengajar Next.js",
  "category_id": 3,
  "description": "Mengajar Coding dari Javascript dasar, Typescript, hingga React.Js",
  "images": Background.png, BeresIn Flow.png
}
```

#### **Example Response**:
```json
{
  "status": "success",
  "service": {
    "id": 11,
    "created_at": "2024-11-04T09:44:53.352Z",
    "updated_at": "2024-11-04T09:44:53.352Z",
    "user_id": 2,
    "isSubscription": false,
    "name_of_service": "Jasa Mengajar Next.js",
    "category_id": 3,
    "description": "Mengajar Coding dari Javascript dasar, Typescript, hingga React.Js",
    "status": "pending"
  },
  "images": [
    {
      "id": 13,
      "image": "services/uploads/images/1730713493349-Background.png",
      "service_id": 11
    },
    {
      "id": 14,
      "image": "services/uploads/images/1730713493349-BeresIn Flow.drawio.png",
      "service_id": 11
    }
  ]
}
```

---

#### **Endpoint: PUT /v1/user/services/:id**

| Parameter            | Type     | Description                        |
| -------------------- | -------- | ---------------------------------- |
| `api_key`            | `string` | **Required**. User API key         |
| `name_of_service`    | `string` | **Required**. Name of the service  |
| `category_id`        | `integer`| **Required**. ID of the category   |
| `description`        | `string` | **Required**. Description of service |

#### **Example Request Body**:
```json
{
  "name_of_service": "Jasa Perbaikan",
  "category_id": 1,
  "description": "Perbaikan Laptop, Hp, dan Komputer",
}
```

#### **Example Response**:
```json
{
  "status": "success",
  "service": {
    "id": 2,
    "created_at": "2024-11-02T19:19:18.752Z",
    "updated_at": "2024-11-02T19:19:18.752Z",
    "user_id": 3,
    "isSubscription": true,
    "name_of_service": "Jasa Perbaikan",
    "category_id": 1,
    "description": "Perbaikan Laptop, Hp, dan Komputer",
    "status": "accept"
  }
}
```

---

#### **Endpoint: DELETE /user/services/:id**

| Parameter  | Type     | Description                   |
| ---------- | -------- | ----------------------------- |
| `api_key`  | `string` | **Required**. User API key    |

#### **Example Response**:
```json
{
  "status": "success",
  "message": "Service deleted successfully"
}
```

---

#### **Endpoint: GET /user/category**

| Parameter  | Type     | Description                   |
| ---------- | -------- | ----------------------------- |
| `api_key`  | `string` | **Required**. User API key    |

#### **Example Response**:
```json
{
  "status": "success",
  "category": [
    {
      "id": 1,
      "name_of_category": "Technology"
    },
    {
      "id": 2,
      "name_of_category": "Household"
    },
    {
      "id": 3,
      "name_of_category": "Uncategories"
    }
  ]
}
```

---

### 4. Public

#### **Endpoint: GET /services/all**

Only services with `status: accept` are displayed.

| Parameter | Type     | Description               |
| --------- | -------- | ------------------------- |
| None      | -        | No parameters required    |

#### **Example Response**:
```json
{
  "status": "success",
  "services": [
    {
      "id": 2,
      "created_at": "2024-11-02T19:19:18.752Z",
      "updated_at": "2024-11-02T19:19:18.752Z",
      "user_id": 3,
      "isSubscription": true,
      "name_of_service": "Jasa Laundry",
      "category_id": 2,
      "description": "Laundry Baju, Kemeja kecuali CD",
      "status": "accept"
    },
    {
      "id": 1,
      "created_at": "2024-11-01T18:36:42.777Z",
      "updated_at": "2024-11-01T18:36:42.777Z",
      "user_id": 2,
      "isSubscription": true,
      "name_of_service": "Jasa Design",
      "category_id": 1,
      "description": "Jasa design web dan aplikasi",
      "status": "accept"
    }
  ]
}
```

---

#### **Endpoint: GET /category**

| Parameter | Type     | Description               |
| --------- | -------- | ------------------------- |
| None      | -        | No parameters required    |

#### **Example Response**:
```json
{
  "status": "success",
  "category": [
    {
      "id": 1,
      "name_of_category": "Technology"
    },
    {
      "id": 2,
      "name_of_category": "Household"
    },
    {
      "id": 3,
      "name_of_category": "Uncategories"
    }
  ]
}
```
## Used By

This project is used by the following companies:

- [Agile Teknik](https://agileteknik.com)
- [PENS](https://pens.id)

## Support

For support, email teambersin@gmail.com.

