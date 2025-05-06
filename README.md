# Verdo - CO₂ Savings Tracker API

Hi! This is the backend API for Verdo, a project designed to help users and businesses track CO₂ savings. I built this using Node.js, Express, and MongoDB as part of my final project. It was a really cool experience getting all these pieces to work together!

## What's This Project About?

**The Goal:** To create a simple but solid API that lets users log their carbon-saving activities (like choosing to bike instead of drive). Businesses can then see these logs to get an idea of their team's positive environmental impact.

**How it Works (The Basics):**
* Users can sign up and log in (gotta keep things secure!).
* Once logged in, they can post a new "activity log" (e.g., "Saved 2kg of CO₂ by using public transport").
* Users can also see and manage *their own* logs.
* There's a special role for "admin" users who can see *all* the logs submitted by everyone, and help manage them if needed.
* It's all about secure and organized data, with input checks to make sure things are sensible!

## Tech I Used:

* **Node.js:** For running JavaScript on the server (my backend powerhouse!).
* **Express.js:** To build the API routes and handle requests smoothly.
* **MongoDB:** My database for storing user info and activity logs – it’s pretty flexible.
* **Mongoose:** Helped me create schemas (like blueprints) for my user and log data in MongoDB and make sure the data going in is good.
* **JSON Web Tokens (JWT):** For making sure users are logged in and keeping routes secure. This was interesting to implement!
* **bcryptjs:** To hash passwords safely before saving them – no plain text passwords here!
* **dotenv:** To keep my secret keys and database links out of the main code (super important for security!).
* **morgan:** For logging HTTP requests in the console, which was super handy for debugging to see what's going on.
* **cors:** To allow requests from different origins (like a future frontend app I might build).
* **express-validator:** To check and validate the data coming into my API – helps keep bad data out!

## Cool Features I've Built:

* **User Accounts & Security:**
    * New users can sign up (`/api/auth/signup`).
    * Existing users can log in (`/api/auth/login`) to get a JWT.
    * Passwords are super scrambled (hashed) with bcrypt.
    * My `protect` middleware uses JWTs to make sure only logged-in users can access certain things.
* **Activity Logging (Full CRUD!):**
    * Logged-in users can post their CO₂-saving activities (`POST /api/logs`).
    * Each log automatically gets a timestamp, a "kg" unit, and info about who logged it (from their token!).
    * Users can fetch just *their own* logs (`GET /api/logs/my-logs`).
    * Users can update their own logs (`PUT /api/logs/:id`).
    * Users can delete their own logs (`DELETE /api/logs/:id`).
* **Admin Superpowers:**
    * Users with an "admin" role can fetch a list of *all* activity logs from everyone (`GET /api/logs`).
    * Admins can also update or delete *any* log if needed. My `authorize` middleware handles this.
* **Data Validation:** Incoming data for creating/updating users and logs is checked using `express-validator`.
* **Organized Code:** Tried my best to follow an MVC-like structure (models, routes, controllers, middleware). It helps keep things from getting too messy.
* **Centralized Error Handling:** Got a main error handler to catch issues and send back consistent error messages.

## Getting it Running:

**What you'll need:**
* Node.js and npm (or yarn) installed on your computer.
* MongoDB running locally or a connection string to a cloud one (like MongoDB Atlas).

**Steps:**

1.  **Clone this project:**
    ```bash
    git clone <your-repository-url>
    cd verda-business-dashboard
    ```

2.  **Install all the packages:** (This reads my `package.json` and gets everything needed)
    ```bash
    npm install
    ```

3.  **Set up your Environment Variables:**
    Create a file named `.env` in the main project folder. You can copy `.env.example` if I've included one, or just add these lines, filling in your own details:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string_here
    JWT_SECRET=a_really_long_and_strong_secret_key_for_jwt
    JWT_EXPIRE=30d
    NODE_ENV=development
    ```
    * `PORT`: What port the server should use (5000 is a good default).
    * `MONGO_URI`: Your MongoDB connection link.
    * `JWT_SECRET`: Make this a long, random string! It's for making tokens secure.
    * `JWT_EXPIRE`: How long a login token should last (e.g., "30d" for 30 days).
    * `NODE_ENV`: Set to `development` for more detailed error messages, or `production` for live.

4.  **Start the server (for development):**
    This command uses `nodemon`, so the server restarts automatically when you change code – super useful!
    ```bash
    npm run dev
    ```
    You should see a message like `🚀 Server running on port 5000` and `MongoDB connected`.

5.  **(Optional) Start for production:**
    ```bash
    npm start
    ```

## API Endpoints Guide:

Hey, so this is how you talk to my API! All API responses try to follow this pattern:
`{ "success": true/false, "data": {...} or [...], "message": "A helpful message" }`

And don't forget, for the routes that say "JWT Auth", you need to send a Bearer Token in the `Authorization` header, like this: `Authorization: Bearer your_jwt_token_here`. I've used `express-validator` to check the data you send, so it'll tell you if something's not right!

---

### **Authentication (`/api/auth`)**

1.  **Sign Up a New User**
    * **Method:** `POST`
    * **Path:** `/signup`
    * **Auth:** None needed.
    * **Body (JSON) & Validations:**
        ```json
        {
            "name": "Test User", // Required, string
            "email": "test@example.com", // Required, must be a valid email
            "password": "password123" // Required, min 6 characters
        }
        ```
    * **Success (201 Created):**
      `{ "success": true, "data": { ...user object without password... }, "message": "User registered successfully" }`
    * **Errors:**
        * `400 Bad Request`: If validation fails (e.g., missing fields, bad email, short password) or email is already taken. (You'll get specific messages from the validator!)
        * `500 Server Error`: If my server goofed.

2.  **Log In an Existing User**
    * **Method:** `POST`
    * **Path:** `/login`
    * **Auth:** None needed.
    * **Body (JSON) & Validations:**
        ```json
        {
            "email": "test@example.com", // Required, must be a valid email
            "password": "password123" // Required
        }
        ```
    * **Success (200 OK):**
      `{ "success": true, "token": "your_jwt_token", "data": { ...user object... }, "message": "User logged in successfully" }`
    * **Errors:**
        * `400 Bad Request`: Missing email/password or bad email format.
        * `401 Unauthorized`: Wrong email or password.

---

### **Activity Logs (`/api/logs`)**

*(Heads up! All these log routes below need JWT Auth. My `protect` middleware takes care of that!)*

1.  **Add a New CO₂ Saving Log**
    * **Method:** `POST`
    * **Path:** `/`
    * **Auth:** **Required** (Bearer Token - User JWT)
    * **Body (JSON) & Validations:**
        ```json
        {
            // "user" field is automatically taken from your login token!
            "category": "transportation", // Required, string
            "amount": 5.5 // Required, number (e.g., CO2 saved) >= 0
        }
        ```
      *(The `unit` ("kg") and `timestamp` are added automatically by the server.)*
    * **Success (201 Created):**
      `{ "success": true, "data": { ...newly created log object... }, "message": "Log created" }`
    * **Errors:**
        * `400 Bad Request`: If validation fails (e.g., missing fields, amount is not a number).
        * `401 Unauthorized`: No token or invalid token.

2.  **Get MY Activity Logs** (Get logs for the currently logged-in user)
    * **Method:** `GET`
    * **Path:** `/my-logs`
    * **Auth:** **Required** (Bearer Token - User JWT)
    * **Body:** None.
    * **Success (200 OK):**
      `{ "success": true, "count": log_count, "data": [ ...array of YOUR log objects... ], "message": "User logs retrieved successfully" }`
    * **Errors:**
        * `401 Unauthorized`: No token or invalid token.

3.  **Get ALL Activity Logs (Admin Only!)**
    * **Method:** `GET`
    * **Path:** `/`
    * **Auth:** **Required** (Bearer Token - **Admin** JWT). My `authorize('admin')` middleware checks this!
    * **Body:** None.
    * **Success (200 OK):**
      `{ "success": true, "count": total_log_count, "data": [ ...array of ALL log objects... ], "message": "Logs retrieved successfully" }`
    * **Errors:**
        * `401 Unauthorized`: No token or invalid token.
        * `403 Forbidden`: You're logged in, but not an admin!

4.  **Update an Activity Log**
    * **Method:** `PUT`
    * **Path:** `/:id` (e.g., `/api/logs/60c72b2f9b1d8c001c8e4d5f`)
    * **Auth:** **Required** (Bearer Token - User JWT). You must be the **owner** of the log or an **admin**.
    * **Params:**
        * `id` (in URL): The ID of the log to update (must be a valid MongoDB ObjectId).
    * **Body (JSON) & Validations (Optional fields):**
        ```json
        {
            "category": "public transit", // Optional, string
            "amount": 6.0 // Optional, number >= 0
        }
        ```
      *(You can update one, or both! The validators check the fields if you send them.)*
    * **Success (200 OK):**
      `{ "success": true, "data": { ...updated log object... }, "message": "Log updated successfully" }`
    * **Errors:**
        * `400 Bad Request`: Invalid Log ID format, or validation fails for provided fields (e.g., category empty if provided, amount not a number).
        * `401 Unauthorized`: No token or invalid token.
        * `403 Forbidden`: You're not the owner and not an admin.
        * `404 Not Found`: Log with that ID doesn't exist.

5.  **Delete an Activity Log**
    * **Method:** `DELETE`
    * **Path:** `/:id` (e.g., `/api/logs/60c72b2f9b1d8c001c8e4d5f`)
    * **Auth:** **Required** (Bearer Token - User JWT). You must be the **owner** of the log or an **admin**.
    * **Params:**
        * `id` (in URL): The ID of the log to delete (must be a valid MongoDB ObjectId).
    * **Body:** None.
    * **Success (200 OK):**
      `{ "success": true, "data": {}, "message": "Log deleted successfully" }`
    * **Errors:**
        * `400 Bad Request`: Invalid Log ID format.
        * `401 Unauthorized`: No token or invalid token.
        * `403 Forbidden`: You're not the owner and not an admin.
        * `404 Not Found`: Log with that ID doesn't exist.

---

## A Little About the Code Structure:

I tried to keep things tidy so it's easier to find stuff:
* `src/config/`: Database connection logic.
* `src/controllers/`: The brains for each route (handles what happens when you hit an endpoint).
* `src/middleware/`: For code that runs "in the middle" (like checking JWTs or handling errors).
* `src/models/`: Defines how my `User` and `ActivityLog` data should look using Mongoose schemas.
* `src/routes/`: Sets up the API paths (like `/api/auth` and `/api/logs`) and connects them to controllers and validators.
* `app.js`: Main Express app setup (middleware, routes).
* `server.js`: Starts the actual server.

## What I Learned / Next Steps:

This was a great project to really get into Node.js, Express, and how to secure an API with JWTs. Mongoose schemas and `express-validator` were also cool for making sure the data is right from the start. Connecting all these pieces and seeing it work was really rewarding!

**Things I might add if I had more time (maybe for Verda v2.0!):**
* More detailed user profile management.
* Pagination for GET requests that return many logs.
* Maybe a way for users to see a summary of their own carbon savings.

Thanks for checking out my project! I hope you like it.