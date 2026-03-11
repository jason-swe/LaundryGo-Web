// Central data import/export file
// Shop Dashboard + Admin Dashboard

// ── Shop Dashboard data ──────────────────────────────────────
import ordersData from './orders.json'
import servicesData from './services.json'
import machinesData from './machines.json'
import suppliesData from './supplies.json'
import staffData from './staff.json'
import customersData from './customers.json'
import revenueData from './revenue.json'
import statisticsData from './statistics.json'
import documentsData from './documents.json'
import incidentsData from './incidents.json'
import notificationsData from './notifications.json'
import settingsData from './settings.json'

// ── Admin Dashboard data ─────────────────────────────────────
import shippersRaw from './shippers.json'
import shopsRaw from './shops.json'
import adminCustomersRaw from './adminCustomers.json'
import adminOrdersRaw from './adminOrders.json'
import financeRaw from './finance.json'
import promotionsRaw from './promotions.json'
import adminNotificationsRaw from './adminNotifications.json'

// ── Shop Dashboard exports ───────────────────────────────────
export const orders = ordersData
export const services = servicesData
export const machines = machinesData
export const supplies = suppliesData
export const staff = staffData
export const customers = customersData
export const revenue = revenueData
export const statistics = statisticsData
export const documents = documentsData
export const incidents = incidentsData
export const notifications = notificationsData
export const settings = settingsData

// ── Admin Dashboard exports ──────────────────────────────────
export const shippers = shippersRaw.shippers
export const pendingShippers = shippersRaw.pendingShippers
export const shipperPayments = shippersRaw.shipperPayments

export const shops = shopsRaw.shops
export const pendingShops = shopsRaw.pendingShops
export const shopDocumentUpdates = shopsRaw.shopDocumentUpdates

export const adminCustomers = adminCustomersRaw.customers
export const customerComplaints = adminCustomersRaw.customerComplaints

export const adminOrders = adminOrdersRaw.orders

export const financeConfig = financeRaw.config
export const shopRevenue = financeRaw.shopRevenue
export const platformRevenueTrend = financeRaw.platformRevenueTrend
export const pendingPayouts = financeRaw.pendingPayouts

export const promotions = promotionsRaw.promotions
export const shopAchievements = promotionsRaw.shopAchievements

export const adminNotifications = adminNotificationsRaw.notifications

// Export as default object for convenience
export default {
    orders: ordersData,
    services: servicesData,
    machines: machinesData,
    supplies: suppliesData,
    staff: staffData,
    customers: customersData,
    revenue: revenueData,
    statistics: statisticsData,
    documents: documentsData,
    incidents: incidentsData,
    notifications: notificationsData,
    settings: settingsData
}

// Helper functions for data manipulation
export const getOrderById = (orderId) => {
    return ordersData.find(order => order.id === orderId)
}

export const getOrdersByStatus = (status) => {
    return ordersData.filter(order => order.status === status)
}

export const getCustomerById = (customerId) => {
    return customersData.find(customer => customer.id === customerId)
}

export const getStaffById = (staffId) => {
    return staffData.find(staff => staff.id === staffId)
}

export const getMachineById = (machineId) => {
    return machinesData.find(machine => machine.id === machineId)
}

export const getServiceById = (serviceId) => {
    return servicesData.find(service => service.id === serviceId)
}

export const getUnreadNotifications = () => {
    return notificationsData.filter(notif => !notif.read)
}

export const getActiveIncidents = () => {
    return incidentsData.filter(incident => incident.status !== 'resolved')
}

export const getLowStockSupplies = () => {
    return suppliesData.filter(supply => supply.current <= supply.reorderPoint)
}

export const getAvailableMachines = () => {
    return machinesData.filter(machine => machine.status === 'empty')
}

export const getActiveStaff = () => {
    return staffData.filter(staff => staff.status === 'active')
}
