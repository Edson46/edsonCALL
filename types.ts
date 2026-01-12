
export enum UserTier {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM'
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  location: string;
  photo: string;
  interests: string[];
  isOnline: boolean;
  tier: UserTier;
  role: UserRole;
  points: number;
  trialCallsRemaining: number;
  joinedAt: string;
  lastLogin: string;
  completionPercentage: number;
  phone?: string;
  verificationStatus?: VerificationStatus;
  verificationIdPhoto?: string;
  followingIds?: string[];
  isBlocked?: boolean;
}

export type PostVisibility = 'PUBLIC' | 'FOLLOWERS' | 'ADMIN_ONLY';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  text: string;
  timestamp: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  commentsList?: Comment[];
  timestamp: string;
  isHot: boolean;
  visibility: PostVisibility;
  featured?: boolean;
}

export interface Status {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  image: string;
  timestamp: string;
  expiresAt: string;
}

export interface AdminChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Match {
  id: string;
  users: [string, string];
  timestamp: string;
}

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REJECTED';
export type TransactionType = 'SUBSCRIPTION' | 'WEEKLY_PASS' | 'WITHDRAWAL' | 'POINTS_CONVERSION' | 'MINUTES_PURCHASE';

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: 'TZS';
  type: TransactionType;
  status: TransactionStatus;
  provider: string;
  timestamp: string;
  reference?: string;
}

export interface WithdrawalRequest extends Transaction {
  mobileNumber: string;
}

export interface CallSession {
  id: string;
  callerId: string;
  receiverId: string;
  startTime: string;
  endTime?: string;
  duration: number; // in seconds
  status: 'ONGOING' | 'ENDED';
  type: 'TRIAL' | 'PAID' | 'PREMIUM';
  recordingUrl?: string;
}
