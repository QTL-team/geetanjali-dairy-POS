import * as z from "zod";

export const productSchema = z.object({
  name: z.string().min(1, { message: "Product name is required" }),
  gujaratiName: z.string().optional(),
  description: z.string().optional(),
  unit: z.enum(["KG", "LITER", "PIECE"], {
    message: "Please select a valid unit",
  }),
  sellingPrice: z.number({ message: "Selling price must be a valid number" })
    .positive({ message: "Selling price must be greater than 0" }),
  availableStock: z.number()
    .min(0, { message: "Stock cannot be negative" }),
  lowStockThreshold: z.number()
    .min(0, { message: "Threshold cannot be negative" }),
});

export type ProductFormValues = z.infer<typeof productSchema>;
