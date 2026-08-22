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
  addCartItem,
  clearCart,
  deleteCartItem,
  getCart,
  updateCartItemQuantity,
} from "../services/cartApi";
import { getShopVouchers } from "../services/voucherApi";
import { apiRequest } from "../utils/api";
import { getLoggedInUser, normalizeRole } from "../utils/auth";
import { getShopFallbackImage } from "../data/shopMedia";

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

const normalizePricingType = (value, fallbackItem) => {
  const raw = String(value || "").toLowerCase();
  if (raw.includes("kg") || raw.includes("kilo")) return "kg";
  if (raw.includes("meter") || raw === "m") return "meter";
  if (raw.includes("item") || raw.includes("piece")) return "item";
  return fallbackItem ? inferPricingType(fallbackItem) : "item";
};

// ─────────────────────────────────────────────────────────────
//  Default UI sections used when BE doesn't return services yet
// ─────────────────────────────────────────────────────────────
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
const mapBackendService = (service, categoryName = "") => {
  const label =
    service?.serviceName || service?.name || `Service #${service?.id || ""}`;
  const fallbackItem = { label };

  return {
    serviceId: service?.id,
    label,
    price: service?.price !== undefined && service?.price !== null ? Number(service.price) : null,
    notes: service?.description || "",
    category: categoryName,
    description: service?.description || "",
    estimatedTime: service?.estimatedTime || "",
    minOrder: service?.minOrder !== undefined && service?.minOrder !== null ? Number(service.minOrder) : null,
    pricingType: normalizePricingType(
      service?.pricingType || service?.serviceUnit,
      fallbackItem,
    ),
    available: service?.available,
    tags: categoryName ? [categoryName] : [],
  };
};

const mapBackendCategoriesToServices = (categories = []) => {
  const grouped = {
    washFold: [],
    dryCleaning: [],
    ironing: null,
  };

  categories.forEach((category) => {
    const categoryName = category?.name || category?.categoryName || "";
    const normalized = categoryName.toLowerCase();
    const services = (category?.services || []).map((service) =>
      mapBackendService(service, categoryName),
    );

    if (normalized.includes("dry")) {
      grouped.dryCleaning.push(...services);
      return;
    }

    if (normalized.includes("iron") || normalized.includes("press")) {
      grouped.ironing = services[0] || grouped.ironing;
      grouped.washFold.push(...services.slice(1));
      return;
    }

    grouped.washFold.push(...services);
  });

  return grouped;
};

const hasBackendServices = (services) =>
  services.washFold.length > 0 ||
  services.dryCleaning.length > 0 ||
  Boolean(services.ironing);

function mapBackendShopToFrontend(beData, shopId, serviceCategories = []) {
  const shopIdStr = String(shopId || "");

  // ── Determine starting price for default services ──────────
  // BE ShopDetailResponse doesn't expose price yet → use 7000 VND
  // ── Resolve image ──────────────────────────────────────────
  const image =
    beData?.imageUrl ||
    beData?.coverImageUrl ||
    beData?.image ||
    getShopFallbackImage(shopId);

  // ── Resolve hours ──────────────────────────────────────────
  const hours =
    beData?.hours && typeof beData.hours === "object" ? beData.hours : {};

  // ── Resolve other scalar fields with safe fallbacks ────────
  const turnaround = beData?.turnaround || "";
  const distance = beData?.distance || "";
  const backendServices = mapBackendCategoriesToServices(serviceCategories);
  const services = hasBackendServices(backendServices)
    ? backendServices
    : { washFold: [], dryCleaning: [], ironing: null };
  const promotions = Array.isArray(beData?.promotions)
    ? beData.promotions
    : beData?.promo
      ? [beData.promo]
      : [];
  const reviews = Array.isArray(beData?.reviews) ? beData.reviews : [];
  const rating = Number(beData?.rating);

  return {
    id: shopIdStr,
    name: beData?.name || `Shop #${shopIdStr}`,
    rating: Number.isFinite(rating) ? rating : null,
    address: beData?.address || "",
    distance,
    delivery: turnaround,
    hours,
    turnaround,
    image,
    services,
    promotions,
    reviews,
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
  const [vouchers, setVouchers] = useState([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);

  // ── Cart state — init from pending cart if same shop ──────
  const [cartPayload, setCartPayload] = useState(null);
  const [cart, setCart] = useState({});
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [cartActionServiceId, setCartActionServiceId] = useState(null);
  const [cartError, setCartError] = useState("");

  // ── Other UI state ─────────────────────────────────────────
  const [copied, setCopied] = useState(false);
  const [selectedServiceLabel, setSelectedServiceLabel] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ show: false });

  useEffect(() => {
    let active = true;
    setIsLoadingCart(true);
    setCartError("");

    getCart()
      .then((nextCart) => {
        if (!active) return;
        setCartPayload(nextCart);
        setCart(String(nextCart?.shopId) === String(id) ? nextCart.cart || {} : {});
      })
      .catch((err) => {
        if (!active) return;
        setCartPayload(null);
        setCart({});
        if (err?.status && err.status !== 401 && err.status !== 403) {
          setCartError(err.message || "Could not load cart");
        }
      })
      .finally(() => {
        if (active) setIsLoadingCart(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  // ── Fetch shop detail from BE ─────────────────────────────
  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setShop(null);

    const fetchShopDetail = async () => {
      try {
        const [response, categoriesResponse] = await Promise.all([
          apiRequest(`/api/v1/shops/${id}`),
          apiRequest(`/api/v1/shops/${id}/service-categories`).catch(() => ({
            data: [],
          })),
        ]);
        if (!isMounted) return;

        // ── DIAGNOSTIC LOG ─────────────────────────────────────
        console.log("=== LAUNDRYGO DEBUG: API Response Raw ===", response);

        // Unwrap BaseResponse wrapper: { success, message, data } → data
        // Falls back to the full response if no `.data` key present.
        const beData =
          response?.data !== undefined && response?.data !== null
            ? response.data
            : response;
        const serviceCategories = Array.isArray(categoriesResponse?.data)
          ? categoriesResponse.data
          : [];

        // ── DIAGNOSTIC LOG ─────────────────────────────────────
        console.log("=== LAUNDRYGO DEBUG: beData before mapping ===", beData);
        console.log(
          "=== LAUNDRYGO DEBUG: Data sau khi Map ===",
          mapBackendShopToFrontend(beData, id, serviceCategories),
        );

        // Adapter ALWAYS returns a full object — never null.
        // Only set error if the API explicitly returned a failure
        // (handled in catch) or the shop truly doesn't exist (404).
        const mapped = mapBackendShopToFrontend(beData, id, serviceCategories);
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

  useEffect(() => {
    if (!id) return;

    let active = true;
    setIsLoadingVouchers(true);
    setVouchers([]);

    getShopVouchers(id)
      .then((items) => {
        if (active) setVouchers(items);
      })
      .catch(() => {
        if (active) setVouchers([]);
      })
      .finally(() => {
        if (active) setIsLoadingVouchers(false);
      });

    return () => {
      active = false;
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
        t("shopDetail.unavailable"),
    ),
    description: translateServiceCopy(
      t,
      item.label,
      "description",
      item.description ||
        SERVICE_META_BY_LABEL[item.label]?.description ||
        item.notes,
    ),
    minOrder: item.minOrder ?? SERVICE_META_BY_LABEL[item.label]?.minOrder ?? null,
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
  const closeConfirmDialog = () => setConfirmDialog({ show: false });

  const findCartLine = (item) =>
    Object.values(cart).find((line) => String(line.serviceId) === String(item.serviceId)) ||
    cart[item.label];

  const syncCart = (nextCart) => {
    setCartPayload(nextCart);
    setCart(String(nextCart?.shopId) === String(id) ? nextCart.cart || {} : {});
  };

  const ensureCustomerSession = () => {
    const session = getLoggedInUser();
    if (!session?.accessToken) {
      navigate(localizePath("/login", language), {
        state: { returnTo: localizePath(`/all-shops/${id}`, language) },
      });
      return false;
    }
    if (normalizeRole(session.role) !== "CUSTOMER") {
      setCartError("Please sign in with a customer account to create a booking.");
      return false;
    }
    return true;
  };

  const addToCart = async (item) => {
    if (!ensureCustomerSession()) return;

    if (!item.serviceId) {
      setCartError("This service is missing serviceId. Please refresh and choose again.");
      return;
    }

    setCartActionServiceId(item.serviceId);
    setCartError("");
    try {
      const prev = findCartLine(item);
      const nextQuantity = item.pricingType === "kg" ? 1 : Number(prev?.count || 0) + 1;
      const nextCart = prev?.cartItemId
        ? await updateCartItemQuantity(prev.cartItemId, nextQuantity)
        : await addCartItem(item.serviceId, 1);
      syncCart(nextCart);
      setSelectedServiceLabel(item.label);
    } catch (err) {
      setCartError(err?.message || "Could not update cart");
    } finally {
      setCartActionServiceId(null);
    }
  };

  const addToCartWithPendingCheck = (item) => {
    if (!ensureCustomerSession()) return;

    const hasForeignCart =
      cartPayload?.shopId &&
      String(cartPayload.shopId) !== String(id) &&
      Number(cartPayload.totalItems || 0) > 0;

    if (hasForeignCart) {
      setConfirmDialog({
        show: true,
        title: "Replace current pending cart?",
        message: `You already have a cart from ${cartPayload.shopName}. Adding services from ${shopName} will remove that cart and start a new one. Do you want to continue?`,
        cancelText: "Cancel",
        confirmText: "Replace Cart",
        type: "warning",
        onConfirm: async () => {
          setCartActionServiceId(item.serviceId);
          try {
            const emptiedCart = await clearCart();
            syncCart(emptiedCart);
            await addToCart(item);
          } finally {
            setCartActionServiceId(null);
          }
          closeConfirmDialog();
        },
      });
      return;
    }

    addToCart(item);
  };

  const removeFromCart = async (item) => {
    const prev = findCartLine(item);
    if (!prev?.cartItemId) return;

    setCartActionServiceId(item.serviceId);
    setCartError("");
    try {
      const nextCart =
        item.pricingType === "kg" || Number(prev.count || 0) <= 1
          ? await deleteCartItem(prev.cartItemId)
          : await updateCartItemQuantity(prev.cartItemId, Number(prev.count || 0) - 1);
      syncCart(nextCart);
    } catch (err) {
      setCartError(err?.message || "Could not update cart");
    } finally {
      setCartActionServiceId(null);
    }
  };

  const handleCopyCode = () => {
    const code = vouchers[0]?.code;
    if (!code) return;
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
  const activePromotion = vouchers[0] || null;
  const subtotal = Number(cartPayload?.subtotal || 0) || cartEntries.reduce(
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
      items: shop.services.ironing ? [enrichServiceItem(shop.services.ironing)] : [],
    },
  ].filter((section) => section.items.length > 0);

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
              e.target.src = getShopFallbackImage(id);
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
              <span className="detail-hero-star-value">
                {shop.rating !== null ? shop.rating.toFixed(1) : t("shopDetail.unavailable")}
              </span>
            </div>
            <h1 className="detail-hero-name">{shop.name}</h1>
            <span className="detail-hero-address">
              <MapPin size={15} strokeWidth={1.8} />
              {shop.address || t("shopDetail.unavailable")}
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
                  {shop.distance || t("shopDetail.unavailable")}
                </span>
              </div>
              <div className="detail-meta-card">
                <span className="detail-meta-card-label">
                  {t("shopDetail.turnaround")}
                </span>
                <Clock size={16} className="detail-meta-card-icon" />
                <span className="detail-meta-card-value">
                  {shop.turnaround || t("shopDetail.unavailable")}
                </span>
              </div>
              <div className="detail-meta-card">
                <span className="detail-meta-card-label">
                  {t("shopDetail.weekdays")}
                </span>
                <Clock size={16} className="detail-meta-card-icon" />
                <span className="detail-meta-card-value">
                  {shop.hours["Mon-Fri"] || t("shopDetail.unavailable")}
                </span>
              </div>
              <div className="detail-meta-card">
                <span className="detail-meta-card-label">
                  {t("shopDetail.weekend")}
                </span>
                <Clock size={16} className="detail-meta-card-icon" />
                <span className="detail-meta-card-value">
                  {shop.hours["Sat-Sun"] || t("shopDetail.unavailable")}
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
                        {selectedService.minOrder !== null
                          ? `${selectedService.minOrder} ${
                              selectedService.pricingType === "kg"
                                ? t("shopDetail.unitKg")
                                : t("shopDetail.unitItems")
                            }`
                          : t("shopDetail.unavailable")}
                      </span>
                    </div>
                    <div>
                      <span className="detail-service-inspector-k">
                        {t("shopDetail.price")}
                      </span>
                      <span className="detail-service-inspector-v">
                        {selectedService.price !== null
                          ? `${formatVnd(selectedService.price)} VND`
                          : t("shopDetail.unavailable")}
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
                      {selectedService.available === true
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
              {SERVICE_SECTIONS.length === 0 ? (
                <div className="detail-service-card">
                  <div className="detail-service-body">
                    <div className="detail-order-empty">
                      <ShoppingCart size={28} strokeWidth={1.4} />
                      <span>{t("shopDetail.unavailable")}</span>
                    </div>
                  </div>
                </div>
              ) : SERVICE_SECTIONS.map(({ id: sId, titleKey, Icon, items }) => (
                <div key={sId} className="detail-service-card">
                  <div className="detail-service-header">
                    <div className="detail-service-icon">
                      {createElement(Icon, { size: 16, strokeWidth: 1.8 })}
                    </div>
                    <span className="detail-service-title">{t(titleKey)}</span>
                  </div>
                  <div className="detail-service-body">
                    {items.map((item, idx) => {
                      const cartLine = findCartLine(item);
                      const count = cartLine?.count || 0;
                      const isKgService = item.pricingType === "kg";
                      const isSelected = count > 0;
                      const isBusy = cartActionServiceId === item.serviceId;
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
                            {item.price !== null ? formatVnd(item.price) : t("shopDetail.unavailable")}
                            <span className="detail-svc-price-unit">
                              {item.price !== null && (
                                <>
                                  {" "}
                                  VND/
                                  {item.pricingType === "kg"
                                    ? t("shopDetail.unitKg")
                                    : item.pricingType === "meter"
                                      ? t("shopDetail.unitMeter")
                                      : t("shopDetail.unitItem")}
                                </>
                              )}
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
                                disabled={isBusy}
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
                                  disabled={count === 0 || isBusy}
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
                                disabled={isBusy}
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
                {cartError || (isLoadingCart ? "Loading cart..." : t("shopDetail.priceNote"))}
              </div>

              <button
                className="detail-order-cta"
                disabled={cartEntries.length === 0 || isLoadingCart}
                onClick={() =>
                  navigate(localizePath(`/all-shops/${id}/schedule`, language))
                }
              >
                {t("shopDetail.schedulePickup")}
                <ArrowRight size={15} />
              </button>
            </div>

            {isLoadingVouchers && !activePromotion && (
              <div className="detail-promo-box" role="status">
                <div className="detail-promo-icon">
                  <Loader2 size={20} strokeWidth={1.8} />
                </div>
                <p className="detail-promo-text">{t("common.loading")}</p>
              </div>
            )}

            {activePromotion && (
              <div className="detail-promo-box">
                <div className="detail-promo-icon">
                  <Tag size={20} strokeWidth={1.8} />
                </div>
                <p className="detail-promo-text">{activePromotion.text || activePromotion.description}</p>
                {activePromotion.code && (
                  <button
                    className="detail-promo-code-btn"
                    onClick={handleCopyCode}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {activePromotion.code}
                  </button>
                )}
                <p className="detail-promo-copied">
                  {copied ? t("shopDetail.copied") : "\u00a0"}
                </p>
              </div>
            )}
          </aside>

          <div className="detail-reviews">
            <h2 className="detail-reviews-heading">
              {t("shopDetail.reviewsTitle")}
            </h2>
            <div className="detail-reviews-grid">
              {shop.reviews.length === 0 ? (
                <div className="detail-review-card">
                  <p className="detail-review-text">{t("shopDetail.unavailable")}</p>
                </div>
              ) : shop.reviews.map((r, i) => (
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
