# CIA-3 EVALUATION REPORT
# P01 — ENTERPRISE E-COMMERCE CATALOG & ORDER MANAGEMENT SYSTEM
**Domain: Retail / Multi-Vendor E-Commerce Platform**

---

## 👥 Team Details & Module Ownership (First Page Requirement)

| # | Student Name | Roll Number | Department & Section | Assigned Module Ownership |
|:---:|---|---|---|---|
| **1** | [Member 1 Name] | [Roll No 1] | Computer Science / Section A | Sprint 1: Auth & JWT, RBAC, Product Catalog, Categories |
| **2** | [Member 2 Name] | [Roll No 2] | Computer Science / Section A | Sprint 2: Product Search & Filter, Cart, Checkout, Order Status Machine |
| **3** | [Member 3 Name] | [Roll No 3] | Computer Science / Section A | Sprint 3: Inventory Alerts, Coupons, Mock Payments, Reviews & Ratings |
| **4** | [Member 4 Name] | [Roll No 4] | Computer Science / Section A | Sprint 3: Seller Dashboard, Admin Sales Analytics, Postman & QA |

---

## 1. Problem Statement & Business Overview
Enterprise multi-vendor retail platforms face significant operational complexities when managing disparate product catalogs across independent sellers while preserving transactional integrity during customer checkouts. Key engineering challenges addressed in this platform include real-time stock decrements to prevent overselling, enforcing strict role-based access control (RBAC) across Customers, Sellers, and Admins, orchestrating non-reversible order fulfillment workflows, and synthesizing actionable business intelligence without treating document-oriented MongoDB like a legacy relational database.

---

## 2. System Architecture & Tech Stack
The solution adheres strictly to a clean Model-View-Controller (MVC) architectural pattern implemented with Node.js and Express.js, backed by MongoDB through Mongoose ODM:
- **Runtime**: Node.js (v24.x)
- **Web Framework**: Express.js (v4.21.x)
- **Database & ODM**: MongoDB with Mongoose (v8.9.x)
- **Authentication**: Stateless JSON Web Tokens (`jsonwebtoken`) with `bcryptjs` password hashing (salt rounds = 10)
- **Validation Layer**: `express-validator` middleware
- **Interactive UI**: Single-page application built with HTML5, Tailwind CSS, FontAwesome, and Vanilla JS
- **Error Handling**: Centralized global error handler capturing CastErrors, duplicate keys, validation errors, and business conflicts into clean JSON responses.

---

## 3. Database Design: Referencing vs. Embedding Rationale (6 Marks Rubric)
A critical criterion in the evaluation rubric is making deliberate, justified decisions between referencing and embedding in MongoDB:

| Entity / Field | Design Pattern | Architectural & Business Rationale |
|---|---|---|
| `orders.items` | Embedded Array | **Financial immutability**: Captures a snapshot of product name and price at the exact moment of checkout. If a seller later edits a product's price or description, past orders remain unchanged. |
| `orders.statusHistory` | Embedded Subdocuments | **Strictly bounded** (maximum 4-5 status transitions per order lifetime) and always retrieved together with the order. Eliminates redundant `$lookup` joins. |
| `carts.items` | Embedded Array | High-frequency read/write operations bound to a single user session; read and written together as a unit. |
| `products.sellerId` | Referenced (`ObjectId`) | Sellers and products have independent lifecycles. Prevents exceeding MongoDB's 16MB document size limit on high-volume seller stores. |
| `products.categoryId` | Referenced (`ObjectId`) | Enables hierarchical category taxonomies (parent-child trees) and prevents catalog data duplication. |
| `reviews` | Referenced Collection | **Unbounded growth**: Popular products can accumulate tens of thousands of reviews; keeping reviews in a separate collection keeps product documents lean. |

---

## 4. Summary of Implemented Modules (14/14 Modules)
1. **User Registration & Authentication**: Secure sign-up/login with bcrypt password hashing and JWT token generation.
2. **Role-Based Access Control (RBAC)**: Segregated routes and permissions for Customer, Seller, and Admin roles.
3. **Product Catalog Management**: Full CRUD for products with price, category, stock, images, and seller ownership authorization.
4. **Category & Sub-Category Tree**: Hierarchical category organization with parent-child tree queries and orphan deletion prevention.
5. **Product Search & Filtering**: Regex/text search with multi-field filtering (category, price range, stock, ratings) & sorting.
6. **Shopping Cart Management**: Add/update/remove items with live stock validation ensuring users cannot add more items than available.
7. **Order Placement & Checkout**: Cart-to-order transformation, shipping address capture, discount deduction, and order snapshot generation.
8. **Order Status Workflow**: State machine enforcing valid transitions (`Placed` &rarr; `Confirmed` &rarr; `Shipped` &rarr; `Delivered`) with audit log.
9. **Inventory & Stock Management**: Auto-decrement stock upon order placement, auto-restoration upon cancellation, and low-stock alerts (`stock <= 5`).
10. **Discount & Coupon Engine**: Percentage and flat coupons with minimum order values, expiration dates, and discount calculations.
11. **Payment Status Tracking**: Mock payment processing (`Card`, `UPI`, `COD`, `MockGateway`), transaction IDs, and status tracking.
12. **Reviews & Ratings**: Verified-purchase reviews (only customers with delivered orders can review) and real-time rating average aggregation.
13. **Seller Dashboard APIs**: Analytics for seller: total revenue, units sold, low-stock warnings, pending orders, and product breakdown.
14. **Admin Reporting & Analytics**: Aggregation pipelines for gross sales, net revenue, AOV, order status breakdown, top products, and user growth.

---

## 5. Verification & Test Suite Results (30/30 Passed)
An automated end-to-end integration test runner (`scripts/test-api.js`) asserted all 14 modules:
- **Total Assertions**: 30 Passed, 0 Failed (100% success rate).
- **HTTP Code Coverage**:
  - `200 / 201`: Successful resource retrieval and state mutations.
  - `400`: Validation error and insufficient stock conflicts.
  - `401`: Missing or invalid JWT authorization tokens.
  - `403`: Role-based forbidden access (e.g. customer attempting admin/seller actions, unverified buyer reviews).
  - `404`: Non-existent resource ID lookups.
  - `409`: Illegal state machine transitions (e.g. attempting to skip from `Placed` directly to `Delivered`).

---

## 6. Screenshots & Output Placeholders

### Module 1 & 2: User Login & Role Switching
*(Paste screenshot of User Login / JWT Token response or Live UI Role Switcher)*

### Module 3 & 5: Product Catalog with Live Search & Filtering
*(Paste screenshot of Product Catalog grid and search by keyword)*

### Module 6, 7 & 10: Shopping Cart, Coupon & Checkout
*(Paste screenshot of Cart modal with applied `WELCOME10` coupon discount)*

### Module 8: Order Status Workflow Progression
*(Paste screenshot of order state progression from Placed &rarr; Confirmed &rarr; Shipped &rarr; Delivered)*

### Module 9: Inventory Low-Stock Alerts
*(Paste screenshot of Low-Stock Alert table and Restock action)*

### Module 13 & 14: Seller Dashboard & Admin Financial Analytics
*(Paste screenshot of Seller Revenue cards and Admin Sales Summary)*
