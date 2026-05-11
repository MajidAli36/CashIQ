import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CheckGuarantee, InstallmentPayment, PaymentSchedule } from '@/lib/types'

interface CheckGuaranteeState {
  checkGuarantees: CheckGuarantee[]
  installmentPayments: InstallmentPayment[]
  paymentSchedules: PaymentSchedule[]
  
  // Check Guarantee Actions
  addCheckGuarantee: (data: Omit<CheckGuarantee, 'id' | 'created_at' | 'updated_at' | 'total_paid' | 'remaining_balance'>) => string
  updateCheckGuarantee: (id: string, data: Partial<CheckGuarantee>) => void
  deleteCheckGuarantee: (id: string) => void
  getCheckGuarantee: (id: string) => CheckGuarantee | undefined
  
  // Installment Payment Actions
  addInstallmentPayment: (data: Omit<InstallmentPayment, 'id' | 'created_at'>) => string
  getCheckPayments: (checkId: string) => InstallmentPayment[]
  
  // Customer Actions
  getCustomerChecks: (customerId: string) => CheckGuarantee[]
  getCustomerTotalBalance: (customerId: string) => { totalCheckAmount: number; totalPaid: number; totalRemaining: number }
  
  // Payment Schedule Actions
  createPaymentSchedule: (checkId: string, schedules: Omit<PaymentSchedule, 'id' | 'check_guarantee_id'>[]) => void
  getCheckSchedule: (checkId: string) => PaymentSchedule[]
  markScheduleAsPaid: (scheduleId: string, paymentId: string, amount: number, date: string) => void
  
  // Calculations
  getCheckBalance: (checkId: string) => { totalPaid: number; remaining: number; percentage: number }
  recalculateCheckBalance: (checkId: string) => void
}

export const useCheckGuaranteeStore = create<CheckGuaranteeState>()(
  persist(
    (set, get) => ({
      checkGuarantees: [],
      installmentPayments: [],
      paymentSchedules: [],

      // Add Check Guarantee
      addCheckGuarantee: (data) => {
        const id = `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date().toISOString()
        
        const newCheck: CheckGuarantee = {
          ...data,
          id,
          total_paid: 0,
          remaining_balance: data.check_amount,
          created_at: now,
          updated_at: now,
        }

        set((state) => ({
          checkGuarantees: [...state.checkGuarantees, newCheck],
        }))

        return id
      },

      // Update Check Guarantee
      updateCheckGuarantee: (id, data) => {
        set((state) => ({
          checkGuarantees: state.checkGuarantees.map((check) =>
            check.id === id
              ? { ...check, ...data, updated_at: new Date().toISOString() }
              : check
          ),
        }))
      },

      // Delete Check Guarantee
      deleteCheckGuarantee: (id) => {
        set((state) => ({
          checkGuarantees: state.checkGuarantees.filter((check) => check.id !== id),
          installmentPayments: state.installmentPayments.filter((payment) => payment.check_guarantee_id !== id),
          paymentSchedules: state.paymentSchedules.filter((schedule) => schedule.check_guarantee_id !== id),
        }))
      },

      // Get Check Guarantee
      getCheckGuarantee: (id) => {
        return get().checkGuarantees.find((check) => check.id === id)
      },

      // Add Installment Payment
      addInstallmentPayment: (data) => {
        const id = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date().toISOString()

        const newPayment: InstallmentPayment = {
          ...data,
          id,
          created_at: now,
        }

        set((state) => ({
          installmentPayments: [...state.installmentPayments, newPayment],
        }))

        // Recalculate check balance
        get().recalculateCheckBalance(data.check_guarantee_id)

        return id
      },

      // Get Check Payments
      getCheckPayments: (checkId) => {
        return get().installmentPayments
          .filter((payment) => payment.check_guarantee_id === checkId)
          .sort((a, b) => b.date.localeCompare(a.date))
      },

      // Get Customer Checks
      getCustomerChecks: (customerId) => {
        return get().checkGuarantees
          .filter((check) => check.customer_id === customerId)
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
      },

      // Get Customer Total Balance
      getCustomerTotalBalance: (customerId) => {
        const checks = get().getCustomerChecks(customerId)
        
        const totalCheckAmount = checks.reduce((sum, check) => sum + check.check_amount, 0)
        const totalPaid = checks.reduce((sum, check) => sum + check.total_paid, 0)
        const totalRemaining = checks.reduce((sum, check) => sum + check.remaining_balance, 0)

        return { totalCheckAmount, totalPaid, totalRemaining }
      },

      // Create Payment Schedule
      createPaymentSchedule: (checkId, schedules) => {
        const newSchedules: PaymentSchedule[] = schedules.map((schedule, index) => ({
          ...schedule,
          id: `schedule_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
          check_guarantee_id: checkId,
        }))

        set((state) => ({
          paymentSchedules: [...state.paymentSchedules, ...newSchedules],
        }))
      },

      // Get Check Schedule
      getCheckSchedule: (checkId) => {
        return get().paymentSchedules
          .filter((schedule) => schedule.check_guarantee_id === checkId)
          .sort((a, b) => a.installment_number - b.installment_number)
      },

      // Mark Schedule as Paid
      markScheduleAsPaid: (scheduleId, paymentId, amount, date) => {
        set((state) => ({
          paymentSchedules: state.paymentSchedules.map((schedule) =>
            schedule.id === scheduleId
              ? {
                  ...schedule,
                  is_paid: true,
                  paid_amount: amount,
                  paid_date: date,
                  installment_payment_id: paymentId,
                }
              : schedule
          ),
        }))
      },

      // Get Check Balance
      getCheckBalance: (checkId) => {
        const check = get().getCheckGuarantee(checkId)
        if (!check) return { totalPaid: 0, remaining: 0, percentage: 0 }

        const totalPaid = check.total_paid
        const remaining = check.remaining_balance
        const percentage = check.check_amount > 0 ? (totalPaid / check.check_amount) * 100 : 0

        return { totalPaid, remaining, percentage }
      },

      // Recalculate Check Balance
      recalculateCheckBalance: (checkId) => {
        const payments = get().getCheckPayments(checkId)
        const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
        
        const check = get().getCheckGuarantee(checkId)
        if (!check) return

        const remaining = check.check_amount - totalPaid
        
        // Update check status if fully paid
        const newStatus = remaining <= 0 ? 'cleared' : check.status

        get().updateCheckGuarantee(checkId, {
          total_paid: totalPaid,
          remaining_balance: remaining,
          status: newStatus,
        })
      },
    }),
    {
      name: 'rozcash-check-guarantee-storage',
    }
  )
)
