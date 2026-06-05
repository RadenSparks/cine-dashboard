export type Transaction = {
  id: number;
  transactionId: string;
  userId: number;
  userName: string;
  amount: number;
  type: "BOOKING" | "REFUND" | "PAYMENT" | "CHARGE";
  status: "COMPLETED" | "PENDING" | "FAILED" | "CANCELLED";
  description: string;
  createdAt: string;
  updatedAt?: string;
};

export type Booking = {
  id: number;
  bookingId: string;
  userId: number;
  userName: string;
  movieTitle: string;
  roomName: string;
  seats: string[];
  sessionDate: string;
  bookingDate: string;
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
  totalPrice: number;
  ticketCount: number;
};

export type Promotion = {
  id: number;
  code: string;
  title: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  maxUses: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "SCHEDULED" | "EXPIRED";
  applicableMovies: number[];
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    transactionId: "TXN-001-2025",
    userId: 1,
    userName: "John Doe",
    amount: 450,
    type: "BOOKING",
    status: "COMPLETED",
    description: "Movie ticket booking - Inception",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    transactionId: "TXN-002-2025",
    userId: 2,
    userName: "Jane Smith",
    amount: -150,
    type: "REFUND",
    status: "COMPLETED",
    description: "Refund - Cancelled booking",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    transactionId: "TXN-003-2025",
    userId: 3,
    userName: "Mike Johnson",
    amount: 600,
    type: "BOOKING",
    status: "PENDING",
    description: "Movie ticket booking - Oppenheimer",
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    transactionId: "TXN-004-2025",
    userId: 4,
    userName: "Sarah Wilson",
    amount: 300,
    type: "BOOKING",
    status: "COMPLETED",
    description: "Movie ticket booking - Dune Part Two",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    transactionId: "TXN-005-2025",
    userId: 5,
    userName: "Tom Brown",
    amount: 0,
    type: "CHARGE",
    status: "FAILED",
    description: "Payment processing failed",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 1,
    bookingId: "BK-001-2025",
    userId: 1,
    userName: "John Doe",
    movieTitle: "Inception",
    roomName: "Room 1",
    seats: ["A1", "A2"],
    sessionDate: "2025-12-10",
    bookingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "CONFIRMED",
    totalPrice: 500,
    ticketCount: 2,
  },
  {
    id: 2,
    bookingId: "BK-002-2025",
    userId: 2,
    userName: "Jane Smith",
    movieTitle: "Oppenheimer",
    roomName: "Room 2",
    seats: ["B5", "B6", "B7"],
    sessionDate: "2025-12-12",
    bookingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "CONFIRMED",
    totalPrice: 750,
    ticketCount: 3,
  },
  {
    id: 3,
    bookingId: "BK-003-2025",
    userId: 3,
    userName: "Mike Johnson",
    movieTitle: "Dune Part Two",
    roomName: "Room 1",
    seats: ["C3"],
    sessionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    bookingDate: new Date().toISOString(),
    status: "PENDING",
    totalPrice: 250,
    ticketCount: 1,
  },
  {
    id: 4,
    bookingId: "BK-004-2025",
    userId: 4,
    userName: "Sarah Wilson",
    movieTitle: "Barbie",
    roomName: "Room 3",
    seats: ["D1", "D2"],
    sessionDate: "2025-12-08",
    bookingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "CANCELLED",
    totalPrice: 400,
    ticketCount: 2,
  },
  {
    id: 5,
    bookingId: "BK-005-2025",
    userId: 5,
    userName: "Tom Brown",
    movieTitle: "Interstellar",
    roomName: "Room 2",
    seats: ["E4", "E5"],
    sessionDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    bookingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "CONFIRMED",
    totalPrice: 500,
    ticketCount: 2,
  },
];

export const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: 1,
    code: "SUMMER25",
    title: "Summer Special",
    description: "20% off on all movie tickets",
    discountType: "PERCENTAGE",
    discountValue: 20,
    maxUses: 100,
    usedCount: 45,
    startDate: "2025-06-01",
    endDate: "2025-08-31",
    status: "EXPIRED",
    applicableMovies: [1, 2, 3],
  },
  {
    id: 2,
    code: "HOLIDAY25",
    title: "Holiday Bonanza",
    description: "30% off on weekend shows",
    discountType: "PERCENTAGE",
    discountValue: 30,
    maxUses: 150,
    usedCount: 78,
    startDate: "2025-12-01",
    endDate: "2025-12-31",
    status: "ACTIVE",
    applicableMovies: [1, 2, 3, 4, 5],
  },
  {
    id: 3,
    code: "FLAT100",
    title: "Flat Discount",
    description: "Save ৳100 on bookings above ৳500",
    discountType: "FIXED",
    discountValue: 100,
    maxUses: 80,
    usedCount: 32,
    startDate: "2025-10-01",
    endDate: "2025-12-31",
    status: "ACTIVE",
    applicableMovies: [2, 4],
  },
  {
    id: 4,
    code: "NEWYEAR25",
    title: "New Year Offer",
    description: "25% off on all bookings",
    discountType: "PERCENTAGE",
    discountValue: 25,
    maxUses: 200,
    usedCount: 0,
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    status: "SCHEDULED",
    applicableMovies: [1, 2, 3, 4, 5],
  },
  {
    id: 5,
    code: "STUDENT25",
    title: "Student Discount",
    description: "15% off with valid student ID",
    discountType: "PERCENTAGE",
    discountValue: 15,
    maxUses: 500,
    usedCount: 156,
    startDate: "2025-09-01",
    endDate: "2025-12-31",
    status: "ACTIVE",
    applicableMovies: [1, 2, 3, 4, 5],
  },
];
