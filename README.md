# 💬 Bero Talker - Backend API

The high-performance, real-time messaging engine for **Bero Talker**. Built with **NestJS**, this API provides a robust foundation for instant communication, secure authentication, and scalable data management.

---

## 🚀 Features

-   **Real-time Communication:** Fully functional Chat Gateway using `Socket.io` for instant messaging.
-   **Advanced Authentication:** Dual-token security system (Access & Refresh Tokens) with JWT and `Passport.js`.
-   **Conversation Management:** Create group chats or direct messages, manage participants, and admin controls.
-   **Live Features:**
    -   Typing indicators (User is typing...).
    -   Read receipts (Message status).
    -   Online/Offline presence tracking.
-   **Database Excellence:** Type-safe database queries using **Prisma ORM** with **PostgreSQL**.
-   **Automated Documentation:** Fully documented API endpoints using **Swagger UI**.
-   **Mailing System:** Integrated `Nodemailer` for password resets and notifications.
-   **Security:** Password hashing with `bcrypt`, CORS enabled, and strict validation pipes.

---

## 🛠 Tech Stack

-   **Framework:** [NestJS](https://nestjs.com/) (Node.js)
-   **Real-time:** [Socket.io](https://socket.io/)
-   **Database:** [PostgreSQL](https://www.postgresql.org/)
-   **ORM:** [Prisma](https://www.prisma.io/)
-   **Documentation:** [Swagger/OpenAPI](https://swagger.io/)
-   **Security:** JWT, Passport, Bcrypt
-   **Language:** TypeScript

---

## 📂 Project Structure

The project follows the standard NestJS modular architecture, ensuring high maintainability and scalability:

```
src/
├── auth/                 # Authentication logic (JWT, AT/RT Strategies, Guards)
├── user/                 # User profile management and status tracking
├── conversation/         # Group & Direct chat management (Participants, Roles)
├── message/              # Message persistence, editing, and deletion logic
├── mail/               # Email service for notifications and password reset
├── prisma/               # Database connection and global Prisma service
└── chat/                 # Real-time engine (WebSocket Gateway & Events)
    └── chat.gateway.ts   # The core Hub for all Socket.io interactions
```

---

## 📋 Prerequisites

Before running the project, ensure you have:
-   Node.js (v18 or higher)
-   PostgreSQL database instance
-   `npm` or `yarn`

---

## ⚙️ Installation & Setup

1. **Clone the repository:**
   
   ```
   git clone https://github.com/ibrahimdayoub/talker-backend.git
   cd talker-backend
   ```
   
3. **Install dependencies:**
   
   ```
   yarn install
   ```
   
5. **Environment Configuration: Create a .env file in the root directory and add your credentials:**
   
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/bero_talker?schema=public"
   
   # Access token
   JWT_SECRET="jwt-secret-123"
   JWT_EXPIRY="15m"

   # Refresh token
   RT_SECRET="rt-secret-456"
   RT_EXPIRY="7d"

   # Email Service (Nodemailer)
   MAIL_HOST="smtp.example.com"
   MAIL_PORT=2525
   MAIL_USER="your-email@example.com"
   MAIL_PASS="your-password"
   MAIL_FROM=support@berotalker.com
   ```
   
7. **Database Migration:**
   
   ```
   npx prisma migrate dev --name init
   ```
   
9. **Start the server:**
    
   ```
   # Development mode
   yarn start:dev
  
   # Production mode
   yarn start:prod
   ```
   
---

## 📖 API Documentation
Once the server is running, you can access the interactive Swagger documentation at: ```http://localhost:3000/api/docs```

### 📡 WebSocket Events

```
EVENT	              DIRECTION	              DESCRIPTION
__________________________________________________________________________________________________________________
sendMessage	          Client ➡️ Server	      Sends a new message to a specific conversation.
receiveMessage	      Server ️➡️ Client	      Broadcasts the saved message to all participants in the room.
typing	              Client ➡️ Server	      Informs others that the user is currently typing.
messagesRead	      Client ➡️ Server	      Updates the read status for messages in a conversation.
joinConversation	  Client ➡️ Server	      Validates membership and joins the specific room for real-time updates.
editMessage	          Client ➡️ Server	      Updates an existing message and notifies participants.
deleteMessage	      Client ➡️ Server	      Removes a message for all participants in real-time.
userStatusChanged	  Server ➡️ Client	      System Event: Triggered automatically on connection/disconnection.
```

---

## 📌 Screenshots

<img src="assets/images/swagger-docs.png" alt="Swagger Docs" width="75%">
<img src="assets/images/postgresql-admin.png" alt="Postgresql Admin" width="75%">
<img src="assets/images/vs-code.png" alt="VS Code" width="75%">

---

## 🔗 Related Project
This API powers the [Bero Talker Web App](https://github.com/ibrahimdayoub/talker-frontend)

---
