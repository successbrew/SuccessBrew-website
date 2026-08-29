import { z } from "zod";
import { OFFER_PRODUCT } from "@/lib/commerce/product";

export const checkoutSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  name: z.string().trim().min(1, "Enter your name.").max(120).optional(),
  /** Defaults to the original ₹2,999 offer so /offer's existing POST body
   * (which never sent this field) keeps working unchanged. */
  productKey: z.string().trim().min(1).optional().default(OFFER_PRODUCT.key),
});
