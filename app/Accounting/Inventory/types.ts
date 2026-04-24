export interface InventoryVariant {
  name: string;
  cp: number;
  sp: number;
  stock: number;
  sold: number;
  damaged: number;
}

export interface InventoryItem {
  _id?: string;
  schoolId: string;
  academicYear: string;
  name: string;
  category: string;
  unit: string;
  hasVariants: boolean;
  variants: InventoryVariant[];
  totalStock: number;
  totalSold: number;
  totalDamaged: number;
  reorderLevel: number;
  supplier: string;
  purchasePrice: number;
  sellingPrice: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockTransaction {
  _id?: string;
  inventoryId: string;
  schoolId: string;
  type: 'purchase' | 'sale' | 'damage' | 'adjustment';
  qty: number;
  beforeStock: number;
  afterStock: number;
  cp: number;
  sp: number;
  profit: number;
  referenceId?: string;
  paymentStatus?: 'paid' | 'pending';
  person?: string;
  purpose?: string;
  notes?: string;
  variantName?: string;
  createdAt?: string;
}

export type TabType = 'add' | 'list' | 'stock' | 'reports';
