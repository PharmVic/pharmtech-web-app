export interface InstalmentPenaltyResult {
    daysOverdue: number;
    periods: number;
    penaltyPercent: number;
    penaltyAmount: number;
    finalAmount: number;
    isLate: boolean;
    isPenaltyApplied: boolean;
    statusBadgeLabel: string;
}

/**
 * Calculates the late fee for an instalment payment based on default duration.
 * Rule: 5% of the monthly payment is added for every 7 days of default payment.
 * 
 * - 0 - 6 days overdue: 0% penalty (Grace Period)
 * - 7 - 13 days overdue: 5% penalty (1 block of 7 days completed)
 * - 14 - 20 days overdue: 10% penalty (2 blocks of 7 days completed)
 * - 21 - 27 days overdue: 15% penalty (3 blocks of 7 days completed)
 * - 28+ days overdue: 20%+ penalty (4+ blocks of 7 days completed)
 */
export function calculateInstalmentPenalty(
    dueDateInput: Date | string,
    amountDue: number,
    currentDateInput: Date | string = new Date()
): InstalmentPenaltyResult {
    const dueDate = new Date(dueDateInput);
    const currentDate = new Date(currentDateInput);

    const baseAmount = Number(amountDue) || 0;

    const isLate = currentDate > dueDate;

    if (!isLate) {
        return {
            daysOverdue: 0,
            periods: 0,
            penaltyPercent: 0,
            penaltyAmount: 0,
            finalAmount: baseAmount,
            isLate: false,
            isPenaltyApplied: false,
            statusBadgeLabel: 'UPCOMING'
        };
    }

    const diffMs = currentDate.getTime() - dueDate.getTime();
    const daysOverdue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    // 5% penalty for every 7 days of default
    const periods = Math.floor(daysOverdue / 7);
    const penaltyPercent = periods * 5;
    const penaltyAmount = baseAmount * (penaltyPercent / 100);
    const finalAmount = baseAmount + penaltyAmount;
    const isPenaltyApplied = periods > 0;

    let statusBadgeLabel = 'OVERDUE (GRACE PERIOD)';
    if (isPenaltyApplied) {
        statusBadgeLabel = `OVERDUE (+${penaltyPercent}% PENALTY)`;
    }

    return {
        daysOverdue,
        periods,
        penaltyPercent,
        penaltyAmount,
        finalAmount,
        isLate: true,
        isPenaltyApplied,
        statusBadgeLabel
    };
}
