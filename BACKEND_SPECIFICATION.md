# Urban Pulse (GreenSathi) - Complete Backend Architecture & API Documentation

## 1. Database Overview & Tech Stack
- **Database**: MongoDB (via Mongoose ODM) with 2dsphere GeoJSON spatial indexing.
- **Authentication**: Session-based authentication via `passport-local` + `connect-mongo`, alongside JWT for Committee portal access, and OTP (Twilio / SMS) verification.
- **File Storage**: Cloudinary & in-memory Multer for image processing and YOLO vision inference.
- **Payment Gateway**: Razorpay for e-commerce transactions & green coin settlements.

---

## 2. Android App (APK) Integration Architecture

### Android Networking Notes (Retrofit / OkHttp)
1. **Base URL Configuration (`BuildConfig.BACKEND_URL`)**:
   - **Local Android Emulator**: `http://10.0.2.2:5000/` (maps to Host `localhost:5000`)
   - **Physical Device**: `http://<YOUR_LAN_IP>:5000/` or your deployed Cloud URL (e.g. `https://urbanpulse-api.onrender.com/`).
2. **Session Cookie Management (Critical for Android)**:
   - The backend uses Express session cookies (`connect.sid`).
   - In your OkHttp Client in Kotlin, attach a persistent `JavaNetCookieJar` or custom `Interceptor` so session cookies returned from `/auth/login` and `/auth/sign-up` are stored and attached to subsequent requests.
   ```kotlin
   val cookieManager = CookieManager().apply { setCookiePolicy(CookiePolicy.ACCEPT_ALL) }
   val okHttpClient = OkHttpClient.Builder()
       .cookieJar(JavaNetCookieJar(cookieManager))
       .connectTimeout(30, TimeUnit.SECONDS)
       .readTimeout(30, TimeUnit.SECONDS)
       .build()
   ```
3. **Multipart Form Requests (Uploads)**:
   - For image uploads (`POST /reports/` and `POST /reports/:id/resolve`), use `MultipartBody.Part` for `image` / `resolvedImage` and `RequestBody` for latitude, longitude, remarks, and type.

---

## 3. User Roles & Permissions
The backend recognizes 5 distinct user roles defined in `User.role` plus standalone Committee portal accounts:

1. **`user` (Citizen / Resident)**:
   - Report civic & environmental issues (garbage, pothole, road hazards, etc.).
   - Track reports and earn reward points / `greenCoins`.
   - Submit recyclable waste for cash/points.
   - Register for community cleanup events.
   - Browse the eco-shop, manage cart, place orders via Razorpay.
   - Register a local Committee / Resident Welfare Association.

2. **`official` (Municipal Officer / Ward Authority)**:
   - View, audit, and manage civic reports across jurisdictions.
   - Allocate pending civic hazard reports to on-duty OSPs (On-Site Personnel).
   - Create municipal events and recycling franchisees.
   - Verify waste pickup submissions.

3. **`osp` (On-Site Personnel / Ground Field Worker)**:
   - Toggle on-duty / off-duty status (`isOnDuty`).
   - View assigned civic reports with geo-coordinates.
   - Resolve reports by submitting after-cleanup geo-tagged photos (`resolvedImg`).

4. **`vendor` (Recycling Franchisee / Waste Collector)**:
   - View recycling pickup requests and nearby collection events.
   - Manage accepted waste types, pricing, and assigned vendor pickups.
   - Mark waste as `collected` and initiate financial settlements.

5. **`admin` (Super Admin)**:
   - Full CRUD over users, reports, committees, waste types, orders, and settlements.
   - Approve / Reject committee onboarding requests.
   - Trigger vendor payouts and system-wide configurations.

6. **`Committee` (Standalone entity)**:
   - Authenticated via JWT token (`/committees/login`).
   - Manage local community members, cleanup initiatives, and view community leaderboard ranking.

---

## 4. Database Collections & Schemas (Tables)

### 1. `users` (User Schema)
Stores citizen, official, osp, vendor, and admin profiles.
- **Fields**:
  - `fname`, `lname`, `username`, `email` (unique), `phone` (unique), `aadhar` (unique)
  - `gender`, `dob`, `address`, `profileImg`
  - `role`: enum `["user", "admin", "official", "osp", "vendor"]`
  - `points` (Number), `greencoins` (Number, virtual: `greenCoins`)
  - `isOnDuty` (Boolean, for OSP workers)
  - `reports`: Array of ObjectIds (`Report` refs)
  - `committee`: ObjectId (`Committee` ref)
  - `cart`: Array of items `[{ id, name, price, description, img, category, quantity }]`
  - `otp`, `otpExpires`, `isOtpVerified`

### 2. `reports` (Report Schema)
Civic issues reported by citizens (garbage, potholes, road hazards, drainage/sewage).
- **Fields**:
  - `reportImg` (String, URL)
  - `reportYoloImg` (String, AI annotated image URL)
  - `reportType`: enum `["garbage", "pothole", "blind_turn", "road_hazard", "drainage"]`
  - `severity`: enum `["low", "medium", "high", "critical"]`
  - `landmark` (String)
  - `location`: `{ type: "Point", coordinates: [lng, lat] }` (2dsphere indexed)
  - `status`: enum `["pending", "allotted", "resolved"]`
  - `reportOwner`: ObjectId (`User` ref)
  - `assignedTo`: ObjectId (`User` ref - OSP worker)
  - `resolvedImg`: String URL
  - `resolvedLocation`: GeoJSON Point
  - `remarks`, `time` (Timestamp)

### 3. `committees` (Committee Schema)
Resident welfare associations and locality committees.
- **Fields**:
  - `committeeName` (unique), `description`, `localityType` (`"Society"`, `"Colony"`, `"Village"`, etc.)
  - `approxHouseholds` (Number)
  - `leaderName`, `leaderEmail` (unique), `leaderPhone`, `password` (bcrypt hashed)
  - `address`: `{ line1, line2, area, city, district, state, pincode, landmark }`
  - `committeeLocation`: GeoJSON Point (2dsphere indexed)
  - `members`: Array of `User` ObjectIds
  - `committeeStatus`: enum `["PENDING", "UNDER_PROCESS", "APPROVED", "REJECTED"]`
  - `isKycVerified`, `isCommitteeVerified`, `kycRemarks`

### 4. `events` (Event Schema)
Cleanup drives, green marathons, and environmental awareness workshops.
- **Fields**:
  - `eventName`, `eventHostedBy`, `eventDescription`, `eventDateTime`
  - `eventLocation` (String text)
  - `eventLocationData`: GeoJSON Point (2dsphere indexed)
  - `registrations`: Array of `EventRegistration` ObjectIds
  - `eventActive` (Boolean)

### 5. `eventregistrations` (EventRegistration Schema)
Join records linking users with events.
- **Fields**: `event` (ObjectId), `user` (ObjectId), `registeredAt` (Date)

### 6. `wastetypes` (WasteType Schema)
Master catalog of accepted recyclables.
- **Fields**: `name` (Plastic, E-Waste, Metal, Paper, etc.), `pricePerKg`, `category`, `description`

### 7. `franchisees` (Franchisee Schema)
Authorized recycling hub / vendor facility.
- **Fields**:
  - `name`, `owner` (`User` ref), `phone`, `email`
  - `address`, `location` (GeoJSON Point)
  - `acceptedWasteTypes`: Array of `WasteType` ObjectIds
  - `operatingHours`, `isActive`

### 8. `wastesubmissions` (WasteSubmission Schema)
Recycling pickup or drop-off requests initiated by users.
- **Fields**:
  - `user` (ObjectId), `wasteType` (ObjectId), `franchisee` (ObjectId), `vendor` (ObjectId)
  - `weightKg`, `estimatedAmount`, `finalAmount`
  - `pickupMethod`: enum `["self", "vendor"]`
  - `status`: enum `["pending", "approved", "vendor-assigned", "collected", "verified", "paid", "rejected"]`
  - `images`: Array of URLs, `notes`

### 9. `vendorevents` & `vendorsettlements`
Vendor collection runs, route records, and payout settlement ledgers.

### 10. `orders` (Order Schema)
Eco-store product purchases.
- **Fields**:
  - `orderedBy` (`User` ref)
  - `items`: `[{ id, name, price, description, img, category, quantity }]`
  - `totalAmount`
  - `orderStatus`: enum `["pending", "created", "paid", "processing", "shipped", "delivered", "cancelled"]`
  - `paymentStatus`: enum `["pending", "failed", "paid"]`
  - `paymentMethod`: enum `["razorpay", "cod"]`
  - `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`
  - `shippingAddress`

---

## 5. Complete API Directory

### Authentication & Users (`/auth`, `/profile`)
| Method | Endpoint | Auth / Role | Android Usage / Details |
|---|---|---|---|
| `GET` | `/auth/check` | Public / Session | Checks session state, returns current authenticated user DTO |
| `GET` | `/auth/users` | Admin | Get list of all users |
| `POST` | `/auth/send-otp` | Public | Body: `{ phone }` — sends 6-digit OTP |
| `POST` | `/auth/verify-otp` | Public | Body: `{ phone, otp }` — verifies OTP |
| `POST` | `/auth/sign-up` | Public | Body: `{ username, email, phone, aadhar, password, fname, lname, gender, dob, address, role }` |
| `POST` | `/auth/login` | Public | Body: `{ username, password }` — sets session cookie |
| `POST` | `/auth/logout` | Logged in | Clears session cookie |
| `GET` | `/profile` | Logged in | Returns user profile, stats, greenCoins |
| `PUT` | `/profile` | Logged in | Updates profile data / avatar |

---

### Civic Hazard Reporting (`/reports`)
| Method | Endpoint | Auth / Role | Android Usage / Details |
|---|---|---|---|
| `GET` | `/reports` | Admin, Official | Fetch all civic reports |
| `POST` | `/reports` | Logged in (User) | Multipart: `image` (File), `type` ("garbage"/"pothole"/etc), `latitude`, `longitude`, `remarks`, `landmark` |
| `GET` | `/reports/my-reports` | Logged in | Fetch reports submitted by logged-in user |
| `GET` | `/reports/assigned` | OSP | Fetch reports assigned to logged-in OSP worker |
| `GET` | `/reports/:id` | Admin, Official, OSP | Report detail view |
| `POST` | `/reports/:id` | Admin | Update status |
| `POST` | `/reports/:id/assign` | Admin, Official | Body: `{ ospId }` — Assign task to OSP |
| `POST` | `/reports/:id/resolve` | OSP | Multipart: `resolvedImage` (File), `latitude`, `longitude`, `remarks` |

---

### On-Site Personnel Management (`/osp`)
| Method | Endpoint | Auth / Role | Android Usage / Details |
|---|---|---|---|
| `GET` | `/osp/active` | Admin, Official | Get active/online field officers |
| `POST` | `/osp/toggle-duty` | OSP | Toggle `isOnDuty` boolean state |

---

### Green Committees & RWAs (`/committees`)
| Method | Endpoint | Auth / Role | Android Usage / Details |
|---|---|---|---|
| `GET` | `/committees` | Public | Get public committee list & leaderboard |
| `POST` | `/committees/register` | Logged in | Register new residential committee |
| `POST` | `/committees/login` | Public | Header / response returns JWT token |
| `GET` | `/committees/committee`| Committee JWT | Header: `Authorization: Bearer <token>` |
| `GET` | `/committees/:id/status`| Public | Check approval status |
| `GET` | `/committees/:id/data` | Committee JWT | Get committee stats & analytics |
| `GET` | `/committees/:id/users`| Committee JWT | Get member users |
| `POST` | `/committees/approve/:cid` | Admin | Approve committee |
| `POST` | `/committees/reject/:cid` | Admin | Reject committee |

---

### Waste Recycling & Franchisees (`/recycle`, `/official`, `/waste-submission`)
| Method | Endpoint | Auth / Role | Android Usage / Details |
|---|---|---|---|
| `GET` | `/recycle/franchisees` | Public | List all recycling hubs |
| `GET` | `/recycle/franchisees/near-me` | Public | Query: `?lat=...&lng=...&distance=...` |
| `GET` | `/recycle/types` | Public | Get all waste categories & rates |
| `POST` | `/recycle/create` | Logged in (User) | Body: `{ wasteTypeId, weightKg, pickupMethod, franchiseeId, notes }` |
| `GET` | `/recycle/my-requests` | Logged in (User) | View own submitted waste requests |
| `POST` | `/recycle/types` | Admin | Create waste type rate |
| `PATCH` | `/recycle/types/:id` | Admin | Update waste type rate |
| `DELETE`| `/recycle/types/:id` | Admin | Delete waste type |
| `GET` | `/recycle/franchisee/requests` | Vendor | Incoming requests for franchisee |
| `PATCH` | `/recycle/franchisee/requests/:id/assign-vendor` | Vendor | Assign driver/vendor to pickup |
| `PATCH` | `/recycle/franchisee/requests/:id/approve` | Vendor | Approve weight and amount |
| `PATCH` | `/recycle/franchisee/requests/:id/reject` | Vendor | Reject request |
| `POST` | `/official/franchisee/create` | Admin, Official | Create recycling franchisee center |
| `GET` | `/waste-submission/` | Admin | All waste submissions |
| `GET` | `/waste-submission/assigned` | Vendor | Assigned pickups for vendor |
| `PATCH` | `/waste-submission/requests/:id/collected` | Vendor | Mark collected |
| `PATCH` | `/waste-submission/requests/:id/verify` | Admin, Official | Verify waste collection |
| `PATCH` | `/waste-submission/requests/:id/pay` | Admin | Release greenCoins or cash payout |
| `POST` | `/waste-submission/vendor/settlement` | Vendor | Submit collection settlement batch |

---

### Eco-Shop & Orders (`/shop`)
| Method | Endpoint | Auth / Role | Android Usage / Details |
|---|---|---|---|
| `GET` | `/shop` | Public | Get product catalog |
| `GET` | `/shop/:id` | Public | Single product details |
| `GET` | `/shop/user-cart` | Logged in | Get cart items |
| `POST` | `/shop/:id/add-to-cart` | Logged in | Add item to cart |
| `POST` | `/shop/:id/remove-from-cart` | Logged in | Remove item |
| `PATCH` | `/shop/:id/increase-qty` | Logged in | Quantity + 1 |
| `PATCH` | `/shop/:id/decrease-qty` | Logged in | Quantity - 1 |
| `DELETE`| `/shop/empty-cart` | Logged in | Empty cart |
| `POST` | `/shop/create-rzp-order` | Logged in | Create Razorpay order |
| `POST` | `/shop/verify-rzp-payment` | Logged in | Verify Razorpay payment |
| `POST` | `/shop/place-order` | Logged in | Place COD or completed order |

---

### Community Events (`/events`)
| Method | Endpoint | Auth / Role | Android Usage / Details |
|---|---|---|---|
| `GET` | `/events` | Public | Fetch cleanup & green events |
| `GET` | `/events/:id` | Public | Event detail view |
| `POST` | `/events` | Admin, Official | Create event |
| `PUT` | `/events/:id` | Admin, Official | Update event |
| `POST` | `/events/:id` | Logged in | Register / RSVP for event |
| `POST` | `/events/:id/unregister` | Logged in | Cancel RSVP |
