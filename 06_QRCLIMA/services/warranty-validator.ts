/**
 * Warranty Validator Service
 * Handles PRO features for warranty validation
 */

import { differenceInDays, addMonths, isAfter, format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface WarrantyStatus {
    isValid: boolean;
    status: 'active' | 'expired' | 'none';
    daysRemaining: number;
    expirationDate?: Date;
    message: string;
}

/**
 * Checks if a service is covered under warranty based on previous service date and warranty duration.
 * @param lastServiceDate Date of the last service (Installation/Repair)
 * @param warrantyMonths Number of months of warranty given
 */
export const checkWarrantyStatus = (lastServiceDate: Date | string | any, warrantyMonths: number): WarrantyStatus => {
    if (!warrantyMonths || warrantyMonths <= 0) {
        return {
            isValid: false,
            status: 'none',
            daysRemaining: 0,
            message: 'Sin garantía activa'
        };
    }

    // Handle Firestore Timestamps or strings
    const startDate = lastServiceDate?.toDate ? lastServiceDate.toDate() : new Date(lastServiceDate);

    // Calculate expiration
    const expirationDate = addMonths(startDate, warrantyMonths);
    const now = new Date();

    const isValid = isAfter(expirationDate, now);
    const daysRemaining = differenceInDays(expirationDate, now);

    return {
        isValid,
        status: isValid ? 'active' : 'expired',
        daysRemaining: Math.max(0, daysRemaining),
        expirationDate,
        message: isValid
            ? `Garantía activa (${daysRemaining} días restantes)`
            : `Garantía expirada el ${format(expirationDate, 'dd MMM yyyy', { locale: es })}`
    };
};

/**
 * Validates if the selected warranty input is allowed for the user tier
 * (e.g. Free users might be capped, or this function could enforce business rules)
 */
export const validateWarrantyInput = (months: number, isPro: boolean): boolean => {
    if (!isPro && months > 3) {
        // Example rule: Free users max 3 months warranty? (Pending definition)
        // For now allowing all, but this function exists for future locking
        return true;
    }
    return true;
};
