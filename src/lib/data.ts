// Static data for the application
// This will be replaced with Supabase integration later

export interface User {
    id: string
    email: string
    name: string
    role: string
    createdAt: string
    updatedAt: string
}

export interface Order {
    id: string
    orderNumber: string
    customerName: string
    customerPhone: string
    customerEmail?: string
    eventType: string
    guestCount: number
    bookingDate: string
    eventDate: string
    venue: string
    status: 'BOOKED' | 'MENU_FINALIZED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
    totalAmount: number
    notes?: string
    createdAt: string
    updatedAt: string
    userId: string
    menus: Menu[]
}

export interface Menu {
    id: string
    name: string
    description?: string
    totalPrice: number
    isTemplate: boolean
    createdAt: string
    updatedAt: string
    orderId?: string
    items: MenuItem[]
}

export interface MenuItem {
    id: string
    name: string
    category: string
    description?: string
    price: number
    quantity: number
    unit: string
    menuId: string
}

export interface Expense {
    id: string
    title: string
    amount: number
    category: 'INGREDIENTS' | 'EQUIPMENT' | 'TRANSPORTATION' | 'STAFF' | 'MARKETING' | 'UTILITIES' | 'OTHER'
    description?: string
    date: string
    createdAt: string
    updatedAt: string
    userId: string
}

// Static user data
export const users: User[] = [
    {
        id: '1',
        email: 'admin@samarthcaters.com',
        name: 'Admin User',
        role: 'admin',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    }
]

// Static orders data
export const orders: Order[] = [
    {
        id: '1',
        orderNumber: 'SC-001',
        customerName: 'Rajesh Kumar',
        customerPhone: '+91 9876543210',
        customerEmail: 'rajesh@example.com',
        eventType: 'Wedding',
        guestCount: 200,
        bookingDate: '2024-01-15',
        eventDate: '2024-03-15',
        venue: 'Royal Palace Banquet Hall',
        status: 'BOOKED',
        totalAmount: 50000,
        notes: 'Vegetarian menu preferred',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        userId: '1',
        menus: []
    },
    {
        id: '2',
        orderNumber: 'SC-002',
        customerName: 'Priya Sharma',
        customerPhone: '+91 9876543211',
        customerEmail: 'priya@example.com',
        eventType: 'Birthday Party',
        guestCount: 50,
        bookingDate: '2024-01-10',
        eventDate: '2024-02-20',
        venue: 'Home Garden',
        status: 'MENU_FINALIZED',
        totalAmount: 15000,
        notes: 'Kids birthday party',
        createdAt: '2024-01-10T14:30:00Z',
        updatedAt: '2024-01-10T14:30:00Z',
        userId: '1',
        menus: []
    },
    {
        id: '3',
        orderNumber: 'SC-003',
        customerName: 'Amit Patel',
        customerPhone: '+91 9876543212',
        customerEmail: 'amit@example.com',
        eventType: 'Corporate Event',
        guestCount: 100,
        bookingDate: '2024-01-20',
        eventDate: '2024-02-28',
        venue: 'Tech Park Conference Hall',
        status: 'IN_PROGRESS',
        totalAmount: 25000,
        notes: 'Lunch meeting for 100 people',
        createdAt: '2024-01-20T09:15:00Z',
        updatedAt: '2024-01-20T09:15:00Z',
        userId: '1',
        menus: []
    },
    {
        id: '4',
        orderNumber: 'SC-004',
        customerName: 'Sunita Gupta',
        customerPhone: '+91 9876543213',
        customerEmail: 'sunita@example.com',
        eventType: 'Anniversary',
        guestCount: 75,
        bookingDate: '2024-01-05',
        eventDate: '2024-01-25',
        venue: 'Garden Restaurant',
        status: 'COMPLETED',
        totalAmount: 18000,
        notes: '25th wedding anniversary celebration',
        createdAt: '2024-01-05T16:45:00Z',
        updatedAt: '2024-01-25T20:00:00Z',
        userId: '1',
        menus: []
    },
    {
        id: '5',
        orderNumber: 'SC-005',
        customerName: 'Vikram Singh',
        customerPhone: '+91 9876543214',
        customerEmail: 'vikram@example.com',
        eventType: 'Wedding',
        guestCount: 300,
        bookingDate: '2024-01-25',
        eventDate: '2024-04-10',
        venue: 'Grand Ballroom, Hotel Taj',
        status: 'BOOKED',
        totalAmount: 75000,
        notes: 'Mixed veg and non-veg menu required. Special dietary requirements for 10 guests.',
        createdAt: '2024-01-25T11:20:00Z',
        updatedAt: '2024-01-25T11:20:00Z',
        userId: '1',
        menus: []
    },
    {
        id: '6',
        orderNumber: 'SC-006',
        customerName: 'Meera Joshi',
        customerPhone: '+91 9876543215',
        customerEmail: 'meera@example.com',
        eventType: 'Birthday Party',
        guestCount: 80,
        bookingDate: '2024-01-28',
        eventDate: '2024-03-05',
        venue: 'Community Center, Sector 15',
        status: 'MENU_FINALIZED',
        totalAmount: 22000,
        notes: 'Adult birthday party with cocktail snacks and dinner',
        createdAt: '2024-01-28T16:10:00Z',
        updatedAt: '2024-01-28T16:10:00Z',
        userId: '1',
        menus: []
    },
    {
        id: '7',
        orderNumber: 'SC-007',
        customerName: 'Rohit Agarwal',
        customerPhone: '+91 9876543216',
        customerEmail: 'rohit@example.com',
        eventType: 'Corporate Event',
        guestCount: 150,
        bookingDate: '2024-02-01',
        eventDate: '2024-03-20',
        venue: 'Business Center, Cyber City',
        status: 'IN_PROGRESS',
        totalAmount: 35000,
        notes: 'Annual company meeting with breakfast, lunch and evening snacks',
        createdAt: '2024-02-01T09:30:00Z',
        updatedAt: '2024-02-01T09:30:00Z',
        userId: '1',
        menus: []
    },
    {
        id: '8',
        orderNumber: 'SC-008',
        customerName: 'Kavita Reddy',
        customerPhone: '+91 9876543217',
        customerEmail: 'kavita@example.com',
        eventType: 'Festival',
        guestCount: 120,
        bookingDate: '2024-02-05',
        eventDate: '2024-03-12',
        venue: 'Temple Premises, Old City',
        status: 'BOOKED',
        totalAmount: 28000,
        notes: 'Holi celebration with traditional sweets and snacks',
        createdAt: '2024-02-05T14:45:00Z',
        updatedAt: '2024-02-05T14:45:00Z',
        userId: '1',
        menus: []
    },
    {
        id: '9',
        orderNumber: 'SC-009',
        customerName: 'Deepak Malhotra',
        customerPhone: '+91 9876543218',
        customerEmail: 'deepak@example.com',
        eventType: 'Anniversary',
        guestCount: 60,
        bookingDate: '2024-02-08',
        eventDate: '2024-04-15',
        venue: 'Rooftop Restaurant, Marina Bay',
        status: 'MENU_FINALIZED',
        totalAmount: 20000,
        notes: '10th wedding anniversary with close family and friends',
        createdAt: '2024-02-08T12:15:00Z',
        updatedAt: '2024-02-08T12:15:00Z',
        userId: '1',
        menus: []
    },
    {
        id: '10',
        orderNumber: 'SC-010',
        customerName: 'Anita Kapoor',
        customerPhone: '+91 9876543219',
        customerEmail: 'anita@example.com',
        eventType: 'Corporate Event',
        guestCount: 200,
        bookingDate: '2024-02-10',
        eventDate: '2024-03-25',
        venue: 'Convention Center, IT Park',
        status: 'IN_PROGRESS',
        totalAmount: 45000,
        notes: 'Product launch event with welcome drinks, lunch and networking dinner',
        createdAt: '2024-02-10T10:00:00Z',
        updatedAt: '2024-02-10T10:00:00Z',
        userId: '1',
        menus: []
    },
    {
        id: '11',
        orderNumber: 'SC-011',
        customerName: 'Sanjay Verma',
        customerPhone: '+91 9876543220',
        customerEmail: 'sanjay@example.com',
        eventType: 'Birthday Party',
        guestCount: 40,
        bookingDate: '2024-02-12',
        eventDate: '2024-02-18',
        venue: 'Farmhouse, Outskirts',
        status: 'COMPLETED',
        totalAmount: 12000,
        notes: 'Outdoor birthday celebration with BBQ and games',
        createdAt: '2024-02-12T15:30:00Z',
        updatedAt: '2024-02-18T22:00:00Z',
        userId: '1',
        menus: []
    },
    {
        id: '12',
        orderNumber: 'SC-012',
        customerName: 'Ravi Krishnan',
        customerPhone: '+91 9876543221',
        customerEmail: 'ravi@example.com',
        eventType: 'Wedding',
        guestCount: 250,
        bookingDate: '2024-02-15',
        eventDate: '2024-05-20',
        venue: 'Heritage Palace, Rajasthan',
        status: 'BOOKED',
        totalAmount: 65000,
        notes: 'Destination wedding with 3-day celebration including mehendi, sangeet and wedding',
        createdAt: '2024-02-15T13:20:00Z',
        updatedAt: '2024-02-15T13:20:00Z',
        userId: '1',
        menus: []
    }
]

// Static expenses data
export const expenses: Expense[] = [
    {
        id: '1',
        title: 'Fresh Vegetables',
        amount: 2500,
        category: 'INGREDIENTS',
        description: 'Weekly vegetable purchase from local market',
        date: '2024-01-10',
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: '2024-01-10T08:00:00Z',
        userId: '1'
    },
    {
        id: '2',
        title: 'Gas Cylinder Refill',
        amount: 800,
        category: 'UTILITIES',
        description: 'Cooking gas cylinder refill',
        date: '2024-01-08',
        createdAt: '2024-01-08T12:30:00Z',
        updatedAt: '2024-01-08T12:30:00Z',
        userId: '1'
    },
    {
        id: '3',
        title: 'Chef Salary',
        amount: 15000,
        category: 'STAFF',
        description: 'Monthly salary for head chef',
        date: '2024-01-01',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        userId: '1'
    },
    {
        id: '4',
        title: 'New Cooking Utensils',
        amount: 3500,
        category: 'EQUIPMENT',
        description: 'Large serving spoons and ladles',
        date: '2024-01-12',
        createdAt: '2024-01-12T15:20:00Z',
        updatedAt: '2024-01-12T15:20:00Z',
        userId: '1'
    },
    {
        id: '5',
        title: 'Vehicle Fuel',
        amount: 1200,
        category: 'TRANSPORTATION',
        description: 'Fuel for delivery van',
        date: '2024-01-14',
        createdAt: '2024-01-14T11:10:00Z',
        updatedAt: '2024-01-14T11:10:00Z',
        userId: '1'
    },
    {
        id: '6',
        title: 'Social Media Ads',
        amount: 2000,
        category: 'MARKETING',
        description: 'Facebook and Instagram advertising',
        date: '2024-01-16',
        createdAt: '2024-01-16T13:45:00Z',
        updatedAt: '2024-01-16T13:45:00Z',
        userId: '1'
    },
    {
        id: '7',
        title: 'Spices and Condiments',
        amount: 1800,
        category: 'INGREDIENTS',
        description: 'Bulk purchase of spices, salt, and cooking oils',
        date: '2024-01-18',
        createdAt: '2024-01-18T09:15:00Z',
        updatedAt: '2024-01-18T09:15:00Z',
        userId: '1'
    },
    {
        id: '8',
        title: 'Kitchen Helper Wages',
        amount: 8000,
        category: 'STAFF',
        description: 'Weekly wages for 2 kitchen helpers',
        date: '2024-01-20',
        createdAt: '2024-01-20T17:00:00Z',
        updatedAt: '2024-01-20T17:00:00Z',
        userId: '1'
    },
    {
        id: '9',
        title: 'Meat and Poultry',
        amount: 4500,
        category: 'INGREDIENTS',
        description: 'Fresh chicken, mutton and fish for upcoming orders',
        date: '2024-01-22',
        createdAt: '2024-01-22T07:30:00Z',
        updatedAt: '2024-01-22T07:30:00Z',
        userId: '1'
    },
    {
        id: '10',
        title: 'Electricity Bill',
        amount: 2200,
        category: 'UTILITIES',
        description: 'Monthly electricity bill for kitchen and office',
        date: '2024-01-25',
        createdAt: '2024-01-25T14:20:00Z',
        updatedAt: '2024-01-25T14:20:00Z',
        userId: '1'
    },
    {
        id: '11',
        title: 'New Pressure Cookers',
        amount: 5200,
        category: 'EQUIPMENT',
        description: '2 large commercial pressure cookers',
        date: '2024-01-28',
        createdAt: '2024-01-28T11:45:00Z',
        updatedAt: '2024-01-28T11:45:00Z',
        userId: '1'
    },
    {
        id: '12',
        title: 'Delivery Van Maintenance',
        amount: 3200,
        category: 'TRANSPORTATION',
        description: 'Oil change, tire rotation and general maintenance',
        date: '2024-01-30',
        createdAt: '2024-01-30T16:30:00Z',
        updatedAt: '2024-01-30T16:30:00Z',
        userId: '1'
    },
    {
        id: '13',
        title: 'Rice and Grains',
        amount: 3800,
        category: 'INGREDIENTS',
        description: 'Basmati rice, wheat flour, and lentils bulk purchase',
        date: '2024-02-02',
        createdAt: '2024-02-02T08:45:00Z',
        updatedAt: '2024-02-02T08:45:00Z',
        userId: '1'
    },
    {
        id: '14',
        title: 'Serving Staff Wages',
        amount: 6000,
        category: 'STAFF',
        description: 'Payment for 4 serving staff for weekend events',
        date: '2024-02-05',
        createdAt: '2024-02-05T19:00:00Z',
        updatedAt: '2024-02-05T19:00:00Z',
        userId: '1'
    },
    {
        id: '15',
        title: 'Business License Renewal',
        amount: 1500,
        category: 'OTHER',
        description: 'Annual business license and food safety certification',
        date: '2024-02-08',
        createdAt: '2024-02-08T10:15:00Z',
        updatedAt: '2024-02-08T10:15:00Z',
        userId: '1'
    },
    {
        id: '16',
        title: 'Dairy Products',
        amount: 2800,
        category: 'INGREDIENTS',
        description: 'Milk, paneer, yogurt and ghee for the week',
        date: '2024-02-10',
        createdAt: '2024-02-10T07:00:00Z',
        updatedAt: '2024-02-10T07:00:00Z',
        userId: '1'
    },
    {
        id: '17',
        title: 'Water Purifier Maintenance',
        amount: 800,
        category: 'UTILITIES',
        description: 'Filter replacement and system cleaning',
        date: '2024-02-12',
        createdAt: '2024-02-12T13:30:00Z',
        updatedAt: '2024-02-12T13:30:00Z',
        userId: '1'
    },
    {
        id: '18',
        title: 'Google Ads Campaign',
        amount: 2500,
        category: 'MARKETING',
        description: 'Monthly Google Ads for catering services',
        date: '2024-02-15',
        createdAt: '2024-02-15T12:00:00Z',
        updatedAt: '2024-02-15T12:00:00Z',
        userId: '1'
    }
]

// Static menu templates
export const menuTemplates: Menu[] = [
    {
        id: '1',
        name: 'Wedding Special Menu',
        description: 'Complete wedding celebration menu with appetizers, main course, and desserts',
        totalPrice: 25000,
        isTemplate: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        items: [
            {
                id: '1',
                name: 'Paneer Tikka',
                category: 'Appetizers',
                description: 'Grilled cottage cheese with spices',
                price: 250,
                quantity: 50,
                unit: 'serving',
                menuId: '1'
            },
            {
                id: '2',
                name: 'Butter Chicken',
                category: 'Main Course',
                description: 'Rich and creamy chicken curry',
                price: 350,
                quantity: 50,
                unit: 'serving',
                menuId: '1'
            },
            {
                id: '3',
                name: 'Basmati Rice',
                category: 'Rice',
                description: 'Aromatic basmati rice',
                price: 150,
                quantity: 50,
                unit: 'serving',
                menuId: '1'
            },
            {
                id: '4',
                name: 'Gulab Jamun',
                category: 'Dessert',
                description: 'Traditional sweet dessert',
                price: 100,
                quantity: 50,
                unit: 'piece',
                menuId: '1'
            }
        ]
    },
    {
        id: '2',
        name: 'Birthday Party Menu',
        description: 'Fun and colorful menu perfect for birthday celebrations',
        totalPrice: 15000,
        isTemplate: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        items: [
            {
                id: '5',
                name: 'Chicken Wings',
                category: 'Appetizers',
                description: 'Crispy chicken wings with sauce',
                price: 200,
                quantity: 30,
                unit: 'piece',
                menuId: '2'
            },
            {
                id: '6',
                name: 'Pizza Margherita',
                category: 'Main Course',
                description: 'Classic cheese pizza',
                price: 400,
                quantity: 15,
                unit: 'pizza',
                menuId: '2'
            },
            {
                id: '7',
                name: 'Chocolate Cake',
                category: 'Dessert',
                description: 'Rich chocolate birthday cake',
                price: 800,
                quantity: 2,
                unit: 'cake',
                menuId: '2'
            }
        ]
    },
    {
        id: '3',
        name: 'Corporate Lunch Menu',
        description: 'Professional lunch menu for corporate events',
        totalPrice: 12000,
        isTemplate: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        items: [
            {
                id: '8',
                name: 'Sandwich Platter',
                category: 'Main Course',
                description: 'Assorted sandwiches',
                price: 180,
                quantity: 40,
                unit: 'piece',
                menuId: '3'
            },
            {
                id: '9',
                name: 'Fresh Fruit Salad',
                category: 'Dessert',
                description: 'Seasonal fresh fruits',
                price: 120,
                quantity: 40,
                unit: 'serving',
                menuId: '3'
            },
            {
                id: '10',
                name: 'Masala Chai',
                category: 'Beverages',
                description: 'Traditional Indian tea',
                price: 50,
                quantity: 40,
                unit: 'cup',
                menuId: '3'
            }
        ]
    }
]

// Helper functions for data manipulation
export function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function getCurrentUser(): User | null {
    // For now, return the admin user
    // This will be replaced with actual authentication logic
    return users[0]
}

export function getUserById(id: string): User | null {
    return users.find(user => user.id === id) || null
}

export function getOrdersByUserId(userId: string): Order[] {
    return orders.filter(order => order.userId === userId)
}

export function getExpensesByUserId(userId: string): Expense[] {
    return expenses.filter(expense => expense.userId === userId)
}

export function addOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'menus'>): Order {
    const newOrder: Order = {
        ...orderData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        menus: []
    }
    orders.push(newOrder)
    return newOrder
}

export function addExpense(expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Expense {
    const newExpense: Expense = {
        ...expenseData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
    expenses.push(newExpense)
    return newExpense
}