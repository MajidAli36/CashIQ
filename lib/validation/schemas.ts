import { z } from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer', 'loan_given', 'loan_received']),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  category_id: z.string().min(1, 'Category is required'),
  wallet_id: z.string().min(1, 'Wallet is required'),
  note_en: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  customer_id: z.string().optional(),
})

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().regex(/^03\d{9}$/, 'Phone must be 11 digits starting with 03'),
  notes: z.string().optional(),
})

export const shopProfileSchema = z.object({
  name: z.string().min(1, 'Shop name is required'),
  owner_name: z.string().min(1, 'Owner name is required'),
  phone: z.string().regex(/^03\d{9}$/, 'Phone must be 11 digits starting with 03'),
  city: z.string().min(1, 'City is required'),
  business_type: z.enum(['mobile_shop', 'repair_shop', 'garments', 'grocery', 'freelancer', 'manufacturer', 'other']),
})

export const invoiceItemSchema = z.object({
  name_en: z.string().min(1, 'Item name is required'),
  name_ur: z.string().optional().default(''),
  quantity: z.number().min(1),
  price: z.number().min(0),
  total: z.number().min(0),
})

export const teamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().regex(/^03\d{9}$/, 'Phone must be 11 digits starting with 03'),
  role: z.enum(['manager', 'staff']),
  pin: z.string().length(4).optional(),
})
