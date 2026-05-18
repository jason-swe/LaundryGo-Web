import { createContext, useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import enTranslations from '../../../locales/en.json'
import viTranslations from '../../../locales/vi.json'
import { getLanguageFromPath } from './localePath'

// Inline translations object
const translationsData = {
    en: { "common": { "appName": "LaundryGo", "loading": "Loading...", "error": "Error", "success": "Success", "cancel": "Cancel", "save": "Save", "delete": "Delete", "edit": "Edit", "back": "Back", "close": "Close" }, "nav": { "home": "Home", "allShops": "All Shops", "trackOrder": "Track Order", "myOrders": "My Orders", "profile": "Profile", "logout": "Logout", "login": "Login", "signup": "Sign Up" }, "landing": { "tagline": "Effortless to keep your wardrobe flawless.", "headline": "Innovating the Way You Wash your Clothes", "aboutTitle": "About Us", "aboutText": "At LaundryGo, we believe your time is too precious to be spent on laundry. Our mission is to provide a seamless, high-quality garment care experience that fits perfectly into your modern lifestyle.", "valuesTitle": "What success means at LaundryGo Cleaners", "pickupTitle": "pick-up & delivery", "skipTrip": "Skip the trip", "skipTripDesc": "Do you run to the dry cleaners 5+ times per month? Try our dry cleaning delivery service.", "samePrice": "Same price", "samePriceDesc": "We pick-up and deliver your dry cleaning with a small flat-rate fee.", "moreServices": "More than dry cleaning", "moreServicesDesc": "LaundryGo also can pick-up and clean your comforters, drapes, area rugs, leather, and suede.", "getStarted": "Get started today", "getStartedDesc": "It's easy. Click to sign up. We will contact you by phone or text to get started.", "valuePride": "PRIDE", "valuePrideDesc": "On a scale of 1–10, be an 11. Be the person that takes an extra step.", "valueAdvancement": "ADVANCEMENT", "valueAdvancementDesc": "When your aim is perfection, you will achieve excellence.", "valueCaring": "CARING", "valueCaringDesc": "Treat each customer how you would like to be treated.", "footerCompany": "Company", "footerAbout": "About Us", "footerBlog": "Blog", "footerPartner": "Partner With Us", "footerSupport": "Support", "footerHelpCenter": "Help Center", "footerFAQ": "FAQ", "footerTerms": "Terms Of Services", "footerNewsletter": "Newsletter", "footerEmail": "Email", "footerPlaceholder": "Enter your email", "footerDescription": "Redefining laundry with modern technology and professional care. We bring the laundromat to your doorstep." }, "auth": { "login": "Login", "signup": "Create Account", "email": "Email", "password": "Password", "confirmPassword": "Confirm Password", "rememberMe": "Remember me", "forgotPassword": "Forgot password?", "dontHaveAccount": "Don't have an account?", "haveAccount": "Already have an account?", "signupSuccess": "Account created successfully!", "loginSuccess": "Logged in successfully!", "emailRequired": "Email is required", "passwordRequired": "Password is required", "passwordTooShort": "Password must be at least 6 characters", "passwordMismatch": "Passwords do not match", "emailTaken": "This email is already registered", "invalidCredentials": "Email or password is incorrect", "loginHint": "Your Laundry, Our Priority. Professional care delivered to your doorstep." }, "shops": { "title": "Find laundry services near you", "subtitle": "Professional cleaning, delivered to your doorstep", "sortBy": "Sort by", "filter": "Filter", "topRated": "Top Rated", "nearest": "Nearest", "fastest": "Fastest", "price": "Price: Low → High", "distance": "Distance", "speed": "Speed", "budget": "Budget", "fiveStarOnly": "5-Star Only", "clearFilters": "Clear filters", "showing": "Showing", "of": "of", "shops": "shops", "rating": "Rating", "delivery": "Delivery", "services": "Services" }, "shopDetail": { "orderSummary": "Order Summary", "addServices": "Add services to get started", "subtotal": "Subtotal", "pickupDelivery": "Pickup & Delivery", "estimatedTotal": "Estimated Total", "schedulePickup": "Schedule Pickup", "washFold": "Wash & Fold", "dryCleaning": "Dry Cleaning", "ironingOnly": "Ironing Only", "serviceType": "Service Type", "quantity": "Quantity", "price": "Price", "monFri": "Mon – Fri", "satSun": "Sat – Sun", "turnaround": "Turnaround", "reviewsTitle": "Customer Reviews", "promoTitle": "Welcome offer", "promoCode": "with code:" }, "booking": { "title": "Schedule Pickup & Delivery", "pickupDate": "Pickup Date", "pickupTime": "Pickup Time Window", "deliveryDate": "Delivery Date", "deliveryTime": "Delivery Time Window", "address": "Address", "selectAddress": "Select or enter delivery address", "notes": "Special Instructions", "selectTimeSlot": "Select Time Slot", "confirmBooking": "Confirm Booking", "selectDate": "Select Date", "selectTime": "Select Time" }, "order": { "confirm": "Order Placed Successfully!", "confirmMessage": "Your laundry pickup has been scheduled. We'll be there on time!", "orderId": "Order ID", "status": "Status", "placedOrder": "Placed Order", "pickedUp": "Picked Up", "inWash": "In Wash", "ready": "Ready", "delivery": "Delivery", "track": "Track Order", "estimatedDelivery": "Estimated Delivery", "pickupLocation": "Pickup Location", "deliveryLocation": "Delivery Location", "lastUpdated": "Last updated", "inProgress": "In Progress", "washingYourClothes": "Washing your clothes", "noOrders": "No Orders", "noOrdersDesc": "You don't have any active orders yet. Visit our shop to place an order.", "backToShop": "Back to Shop", "contactSupport": "Contact Support", "helpCenter": "Help Center", "shopLocation": "EXE Shop", "yourLocation": "Your Location", "distance": "Distance", "driverCard": "Driver", "orderSummary": "Order Summary" } },
    vi: { "common": { "appName": "LaundryGo", "loading": "Đang tải...", "error": "Lỗi", "success": "Thành công", "cancel": "Hủy", "save": "Lưu", "delete": "Xóa", "edit": "Chỉnh sửa", "back": "Quay lại", "close": "Đóng" }, "nav": { "home": "Trang chủ", "allShops": "Tất cả cửa hàng", "trackOrder": "Theo dõi đơn hàng", "myOrders": "Đơn hàng của tôi", "profile": "Hồ sơ", "logout": "Đăng xuất", "login": "Đăng nhập", "signup": "Đăng ký" }, "landing": { "tagline": "Dễ dàng giữ cho trang phục của bạn luôn hoàn hảo.", "headline": "Đổi mới cách bạn giặt ủi quần áo", "aboutTitle": "Về chúng tôi", "aboutText": "Tại LaundryGo, chúng tôi tin rằng thời gian của bạn quý giá hơn để dành cho giặt giũ. Sứ mệnh của chúng tôi là cung cấp trải nghiệm chăm sóc trang phục liền mạch, chất lượng cao phù hợp với lối sống hiện đại của bạn.", "valuesTitle": "Ý nghĩa thành công tại LaundryGo Cleaners", "pickupTitle": "Nhận và giao hàng", "skipTrip": "Bỏ qua chuyến đi", "skipTripDesc": "Bạn chạy đến tiệm giặt khô 5+ lần mỗi tháng? Hãy thử dịch vụ giao hàng giặt khô của chúng tôi.", "samePrice": "Giá tương tự", "samePriceDesc": "Chúng tôi đến lấy và giao hàng giặt khô của bạn với một khoản phí cố định nhỏ.", "moreServices": "Hơn cả giặt khô", "moreServicesDesc": "LaundryGo cũng có thể đến lấy và giặt chăn đệm, rèm cửa, thảm, da và da lộn của bạn.", "getStarted": "Bắt đầu hôm nay", "getStartedDesc": "Rất đơn giản. Nhấp vào đăng ký. Chúng tôi sẽ liên hệ bạn qua điện thoại hoặc tin nhắn để bắt đầu.", "valuePride": "NIỀM TỰ HÀO", "valuePrideDesc": "Trên thang điểm 1-10, hãy là 11. Hãy là người luôn đi thêm một bước.", "valueAdvancement": "PHÁT TRIỂN", "valueAdvancementDesc": "Khi mục tiêu của bạn là hoàn hảo, bạn sẽ đạt được xuất sắc.", "valueCaring": "CHĂM SÓC", "valueCaringDesc": "Hãy đối xử với mỗi khách hàng như cách bạn muốn được đối xử.", "footerCompany": "Công ty", "footerAbout": "Về chúng tôi", "footerBlog": "Blog", "footerPartner": "Trở thành đối tác", "footerSupport": "Hỗ trợ", "footerHelpCenter": "Trung tâm trợ giúp", "footerFAQ": "Câu hỏi thường gặp", "footerTerms": "Điều khoản dịch vụ", "footerNewsletter": "Bản tin", "footerEmail": "Email", "footerPlaceholder": "Nhập email của bạn", "footerDescription": "Định hình lại giặt ủi bằng công nghệ hiện đại và chăm sóc chuyên nghiệp. Chúng tôi mang nhà máy giặt đến ngưỡng cửa của bạn." }, "auth": { "login": "Đăng nhập", "signup": "Tạo tài khoản", "email": "Email", "password": "Mật khẩu", "confirmPassword": "Xác nhận mật khẩu", "rememberMe": "Ghi nhớ tôi", "forgotPassword": "Quên mật khẩu?", "dontHaveAccount": "Chưa có tài khoản?", "haveAccount": "Đã có tài khoản?", "signupSuccess": "Tạo tài khoản thành công!", "loginSuccess": "Đăng nhập thành công!", "emailRequired": "Email là bắt buộc", "passwordRequired": "Mật khẩu là bắt buộc", "passwordTooShort": "Mật khẩu phải có ít nhất 6 ký tự", "passwordMismatch": "Mật khẩu không khớp", "emailTaken": "Email này đã được đăng ký", "invalidCredentials": "Email hoặc mật khẩu không chính xác", "loginHint": "Quần áo của bạn, Ưu tiên của chúng tôi. Chăm sóc chuyên nghiệp được giao đến cửa của bạn." }, "shops": { "title": "Tìm dịch vụ giặt ủi gần bạn", "subtitle": "Vệ sinh chuyên nghiệp, được giao tận nơi", "sortBy": "Sắp xếp theo", "filter": "Lọc", "topRated": "Được đánh giá cao nhất", "nearest": "Gần nhất", "fastest": "Nhanh nhất", "price": "Giá: Thấp → Cao", "distance": "Khoảng cách", "speed": "Tốc độ", "budget": "Ngân sách", "fiveStarOnly": "Chỉ 5 sao", "clearFilters": "Xóa bộ lọc", "showing": "Đang hiển thị", "of": "trong", "shops": "cửa hàng", "rating": "Xếp hạng", "delivery": "Giao hàng", "services": "Dịch vụ" }, "shopDetail": { "orderSummary": "Tóm tắt đơn hàng", "addServices": "Thêm dịch vụ để bắt đầu", "subtotal": "Tổng cộng", "pickupDelivery": "Nhận hàng & Giao hàng", "estimatedTotal": "Tổng ước tính", "schedulePickup": "Lên lịch nhận hàng", "washFold": "Giặt & Gấp", "dryCleaning": "Giặt khô", "ironingOnly": "Chỉ ủi", "serviceType": "Loại dịch vụ", "quantity": "Số lượng", "price": "Giá", "monFri": "Thứ Hai - Thứ Sáu", "satSun": "Thứ Bảy - Chủ Nhật", "turnaround": "Thời gian xử lý", "reviewsTitle": "Đánh giá của khách hàng", "promoTitle": "Ưu đãi chào mừng", "promoCode": "với mã:" }, "booking": { "title": "Lên lịch Nhận hàng & Giao hàng", "pickupDate": "Ngày nhận hàng", "pickupTime": "Khung giờ nhận hàng", "deliveryDate": "Ngày giao hàng", "deliveryTime": "Khung giờ giao hàng", "address": "Địa chỉ", "selectAddress": "Chọn hoặc nhập địa chỉ giao hàng", "notes": "Hướng dẫn đặc biệt", "selectTimeSlot": "Chọn khung giờ", "confirmBooking": "Xác nhận đặt lịch", "selectDate": "Chọn ngày", "selectTime": "Chọn giờ" }, "order": { "confirm": "Đặt đơn hàng thành công!", "confirmMessage": "Lịch nhận giặt của bạn đã được xác nhận. Chúng tôi sẽ đến đúng giờ!", "orderId": "Mã đơn hàng", "status": "Trạng thái", "placedOrder": "Đã đặt hàng", "pickedUp": "Đã nhận", "inWash": "Đang giặt", "ready": "Đã sẵn sàng", "delivery": "Giao hàng", "track": "Theo dõi đơn hàng", "estimatedDelivery": "Ngày giao hàng ước tính", "pickupLocation": "Địa điểm nhận hàng", "deliveryLocation": "Địa điểm giao hàng", "lastUpdated": "Cập nhật lần cuối", "inProgress": "Đang xử lý", "washingYourClothes": "Đang giặt quần áo của bạn", "noOrders": "Không có đơn hàng", "noOrdersDesc": "Bạn chưa có đơn hàng nào. Hãy truy cập cửa hàng để đặt đơn hàng.", "backToShop": "Quay lại cửa hàng", "contactSupport": "Liên hệ hỗ trợ", "helpCenter": "Trung tâm trợ giúp", "shopLocation": "Cửa hàng EXE", "yourLocation": "Vị trí của bạn", "distance": "Khoảng cách", "driverCard": "Tài xế", "orderSummary": "Tóm tắt đơn hàng" } }
}

const LANG_STORAGE_KEY = 'laundrygo_language'
const DEFAULT_LANGUAGE = 'en'

let translations = {
    en: { ...translationsData.en, ...enTranslations },
    vi: { ...translationsData.vi, ...viTranslations },
}

export const TranslationContext = createContext()

export function TranslationProvider({ children }) {
    const location = useLocation()
    const [language, setLanguage] = useState(() => {
        const routeLanguage = getLanguageFromPath(window.location.pathname)
        if (routeLanguage === 'vi') return routeLanguage

        // Load language preference from localStorage
        try {
            const stored = localStorage.getItem(LANG_STORAGE_KEY)
            return stored && (stored === 'en' || stored === 'vi') ? stored : DEFAULT_LANGUAGE
        } catch {
            return DEFAULT_LANGUAGE
        }
    })

    useEffect(() => {
        const routeLanguage = getLanguageFromPath(location.pathname)
        setLanguage(routeLanguage)
    }, [location.pathname])

    // Persist language preference
    useEffect(() => {
        try {
            localStorage.setItem(LANG_STORAGE_KEY, language)
        } catch (error) {
            console.error('Failed to save language preference:', error)
        }
    }, [language])

    const changeLanguage = useCallback((lang) => {
        if (lang === 'en' || lang === 'vi') {
            setLanguage(lang)
        }
    }, [])

    const t = useCallback(
        (key) => {
            const keys = key.split('.')
            let value = translations[language]

            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k]
                } else {
                    // Fallback to English if key not found
                    value = translations['en']
                    for (const k of keys) {
                        if (value && typeof value === 'object' && k in value) {
                            value = value[k]
                        } else {
                            return key // Return key itself if not found anywhere
                        }
                    }
                    return value
                }
            }

            return value || key
        },
        [language]
    )

    const value = {
        language,
        changeLanguage,
        t,
        availableLanguages: ['en', 'vi'],
        languageNames: { en: 'English', vi: 'Tiếng Việt' }
    }

    return (
        <TranslationContext.Provider value={value}>
            {children}
        </TranslationContext.Provider>
    )
}
