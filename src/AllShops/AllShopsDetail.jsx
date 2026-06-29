import { useParams, useNavigate } from "react-router-dom";
import { createElement, useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Star,
  User,
  Shirt,
  Wind,
  Flame,
  ShoppingCart,
  Tag,
  Copy,
  Check,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import servicesCatalog from "../data/services.json";
import UserNavbar from "../components/UserNavbar";
import ConfirmDialog from "../components/ConfirmDialog/ConfirmDialog";
import "../LandingPage/LandingPage.css";
import "./AllShops.css";
import "./AllShopsDetail.css";
import { localizePath, useTranslation } from "../shared/lib/i18n";
import { translateServiceCopy } from "../shared/lib/i18n/serviceCopy";
import {
  clearPendingCart,
  readPendingCart,
  savePendingCart,
} from "../utils/pendingCart";
import { apiRequest } from "../utils/api";

// ─────────────────────────────────────────────────────────────
//  Static meta catalogue (from services.json) — unchanged
// ─────────────────────────────────────────────────────────────
const SERVICE_META_BY_LABEL = servicesCatalog.reduce((acc, service) => {
  acc[service.name] = {
    category: service.category,
    description: service.description,
    estimatedTime: service.estimatedTime,
    minOrder: service.minOrder,
    pricingType: service.pricingType,
    available: service.available,
    tags: service.tags,
  };
  return acc;
}, {});

const inferPricingType = (item) => {
  const label = item.label.toLowerCase();
  if (label.includes("per kg") || label.includes("kg")) return "kg";
  if (label.includes("meter")) return "meter";
  return "item";
};

const FALLBACK_IMAGES = [
  "/laundryshop1.jpg",
  "/laundryshop2.jpg",
  "/laundryshop3.jpg",
  "/laundryshop4.jpg",
  "/laundryshop5.jpg",
];

// ─────────────────────────────────────────────────────────────
//  Default UI sections used when BE doesn't return services yet
// ─────────────────────────────────────────────────────────────
const buildDefaultServices = (startingPrice = 7000) => ({
  washFold: [
    {
      label: "Everyday Wear (per kg)",
      price: startingPrice,
      notes: "T-shirts, socks, jeans etc.",
    },
    {
      label: "Bedding & Linen (per kg)",
      price: Math.round(startingPrice * 1.4),
      notes: "Sheets, pillowcases, towels etc.",
    },
  ],
  dryCleaning: [
    {
      label: "Two-piece Suit",
      price: 35000,
      notes: "Jacket and trousers/skirt etc.",
    },
    {
      label: "Dress Shirt (Pressed)",
      price: 15000,
      notes: "Machine pressed and hung.",
    },
  ],
  ironing: {
    label: "Individual Item",
    price: 4000,
    notes: "Priced per garment.",
  },
});

const DEFAULT_HOURS = { "Mon-Fri": "7AM-9PM", "Sat-Sun": "6AM-10PM" };

const DEFAULT_REVIEWS = [
  { author: "Customer A", rating: 5, text: "Good service and quick support." },
  {
    author: "Customer B",
    rating: 4,
    text: "Delivery is on time and clothes are clean.",
  },
];

// ─────────────────────────────────────────────────────────────
//  Adapter: BackendShopDetailResponse → FE shape
//
//  BE ShopDetailResponse fields:
//    id, name, rating, address, distance, turnaround, hours, image
//
//  ⚠️  FAULT-TOLERANT DESIGN: This function NEVER returns null.
//  Even if beData is empty/partial, it always returns a full FE
//  object with safe defaults. Only a truly missing beData (the
//  entire payload is null/undefined) falls back to a minimal shell.
// ─────────────────────────────────────────────────────────────
function mapBackendShopToFrontend(beData, shopId) {
  const shopIdStr = String(shopId || "");

  // ── Determine starting price for default services ──────────
  // BE ShopDetailResponse doesn't expose price yet → use 7000 VND
  const startingPrice = 7000;

  // ── Resolve image ──────────────────────────────────────────
  // Safe fallback: handle NaN when shopId is non-numeric (e.g. "abc")
  const shopIdNum = Number(shopId);
  const fallbackIdx = isNaN(shopIdNum) ? 0 : Math.abs(shopIdNum - 1);
  const image =
    beData?.image || FALLBACK_IMAGES[fallbackIdx % FALLBACK_IMAGES.length];

  // ── Resolve hours ──────────────────────────────────────────
  // Merge with DEFAULT_HOURS so missing keys never render "undefined"
  const hours = {
    ...DEFAULT_HOURS,
    ...(beData?.hours && typeof beData.hours === "object" ? beData.hours : {}),
  };

  // ── Resolve other scalar fields with safe fallbacks ────────
  const turnaround = beData?.turnaround || "24 Hours";
  const distance = beData?.distance || "";

  return {
    id: shopIdStr,
    name: beData?.name || `Shop #${shopIdStr}`,
    rating: Number(beData?.rating || 0),
    address: beData?.address || "",
    distance,
    delivery: turnaround,
    hours,
    turnaround,
    image,
    // BE doesn't expose shop-level services in this endpoint yet → use defaults
    services: buildDefaultServices(startingPrice),
    promo: {
      text: `Welcome offer! 10% off your first order with code:`,
      code: `WELCOME-${shopIdStr.slice(-3) || "000"}`,
    },
    reviews: DEFAULT_REVIEWS,
  };
}

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────
function AllShopsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, t } = useTranslation();

  // ── API state ─────────────────────────────────────────────
  const [shop, setShop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Cart state — init from pending cart if same shop ──────
  const [cart, setCart] = useState(() => {
    const pendingCart = readPendingCart();
    return pendingCart?.shopId === id ? pendingCart.cart || {} : {};
  });

  // ── Other UI state ─────────────────────────────────────────
  const [copied, setCopied] = useState(false);
  const [selectedServiceLabel, setSelectedServiceLabel] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ show: false });

  // ── Fetch shop detail from BE ─────────────────────────────
  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setShop(null);

    const fetchShopDetail = async () => {
      try {
        const response = await apiRequest(`/api/v1/shops/${id}`);
        if (!isMounted) return;

        // ── DIAGNOSTIC LOG ─────────────────────────────────────
        console.log("=== LAUNDRYGO DEBUG: API Response Raw ===", response);

        // Unwrap BaseResponse wrapper: { success, message, data } → data
        // Falls back to the full response if no `.data` key present.
        const beData =
          response?.data !== undefined && response?.data !== null
            ? response.data
            : response;

        // ── DIAGNOSTIC LOG ─────────────────────────────────────
        console.log("=== LAUNDRYGO DEBUG: beData before mapping ===", beData);
        console.log(
          "=== LAUNDRYGO DEBUG: Data sau khi Map ===",
          mapBackendShopToFrontend(beData, id),
        );

        // Adapter ALWAYS returns a full object — never null.
        // Only set error if the API explicitly returned a failure
        // (handled in catch) or the shop truly doesn't exist (404).
        const mapped = mapBackendShopToFrontend(beData, id);
        setShop(mapped);
      } catch (err) {
        if (!isMounted) return;
        // ── DIAGNOSTIC LOG ─────────────────────────────────────
        console.error("=== LAUNDRYGO DEBUG: API Fetch Error ===", err);
        setError(err?.message || "fetch_error");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchShopDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // ── Helpers ───────────────────────────────────────────────
  const formatVnd = (value) =>
    String(value || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const formatCurrency = (value) => {
    if (!value) return "0";
    if (language === "vi") return `${formatVnd(value)} đ`;
    return `${new Intl.NumberFormat("en-US").format(value)} VND`;
  };

  const shopName = shop?.name;

  const renderStars = (rating, size = 14) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={size}
        className={i < rating ? "star-filled" : "star-empty"}
      />
    ));

  // ── Enrich a service item with catalogue meta ─────────────
  const enrichServiceItem = (item) => ({
    ...item,
    category: SERVICE_META_BY_LABEL[item.label]?.category || item.category,
    estimatedTime: translateServiceCopy(
      t,
      item.label,
      "estimatedTime",
      item.estimatedTime ||
        SERVICE_META_BY_LABEL[item.label]?.estimatedTime ||
        "24 hours",
    ),
    description: translateServiceCopy(
      t,
      item.label,
      "description",
      item.description ||
        SERVICE_META_BY_LABEL[item.label]?.description ||
        item.notes,
    ),
    minOrder: item.minOrder || SERVICE_META_BY_LABEL[item.label]?.minOrder || 1,
    pricingType:
      item.pricingType ||
      SERVICE_META_BY_LABEL[item.label]?.pricingType ||
      inferPricingType(item),
    available:
      item.available ?? SERVICE_META_BY_LABEL[item.label]?.available ?? true,
    tags: item.tags || SERVICE_META_BY_LABEL[item.label]?.tags || [],
    displayLabel: translateServiceCopy(t, item.label, "label", item.label),
    displayNotes: translateServiceCopy(
      t,
      item.label,
      "description",
      item.notes ||
        item.description ||
        SERVICE_META_BY_LABEL[item.label]?.description ||
        "",
    ),
  });

  // ── Cart operations ───────────────────────────────────────
  const addToCart = (item) => {
    setCart((c) => {
      const prev = c[item.label] || {
        count: 0,
        price: item.price,
        pricingType: item.pricingType,
      };
      const nextCount = item.pricingType === "kg" ? 1 : prev.count + 1;
      return {
        ...c,
        [item.label]: {
          count: nextCount,
          price: item.price,
          pricingType: item.pricingType,
        },
      };
    });
  };

  const closeConfirmDialog = () => setConfirmDialog({ show: false });

  const addToCartWithPendingCheck = (item) => {
    const pendingCart = readPendingCart();
    const hasForeignCart =
      pendingCart?.shopId &&
      pendingCart.shopId !== id &&
      Object.keys(pendingCart.cart || {}).length > 0;

    if (hasForeignCart) {
      setConfirmDialog({
        show: true,
        title: "Replace current pending cart?",
        message: `You already have a pending cart from ${pendingCart.shopName}. Adding services from ${shopName} will remove that cart and start a new one. Do you want to continue?`,
        cancelText: "Cancel",
        confirmText: "Replace Cart",
        type: "warning",
        onConfirm: () => {
          clearPendingCart();
          addToCart(item);
          setSelectedServiceLabel(item.label);
          closeConfirmDialog();
        },
      });
      return;
    }

    addToCart(item);
    setSelectedServiceLabel(item.label);
  };

  const removeFromCart = (item) => {
    setCart((c) => {
      const prev = c[item.label];
      if (!prev) return c;
      if (item.pricingType === "kg" || prev.count <= 1) {
        const { [item.label]: _, ...rest } = c;
        return rest;
      }
      return {
        ...c,
        [item.label]: {
          count: prev.count - 1,
          price: item.price,
          pricingType: item.pricingType,
        },
      };
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(shop.promo.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Persist cart to localStorage ──────────────────────────
  useEffect(() => {
    if (!shopName) return;

    const itemCount = Object.values(cart).reduce(
      (total, item) => total + (item.count || 0),
      0,
    );
    if (itemCount === 0) {
      const pendingCart = readPendingCart();
      if (pendingCart?.shopId === id) clearPendingCart();
      return;
    }

    savePendingCart({ shopId: id, shopName, cart });
  }, [cart, id, shopName]);

  // ── Loading state ─────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className="allshops-page"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: "12px",
        }}
      >
        <Loader2
          size={32}
          strokeWidth={1.5}
          style={{ color: "#6366f1", animation: "spin 1s linear infinite" }}
        />
        <p style={{ color: "#64748b", fontSize: "15px" }}>
          {t("common.loading") || "Loading shop details..."}
        </p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Error / not found state ───────────────────────────────
  if (error || !shop) {
    return (
      <div
        className="allshops-page"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: "12px",
        }}
      >
        <AlertCircle size={36} strokeWidth={1.5} style={{ color: "#ef4444" }} />
        <p style={{ color: "#64748b", fontSize: "15px" }}>
          {t("shopDetail.notFound")}
        </p>
        <button
          style={{
            marginTop: "8px",
            padding: "8px 20px",
            borderRadius: "8px",
            background: "#6366f1",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
          }}
          onClick={() => navigate(localizePath("/all-shops", language))}
        >
          {t("shopDetail.backToShops") || "Back to Shops"}
        </button>
      </div>
    );
  }

  // ── Derive computed values for rendering ──────────────────
  const bannerImage = shop.image;
  const cartEntries = Object.entries(cart);
  const subtotal = cartEntries.reduce(
    (acc, [, { count = 0, price = 0 }]) => acc + count * price,
    0,
  );

  const SERVICE_SECTIONS = [
    {
      id: "wash",
      titleKey: "shopDetail.washFold",
      Icon: Shirt,
      items: shop.services.washFold.map(enrichServiceItem),
    },
    {
      id: "dry",
      titleKey: "shopDetail.dryCleaning",
      Icon: Wind,
      items: shop.services.dryCleaning.map(enrichServiceItem),
    },
    {
      id: "iron",
      titleKey: "shopDetail.ironingOnly",
      Icon: Flame,
      items: [enrichServiceItem(shop.services.ironing)],
    },
  ];

  const allServiceItems = SERVICE_SECTIONS.flatMap((section) => section.items);
  const selectedService =
    allServiceItems.find((item) => item.label === selectedServiceLabel) ||
    allServiceItems[0];

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="shop-detail-page">
      <UserNavbar />

      <main className="shop-detail-main">
        <section className="detail-hero">
          <img
            src={bannerImage}
            alt={shop.name}
            className="detail-hero-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/laundryshop1.jpg";
            }}
          />
          <div className="detail-hero-overlay" />
          <button
            className="detail-hero-back"
            onClick={() => navigate(localizePath("/all-shops", language))}
          >
            <ArrowLeft size={15} strokeWidth={1.8} />
            {t("shopDetail.backToShops")}
          </button>
          <div className="detail-hero-content">
            <span className="detail-hero-eyebrow">
              {t("shopDetail.partnerShop")}
            </span>
            <div className="detail-hero-stars">
              {renderStars(shop.rating, 16)}
              <span className="detail-hero-star-value">{shop.rating}.0</span>
            </div>
            <h1 className="detail-hero-name">{shop.name}</h1>
            <span className="detail-hero-address">
              <MapPin size={15} strokeWidth={1.8} />
              {shop.address}
            </span>
          </div>
        </section>

        <section className="detail-body">
          <div className="detail-content">
            <div className="detail-meta-row">
              <div className="detail-meta-card">
                <span className="detail-meta-card-label">
                  {t("shops.distance")}
                </span>
                <MapPin size={16} className="detail-meta-card-icon" />
                <span className="detail-meta-card-value">
                  {shop.distance || "—"}
                </span>
              </div>
              <div className="detail-meta-card">
                <span className="detail-meta-card-label">
                  {t("shopDetail.turnaround")}
                </span>
                <Clock size={16} className="detail-meta-card-icon" />
                <span className="detail-meta-card-value">
                  {shop.turnaround}
                </span>
              </div>
              <div className="detail-meta-card">
                <span className="detail-meta-card-label">
                  {t("shopDetail.weekdays")}
                </span>
                <Clock size={16} className="detail-meta-card-icon" />
                <span className="detail-meta-card-value">
                  {shop.hours["Mon-Fri"]}
                </span>
              </div>
              <div className="detail-meta-card">
                <span className="detail-meta-card-label">
                  {t("shopDetail.weekend")}
                </span>
                <Clock size={16} className="detail-meta-card-icon" />
                <span className="detail-meta-card-value">
                  {shop.hours["Sat-Sun"]}
                </span>
              </div>
            </div>

            <div className="detail-service-inspector">
              <div className="detail-service-inspector-header">
                <div>
                  <h2 className="detail-service-inspector-title">
                    {t("shopDetail.serviceDetails")}
                  </h2>
                  <p className="detail-service-inspector-subtitle">
                    {t("shopDetail.serviceDetailsHint")}
                  </p>
                </div>
                {selectedService && (
                  <span className="detail-service-inspector-badge">
                    {selectedService.estimatedTime}
                  </span>
                )}
              </div>

              {selectedService && (
                <div className="detail-service-inspector-body">
                  <div className="detail-service-inspector-name">
                    {selectedService.displayLabel || selectedService.label}
                  </div>
                  <div className="detail-service-inspector-desc">
                    {selectedService.description}
                  </div>
                  <div className="detail-service-inspector-grid">
                    <div>
                      <span className="detail-service-inspector-k">
                        {t("shopDetail.estimatedTime")}
                      </span>
                      <span className="detail-service-inspector-v">
                        {selectedService.estimatedTime}
                      </span>
                    </div>
                    <div>
                      <span className="detail-service-inspector-k">
                        {t("shopDetail.minOrder")}
                      </span>
                      <span className="detail-service-inspector-v">
                        {selectedService.minOrder}{" "}
                        {selectedService.pricingType === "kg"
                          ? t("shopDetail.unitKg")
                          : t("shopDetail.unitItems")}
                      </span>
                    </div>
                    <div>
                      <span className="detail-service-inspector-k">
                        {t("shopDetail.price")}
                      </span>
                      <span className="detail-service-inspector-v">
                        {formatVnd(selectedService.price)} VND
                      </span>
                    </div>
                    <div>
                      <span className="detail-service-inspector-k">
                        {t("shopDetail.pricingType")}
                      </span>
                      <span className="detail-service-inspector-v">
                        {selectedService.pricingType === "kg"
                          ? t("shopDetail.unitKg")
                          : selectedService.pricingType === "meter"
                            ? t("shopDetail.unitMeter")
                            : t("shopDetail.unitItem")}
                      </span>
                    </div>
                  </div>
                  <div className="detail-service-inspector-footer">
                    <span className="detail-service-status">
                      {selectedService.available
                        ? t("shopDetail.availableNow")
                        : t("shopDetail.unavailable")}
                    </span>
                    {selectedService.tags.length > 0 && (
                      <div className="detail-service-tags">
                        {selectedService.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="detail-services">
              {SERVICE_SECTIONS.map(({ id: sId, titleKey, Icon, items }) => (
                <div key={sId} className="detail-service-card">
                  <div className="detail-service-header">
                    <div className="detail-service-icon">
                      {createElement(Icon, { size: 16, strokeWidth: 1.8 })}
                    </div>
                    <span className="detail-service-title">{t(titleKey)}</span>
                  </div>
                  <div className="detail-service-body">
                    {items.map((item, idx) => {
                      const count = cart[item.label]?.count || 0;
                      const isKgService = item.pricingType === "kg";
                      const isSelected = count > 0;
                      return (
                        <div
                          key={idx}
                          className={`detail-service-row${selectedServiceLabel === item.label ? " selected" : ""}`}
                          onClick={() => setSelectedServiceLabel(item.label)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setSelectedServiceLabel(item.label);
                            }
                          }}
                        >
                          <div className="detail-svc-info">
                            <div className="detail-svc-label">
                              {item.displayLabel || item.label}
                            </div>
                            <div className="detail-svc-notes">
                              {item.displayNotes || item.notes}
                            </div>
                            <div className="detail-svc-duration">
                              {item.estimatedTime} ·{" "}
                              {t("shopDetail.finalDetailsAfterConfirm")}
                            </div>
                            <span className="detail-svc-more">
                              {t("shopDetail.viewServiceDetails")}
                            </span>
                          </div>
                          <div className="detail-svc-price">
                            {formatVnd(item.price)}
                            <span className="detail-svc-price-unit">
                              {" "}
                              VND/
                              {item.pricingType === "kg"
                                ? t("shopDetail.unitKg")
                                : item.pricingType === "meter"
                                  ? t("shopDetail.unitMeter")
                                  : t("shopDetail.unitItem")}
                            </span>
                          </div>
                          <div
                            className="detail-qty"
                            style={
                              isKgService
                                ? { gridTemplateColumns: "36px" }
                                : undefined
                            }
                          >
                            {isKgService ? (
                              <button
                                className={`detail-qty-btn ${isSelected ? "minus" : "plus"}`}
                                aria-label={
                                  isSelected
                                    ? t("shopDetail.decreaseQuantity")
                                    : t("shopDetail.increaseQuantity")
                                }
                                onClick={(event) => {
                                  event.stopPropagation();
                                  if (isSelected) {
                                    removeFromCart(item);
                                    return;
                                  }
                                  addToCartWithPendingCheck(item);
                                }}
                              >
                                {isSelected ? "−" : "+"}
                              </button>
                            ) : (
                              <>
                                <button
                                  className="detail-qty-btn minus"
                                  aria-label={t("shopDetail.decreaseQuantity")}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    removeFromCart(item);
                                  }}
                                  disabled={count === 0}
                                >
                                  −
                                </button>
                                <span className="detail-qty-count">
                                  {count}
                                </span>
                                <button
                                  className="detail-qty-btn plus"
                                  aria-label={t("shopDetail.increaseQuantity")}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    addToCartWithPendingCheck(item);
                                  }}
                                >
                                  +
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="detail-sidebar">
            <div className="detail-order-box">
              <div className="detail-order-header">
                <ShoppingCart size={15} />
                {t("shopDetail.selectedServices")}
              </div>
              {cartEntries.length === 0 ? (
                <div className="detail-order-empty">
                  <ShoppingCart size={28} strokeWidth={1.4} />
                  <span>{t("shopDetail.emptyCart")}</span>
                </div>
              ) : (
                <div className="detail-order-items">
                  {cartEntries.map(([label, { count, price, pricingType }]) => (
                    <div key={label} className="detail-order-line">
                      <span className="detail-order-line-label">
                        {translateServiceCopy(t, label, "label", label)}
                      </span>
                      <span className="detail-order-line-price">
                        {count} × {formatVnd(price)} đ/
                        {pricingType === "kg"
                          ? t("shopDetail.unitKg")
                          : t("shopDetail.unitItem")}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="detail-order-subtotal">
                <span>{t("track.subtotal")}</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <div className="detail-order-note">
                {t("shopDetail.priceNote")}
              </div>

              <button
                className="detail-order-cta"
                disabled={cartEntries.length === 0}
                onClick={() =>
                  navigate(
                    localizePath(`/all-shops/${id}/schedule`, language),
                    {
                      state: { cart },
                    },
                  )
                }
              >
                {t("shopDetail.schedulePickup")}
                <ArrowRight size={15} />
              </button>
            </div>

            <div className="detail-promo-box">
              <div className="detail-promo-icon">
                <Tag size={20} strokeWidth={1.8} />
              </div>
              <p className="detail-promo-text">{shop.promo.text}</p>
              <button
                className="detail-promo-code-btn"
                onClick={handleCopyCode}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {shop.promo.code}
              </button>
              <p className="detail-promo-copied">
                {copied ? t("shopDetail.copied") : "\u00a0"}
              </p>
            </div>
          </aside>

          <div className="detail-reviews">
            <h2 className="detail-reviews-heading">
              {t("shopDetail.reviewsTitle")}
            </h2>
            <div className="detail-reviews-grid">
              {shop.reviews.map((r, i) => (
                <div key={i} className="detail-review-card">
                  <div className="detail-review-stars">
                    {renderStars(r.rating, 13)}
                  </div>
                  <p className="detail-review-text">"{r.text}"</p>
                  <div className="detail-review-author">
                    <span className="detail-review-avatar">
                      <User size={14} />
                    </span>
                    <span className="detail-review-name">{r.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {confirmDialog.show && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText}
          onConfirm={confirmDialog.onConfirm}
          onCancel={closeConfirmDialog}
        />
      )}
    </div>
  );
}

export default AllShopsDetail;
