# P01 — Enterprise E-Commerce Catalog & Order Management System

A production-grade backend platform and interactive management interface built for a multi-vendor retail company. The system manages product catalogs, customer shopping carts, checkout, inventory decrement, discount coupons, payments status tracking, order fulfillment workflows, reviews, seller dashboards, and executive admin analytics.

---

## 👥 Team & Submission Details
- **Project Code**: P01 — Enterprise E-Commerce Catalog & Order Management System
- **Domain**: Retail / E-Commerce
- **Course Component**: CIA-3 Evaluation
- **Team Details**:
  - **Member 1**: Lead Backend & Auth Engineer (Registration, JWT Auth, RBAC, Categories)
  - **Member 2**: Core Workflow Engineer (Search & Filter, Shopping Cart, Checkout, Order Workflow)
  - **Member 3**: Analytics & Reporting Engineer (Inventory, Coupons, Payments, Reviews, Dashboards)
  - **Member 4**: Database Architect & QA Lead (Mongoose Modeling, Postman Suite, Documentation)

---

## 📌 Problem Statement
Modern multi-vendor retail platforms require a resilient and secure backend architecture capable of managing high-volume product catalogs across multiple independent sellers while guaranteeing transaction integrity during checkout. Key enterprise operational challenges include synchronizing inventory in real-time, preventing out-of-stock purchases, enforcing strict role-based access control (Customer vs. Seller vs. Admin), orchestrating non-reversible order delivery workflows, and synthesizing actionable business intelligence (sales analytics and seller performance) without incurring the performance penalty of relational database joins.

---

## 🛠 Tech Stack Used
- **Runtime**: Node.js (v18+)
- **Web Framework**: Express.js (v4.x)
- **Database**: MongoDB with Mongoose ODM (v8.x)
- **Authentication**: Stateless JSON Web Tokens (`jsonwebtoken`) & password hashing (`bcryptjs`)
- **Data Validation**: `express-validator` middleware
- **Architecture**: Model-View-Controller (MVC) with centralized error handling
- **Interactive UI**: HTML5, Tailwind CSS, FontAwesome icons, Vanilla JS (served statically from Express)
- **API Testing**: Postman Collection (v2.1) & automated Node.js integration script

---

## 🚀 Setup & Local Installation

### Prerequisites
- Node.js (v18 or higher) and npm installed.
- MongoDB: A running local MongoDB instance (`mongodb://127.0.0.1:27017/ecommerce_db`) or MongoDB Atlas URI. *(Note: If no MongoDB is reachable, the server automatically starts a zero-setup in-memory database for immediate offline grading and viva).*

### Installation Steps
```bash
# 1. Navigate to project root
cd ecommerce-backend

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Copy .env.example to .env
cp .env.example .env

# 4. Start the server
npm start
# or for hot-reloading development:
npm run dev
```

The server will launch at:
- **Web Interface (Demo UI)**: `http://localhost:5000`
- **REST API Base URL**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`

### Automatic Seed Data
When the server starts for the first time, it automatically seeds realistic demo data:
| Role | Email | Password | Description |
|---|---|---|---|
| **Admin** | `admin@retail.com` | `admin123` | Full administrative privileges, reports & categories |
| **Seller** | `seller@techstore.com` | `seller123` | Multi-vendor seller managing tech catalog & orders |
| **Seller 2** | `seller2@fashionhub.com` | `seller123` | Apparel & fashion merchant |
| **Customer** | `customer@shopper.com` | `customer123` | End customer placing orders & submitting reviews |
| **Customer 2**| `jane@shopper.com` | `customer123` | Second registered customer |

---

## 📋 List of Implemented Modules (14/14 Modules)

| # | Module Name | Implementation Details | Status |
|---|---|---|:---:|
| **1** | **User Registration & Authentication** | Secure sign-up/login with bcrypt password hashing (salt rounds = 10) and JWT token generation. | ✅ Done |
| **2** | **Role-Based Access Control (RBAC)** | Strict role segregation (`customer`, `seller`, `admin`) via `verifyToken` and `authorizeRoles` middlewares. | ✅ Done |
| **3** | **Product Catalog Management** | Full CRUD for products with price, category, stock, images, and seller ownership authorization. | ✅ Done |
| **4** | **Category & Sub-Category Management** | Hierarchical categories tree via `parentCategoryId` referencing with orphaned record prevention. | ✅ Done |
| **5** | **Product Search & Filtering** | Keyword search (Regex/Text Index) with multi-field filtering (category, price range, stock, ratings) & sorting. | ✅ Done |
| **6** | **Shopping Cart Management** | Add/update/remove items with **live stock validation** ensuring users cannot add more items than available. | ✅ Done |
| **7** | **Order Placement & Checkout** | Cart-to-order transformation, shipping address capture, discount deduction, and order snapshot generation. | ✅ Done |
| **8** | **Order Status Workflow** | Finite state machine enforcing valid transitions (`Placed` &rarr; `Confirmed` &rarr; `Shipped` &rarr; `Delivered`) with audit log. | ✅ Done |
| **9** | **Inventory & Stock Management** | Auto-decrement stock upon order placement, auto-restoration upon cancellation, and low-stock alerts (`stock <= 5`). | ✅ Done |
| **10**| **Discount & Coupon Engine** | Percentage and flat coupons with minimum order values, expiration dates, and discount calculations. | ✅ Done |
| **11**| **Payment Status Tracking** | Mock payment processing (`Card`, `UPI`, `COD`, `MockGateway`), transaction IDs, and status tracking. | ✅ Done |
| **12**| **Reviews & Ratings** | Verified-purchase reviews (only customers with delivered orders can review) and real-time rating average aggregation. | ✅ Done |
| **13**| **Seller Dashboard APIs** | Analytics for seller: total revenue, units sold, low-stock warnings, pending orders, and product breakdown. | ✅ Done |
| **14**| **Admin Reporting & Analytics** | Aggregation pipelines for gross sales, net revenue, AOV, order status breakdown, top products, and user growth. | ✅ Done |

---

## 🗄 Database Design & Schema Rationale

### Collections & Key Fields
1. **`users`**: `name`, `email` *(unique index)*, `passwordHash`, `role` (`customer` \| `seller` \| `admin`), `address`, timestamps.
2. **`categories`**: `name` *(unique)*, `slug`, `parentCategoryId` *(ref to Category, indexed)*, `description`.
3. **`products`**: `name`, `description`, `price` *(indexed)*, `categoryId` *(ref to Category, indexed)*, `sellerId` *(ref to User, indexed)*, `stock`, `images[]`, `ratingAvg`, `ratingCount`, `isActive`. Text index on `name` & `description`.
4. **`carts`**: `userId` *(ref to User, unique index)*, `items: [{ productId, quantity, price }]`, timestamps.
5. **`orders`**: `userId` *(ref to User, indexed)*, `items: [{ productId, name, price, quantity, sellerId }]` *(indexed on `items.sellerId`)*, `totalAmount`, `discountAmount`, `finalAmount`, `couponCode`, `shippingAddress`, `status` *(indexed)*, `statusHistory: [{ status, remarks, updatedBy, timestamp }]`, `paymentStatus`, `paymentMode`, timestamps.
6. **`coupons`**: `code` *(unique index)*, `discountType` (`percentage` \| `flat`), `value`, `validTill`, `minOrderValue`, `maxDiscount`, `isActive`.
7. **`reviews`**: `productId` *(ref to Product, indexed)*, `userId` *(ref to User)*, `rating` (1-5), `comment`, timestamps. Compound unique index on `{ productId: 1, userId: 1 }`.

### 🧠 Referencing vs. Embedding Decision Matrix

```
                     ┌───────────────────────┐
                     │         User          │
                     └──────────┬────────────┘
                                │ 1:N (Ref)
             ┌──────────────────┼─────────────────┐
             │                  │                 │
             ▼                  ▼                 ▼
   ┌──────────────────┐┌──────────────────┐┌──────────────────┐
   │     Product      ││      Order       ││       Cart       │
   │  (Ref categoryId)││ (Embedded items, ││ (Embedded items, │
   │  (Ref sellerId)  ││  shippingAddress,││   unique userId) │
   │                  ││  statusHistory)  ││                  │
   └─────────┬────────┘└──────────────────┘└──────────────────┘
             │ 1:N (Ref)
             ▼
   ┌──────────────────┐
   │      Review      │
   │ (Ref productId)  │
   │ (Ref userId)     │
   └──────────────────┘
```

- **Why Embed `items` and `shippingAddress` in `orders`?**
  Order records must remain strictly immutable financial audit trails. If a seller edits a product's title or price tomorrow, past orders must still retain the exact snapshot of the product name and price at the exact moment of sale.
- **Why Embed `statusHistory` in `orders`?**
  Status transitions are always retrieved together with the order details and are strictly bounded (maximum of 4-5 transitions per order lifetime). Embedding avoids an extra collection and eliminates unnecessary `$lookup` joins.
- **Why Reference `categoryId` and `sellerId` in `products`?**
  Products and Sellers update independently. A seller may have hundreds of products; embedding products inside the user document would exceed MongoDB's 16MB BSON limit and lead to severe document growth fragmentation.
- **Why Reference `productId` and `userId` in `reviews`?**
  A popular product may accumulate thousands of reviews. Storing reviews as an embedded array in the product document would cause unbounded document growth. Referencing keeps the product document lean and allows paginated review browsing.

---

## 📡 REST API Endpoint Catalog

### 1. Authentication & Users
- `POST /api/auth/register` — Register a customer or seller
- `POST /api/auth/login` — Authenticate and issue JWT token
- `GET /api/auth/me` — Get authenticated user profile *(Bearer Token)*
- `PUT /api/auth/profile` — Update user address / details

### 2. Categories
- `GET /api/categories` — List all categories (`?tree=true` for nested tree)
- `GET /api/categories/:id` — Get category details with subcategories
- `POST /api/categories` — Create category or subcategory *(Admin only)*
- `PUT /api/categories/:id` — Update category *(Admin only)*
- `DELETE /api/categories/:id` — Delete category with orphan check *(Admin only)*

### 3. Products
- `GET /api/products` — Search and filter products (`?search=`, `?category=`, `?minPrice=`, `?maxPrice=`, `?inStock=`, `?sortBy=`)
- `GET /api/products/:id` — Get product details
- `POST /api/products` — Create new product *(Seller/Admin)*
- `PUT /api/products/:id` — Update product *(Seller owner or Admin)*
- `DELETE /api/products/:id` — Delete product *(Seller owner or Admin)*

### 4. Shopping Cart
- `GET /api/cart` — View user's cart with live subtotal calculation *(Customer)*
- `POST /api/cart` — Add item to cart with live stock check *(Customer)*
- `PUT /api/cart/:productId` — Update item quantity *(Customer)*
- `DELETE /api/cart/:productId` — Remove product from cart *(Customer)*
- `DELETE /api/cart` — Clear entire cart *(Customer)*

### 5. Orders & Status Workflow
- `POST /api/orders` — Place order from cart, validate stock, apply coupon *(Customer)*
- `GET /api/orders` — List customer's orders *(Customer sees own, Admin sees all)*
- `GET /api/orders/:id` — Get order details with audit history
- `PUT /api/orders/:id/status` — Advance order workflow status *(Seller/Admin)*
- `PUT /api/orders/:id/cancel` — Cancel order & restore inventory stock *(Customer/Admin)*

### 6. Inventory & Low Stock
- `GET /api/inventory/low-stock` — List products with stock &le; threshold *(Seller/Admin)*
- `GET /api/inventory/summary` — Inventory health overview *(Seller/Admin)*
- `PUT /api/inventory/restock/:productId` — Add stock units to a product *(Seller/Admin)*

### 7. Coupons & Discounts
- `GET /api/coupons` — List currently active coupons
- `POST /api/coupons` — Create coupon with rules *(Admin only)*
- `POST /api/coupons/apply` — Validate coupon and compute discount for order amount
- `DELETE /api/coupons/:id` — Delete / deactivate coupon *(Admin only)*

### 8. Payments Tracking
- `POST /api/payments/process` — Mock payment processing gateway integration
- `GET /api/payments/status/:orderId` — Check payment status for an order

### 9. Reviews & Ratings
- `POST /api/products/:id/reviews` — Submit verified review for delivered product *(Customer)*
- `GET /api/products/:id/reviews` — List paginated reviews for product

### 10. Seller Dashboard
- `GET /api/seller/dashboard` — Revenue, units sold, low-stock warnings, and top products *(Seller)*
- `GET /api/seller/orders` — Orders containing seller's products *(Seller)*
- `GET /api/seller/products` — Catalog items belonging to the seller *(Seller)*

### 11. Admin Reporting & Analytics
- `GET /api/admin/reports/sales` — Gross sales, net revenue, AOV, timeline, and status breakdown *(Admin)*
- `GET /api/admin/reports/top-products` — Top selling products across platform *(Admin)*
- `GET /api/admin/reports/user-growth` — User growth trends and demographic split *(Admin)*

---

## 🧪 Postman & Automated Testing Checklist

The provided Postman Collection file (`postman/P01_Ecommerce_System.postman_collection.json`) covers all rubric criteria:
- **Happy Path (200 / 201)**: Registration, login, catalog search, cart additions, checkout, payments, reviews.
- **Validation Failures (400)**: Missing required fields, invalid email formats, non-numeric quantities.
- **Authentication Failures (401)**: Invoking protected routes without `Bearer` JWT token.
- **Authorization Failures (403)**: Customer attempting to create categories or products, non-owner seller editing products.
- **Business Rule Conflicts (409)**:
  - Adding more quantity than available in live stock (`INSUFFICIENT_STOCK`).
  - Transitioning an order from `Placed` directly to `Delivered` without `Confirmed`/`Shipped` (`INVALID_STATUS_TRANSITION`).
  - Submitting a review for a product that has not yet been delivered (`VERIFIED_PURCHASE_REQUIRED`).
  - Deleting a category that contains active child sub-categories or products.
- **Not Found (404)**: Accessing non-existent products or orders with valid ObjectIds without server crash.

### Running the Automated End-to-End Test
```bash
npm run test:api
```
All 14 modules are asserted programmatically in sequence and will print pass/fail results to the terminal.

---

## 🔒 Security & Best Practices
- **No Hardcoded Secrets**: All configuration values (`JWT_SECRET`, `MONGO_URI`, `PORT`) are managed strictly through environment variables.
- **Password Salting & Hashing**: Passwords are never stored in plain text; hashed using `bcryptjs` before persisting to MongoDB.
- **Role Isolation**: Express middleware blocks unauthorized roles before controller execution.
- **Server Crash Prevention**: Centralized global error handling catches all unhandled exceptions and returns structured JSON responses.

---

## ⚠️ Known Assumptions & Limitations
- Single currency (`INR ₹`) and single time zone.
- Payment gateway transactions are simulated using a high-fidelity mock adapter.
- External logistics dispatch and notifications (SMS/Email) are stubbed via order audit logs.
