# BÃO CÃO BÃ€N GIAO HIá»†N TRáº NG TÃCH Há»¢P API - LAUNDRYGO

TÃ i liá»‡u nÃ y ghi nháº­n hiá»‡n tráº¡ng tÃ­ch há»£p API giá»¯a há»‡ thá»‘ng Backend (Spring Boot) vÃ  Frontend (React) cho dá»± Ã¡n sÃ n thÆ°Æ¡ng máº¡i Ä‘iá»‡n tá»­ giáº·t á»§i LaundryGo táº¡i má»‘c bÃ n giao má»›i nháº¥t.

---

## 1. Nháº­t kÃ½ cáº­p nháº­t má»›i nháº¥t (Má»‘c 29/06/2026)

*   **Luá»“ng Xem Chi tiáº¿t Cá»­a hÃ ng (`/all-shops/:id`):** ÄÃ£ hoÃ n táº¥t káº¿t ná»‘i dá»¯ liá»‡u thá»±c táº¿ tá»« Database thÃ´ng qua API vÃ  xá»­ lÃ½ triá»‡t Ä‘á»ƒ cÃ¡c lá»—i crash há»‡ thá»‘ng.
*   **Backend (Spring Boot) Bug-fix & Tá»‘i Æ°u:**
    *   **Loáº¡i bá» ClassCastException:** TÃ¡ch biá»‡t luá»“ng query thá»±c thá»ƒ `Shop` vÃ  Ä‘á»‹a chá»‰ `ShopAddress` thay vÃ¬ sá»­ dá»¥ng cÃ¢u lá»‡nh JPQL JOIN FETCH phá»©c táº¡p kÃ¨m `GROUP BY` Ä‘a dÃ²ng dá»… gÃ¢y lá»—i Ã©p kiá»ƒu máº£ng `Object[]`.
    *   **Kháº¯c phá»¥c lá»—i Hibernate Double-wrapping:** Chuyá»ƒn Ä‘á»•i kiá»ƒu tráº£ vá» cá»§a cÃ¢u query aggregate (láº¥y Ä‘iá»ƒm rating trung bÃ¬nh vÃ  thá»i gian xá»­ lÃ½ tá»‘i thiá»ƒu) tá»« `Optional<Object[]>` sang `List<Object[]>` Ä‘á»ƒ trÃ¡nh Hibernate tá»± Ä‘á»™ng bá»c thÃªm má»™t lá»›p máº£ng (`Object[][]`), giÃºp viá»‡c unwrap dá»¯ liá»‡u diá»…n ra an toÃ n.
    *   **VÃ¡ lá»—i cÃº phÃ¡p soft-delete:** Sá»­a Ä‘á»•i cÃ¢u query táº¡i `ShopAddressRepository` Ä‘á»ƒ map chÃ­nh xÃ¡c thuá»™c tÃ­nh `isDeleted` káº¿ thá»«a tá»« `BaseEntity`.
*   **Frontend (React) Adapter:**
    *   CÃ i Ä‘áº·t hÃ m adapter `mapBackendShopToFrontend` trong `AllShopsDetail.jsx` Ä‘á»ƒ chuyá»ƒn Ä‘á»•i cáº¥u trÃºc gÃ³i tin cá»§a Backend sang Ä‘Ãºng cáº¥u trÃºc Object hiá»ƒn thá»‹ cá»§a Frontend.
    *   TÃ­ch há»£p cÃ¡c cÆ¡ cháº¿ fallback an toÃ n (Default Services, Hours, Promo, Reviews) Ä‘áº£m báº£o giao diá»‡n hiá»ƒn thá»‹ mÆ°á»£t mÃ  ngay cáº£ khi DB local thiáº¿u cÃ¡c trÆ°á»ng thÃ´ng tin hiá»ƒn thá»‹ phá»¥ trá»£.

---

## 2. Báº£ng phÃ¢n loáº¡i danh sÃ¡ch API (API Matrix)

| PhÃ¢n há»‡/Domain | Method | Endpoint BE | Tráº¡ng thÃ¡i | File FE tÆ°Æ¡ng á»©ng | Ghi chÃº |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `POST` | `/api/v1/auth/login` | **ÄÃƒ Ná»I** | `src/utils/auth.js` | TÃ­ch há»£p thÃ nh cÃ´ng |
| **Authentication** | `POST` | `/api/v1/auth/register` | **ÄÃƒ Ná»I** | `src/utils/auth.js` | TÃ­ch há»£p thÃ nh cÃ´ng |
| **Authentication** | `POST` | `/api/v1/auth/logout` | **ÄÃƒ Ná»I** | `src/utils/auth.js` | TÃ­ch há»£p thÃ nh cÃ´ng |
| **User Profile** | `GET` | `/api/v1/users/profile` | **ÄÃƒ Ná»I** | `src/Information/UserInformation.jsx` | Láº¥y thÃ´ng tin tÃ i khoáº£n |
| **User Profile** | `GET` | `/api/v1/users/profile/summary` | **ÄÃƒ Ná»I** | `src/Information/UserInformation.jsx` | Láº¥y thá»‘ng kÃª Ä‘Æ¡n hÃ ng/Ä‘á»‹a chá»‰ |
| **User Profile** | `PUT` | `/api/v1/users/profile` | **ÄÃƒ Ná»I** | `src/Information/UserInformation.jsx` | Cáº­p nháº­t thÃ´ng tin cÃ¡ nhÃ¢n |
| **Shop Public** | `GET` | `/api/v1/shops` | **ÄÃƒ Ná»I** | `src/AllShops/AllShops.jsx` | Danh sÃ¡ch cá»­a hÃ ng cÃ´ng khai |
| **Shop Public** | `GET` | `/api/v1/shops/{shopId}` | **ÄÃƒ Ná»I** | `src/AllShops/AllShopsDetail.jsx` | Xem chi tiáº¿t cá»­a hÃ ng |
| **Shop Owner** | `*` | `/api/v1/shop-owner/*` | **ÄÃƒ Ná»I** | *(Shop Owner Dashboard)* | Luá»“ng quáº£n lÃ½ cá»§a chá»§ cá»­a hÃ ng |
| **Schedule / Booking** | `GET` | `/api/v1/schedules/pickup-dates` | **DA NOI** | `src/PicanDeli/PicanDeli.jsx` | ÄÃ£ kháº£o sÃ¡t há»£p Ä‘á»“ng dá»¯ liá»‡u |
| **Schedule / Booking** | `GET` | `/api/v1/schedules/pickup-slots` | **DA NOI** | `src/PicanDeli/PicanDeli.jsx` | ÄÃ£ kháº£o sÃ¡t há»£p Ä‘á»“ng dá»¯ liá»‡u |
| **Schedule / Booking** | `GET` | `/api/v1/schedules/delivery-dates` | **DA NOI** | `src/PicanDeli/PicanDeli.jsx` | ÄÃ£ kháº£o sÃ¡t há»£p Ä‘á»“ng dá»¯ liá»‡u |
| **Schedule / Booking** | `GET` | `/api/v1/schedules/delivery-slots` | **DA NOI** | `src/PicanDeli/PicanDeli.jsx` | ÄÃ£ kháº£o sÃ¡t há»£p Ä‘á»“ng dá»¯ liá»‡u |
| **Delivery Address** | `GET` | `/api/v1/delivery-addresses` | **DA NOI** | `src/PicanDeli/PicanDeli.jsx` | ÄÃ£ kháº£o sÃ¡t há»£p Ä‘á»“ng dá»¯ liá»‡u |
| **Delivery Address** | `POST` | `/api/v1/delivery-addresses` | **DA NOI** | `src/PicanDeli/PicanDeli.jsx` | ÄÃ£ kháº£o sÃ¡t há»£p Ä‘á»“ng dá»¯ liá»‡u |
| **Order Management** | `POST` | `/api/v1/orders` | **DA NOI** | `src/PicanDeli/PicanDeli.jsx` | ÄÃ£ kháº£o sÃ¡t há»£p Ä‘á»“ng dá»¯ liá»‡u |
| **Order Management** | `POST` | `/api/v1/orders/summary` | **DA NOI** | `src/PicanDeli/PicanDeli.jsx` | ÄÃ£ kháº£o sÃ¡t há»£p Ä‘á»“ng dá»¯ liá»‡u |

---

## 3. HÆ°á»›ng dáº«n bÃ n giao & CÃ¡c Ä‘áº§u viá»‡c tiáº¿p theo cho Frontend (FE)

Khi má»Ÿ nhÃ¡nh lÃ m viá»‡c má»›i Ä‘á»ƒ phÃ¡t triá»ƒn cÃ¡c tÃ­nh nÄƒng tiáº¿p theo, Ä‘á»™i ngÅ© FE cáº§n táº­p trung vÃ o 3 Ä‘áº§u viá»‡c chÃ­nh sau táº¡i trang Ä‘áº·t lá»‹ch (`PicanDeli.jsx`):

1.  **Äáº¥u ná»‘i Sá»• Ä‘á»‹a chá»‰ thá»±c táº¿:**
    *   Thay tháº¿ máº£ng dá»¯ liá»‡u tÄ©nh `ADDRESS_PRESETS` báº±ng viá»‡c gá»i API `GET /api/v1/delivery-addresses` qua hÃ m `authenticatedApiRequest` Ä‘á»ƒ hiá»ƒn thá»‹ Ä‘Ãºng danh sÃ¡ch Ä‘á»‹a chá»‰ nháº­n/giao hÃ ng cá»§a User.
    *   TÃ­ch há»£p form thÃªm Ä‘á»‹a chá»‰ trá»±c tiáº¿p káº¿t ná»‘i tá»›i `POST /api/v1/delivery-addresses`.
2.  **Äá»“ng bá»™ hÃ³a khung giá» giao nháº­n Ä‘á»™ng:**
    *   Gá»i API `GET /api/v1/schedules/pickup-dates` Ä‘á»ƒ káº¿t xuáº¥t danh sÃ¡ch ngÃ y nháº­n hÃ ng thá»±c táº¿.
    *   Dá»±a trÃªn ngÃ y Ä‘Æ°á»£c chá»n, gá»i tiáº¿p `GET /api/v1/schedules/pickup-slots?pickupDate=...` Ä‘á»ƒ láº¥y danh sÃ¡ch khung giá» trá»‘ng tá»« Backend thay vÃ¬ sá»­ dá»¥ng máº£ng cá»©ng `ALL_TIME_SLOTS`.
    *   Thá»±c hiá»‡n tÆ°Æ¡ng tá»± cho viá»‡c láº¥y ngÃ y vÃ  giá» giao hÃ ng (`delivery-dates` vÃ  `delivery-slots`).
3.  **Táº¡o Ä‘Æ¡n hÃ ng thá»±c táº¿ lÃªn há»‡ thá»‘ng:**
    *   Äáº¥u ná»‘i nÃºt xÃ¡c nháº­n Ä‘Æ¡n hÃ ng tá»›i API `POST /api/v1/orders`.
    *   Äáº£m báº£o dá»¯ liá»‡u gá»­i lÃªn (Payload) khá»›p hoÃ n toÃ n vá»›i cáº¥u trÃºc cá»§a DTO [CreateOrderRequest.java](file:///d:/trainingCode/K8/EXE202/Backend/LaundryGo_BE/src/main/java/com/fpt/laundrygo_be/model/dto/request/CreateOrderRequest.java), Ä‘áº·c biá»‡t lÃ  viá»‡c Ã¡nh xáº¡ Ä‘Ãºng `pickupSlot` / `deliverySlot` vÃ  `paymentMethod` dÆ°á»›i dáº¡ng cÃ¡c chuá»—i Enum há»£p lá»‡ (vÃ­ dá»¥: `SLOT_09_11`, `CARD`, `CASH`).

---

## 4. Káº¿ hoáº¡ch triá»ƒn khai ná»‘i API cho luá»“ng Booking

Má»¥c tiÃªu cá»§a phase nÃ y lÃ  chuyá»ƒn trang Ä‘áº·t lá»‹ch `src/PicanDeli/PicanDeli.jsx` tá»« dá»¯ liá»‡u mock/local state sang dá»¯ liá»‡u tháº­t tá»« Backend, Ä‘á»“ng thá»i báº£o Ä‘áº£m luá»“ng hoÃ n chá»‰nh: chá»n dá»‹ch vá»¥ â†’ chá»n Ä‘á»‹a chá»‰ â†’ chá»n lá»‹ch pickup/delivery â†’ xem tá»•ng tiá»n â†’ táº¡o Ä‘Æ¡n â†’ chuyá»ƒn sang trang xÃ¡c nháº­n/theo dÃµi Ä‘Æ¡n.

### 4.1. Pháº¡m vi API cáº§n ná»‘i

| NhÃ³m viá»‡c | Method | Endpoint | Má»¥c Ä‘Ã­ch FE |
| :--- | :--- | :--- | :--- |
| Delivery Address | `GET` | `/api/v1/delivery-addresses` | Láº¥y danh sÃ¡ch Ä‘á»‹a chá»‰ cá»§a user Ä‘ang Ä‘Äƒng nháº­p |
| Delivery Address | `POST` | `/api/v1/delivery-addresses` | ThÃªm Ä‘á»‹a chá»‰ má»›i trong trang schedule |
| Schedule | `GET` | `/api/v1/schedules/pickup-dates` | Láº¥y danh sÃ¡ch ngÃ y cÃ³ thá»ƒ nháº­n Ä‘á»“ |
| Schedule | `GET` | `/api/v1/schedules/pickup-slots?pickupDate=YYYY-MM-DD` | Láº¥y khung giá» nháº­n Ä‘á»“ theo ngÃ y Ä‘Ã£ chá»n |
| Schedule | `GET` | `/api/v1/schedules/delivery-dates?pickupDate=YYYY-MM-DD&pickupSlot=SLOT_09_11` | Láº¥y ngÃ y giao tráº£ há»£p lá»‡ theo lá»‹ch pickup |
| Schedule | `GET` | `/api/v1/schedules/delivery-slots?pickupDate=YYYY-MM-DD&pickupSlot=SLOT_09_11&deliveryDate=YYYY-MM-DD` | Láº¥y khung giá» giao tráº£ há»£p lá»‡ |
| Order | `POST` | `/api/v1/orders/summary` | TÃ­nh tá»•ng tiá»n tháº­t tá»« danh sÃ¡ch dá»‹ch vá»¥ |
| Order | `POST` | `/api/v1/orders` | Táº¡o Ä‘Æ¡n hÃ ng tháº­t |
| Order | `GET` | `/api/v1/orders/{orderId}` | Láº¥y chi tiáº¿t Ä‘Æ¡n tháº­t cho confirm/track |

### 4.2. Thá»© tá»± triá»ƒn khai khuyáº¿n nghá»‹

1.  **Táº¡o service layer riÃªng cho booking**
    *   Táº¡o file `src/services/bookingApi.js` hoáº·c má»™t module tÆ°Æ¡ng Ä‘Æ°Æ¡ng Ä‘á»ƒ gom toÃ n bá»™ API booking.
    *   DÃ¹ng `authenticatedApiRequest` cho cÃ¡c endpoint cáº§n token.
    *   KhÃ´ng gá»i `fetch` trá»±c tiáº¿p ráº£i rÃ¡c trong component.

2.  **Chuáº©n hÃ³a pending cart Ä‘á»ƒ giá»¯ `serviceId`**
    *   Kiá»ƒm tra luá»“ng thÃªm dá»‹ch vá»¥ táº¡i `src/AllShops/AllShopsDetail.jsx` vÃ  `src/utils/pendingCart.js`.
    *   Äáº£m báº£o má»—i item trong cart cÃ³ tá»‘i thiá»ƒu:
        *   `serviceId`
        *   `label`
        *   `count`
        *   `price`
        *   `pricingType`
    *   ÄÃ¢y lÃ  Ä‘iá»u kiá»‡n báº¯t buá»™c vÃ¬ Backend `CreateOrderRequest` vÃ  `OrderSummaryRequest` Ä‘á»u yÃªu cáº§u `items: [{ serviceId, quantity }]`.

3.  **Ná»‘i danh sÃ¡ch Ä‘á»‹a chá»‰ tháº­t**
    *   Khi mount `PicanDeli.jsx`, gá»i `GET /api/v1/delivery-addresses`.
    *   Thay `ADDRESS_PRESETS` báº±ng dá»¯ liá»‡u tá»« API.
    *   Adapter gá»£i Ã½:

```js
function mapAddressToView(address) {
  return {
    id: address.id,
    type: address.isDefault ? 'DEFAULT' : 'OTHER',
    title: address.receiverName,
    line: `${address.addressLine}, ${address.district}, ${address.city}`,
    phone: address.phone,
    receiverName: address.receiverName,
    addressLine: address.addressLine,
    city: address.city,
    district: address.district,
    isDefault: address.isDefault,
  }
}
```

4.  **Ná»‘i form thÃªm Ä‘á»‹a chá»‰**
    *   Form hiá»‡n táº¡i cáº§n bá»• sung cÃ¡c trÆ°á»ng khá»›p `DeliveryAddressCreateRequest`:
        *   `receiverName`
        *   `phone`
        *   `addressLine`
        *   `city`
        *   `district`
        *   `isDefault`
    *   Payload gá»­i Backend:

```js
{
  receiverName,
  phone,
  addressLine,
  city,
  district,
  isDefault
}
```

5.  **Ná»‘i ngÃ y vÃ  khung giá» pickup**
    *   Thay logic offset ngÃ y (`selectedPickupOffset`) báº±ng state ngÃ y tháº­t:
        *   `pickupDates`
        *   `selectedPickupDate`
        *   `pickupSlots`
        *   `selectedPickupSlot`
    *   Khi user chá»n ngÃ y pickup, gá»i láº¡i `pickup-slots`.
    *   Slot lÆ°u theo enum Backend, vÃ­ dá»¥ `SLOT_09_11`, nhÆ°ng hiá»ƒn thá»‹ báº±ng `label`.

6.  **Ná»‘i ngÃ y vÃ  khung giá» delivery**
    *   Sau khi cÃ³ `selectedPickupDate` vÃ  `selectedPickupSlot`, gá»i `delivery-dates`.
    *   Sau khi cÃ³ `selectedDeliveryDate`, gá»i `delivery-slots`.
    *   Khi Ä‘á»•i pickup date/slot, reset delivery date/slot Ä‘á»ƒ trÃ¡nh giá»¯ state khÃ´ng há»£p lá»‡.

7.  **Ná»‘i order summary**
    *   Khi cart cÃ³ item há»£p lá»‡, gá»i `POST /api/v1/orders/summary`.
    *   Payload:

```js
{
  items: [
    { serviceId: 1, quantity: 2 }
  ]
}
```

    *   DÃ¹ng `subtotal`, `priceNote`, `items` tá»« Backend Ä‘á»ƒ hiá»ƒn thá»‹ sticky order summary.
    *   Náº¿u API lá»—i, hiá»ƒn thá»‹ lá»—i inline vÃ  khÃ´ng cho confirm order.

8.  **Ná»‘i táº¡o Ä‘Æ¡n tháº­t**
    *   Khi báº¥m confirm, gá»i `POST /api/v1/orders`.
    *   Payload chuáº©n:

```js
{
  items: [
    { serviceId: 1, quantity: 2 }
  ],
  pickupAddressId: 10,
  deliveryAddressId: 10,
  pickupDate: '2026-06-29',
  pickupSlot: 'SLOT_09_11',
  deliveryDate: '2026-06-30',
  deliverySlot: 'SLOT_14_16',
  paymentMethod: 'CASH',
  specialInstruction: instructions,
  note: ''
}
```

    *   Mapping payment hiá»‡n táº¡i cáº§n chá»‰nh:
        *   `cash` â†’ `CASH`
        *   `card` â†’ `CREDIT_CARD` hoáº·c `DEBIT_CARD` tÃ¹y UI cuá»‘i cÃ¹ng
        *   `wallet` â†’ `E_WALLET`

9.  **Cáº­p nháº­t confirm vÃ  track**
    *   Sau khi táº¡o Ä‘Æ¡n thÃ nh cÃ´ng, navigate sang `/all-shops/:id/confirm` kÃ¨m `orderResponse`.
    *   Trang confirm nÃªn Æ°u tiÃªn hiá»ƒn thá»‹ `orderCode`, `orderId`, `pickupSlotLabel`, `deliverySlotLabel`, `paymentMethodLabel` tá»« Backend.
    *   Trang track nÃªn Ä‘á»c `orderId` tháº­t vÃ  gá»i `GET /api/v1/orders/{orderId}` thay vÃ¬ phá»¥ thuá»™c hoÃ n toÃ n vÃ o mock state/local cart.

### 4.3. State vÃ  UX cáº§n bá»• sung

*   ThÃªm loading state riÃªng cho:
    *   táº£i Ä‘á»‹a chá»‰
    *   thÃªm Ä‘á»‹a chá»‰
    *   táº£i pickup dates/slots
    *   táº£i delivery dates/slots
    *   táº£i order summary
    *   táº¡o order
*   ThÃªm empty state khi user chÆ°a cÃ³ Ä‘á»‹a chá»‰.
*   Disable nÃºt confirm khi:
    *   chÆ°a cÃ³ cart
    *   chÆ°a cÃ³ Ä‘á»‹a chá»‰
    *   chÆ°a cÃ³ pickup date/slot
    *   chÆ°a cÃ³ delivery date/slot
    *   order summary lá»—i
    *   Ä‘ang submit order
*   Táº¥t cáº£ text má»›i pháº£i thÃªm key song ngá»¯ vÃ o `src/locales/en.json` vÃ  `src/locales/vi.json`, khÃ´ng hardcode trá»±c tiáº¿p trong component.

### 4.4. Checklist kiá»ƒm thá»­ sau khi ná»‘i API

1.  ÄÄƒng nháº­p báº±ng tÃ i khoáº£n tháº­t vÃ  xÃ¡c nháº­n token Ä‘Æ°á»£c gá»­i qua `Authorization: Bearer ...`.
2.  VÃ o `/all-shops`, chá»n má»™t shop, thÃªm Ã­t nháº¥t má»™t dá»‹ch vá»¥ vÃ o cart.
3.  Má»Ÿ `/all-shops/:id/schedule`, xÃ¡c nháº­n Ä‘á»‹a chá»‰ Ä‘Æ°á»£c load tá»« Backend.
4.  ThÃªm Ä‘á»‹a chá»‰ má»›i vÃ  xÃ¡c nháº­n Ä‘á»‹a chá»‰ má»›i xuáº¥t hiá»‡n trong danh sÃ¡ch.
5.  Chá»n pickup date, kiá»ƒm tra pickup slot thay Ä‘á»•i theo API.
6.  Chá»n pickup slot, kiá»ƒm tra delivery date vÃ  delivery slot Ä‘Æ°á»£c load Ä‘Ãºng.
7.  Kiá»ƒm tra order summary dÃ¹ng subtotal tá»« Backend.
8.  Báº¥m confirm vÃ  xÃ¡c nháº­n Backend táº¡o order thÃ nh cÃ´ng.
9.  Trang confirm hiá»ƒn thá»‹ `orderCode`/`orderId` tháº­t.
10. Trang track láº¥y Ä‘Æ°á»£c chi tiáº¿t Ä‘Æ¡n báº±ng `GET /api/v1/orders/{orderId}`.

### 4.5. Rá»§i ro ká»¹ thuáº­t cáº§n xá»­ lÃ½ trÆ°á»›c

*   **Cart thiáº¿u `serviceId`:** ÄÃ¢y lÃ  blocker lá»›n nháº¥t. Náº¿u chá»‰ lÆ°u label dá»‹ch vá»¥ thÃ¬ khÃ´ng thá»ƒ gá»i `orders/summary` hoáº·c `orders` Ä‘Ãºng contract.
*   **Payment enum chÆ°a khá»›p:** TÃ i liá»‡u cÅ© cÃ³ vÃ­ dá»¥ `CARD`, nhÆ°ng Backend hiá»‡n dÃ¹ng `CREDIT_CARD`, `DEBIT_CARD`, `BANK_TRANSFER`, `E_WALLET`, `CASH`.
*   **Date label khÃ¡c date value:** FE khÃ´ng Ä‘Æ°á»£c gá»­i label hiá»ƒn thá»‹ nhÆ° `Mon, Jun 29`; pháº£i gá»­i `YYYY-MM-DD`.
*   **Demo token:** ÄÃ£ Ä‘Æ°á»£c gá»¡ bá» trong phase 1 cleanup. Khi test API tháº­t váº«n cáº§n Ä‘Äƒng nháº­p báº±ng tÃ i khoáº£n Backend tháº­t Ä‘á»ƒ cÃ³ JWT há»£p lá»‡.

---

## 5. Cap nhat implementation sau khi noi API Booking (29/06/2026)

Trang booking cua user da duoc chuyen tu mock data sang API that theo pham vi MVP. Cac thay doi duoc giu trong design language hien co cua LaundryGo: nen sang, blue operational accent, card 16-18px radius, inline loading/error state, khong thay doi route hay flow chinh.

### 5.1. File Frontend da cap nhat

| File | Vai tro sau cap nhat |
| :--- | :--- |
| `src/services/bookingApi.js` | Service layer moi gom cac API delivery address, schedule, order summary, create order, get order detail |
| `src/AllShops/AllShopsDetail.jsx` | Lay service categories that tu `/api/v1/shops/{shopId}/service-categories` va luu `serviceId` vao pending cart |
| `src/PicanDeli/PicanDeli.jsx` | Noi dia chi, pickup/delivery dates-slots, order summary, create order |
| `src/PicanDeli/PicanDeli.css` | Bo sung style nho cho checkbox default address va disabled action |
| `src/ConfirmOrder/ConfirmOrder.jsx` | Uu tien hien thi `orderResponse` that tu Backend |
| `src/TrackOrder/TrackOrder.jsx` | Goi lai `GET /api/v1/orders/{orderId}` khi co `orderId` that |
| `src/locales/en.json` | Them copy moi cho address form, loading, error, submit state |
| `src/locales/vi.json` | Them copy tieng Viet tuong ung cho address form, loading, error, submit state |

### 5.2. Trang thai API sau implement

| Domain | Endpoint | Trang thai FE | Ghi chu |
| :--- | :--- | :--- | :--- |
| Shop Service | `GET /api/v1/shops/{shopId}/service-categories` | **DA NOI** | Dung de lay `serviceId` that cho cart/order |
| Delivery Address | `GET /api/v1/delivery-addresses` | **DA NOI** | Hien danh sach dia chi cua customer; co empty state khi chua co dia chi |
| Delivery Address | `POST /api/v1/delivery-addresses` | **DA NOI** | Form FE map theo `DeliveryAddressCreateRequest` |
| Schedule | `GET /api/v1/schedules/pickup-dates` | **DA NOI** | Render date pills bang data Backend |
| Schedule | `GET /api/v1/schedules/pickup-slots` | **DA NOI** | Select slot theo enum `TimeSlot`, hien label tu Backend |
| Schedule | `GET /api/v1/schedules/delivery-dates` | **DA NOI** | Goi sau khi co pickup date + pickup slot |
| Schedule | `GET /api/v1/schedules/delivery-slots` | **DA NOI** | Goi sau khi co delivery date |
| Order | `POST /api/v1/orders/summary` | **DA NOI** | Sticky order summary dung subtotal/items/priceNote tu Backend |
| Order | `POST /api/v1/orders` | **DA NOI** | Confirm order gui `CreateOrderRequest` that |
| Order | `GET /api/v1/orders/{orderId}` | **DA NOI** | Track page refresh chi tiet don that khi co numeric `orderId` |

### 5.3. Mapping contract quan trong

Cart item FE hien bat buoc co `serviceId` de tao order:

```js
{
  serviceId: 1,
  label: 'Wash 5kg',
  count: 1,
  price: 75000,
  pricingType: 'kg'
}
```

Payload tao order FE dang gui:

```js
{
  items: [{ serviceId: 1, quantity: 1 }],
  pickupAddressId: 10,
  deliveryAddressId: 10,
  pickupDate: '2026-06-29',
  pickupSlot: 'SLOT_09_11',
  deliveryDate: '2026-06-29',
  deliverySlot: 'SLOT_14_16',
  paymentMethod: 'CREDIT_CARD',
  specialInstruction: '',
  note: ''
}
```

Mapping payment da chot trong FE:

| UI | Backend enum |
| :--- | :--- |
| Debit/Credit card | `CREDIT_CARD` |
| E-wallet | `E_WALLET` |
| Cash / COD | `CASH` |

### 5.4. Kiem tra API that da thuc hien

Da kiem tra voi customer account `hainambl996@gmail.com`:

| Hang muc | Ket qua |
| :--- | :--- |
| Login | OK, role `CUSTOMER`, co access token |
| Shop list | OK, co 20 shop |
| Service categories | OK, shop `1` co service IDs `1, 2, 3`; cac shop tiep theo co service data |
| Delivery addresses | OK endpoint, hien tai customer co `0` dia chi nen FE se hien empty state va cho them dia chi |
| Pickup dates | OK, co 3 ngay |
| Pickup slots | OK, slot dau `SLOT_09_11`, label `09:00 - 11:00` |
| Delivery dates | OK, co 3 ngay |
| Delivery slots | OK, slot dau `SLOT_14_16`, label `14:00 - 16:00` |
| Order summary | OK voi service `1`, quantity `1`, subtotal `75000.00` |

### 5.5. Luu y khi test giao dien

*   Can dang nhap bang account Backend that de co JWT hop le. Nhanh token `demo` da duoc go bo trong phase 1 cleanup.
*   Customer test hien chua co dia chi, nen can test form Add Address truoc khi confirm order.
*   Neu cart cu da duoc tao truoc khi FE lay service categories that, cart co the thieu `serviceId`; FE se chan confirm va yeu cau chon lai service.
*   UI da doi hien thi tien sang `VND` de tranh loi encoding ky tu `Ä‘` tren cac moi truong console/build khac nhau.
*   `npm run build` da pass. Targeted ESLint cho cac file booking da pass. `npm run lint` toan repo van fail vi cac loi cu ngoai pham vi booking.


### 5.6. Ket qua test end-to-end bang API that (30/06/2026)

Da test flow tao don that bang customer account `hainambl996@gmail.com` tren Backend local:

| Buoc | Ket qua |
| :--- | :--- |
| Login customer | OK, role `CUSTOMER` |
| Tao delivery address test | OK, created address ID `44` |
| Lay pickup date/slot | OK, `2026-06-30`, `SLOT_09_11` |
| Lay delivery date/slot | OK, `2026-06-30`, `SLOT_14_16` |
| Goi order summary | OK, subtotal `75000.00` |
| Tao order | OK, order ID `25`, order code `LG-000025`, status `PENDING` |
| Goi order detail | OK, load duoc 1 item, total amount `75000.00` |

Ket luan: contract Backend cho luong booking MVP da hop le voi FE. Buoc con lai la test lai bang giao dien khi browser/local preview kha dung, dam bao thao tac UI tu login den confirm/track khong bi loi render hoac route state.

### 5.7. Tiep tuc plan - xac minh FE runtime va viec con lai (30/06/2026)

Da tiep tuc kiem tra baseline FE sau phase noi API Booking:

| Hang muc | Ket qua |
| :--- | :--- |
| `npm run build` | PASS, Vite build thanh cong |
| Targeted ESLint cho booking files | PASS voi `src/services/bookingApi.js`, `src/AllShops/AllShopsDetail.jsx`, `src/PicanDeli/PicanDeli.jsx`, `src/ConfirmOrder/ConfirmOrder.jsx`, `src/TrackOrder/TrackOrder.jsx` |
| Dev server | OK tai `http://127.0.0.1:5174/` |
| Route schedule FE | OK, `GET http://127.0.0.1:5174/all-shops/1/schedule` tra `200` |
| Backend schedule API khong token | Tra `403 Forbidden`, dung ky vong vi endpoint booking can authenticated token |

Ghi chu: Browser automation noi bo cua phien Codex hien khong kha dung, va khong co session/token customer that trong browser de submit lai flow UI tu login -> add service -> schedule -> confirm -> track. Vi vay chua danh dau xong E2E UI thao tac bang browser.

Viec tiep theo nen lam:

1.  Dang nhap tren browser bang customer account Backend that.
2.  Vao `/all-shops/1`, them service co `serviceId` vao cart.
3.  Vao `/all-shops/1/schedule`, tao/chon delivery address.
4.  Chon pickup/delivery date-slot, xac nhan order summary lay subtotal tu Backend.
5.  Bam confirm order va kiem tra trang confirm hien `orderCode`/`orderId` that.
6.  Mo track page va xac nhan `GET /api/v1/orders/{orderId}` duoc goi thanh cong.
7.  Neu UI E2E pass, cap nhat muc nay thanh "E2E UI PASS" va ghi lai order code test moi nhat.

### 5.8. Ket qua Playwright E2E UI Booking (30/06/2026)

Do Browser plugin noi bo cua Codex khong kha dung trong VS Code session nay, da chuyen sang Playwright terminal de test UI E2E tren app local `http://localhost:5173`.

Script test: `scripts/booking-e2e.mjs`

Tai khoan test: `customer1@laundrygo.com` / `pass123`

| Buoc UI | Ket qua |
| :--- | :--- |
| Mo app local | OK |
| Login bang account Backend that | OK, navigate sang `/all-shops` |
| Mo `/all-shops/1` | OK |
| Them service dau tien vao cart | OK, cart co `serviceId` that |
| Mo `/all-shops/1/schedule` | OK |
| Chon/tao delivery address | OK, dung address ID `45` |
| Load pickup/delivery date-slot | OK |
| Goi order summary | OK, `POST /api/v1/orders/summary` tra subtotal `75000` |
| Confirm order | OK, `POST /api/v1/orders` tao order that |
| Confirm page | OK, hien order code that |
| Track page | OK, navigate sang `/all-shops/1/track` |
| Reload order detail tren track page | OK, `GET /api/v1/orders/27` tra `200` |

Order test moi nhat:

| Field | Gia tri |
| :--- | :--- |
| `orderId` | `27` |
| `orderCode` | `LG-000027` |
| `status` | `PENDING` |
| `shopId` | `1` |
| `shopName` | `LaundryGo District 1` |
| `serviceId` | `1` |
| `serviceName` | `Wash 5kg` |
| `pickupDate` | `2026-06-30` |
| `pickupSlot` | `SLOT_09_11` |
| `deliveryDate` | `2026-06-30` |
| `deliverySlot` | `SLOT_14_16` |
| `paymentMethod` | `CREDIT_CARD` |
| `totalAmount` | `75000` |

Ket luan: **E2E UI Booking PASS** cho flow MVP login -> shop detail -> add service -> schedule -> confirm -> track bang Backend local that.

### 5.9. Phase 1 cleanup auth demo/mock (30/06/2026)

Da thuc hien cleanup cac nhanh demo/mock trong auth FE de uu tien Backend that:

| Hang muc | Ket qua |
| :--- | :--- |
| Login fallback local/demo | Da go bo trong `src/utils/auth.js`; login chi dung `POST /api/v1/auth/login` |
| Signup local/demo | Da go bo; customer signup chi dung `POST /api/v1/auth/register` |
| Demo token branch | Da go bo trong `src/utils/api.js`; `authenticatedApiRequest` khong con tra mock/null khi token la `demo` |
| Verify PIN demo | Da go bo; `src/SignUp/VerifyPin.jsx` goi `POST /api/v1/auth/verify-email` |
| Resend OTP | Da noi `POST /api/v1/auth/resend-otp` |
| Shop signup | Da chuyen sang `POST /api/v1/auth/shops/register` va bo navigate gia sang dashboard |
| Copy mock checkout/order | Da doi cac copy chinh trong `en.json` va `vi.json` |

Kiem tra sau cleanup:

| Hang muc | Ket qua |
| :--- | :--- |
| Parse locale JSON | PASS |
| Targeted ESLint auth + booking files | PASS |
| `npm run build` | PASS |
| Customer register API | PASS, response `OTP sent. Please verify your email.`, account status `INACTIVE` |
| Playwright booking regression | PASS, tao order `LG-000028`, order ID `28`, `GET /api/v1/orders/28` tra `200` |

Ghi chu: Happy path verify email tren UI can ma OTP that tu email/Redis nen chua tu dong xac minh duoc trong Playwright neu khong co kenh doc OTP. Logic FE da ket noi endpoint that va validation dung OTP 6 chu so.

### 5.10. Bat dau phase tiep theo - auth guard va Shipper Dashboard (30/06/2026)

Da bat dau noi tiep ngoai luong customer booking:

| Hang muc | Ket qua |
| :--- | :--- |
| Route auth guard | Da them check token va role trong `src/App.jsx` |
| Login redirect theo role | `ADMIN` -> `/admin`, `SHOP_OWNER` -> `/shop`, `SHIPPER` -> `/driver`, mac dinh -> `/all-shops` |
| Shipper service layer | Them `src/services/driverApi.js` cho API shipper |
| Driver tasks | `src/DriverDashboard/Tasks/DriverTasks.jsx` goi `GET /api/v1/shippers/tasks/today` |
| Driver history | `src/DriverDashboard/History/DriverHistory.jsx` goi `GET /api/v1/shippers/history` |
| Fallback UI | Neu chua co token shipper/backend chua san sang, UI hien fallback mock data hien co de khong vo demo |

Kiem tra:

| Hang muc | Ket qua |
| :--- | :--- |
| Targeted ESLint | PASS voi auth guard, login, driver API, driver tasks/history |
| `npm run build` | PASS |

Ghi chu tiep theo: Backend hien co DTO income shipper nhung `ShipperController` chua expose endpoint earnings/income, nen man `/driver/earnings` van chua noi API that. Cac man `/admin/*` va phan lon `/shop/*` van con doc `src/data`/`dataManager`.

### 5.11. Noi API Shop Owner Operations (30/06/2026)

Da tiep tuc noi that mot phan Shop Owner Dashboard:

| Hang muc | Ket qua |
| :--- | :--- |
| Shop owner service layer | Them `src/services/shopOwnerApi.js` |
| Service categories | Goi `GET /api/v1/shop-owner/services/categories` de render category dropdown |
| Services | Goi `GET/POST/PUT/PATCH/DELETE /api/v1/shop-owner/services` |
| Machines | Goi `GET/POST/PUT/DELETE /api/v1/shop-owner/machines` |
| Inventory | Goi `GET/POST/PUT/DELETE /api/v1/shop-owner/inventory` |
| FE screen | `src/ShopDashboard/Operations/ShopOperations.jsx` uu tien data Backend va fallback mock/localStorage neu chua login SHOP_OWNER hoac Backend chua san sang |

Mapping dang dung:

| FE | Backend |
| :--- | :--- |
| service `name` | `serviceName` |
| service `categoryId` | `serviceCategoryId` |
| machine `status: empty` | `AVAILABLE` |
| machine `status: washing/drying/ironing` | `IN_USE` |
| machine `status: maintenance` | `MAINTENANCE` |
| supply `current` | request `quantity`, response `current` |
| supply `max` | request `maxQuantity`, response `max` |

Kiem tra:

| Hang muc | Ket qua |
| :--- | :--- |
| Targeted ESLint | PASS voi `shopOwnerApi.js` va `ShopOperations.jsx` |
| `npm run build` | PASS |

Ghi chu tiep theo: cac man `/shop/orders`, `/shop/revenue`, `/shop/staff`, `/shop/documents`, `/shop/incidents`, `/shop/settings` van con doc mock/localStorage. Backend hien chua thay controller rieng cho nhung man nay ngoai cac API shop-owner services/machines/inventory da noi.
