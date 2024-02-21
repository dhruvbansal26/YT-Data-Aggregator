import * as z from "zod";

// Define a schema for a single user's input
export const UserInputSchema = z.object({
  username: z.string(),
  link: z.string().optional(),
});

// Define the main schema to accept an array of UserInput
export const DataSchema = z.object({
  users: z.array(UserInputSchema),
});
