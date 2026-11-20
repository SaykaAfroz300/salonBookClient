export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "customer" | "admin";
  isBlocked: boolean;
  phone?: string;
  createdAt?: string;
  appointmentCount?: number;
}

export interface SalonService {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface AppointmentRecord {
  _id: string;
  serviceId:
    | string
    | {
        _id: string;
        serviceName: string;
        category: string;
        image: string;
        price: number;
        duration: number;
        status?: "active" | "inactive";
      };
  customerId: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    image?: string;
    phone?: string;
  };
  appointmentDate: string;
  timeSlot: string;
  message?: string;
  servicePrice: number;
  paymentStatus: "unpaid" | "paid";
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

export interface TransactionRecord {
  _id: string;
  appointmentId:
    | string
    | {
        _id: string;
        appointmentDate: string;
        timeSlot: string;
        status: string;
        paymentStatus: string;
        serviceId?: {
          _id: string;
          serviceName: string;
          category: string;
          image?: string;
          price: number;
        };
      };
  customerId: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  amount: number;
  currency: string;
  stripeSessionId: string;
  status: "paid" | "failed";
  createdAt: string;
}

export interface CustomerDashboardData {
  stats: {
    totalAppointments: number;
    pendingAppointments: number;
    confirmedAppointments: number;
    cancelledAppointments: number;
  };
  recentAppointments: AppointmentRecord[];
}

export interface AdminDashboardData {
  stats: {
    totalCustomers: number;
    totalActiveServices: number;
    totalAppointments: number;
    pendingAppointments: number;
    confirmedAppointments: number;
    totalSuccessfulPayments: number;
    totalRevenue: number;
  };
  recentAppointments: AppointmentRecord[];
}
