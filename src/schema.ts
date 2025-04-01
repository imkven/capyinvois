import { z } from "zod";

export const NnormalisedAddressSchema = z.object({
  line1: z.string().min(1).max(150),
  line2: z.string().max(150).optional(),
  line3: z.string().max(150).optional(),
  postcode: z.string().max(50).optional(),
  city: z.string().min(1).max(50),
  state: z.string().min(1).max(50),
  country: z.string().min(1).max(50),
});

export const Schema = {
  entity: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  tin: z.string().min(1).max(50),
  type: z.string().min(1).max(50),
  id: z.string().min(1).max(50),
  sst: z.string().min(1).max(50),
  address: z.string().min(1).max(600),
  normalisedAddress: NnormalisedAddressSchema,
  email: z.string().email().min(1),
  contactNumber: z.string().min(1).max(20),
};

export const CreateEntitySchema = z.object({
  entity: Schema.entity,
  name: Schema.name,
  tin: Schema.tin,
  type: Schema.type,
  id: Schema.id,
  sst: Schema.sst,
  address: Schema.address,
  email: Schema.email,
  contactNumber: Schema.contactNumber,
});
export type CreateEntityType = z.infer<typeof CreateEntitySchema>;

export const EditEntitySchema = z.object({
  entity: Schema.entity,
  name: Schema.name,
  tin: Schema.tin,
  type: Schema.type,
  id: Schema.id,
  sst: Schema.sst,
  address: Schema.address,
  email: Schema.email,
  contactNumber: Schema.contactNumber,
});
export type EditEntityType = z.infer<typeof EditEntitySchema>;

export const StorageEntityDataSchema = z.object({
  name: Schema.name,
  tin: Schema.tin,
  type: Schema.type,
  id: Schema.id,
  sst: Schema.sst,
  address: Schema.address,
  email: Schema.email,
  contactNumber: Schema.contactNumber,
});
export type StorageEntityDataType = z.infer<typeof StorageEntityDataSchema>;

export const StorageEntitySchema = z.object({
  name: Schema.entity,
  data: StorageEntityDataSchema,
  hash: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type StorageEntityType = z.infer<typeof StorageEntitySchema>;

export type StorageEntityErrorType = {
  key: string;
  expected: string;
  actual: string;
}

export type StorageEntityWithErrorsType = {
  errors: StorageEntityErrorType[];
} & StorageEntityType;

export const StorageSchema = z.object({
  entities: z.array(StorageEntitySchema),
});
export type StorageType = z.infer<typeof StorageSchema>;
