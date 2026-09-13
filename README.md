# FinGuard ERP - Supply Chain Fraud Detection & ERP Platform

FinGuard ERP is an enterprise-grade Enterprise Resource Planning (ERP) and Supply Chain Finance Fraud Detection platform. It integrates complete Sales & Distribution (SD) workflows with intelligent, multi-tier fraud detection algorithms to protect financial institutions and supply chain participants from fraudulent financing requests, phantom invoices, duplicate financing, and unauthorized invoice inflation.

---

## 🚀 Key Features

### 1. Multi-Role Enterprise Architecture
- **Admin (`ROLE_ADMIN`):** Full system administration, user management, audit logs, and global system configuration.
- **Supplier (`ROLE_SUPPLIER`):** Master data management (Categories, Products, Customers, Inventory), Sales Orders creation, Invoice generation, and Financing Requests.
- **Fraud Analyst (`ROLE_FRAUD_ANALYST`):** Real-time automated fraud scoring, anomaly detection, review checklists, and analyst override decisions.
- **Bank Officer (`ROLE_BANK_OFFICER`):** Review financing applications, inspect risk scores, and approve or reject bank disbursements.

### 2. Supply Chain Finance Fraud Detection Engine
Automated rule-based verification matrix calculating dynamic fraud risk scores (0–100):
- **Customer Verification:** Validates GST and registered tax identity.
- **Sales Order & Shipment Cross-Check:** Verifies goods movement and dispatch tracking before funding approval.
- **Invoice Verification:** Enforces non-draft status and upstream parent lineage.
- **Amount Consistency Matching:** Flags requests where the requested financing amount exceeds invoice valuation.
- **Duplicate Invoice & Duplicate Financing Protection:** Flags double-pledging across multiple banking entities.
- **System Recommendation Matrix:** Categorizes requests into `SAFE`, `SUSPICIOUS`, or `HIGH_RISK`.

### 3. Core ERP Business Modules
- **Master Data:** Customers, Categories, Products, and Real-Time Inventory tracking.
- **Sales & Distribution (SD):**
  - Sales Order Lifecycle (`PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`).
  - Invoice Lifecycle (`DRAFT` → `ISSUED` → `PAID` → `FINANCED` → `CANCELLED`).
  - Shipment Logistics & Dispatch tracking.
- **Financing Management:** Invoice-backed financing request applications with real-time status tracking.
- **Audit Logging:** Tamper-evident logging of all critical actions and decisions across the platform.

---

## 🛠️ Technology Stack

### Backend
- **Language & Framework:** Java 17, Spring Boot 3
- **Security:** Spring Security 6 with stateless JWT authentication & BCrypt password hashing
- **Data Persistence:** Spring Data JPA / Hibernate with MySQL
- **Architecture:** Enterprise Layered Architecture (`Controller` → `Service` → `Repository` → `Entity` / `DTO`)
- **Build Tool:** Maven (includes `mvnw` wrapper)

### Frontend
- **Framework:** React, Vite
- **Styling:** Modern enterprise dashboard design with responsive layouts
- **Routing & State:** React Router DOM, React Context API for global authentication state
- **API Communication:** Axios with JWT Bearer interceptors & automatic 401 handling

---

## 📂 Project Structure

```text
FinGuard-ERP/
├── backend/                              # Spring Boot 3 Backend
│   ├── src/main/java/com/finguard/
│   │   ├── config/                       # Security & Web Configurations
│   │   ├── controller/                   # REST API Controllers
│   │   ├── dto/                          # Data Transfer Objects
│   │   ├── entity/                       # JPA Database Entities
│   │   ├── exception/                    # Global Exception Handling
│   │   ├── repository/                   # Spring Data JPA Repositories
│   │   ├── security/                     # JWT Filters & UserDetailsService
│   │   └── service/                      # Core Business Logic & Fraud Engine
│   ├── src/main/resources/
│   │   └── application.yml               # Database & JWT Application Settings
│   └── pom.xml                           # Maven Dependencies & Build Configuration
│
├── frontend/                             # React + Vite Frontend
│   ├── src/
│   │   ├── assets/                       # Static Assets & Icons
│   │   ├── components/                   # Reusable UI Components (Sidebar, TopNav)
│   │   ├── context/                      # AuthContext & Session Management
│   │   ├── layouts/                      # Main Dashboard Layout Wrapper
│   │   ├── pages/                        # Role-specific Dashboard & ERP Views
│   │   ├── routes/                       # Protected & Role-Based Routing
│   │   ├── services/                     # Axios API Service Modules
│   │   └── theme/                        # Design System & Styling Tokens
│   ├── package.json                      # NPM Dependencies
│   └── vite.config.js                    # Vite Configuration
│
└── README.md                             # Project Documentation
```

---

## 🚦 Getting Started

### Prerequisites
- **Java:** JDK 17+
- **Node.js:** Node 18+ and npm
- **Database:** MySQL 8.0+ running on `localhost:3306`

### 1. Database Setup
Create the MySQL database:
```sql
CREATE DATABASE IF NOT EXISTS finguard_db;
```

Update `backend/src/main/resources/application.yml` with your MySQL credentials if different from default (`root` / `password`).

### 2. Backend Setup
```bash
cd backend
./mvnw clean spring-boot:run
```
*The Spring Boot server will start on port `8080` and auto-seed initial demo accounts and business data.*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The React application will be available at `http://localhost:5173`.*

---

## 👥 Default Demo Credentials

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `password` | Complete system & audit control |
| **Supplier** | `supplier1` | `password` | Orders, Invoices, Financing requests |
| **Fraud Analyst** | `analyst1` | `password` | Fraud detection reports & overrides |
| **Bank Officer** | `bank1` | `password` | Credit approval & loan disbursement |

---

## 📄 License
This project is proprietary and intended for enterprise evaluation and academic demonstration.
