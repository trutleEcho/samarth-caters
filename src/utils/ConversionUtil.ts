/**
 * Utility class for common data conversions like numbers and currency.
 */
class ConversionUtil {
    /**
     * Converts a string to a number.
     * @param value - The string to convert.
     * @returns The numeric value or NaN if invalid.
     */
    public static toNumber(value: string): number {
        return Number(value);
    }

    /**
     * Converts a number to an Indian rupees formatted string (e.g., ₹1,23,456.78).
     * @param amount - The number to convert.
     * @returns Formatted rupee string.
     */
    public static toRupees(amount: number): string {
        return amount.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        });
    }

    /**
     * Converts a number to Indian formatted string without currency symbol (e.g., 1,23,456.78).
     * @param amount - The number to convert.
     * @returns Formatted number string.
     */
    public static toIndianFormat(amount: number): string {
        return amount.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
        });
    }
}

export const conversionUtil = ConversionUtil;
