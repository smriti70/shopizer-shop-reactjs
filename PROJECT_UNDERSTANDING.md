# Shopizer Shop — Technical & Functional Understanding

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Tech Stack](#3-tech-stack)
4. [Folder Structure](#4-folder-structure)
5. [Application Routing](#5-application-routing)
6. [Redux State Management](#6-redux-state-management)
7. [Data Flow Diagram](#7-data-flow-diagram)
8. [API Communication](#8-api-communication)
9. [Authentication Flow](#9-authentication-flow)
10. [Cart Flow](#10-cart-flow)
11. [Checkout & Payment Flow](#11-checkout--payment-flow)
12. [Configuration & Deployment](#12-configuration--deployment)
13. [Internationalization](#13-internationalization)
14. [Key Design Decisions](#14-key-design-decisions)

---

## 1. Project Overview

**Shopizer Shop** is the customer-facing React storefront for the [Shopizer](https://github.com/shopizer-ecommerce/shopizer) open-source e-commerce platform. It is a Single Page Application (SPA) that communicates with a Java/Spring Boot REST backend.

**Core capabilities:**
- Browse products by category or search
- View product details with variants/options
- Add to cart, manage cart
- Guest and authenticated checkout
- Stripe and Nuvei payment integration
- Customer account management (orders, addresses, profile)
- CMS content pages
- Multi-language support (English / French)
- Runtime-configurable theme and backend URL (no rebuild needed)

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               React SPA (CRA)                        │   │
│  │                                                      │   │
│  │  ┌─────────────┐   ┌──────────────┐  ┌───────────┐  │   │
│  │  │   Pages     │   │  Components  │  │ Wrappers  │  │   │
│  │  │  (Routes)   │──▶│  (UI Atoms)  │  │(Sections) │  │   │
│  │  └──────┬──────┘   └──────────────┘  └───────────┘  │   │
│  │         │                                            │   │
│  │  ┌──────▼──────────────────────────────────────┐    │   │
│  │  │              Redux Store                    │    │   │
│  │  │  multilanguage | productData | merchantData │    │   │
│  │  │  cartData | userData | content | loading    │    │   │
│  │  └──────┬──────────────────────────────────────┘    │   │
│  │         │                                            │   │
│  │  ┌──────▼──────┐   ┌──────────────────────────┐     │   │
│  │  │   Actions   │──▶│  WebService (Axios)       │     │   │
│  │  │  (Thunks)   │   │  + JWT Interceptor        │     │   │
│  │  └─────────────┘   └──────────┬───────────────┘     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                  │                          │
│         Cookie: cart ID          │  localStorage: JWT token │
└──────────────────────────────────┼──────────────────────────┘
                                   │ HTTP/REST
                    ┌──────────────▼──────────────┐
                    │   Shopizer Backend           │
                    │   (Java / Spring Boot)       │
                    │   /api/v1/...                │
                    └─────────────────────────────┘
```

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 16 |
| Routing | React Router v5 |
| State Management | Redux + Redux Thunk |
| State Persistence | redux-localstorage-simple (localStorage) |
| HTTP Client | Axios |
| Forms | React Hook Form |
| Styling | Bootstrap 4 + SCSS |
| Payments | Stripe (`@stripe/react-stripe-js`), Nuvei |
| i18n | redux-multilanguage |
| Notifications | react-toast-notifications |
| Carousel/Slider | react-id-swiper (Swiper 5) |
| Maps/Geocoding | google-maps-react, react-geocode |
| Cookie Management | universal-cookie |
| Build Tool | Create React App (react-scripts 4) |
| Deployment | Docker + Nginx |
| CI/CD | CircleCI |

---

## 4. Folder Structure

```
shopizer-shop-reactjs/
├── public/
│   ├── env-config.js          ← Runtime config (injected before React boots)
│   ├── assets/img/            ← Static images
│   └── index.html
├── src/
│   ├── index.js               ← Redux store creation + ReactDOM.render
│   ├── App.js                 ← Route definitions + cookie/language init
│   ├── pages/                 ← Page-level route components
│   │   ├── home/              ← Home page
│   │   ├── category/          ← Product listing
│   │   ├── product-details/   ← Product detail
│   │   ├── search-product/    ← Search results
│   │   ├── content/           ← CMS pages
│   │   └── other/             ← Cart, Checkout, Auth, Account, Orders
│   ├── components/            ← Reusable UI components (header, footer, product cards, etc.)
│   ├── wrappers/              ← Section-level layout wrappers (hero, tabs, newsletter, etc.)
│   ├── layouts/               ← Layout.js (header + footer shell)
│   ├── redux/
│   │   ├── actions/           ← Thunk action creators
│   │   └── reducers/          ← State reducers + rootReducer
│   ├── util/
│   │   ├── webService.js      ← Axios wrapper (GET/POST/PUT/DELETE/PATCH)
│   │   ├── constant.js        ← API endpoint path constants
│   │   └── helper.js          ← localStorage helpers, value validators
│   ├── translations/          ← english.json, french.json
│   └── assets/scss/           ← Global SCSS styles
├── conf/conf.d/               ← Nginx config (default.conf, gzip.conf)
├── Dockerfile
├── env.sh                     ← Injects env vars into env-config.js at container start
└── .circleci/config.yml
```

---

## 5. Application Routing

All routes are lazy-loaded via `React.lazy` + `Suspense`.

```
/                          → Home
/category/:id              → Category (product listing)
/product/:id               → Product Detail
/search/:id                → Search Results
/content/:id               → CMS Content Page
/cart                      → Shopping Cart
/checkout                  → Checkout (Stripe / Nuvei)
/order-confirm             → Order Confirmation
/order-details/:id         → Order Detail
/recent-order              → Order History
/login                     → Login
/register                  → Register
/forgot-password           → Forgot Password
/customer/:code/reset/:id  → Reset Password
/my-account                → Account Dashboard
/contact                   → Contact Form
/not-found                 → 404
*                          → 404 (catch-all)
```

---

## 6. Redux State Management

### Store Initialization (`src/index.js`)

```
createStore(rootReducer, load(), composeWithDevTools(applyMiddleware(thunk, save())))
                              ↑                                              ↑
                    Hydrates from localStorage                  Auto-saves to localStorage
```

### State Shape

```
Redux Store
├── multilanguage          { currentLanguageCode: "en" | "fr" }
├── productData            { products[], productID, categoryID }
├── merchantData           { merchant{}, storeCode }
├── cartData               { cartID, cartItems{}, cartCount, orderID }
├── userData               { user{}, countries[], shippingCountries[], states[], currentAddress[] }
├── content                { content{} }
└── loading                { isLoading: bool }
```

### Reducers & Actions Map

```
┌─────────────────┬──────────────────────────────────────────────────────┐
│ Reducer         │ Actions                                              │
├─────────────────┼──────────────────────────────────────────────────────┤
│ cartReducer     │ GET_CART, GET_SHOPIZER_CART_ID, DELETE_FROM_CART,    │
│                 │ DELETE_ALL_FROM_CART                                 │
├─────────────────┼──────────────────────────────────────────────────────┤
│ userReducer     │ SET_USER, SET_COUNTRY, SET_SHIPPING_COUNTRY,         │
│                 │ SET_STATE, SET_SHIP_STATE, GET_CURRENT_ADDRESS       │
├─────────────────┼──────────────────────────────────────────────────────┤
│ storeReducer    │ SET_MERCHANT, SET_STORE                              │
├─────────────────┼──────────────────────────────────────────────────────┤
│ productReducer  │ FETCH_PRODUCTS_SUCCESS, SET_PRODUCT_ID,              │
│                 │ SET_CATEGORY_ID                                      │
├─────────────────┼──────────────────────────────────────────────────────┤
│ loaderReducer   │ SET_LOADER                                           │
├─────────────────┼──────────────────────────────────────────────────────┤
│ contentReducer  │ SET_CONTENT                                          │
└─────────────────┴──────────────────────────────────────────────────────┘
```

---

## 7. Data Flow Diagram

```
User Interaction
      │
      ▼
  Component
      │  dispatch(action)
      ▼
  Redux Action (Thunk)
      │  dispatch(setLoader(true))
      │
      ├──▶ WebService.get/post/put/delete()
      │         │
      │         │  Axios + JWT interceptor
      │         ▼
      │    Shopizer REST API
      │         │
      │         ▼
      │    API Response
      │         │
      ◀─────────┘
      │  dispatch({ type, payload })
      ▼
  Reducer → New State
      │
      ▼
  Component re-renders
      │
      ▼
  dispatch(setLoader(false))
```

---

## 8. API Communication

All HTTP calls go through `src/util/webService.js`, a thin Axios wrapper.

**Base URL:** `window._env_.APP_BASE_URL + window._env_.APP_API_VERSION`  
(e.g. `http://localhost:8080/api/v1/`)

**Request Interceptor** — attaches JWT Bearer token from localStorage:
```
Authorization: Bearer <token>
```

**Response Interceptor** — handles 401/404 by rejecting the promise (caller handles error).

### Key API Endpoints (from `constant.js`)

```
store/{merchant}           ← Merchant/store info
category/                  ← Product categories
products/                  ← Product listings
product/{id}               ← Product detail
cart/                      ← Cart CRUD
auth/customer/cart         ← Authenticated cart
checkout                   ← Place order
orders/                    ← Order history
customer/                  ← Customer profile
auth/                      ← Login / token
register                   ← Registration
password/reset/            ← Password reset
country/                   ← Country list
zones/                     ← State/province list
shipping/country           ← Shipping countries
search/                    ← Product search
newsletter/                ← Newsletter subscription
contact/                   ← Contact form
content/pages/             ← CMS pages
```

---

## 9. Authentication Flow

```
┌──────────┐     POST /api/v1/login      ┌─────────────┐
│  Login   │ ──────────────────────────▶ │  Backend    │
│  Form    │ ◀────────────────────────── │             │
└──────────┘     { token, customer }     └─────────────┘
      │
      │  dispatch(setUser({ token, customer }))
      ▼
  Redux userData  ──▶  localStorage (via redux-localstorage-simple)
      │
      │  All subsequent requests:
      ▼
  Axios interceptor reads token from localStorage
  → sets Authorization: Bearer <token>
```

**Guest users** can browse and add to cart without logging in. Cart is identified by a server-generated cart code stored in a browser cookie (`{MERCHANT}_shopizer_cart`).

**Password Reset Flow:**
```
Forgot Password → POST /password/request/  → Email sent
Email link → /customer/:code/reset/:id     → POST /password/reset/
```

---

## 10. Cart Flow

```
                    ┌─────────────────────────────────┐
                    │         Cart Cookie              │
                    │  {MERCHANT}_shopizer_cart = code │
                    └────────────┬────────────────────┘
                                 │ on app load (App.js useEffect)
                                 ▼
                    dispatch(setShopizerCartID(code))
                                 │
                                 ▼
                         cartData.cartID

Add to Cart
    │
    ├── cartID exists?  ──YES──▶ PUT  /cart/{cartID}?store={merchant}
    │                            (update existing cart)
    └── No             ──────▶ POST /cart/?store={merchant}
                                (create new cart)
                                 │
                                 ▼
                    Response: { code, products[], quantity }
                                 │
                    ┌────────────┴──────────────┐
                    │  setShopizerCartID(code)   │  ← saves to cookie + localStorage
                    │  getCart(code, userData)   │  ← refreshes cart state
                    └───────────────────────────┘

Delete Item
    │
    ▼
DELETE /cart/{cartID}/product/{itemId}?store={merchant}
    │
    ▼
If cart empty → remove cookie + clear cartData
Else         → update cartCount in state
```

---

## 11. Checkout & Payment Flow

```
Checkout Page
      │
      ├── Load shipping countries  (GET /shipping/country)
      ├── Load billing countries   (GET /country)
      ├── Load states on country select (GET /zones?code=XX)
      │
      ▼
User fills billing/shipping form (react-hook-form validation)
      │
      ▼
  ┌───────────────────────────────────────────────┐
  │  Payment Type (APP_PAYMENT_TYPE in env)        │
  ├───────────────────────────────────────────────┤
  │  STRIPE  → Stripe CardElement                 │
  │            stripe.createPaymentMethod()        │
  │            → paymentMethodId sent to backend   │
  │                                               │
  │  NUVEI   → Nuvei JS SDK (loaded via Script)   │
  │            → terminal ID + secret from env    │
  └───────────────────────────────────────────────┘
      │
      ▼
POST /checkout
  { billing, delivery, payment: { paymentMethodType, ... } }
      │
      ▼
  Order Created → dispatch(deleteAllFromCart())
      │
      ▼
Redirect → /order-confirm
```

---

## 12. Configuration & Deployment

### Runtime Configuration (`public/env-config.js`)

Loaded by `index.html` before React boots, making all values available as `window._env_.*`.

```js
window._env_ = {
  APP_BASE_URL:           "http://localhost:8080",   // Backend URL
  APP_API_VERSION:        "/api/v1/",
  APP_MERCHANT:           "DEFAULT",                 // Merchant code
  APP_PRODUCT_GRID_LIMIT: "15",
  APP_PAYMENT_TYPE:       "STRIPE",                  // STRIPE | NUVEI
  APP_STRIPE_KEY:         "pk_test_...",
  APP_NUVEI_TERMINAL_ID:  "",
  APP_NUVEI_SECRET:       "",
  APP_MAP_API_KEY:        "",                        // Google Maps
  APP_THEME_COLOR:        "#D1D1D1",                 // CSS variable
  APP_PRODUCTION:         "false"
}
```

### Docker Deployment

```
docker build . -t shopizerecomm/shopizer-shop:latest

docker run \
  -e "APP_MERCHANT=DEFAULT" \
  -e "APP_BASE_URL=http://your-backend:8080" \
  -p 80:80 shopizerecomm/shopizer-shop:latest
```

`env.sh` runs at container startup, writes env vars into `env-config.js` — **no rebuild required** to change backend URL or merchant.

### Nginx
- Serves the built React app as static files
- `conf/conf.d/default.conf` — SPA routing (all paths → `index.html`)
- `conf/conf.d/gzip.conf` — gzip compression enabled

### CI/CD
- CircleCI pipeline defined in `.circleci/config.yml`

---

## 13. Internationalization

- Powered by `redux-multilanguage`
- Languages loaded in `App.js` from `src/translations/english.json` and `src/translations/french.json`
- Language code stored in Redux (`multilanguage.currentLanguageCode`)
- Language code is passed as `?lang=en|fr` query param on API calls (products, cart, etc.)
- Components access strings via `multilanguage` HOC → `strings` prop

---

## 14. Key Design Decisions

| Decision | Detail |
|---|---|
| Runtime config via `window._env_` | Allows Docker deployments to change backend URL, merchant, payment keys without rebuilding the app |
| Cart persisted in cookie | Cart survives page refresh and browser close; cookie keyed by merchant code supports multi-tenant setups |
| Redux state persisted to localStorage | Full Redux state (cart, user, language) survives page refresh via `redux-localstorage-simple` |
| Lazy loading all pages | Reduces initial bundle size; each page is a separate chunk loaded on demand |
| Central `WebService` class | Single place to manage base URL, auth headers, and error handling for all API calls |
| JWT in localStorage | Token read by Axios interceptor on every request; no manual token passing needed in components |
| Theme color as CSS variable | `--theme-color` set on `:root` at runtime from `APP_THEME_COLOR`, allowing white-label theming without CSS changes |
| Guest cart + authenticated cart merge | Backend merges guest cart into customer cart on login using the cart code |
