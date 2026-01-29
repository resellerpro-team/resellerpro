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
      `${PLAN_LIMITS.free.orders} Orders/month`,
      `${PLAN_LIMITS.free.products} Products`,
      `${PLAN_LIMITS.free.customers} Customers`,
      `${PLAN_LIMITS.free.enquiries} Enquiries/month`,
      `${PLAN_LIMITS.free.productImages} Images/product`,
    ],
  },
  {
    id: 'beginner',
    name: 'Beginner', // Lowercase match? No, let's keep ID as lowercase key. 
    // The previous code used 'id' for logical checks, 'name' for display sometimes but defined 'name' as Capitalized.
    // Let's standardise: id = key in PLAN_LIMITS.
    price: 199,
    interval: 'month',
    description: 'For small businesses',
    features: [
      `${PLAN_LIMITS.beginner.orders} Orders/month`,
      `${PLAN_LIMITS.beginner.products} Products`,
      `${PLAN_LIMITS.beginner.customers} Customers`,
      `${PLAN_LIMITS.beginner.enquiries} Enquiries/month`,
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
      `${PLAN_LIMITS.professional.orders} Orders/month`,
      `${PLAN_LIMITS.professional.products} Products`,
      'Unlimited Customers',
      `${PLAN_LIMITS.professional.enquiries} Enquiries/month`,
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
