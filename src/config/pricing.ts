export const PLAN_LIMITS = {
  free: {
    orders: 10,
    enquiries: 25,
    customers: 50,
    productImages: 2,
    products: 20,
  },
  beginner: {
    orders: 50,
    enquiries: 100,
    customers: 100,
    productImages: 3,
    products: 30,
  },
  professional: {
    orders: 100,
    enquiries: 200,
    customers: Infinity,
    productImages: 5,
    products: 50,
  },
  business: {
    orders: Infinity,
    enquiries: Infinity,
    customers: Infinity,
    productImages: 10,
    products: Infinity,
  }
} as const;

export type PlanId = keyof typeof PLAN_LIMITS;

export const pricingPlans = [
  {
    id: 'free',
    name: 'Free', // Internal name matches PLAN_LIMITS key
    display_name: 'Free Plan',
    price: 0,
    interval: 'forever',
    description: 'Perfect for getting started',
    features: [
      `${PLAN_LIMITS.free.orders} Orders`,
      `${PLAN_LIMITS.free.products} Products`,
      `${PLAN_LIMITS.free.customers} Customers`,
      `${PLAN_LIMITS.free.enquiries} Enquiries`,
      `${PLAN_LIMITS.free.productImages} Images/product`,
    ],
  },
  {
    id: 'beginner',
    name: 'Business Premium', // Renamed from Beginner
    display_name: 'Business Premium',
    price: 199,
    interval: 'month',
    description: 'For growing businesses',
    features: [
      `${PLAN_LIMITS.beginner.orders} Orders`,
      `${PLAN_LIMITS.beginner.products} Products`,
      `${PLAN_LIMITS.beginner.customers} Customers`,
      `${PLAN_LIMITS.beginner.enquiries} Enquiries`,
      `${PLAN_LIMITS.beginner.productImages} Images/product`,
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 699,
    interval: 'month',
    description: 'For growing businesses',
    popular: true,
    features: [
      `${PLAN_LIMITS.professional.orders} Orders`,
      `${PLAN_LIMITS.professional.products} Products`,
      'Unlimited Customers',
      `${PLAN_LIMITS.professional.enquiries} Enquiries`,
      `${PLAN_LIMITS.professional.productImages} Images/product`,
      'Priority Support'
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: 1999, // Placeholder
    interval: 'month',
    description: 'Coming Soon',
    features: [
      'Unlimited Everything',
      'Dedicated Account Manager',
      'API Access',
    ],
  },
]
