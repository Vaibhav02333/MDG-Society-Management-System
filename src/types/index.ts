export type UserRole = 'ADMIN' | 'RESIDENT' | 'SECURITY';

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  flatId?: number;
  flatNumber?: string;
  wing?: string;
  avatarUrl?: string;
}

export type OccupancyStatus = 'Owner-Occupied' | 'Tenant-Occupied' | 'Vacant' | 'Under Process';

export interface Flat {
  id: number;
  flatNumber: string; // e.g. A-101
  wing: 'A' | 'B' | 'C';
  floor: number;
  bhk: '1BHK' | '2BHK' | '3BHK';
  areaSqFt: number;
  occupancyStatus: OccupancyStatus;
  currentOwnerName?: string;
  currentOwnerPhone?: string;
  currentOwnerEmail?: string;
  purchaseDate?: string;
  purchaseAmount?: number;
  monthlyMaintenanceAmount: number;
}

export interface OwnershipRecord {
  id: number;
  flatId: number;
  flatNumber: string;
  wing: string;
  buyerName: string;
  phone: string;
  email: string;
  address: string;
  purchaseDate: string;
  purchaseAmount: number;
  previousOwnerName?: string;
  transferDate?: string;
  remarks?: string;
}

export interface FamilyMember {
  id: number;
  residentId: number;
  fullName: string;
  relation: 'Spouse' | 'Child' | 'Parent' | 'Sibling' | 'Other';
  age: number;
  phone?: string;
}

export interface Resident {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  flatId: number;
  flatNumber: string;
  wing: string;
  type: 'Owner' | 'Tenant';
  moveInDate: string;
  emergencyContact: string;
  emergencyPhone: string;
  familyMembers: FamilyMember[];
}

export type BillStatus = 'Paid' | 'Pending' | 'Overdue';

export interface MaintenanceBill {
  id: number;
  flatId: number;
  flatNumber: string;
  wing: string;
  residentName: string;
  month: string; // e.g. "April 2025"
  amount: number;
  dueDate: string;
  status: BillStatus;
  paidDate?: string;
  paymentMode?: 'UPI' | 'Card' | 'NetBanking' | 'Cash' | 'Cheque';
  transactionRef?: string;
  receiptNumber?: string;
}

export interface GymPlan {
  id: number;
  name: string;
  durationMonths: number;
  fee: number;
  description: string;
}

export type GymMembershipStatus = 'Active' | 'Expired' | 'Cancelled';

export interface GymMembership {
  id: number;
  residentId: number;
  residentName: string;
  flatNumber: string;
  planId: number;
  planName: string;
  startDate: string;
  expiryDate: string;
  feePaid: number;
  status: GymMembershipStatus;
  paymentStatus: 'Paid' | 'Pending';
}

export interface Facility {
  id: number;
  name: string;
  description: string;
  capacity: number;
  hourlyRate: number;
  timings: string;
  rules: string;
  imageUrl?: string;
}

export type BookingStatus = 'Confirmed' | 'Pending' | 'Rejected' | 'Cancelled';

export interface FacilityBooking {
  id: number;
  facilityId: number;
  facilityName: string;
  residentId: number;
  residentName: string;
  flatNumber: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  totalAmount: number;
  status: BookingStatus;
  purpose: string;
  createdAt: string;
}

export type VisitorStatus = 'Expected' | 'Checked-In' | 'Checked-Out' | 'Denied';

export interface Visitor {
  id: number;
  visitorName: string;
  phone: string;
  hostFlatNumber: string;
  hostResidentName: string;
  purpose: string;
  entryTime?: string;
  exitTime?: string;
  status: VisitorStatus;
  qrPassCode: string;
  vehicleNumber?: string;
  date: string;
}

export interface ParkingSlot {
  id: number;
  slotNumber: string; // e.g. P-A101
  wing: 'A' | 'B' | 'C';
  floorLevel: string;
  isAllocated: boolean;
  allocatedFlatNumber?: string;
  allocatedResidentName?: string;
  vehicleNumber?: string;
  vehicleType?: '4-Wheeler' | '2-Wheeler' | 'EV 4-Wheeler';
  hasEvCharging?: boolean;
}

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Emergency';
export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

export interface Complaint {
  id: number;
  title: string;
  category: 'Plumbing' | 'Electrical' | 'Carpentry' | 'Security' | 'Cleanliness' | 'Elevator' | 'Other';
  description: string;
  flatNumber: string;
  residentName: string;
  residentPhone: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignedStaff?: string;
  deadline?: string;
  createdAt: string;
  resolvedAt?: string;
  adminResponse?: string;
}

export interface Parcel {
  id: number;
  recipientName: string;
  flatNumber: string;
  courierCompany: string;
  trackingNumber?: string;
  receivedAt: string;
  status: 'Pending Collection' | 'Collected';
  collectedAt?: string;
  collectedBy?: string;
  securityStaffName: string;
}

export interface SocietyEvent {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  time?: string;
  location: string;
  category: 'Cultural' | 'Festival' | 'Meeting' | 'Health' | 'Sports';
  organizer?: string;
  bannerGradient?: string;
}

export interface PollOption {
  id: number;
  text: string;
  votes: number;
}

export interface Poll {
  id: number;
  question: string;
  title?: string;
  description: string;
  options: PollOption[];
  totalVotes: number;
  votedUserIds: number[];
  endDate: string;
  expiryDate?: string;
  isActive: boolean;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  category: 'Urgent' | 'General' | 'Maintenance' | 'Security';
  publishedBy: string;
  publishedDate: string;
  isPinned: boolean;
  priority?: 'Emergency' | 'High' | 'Medium' | 'Low' | string;
  date?: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  category: 'bill' | 'complaint' | 'visitor' | 'gym' | 'event' | 'security';
  timestamp: string;
  isRead: boolean;
  targetRole?: UserRole;
  targetFlatNumber?: string;
}

export interface ExpenseRecord {
  id: number;
  category: 'Security Staff' | 'Electricity & Water' | 'Gardening & Housekeeping' | 'Elevator AMC' | 'Repairs' | 'Events' | 'Administrative';
  amount: number;
  expenseDate: string;
  description: string;
  vendorName: string;
  paymentMode: 'Bank Transfer' | 'Cheque' | 'UPI';
  invoiceNumber: string;
}

export interface DocumentItem {
  id: number;
  title: string;
  category: 'Society Bye-Laws' | 'Ownership Document' | 'Maintenance Receipt' | 'Audited Accounts' | 'Fire NOC' | 'Meeting Minutes';
  fileSize: string;
  uploadDate: string;
  allowedRoles: UserRole[];
  flatNumber?: string;
  fileUrl?: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  category: 'Ownership' | 'Payment' | 'Visitor' | 'Complaint' | 'Gym' | 'Facility' | 'System';
  details: string;
  performedBy: string;
  role: UserRole;
  timestamp: string;
}

export interface SocietyHealthBreakdown {
  maintenanceCollectionScore: number;
  complaintResolutionScore: number;
  facilityUsageScore: number;
  residentEngagementScore: number;
  financialHealthScore: number;
  overallScore: number;
  ratingText: 'Excellent' | 'Good' | 'Needs Improvement';
}
