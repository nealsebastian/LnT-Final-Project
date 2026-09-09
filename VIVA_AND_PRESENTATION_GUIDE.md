# P01 — Viva Preparation & PPT Presentation Guide

This guide is designed to help every team member ace the **CIA-3 Viva (6 marks)** and build a winning **PPT Presentation (4 marks)** for **P01 — Enterprise E-Commerce Catalog & Order Management System**.

---

## Part 1: PPT Presentation Slide Structure (Slide-by-Slide)

### Slide 1: Title & Team Details
- **Title**: P01 — Enterprise E-Commerce Catalog & Order Management System
- **Domain**: Retail / Multi-Vendor E-Commerce
- **Team**: List all members with Roll Numbers, Department, Section, and assigned module ownership.
- **Tagline**: A resilient, scalable multi-vendor REST backend with real-time inventory management and workflow orchestration.

### Slide 2: Problem Statement & Objectives
- **The Challenge**: Managing multi-vendor catalogs with conflicting stock, preventing overselling, ensuring secure role-based access, and managing non-trivial order status workflows.
- **Objectives**:
  1. Build a scalable Node.js + Express REST API backed by MongoDB.
  2. Implement strict Role-Based Access Control (Customer, Seller, Admin).
  3. Ensure transactional business rules for checkout, inventory auto-decrement, and state workflow.
  4. Provide deep analytics for sellers and administrators.

### Slide 3: System Architecture & Tech Stack
- **Architecture**: MVC Pattern (Model-View-Controller) with Middleware layer for Auth, Validation, and Global Error Handling.
- **Tech Stack**:
  - Runtime: Node.js (v18+)
  - Server: Express.js
  - Database: MongoDB with Mongoose ODM
  - Security: JWT (JSON Web Tokens), bcryptjs
  - Client Demo: Interactive Tailwind/JS Single Page Application

### Slide 4: Database Modeling & ER Diagram
- Explain the 7 collections: `users`, `categories`, `products`, `carts`, `orders`, `coupons`, `reviews`.
- **Key Architectural Choice**: Referencing vs. Embedding.
  - *Embedded*: Order items, shipping address, status history (immutable snapshots, zero `$lookup` overhead).
  - *Referenced*: Sellers, Categories, Reviews (unbounded growth prevention, relational flexibility).

### Slide 5: Modules Overview (All 14 Modules Implemented)
- Sprint 1 (Foundation): Auth & JWT, RBAC, Product Catalog CRUD, Hierarchical Categories.
- Sprint 2 (Core Workflow): Live Stock Cart, Search & Filtering, Order Placement, State Workflow.
- Sprint 3 (Reporting & Polish): Inventory Auto-Decrement & Alerts, Coupon Engine, Payment Gateway Mock, Reviews, Seller Dashboard, Admin Sales Analytics.

### Slide 6: Core Workflow Deep Dive (Cart & Order Status Machine)
- **Live Stock Checks**: Cart rejects quantity additions that exceed live product stock.
- **Order Placement**: Converts cart to order, snapshots product prices, auto-decrements stock in MongoDB.
- **State Machine Transitions**:
  - `Placed` &rarr; `Confirmed` &rarr; `Shipped` &rarr; `Delivered`.
  - Cancellations allowed only in `Placed` or `Confirmed` states; auto-restores inventory stock.
  - Skips (e.g. `Placed` directly to `Delivered`) return HTTP `409 Conflict`.

### Slide 7: Discount & Coupon Engine + Mock Payments
- **Coupon Engine**: Percentage or flat discounts, validity date checks, minimum order thresholds (`WELCOME10`, `FLAT500`).
- **Payment Processing**: Multi-mode payment tracking (`Card`, `UPI`, `COD`, `MockGateway`) with transaction generation and status tracking (`Pending` &rarr; `Completed`).

### Slide 8: Reviews & Social Proof Engine
- **Verified Purchase Requirement**: Only users who purchased and received the product (`Delivered` status) can review.
- **Real-Time Aggregation Hook**: Mongoose post-save hook recalculates product's `ratingAvg` and `ratingCount` on every review.

### Slide 9: Seller Dashboard & Admin Analytics
- **Seller Dashboard**: Real-time sales, units sold, low-stock warnings (`stock <= 5`), and order status breakdowns.
- **Admin Analytics**: MongoDB aggregation pipelines calculating Gross Revenue, Net Sales, Average Order Value (AOV), and User Growth trends.

### Slide 10: Security, Validation & API Quality
- No plain text passwords (`bcryptjs` salt rounds 10).
- No hardcoded secrets (100% environment variables via `.env`).
- Centralized error handler returning clean JSON responses (`400`, `401`, `403`, `404`, `409`, `500`) without crashing.

### Slide 11: Live Demonstration Screenshots
- Include screenshots from the live web UI (`http://localhost:5000`):
  1. Product Catalog with Search & Filter
  2. Shopping Cart & Checkout with Coupon validation
  3. Order Status Workflow progression buttons
  4. Seller Dashboard and Low Stock alerts
  5. Admin Reporting metrics and charts

### Slide 12: Conclusion & Future Enhancements
- Summary of achievements: 14/14 modules working, 100% test pass rate, Postman suite ready.
- Future Scope: Multi-currency support, Webhook integrations for real payment gateways (Stripe/Razorpay), Redis caching for product catalog.

---

## Part 2: Comprehensive Viva Q&A Guide (All Modules)

### General & Architecture Questions

**Q1: Why did you choose MongoDB instead of a Relational Database like PostgreSQL/MySQL?**
> *Answer*: E-Commerce product catalogs require flexible schemas (different product categories have varying attributes, e.g. electronics vs. clothing). MongoDB's document model allows storing rich nested subdocuments like order snapshots, shipping addresses, and status history within a single document. This dramatically reduces costly `$lookup` (JOIN) operations during high-traffic order checkout and read operations.

**Q2: What is the difference between referencing and embedding in your MongoDB design?**
> *Answer*:
> - **Embedding** is used when data is tightly bound to its parent, read together, and rarely updated independently. For instance, in our `orders` collection, `items` and `shippingAddress` are embedded. This also ensures that an order remains an immutable snapshot even if a product's price changes later.
> - **Referencing** (`ObjectId`) is used for entities with unbounded growth or independent lifecycles. For example, `sellerId` and `categoryId` in `products`, and `productId` in `reviews`. If we embedded reviews inside products, a viral product with 10,000 reviews would exceed MongoDB's 16MB document limit.

**Q3: How does your authentication and RBAC mechanism work?**
> *Answer*: We implemented a stateless JWT (JSON Web Token) architecture. Upon login, the backend verifies the hashed password using `bcryptjs.compare()`. If valid, it signs a JWT containing the user's `id`, `email`, and `role` (`customer`, `seller`, `admin`). On protected routes, the `verifyToken` middleware validates the token, and the `authorizeRoles(...roles)` middleware verifies if the user's role has permission, returning `401 Unauthorized` if no token is provided, or `403 Forbidden` if the role does not match.

---

### Business Rule & Workflow Questions

**Q4: How do you prevent overselling or race conditions when multiple users buy the last stock unit?**
> *Answer*: When placing an order, we check live stock in MongoDB. Upon checkout confirmation, we perform atomic inventory decrements using MongoDB's `$inc: { stock: -quantity }`. Additionally, the shopping cart validates live stock in real time when adding or incrementing item quantities, immediately rejecting additions that exceed current stock with HTTP `400 INSUFFICIENT_STOCK`.

**Q5: Explain your Order Status Workflow state machine.**
> *Answer*: Orders follow a deterministic state machine:
> `Placed` &rarr; `Confirmed` &rarr; `Shipped` &rarr; `Delivered`.
> - A customer or admin can cancel an order only if it is in `Placed` or `Confirmed` status. Once an order is `Shipped` or `Delivered`, cancellation is strictly rejected.
> - If an illegal status transition is attempted (e.g. attempting to jump from `Placed` directly to `Delivered`), the backend rejects it with HTTP `409 Conflict` (`INVALID_STATUS_TRANSITION`).
> - Furthermore, when an order is cancelled, our controller automatically restores the inventory stock (`$inc: { stock: quantity }`).

**Q6: What prevents fake reviews on products?**
> *Answer*: In Module 12, the `addProductReview` controller queries the `orders` collection to verify that the requesting user has an order containing that specific `productId` with `status: 'Delivered'`. If no delivered order exists, it rejects the request with `403 VERIFIED_PURCHASE_REQUIRED`. Additionally, a compound unique index `{ productId: 1, userId: 1 }` prevents a user from submitting multiple reviews for the same product.

**Q7: How does the discount coupon engine validate rules?**
> *Answer*: The coupon engine validates three layers of business rules:
> 1. Expiration check: `new Date() <= coupon.validTill`
> 2. Minimum order threshold: `orderAmount >= coupon.minOrderValue`
> 3. Discount calculation: calculates percentage or flat amount, respecting the `maxDiscount` cap if applicable.

**Q8: How does the Admin sales analytics aggregation pipeline work?**
> *Answer*: We use MongoDB's aggregation framework:
> - `$group` calculates total gross sales, discounts given, net revenue, total orders, and completed payment count.
> - Another stage groups by `paymentMode` and `status` to provide breakdowns.
> - For top selling products, we unwind the embedded `items` array, group by `productId`, sort by `totalUnitsSold: -1`, and use `$lookup` to attach the seller's name.

**Q9: How do you handle server errors to avoid crashing in production?**
> *Answer*: We implemented a centralized `globalErrorHandler` middleware. It intercepts:
> - Mongoose `CastError` (invalid ObjectId format) &rarr; `400 INVALID_ID`
> - MongoDB `code 11000` (Duplicate Key violation) &rarr; `409 DUPLICATE_ENTRY`
> - Mongoose `ValidationError` &rarr; `400 VALIDATION_ERROR`
> - Any unhandled error &rarr; `500 INTERNAL_ERROR`
> This guarantees that no unhandled rejection or syntax error causes the Node.js process to exit unexpectedly.
