import { z } from "zod";

export const BookingCreateInput = z.object({
  guideId: z.string().uuid(),
  serviceId: z.string().uuid(),
  routeId: z.string().uuid().optional().nullable(),
  startDate: z.string().min(1),
  endDate: z.string().optional().nullable(),
  totalPriceUsd: z.number().nonnegative(),
  milestonesTotal: z.number().int().min(1).max(10).optional(),
});

export const BookingStatusUpdateInput = z.object({
  status: z.enum(["pending", "confirmed", "active", "completed", "disputed", "refunded", "cancelled"]),
});

export const CheckinInput = z.object({
  booking_id: z.string().uuid(),
  place_id: z.string().uuid(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const ProofMintInput = z.object({
  bookingId: z.string().uuid(),
  name: z.string().min(1).max(64),
  symbol: z.string().min(1).max(16),
  uri: z.string().url(),
});

export const CreateBookingInput = z.object({
  serviceId: z.string().uuid(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  milestones: z.number().int().min(1).max(10),
});

export const ReviewInput = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export const WalletLinkInput = z.object({
  walletAddress: z.string().min(32).max(44),
  signature: z.string().min(1),
  nonce: z.string().min(1),
});

export const DisputeInput = z.object({
  bookingId: z.string().uuid(),
  category: z.enum(["no_show", "safety", "billing", "quality", "other"]),
  description: z.string().min(10).max(2000),
  evidenceUrls: z.array(z.string().url()).max(5).optional(),
});
