// Data Manager Utility for persisting data changes
// Uses localStorage to save changes and provides export functionality

const STORAGE_KEYS = {
    ORDERS: 'laundrygo_orders',
    SERVICES: 'laundrygo_services',
    MACHINES: 'laundrygo_machines',
    SUPPLIES: 'laundrygo_supplies',
    STAFF: 'laundrygo_staff',
    CUSTOMERS: 'laundrygo_customers',
    REVENUE: 'laundrygo_revenue',
    STATISTICS: 'laundrygo_statistics',
    DOCUMENTS: 'laundrygo_documents',
    INCIDENTS: 'laundrygo_incidents',
    NOTIFICATIONS: 'laundrygo_notifications',
    SETTINGS: 'laundrygo_settings'
}

// Load data from localStorage or use default data
export const loadData = (key, defaultData) => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS[key])
        if (stored) {
            return JSON.parse(stored)
        }
        return defaultData
    } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error)
        return defaultData
    }
}

// Save data to localStorage
export const saveData = (key, data) => {
    try {
        localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data))
        return true
    } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error)
        return false
    }
}

// Clear specific data from localStorage
export const clearData = (key) => {
    try {
        localStorage.removeItem(STORAGE_KEYS[key])
        return true
    } catch (error) {
        console.error(`Error clearing ${key} from localStorage:`, error)
        return false
    }
}

// Clear all data from localStorage
export const clearAllData = () => {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key)
        })
        return true
    } catch (error) {
        console.error('Error clearing all data from localStorage:', error)
        return false
    }
}

// Export data as JSON file for download
export const exportDataAsJSON = (data, filename) => {
    try {
        const jsonString = JSON.stringify(data, null, 2)
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        return true
    } catch (error) {
        console.error('Error exporting data:', error)
        return false
    }
}

// Export all data as a single JSON file
export const exportAllData = (allData) => {
    return exportDataAsJSON(allData, 'laundrygo-all-data.json')
}

// Orders specific functions
export const saveOrders = (orders) => {
    return saveData('ORDERS', orders)
}

export const loadOrders = (defaultOrders) => {
    return loadData('ORDERS', defaultOrders)
}

export const exportOrders = (orders) => {
    return exportDataAsJSON(orders, 'orders.json')
}

// Services specific functions
export const saveServices = (services) => {
    return saveData('SERVICES', services)
}

export const loadServices = (defaultServices) => {
    return loadData('SERVICES', defaultServices)
}

// Machines specific functions
export const saveMachines = (machines) => {
    return saveData('MACHINES', machines)
}

export const loadMachines = (defaultMachines) => {
    return loadData('MACHINES', defaultMachines)
}

// Supplies specific functions
export const saveSupplies = (supplies) => {
    return saveData('SUPPLIES', supplies)
}

export const loadSupplies = (defaultSupplies) => {
    return loadData('SUPPLIES', defaultSupplies)
}

// Staff specific functions
export const saveStaff = (staff) => {
    return saveData('STAFF', staff)
}

export const loadStaff = (defaultStaff) => {
    return loadData('STAFF', defaultStaff)
}

// Customers specific functions
export const saveCustomers = (customers) => {
    return saveData('CUSTOMERS', customers)
}

export const loadCustomers = (defaultCustomers) => {
    return loadData('CUSTOMERS', defaultCustomers)
}

// Documents specific functions
export const saveDocuments = (documents) => {
    return saveData('DOCUMENTS', documents)
}

export const loadDocuments = (defaultDocuments) => {
    return loadData('DOCUMENTS', defaultDocuments)
}

// Incidents specific functions
export const saveIncidents = (incidents) => {
    return saveData('INCIDENTS', incidents)
}

export const loadIncidents = (defaultIncidents) => {
    return loadData('INCIDENTS', defaultIncidents)
}

// Notifications specific functions
export const saveNotifications = (notifications) => {
    return saveData('NOTIFICATIONS', notifications)
}

export const loadNotifications = (defaultNotifications) => {
    return loadData('NOTIFICATIONS', defaultNotifications)
}

// Settings specific functions
export const saveSettings = (settings) => {
    return saveData('SETTINGS', settings)
}

export const loadSettings = (defaultSettings) => {
    return loadData('SETTINGS', defaultSettings)
}

export default {
    loadData,
    saveData,
    clearData,
    clearAllData,
    exportDataAsJSON,
    exportAllData,
    saveOrders,
    loadOrders,
    exportOrders,
    saveServices,
    loadServices,
    saveMachines,
    loadMachines,
    saveSupplies,
    loadSupplies,
    saveStaff,
    loadStaff,
    saveCustomers,
    loadCustomers,
    saveDocuments,
    loadDocuments,
    saveIncidents,
    loadIncidents,
    saveNotifications,
    loadNotifications,
    saveSettings,
    loadSettings
}
