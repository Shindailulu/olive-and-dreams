export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProductStatus = 'draft' | 'active' | 'archived';
export type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type DiscountType = 'percent' | 'fixed';
export type AddressType = 'shipping' | 'billing' | 'both';

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          user_id: string;
          role: 'admin' | 'superadmin' | 'staff';
          created_at: string;
        };
        Insert: {
          user_id: string;
          role?: 'admin' | 'superadmin' | 'staff';
          created_at?: string;
        };
        Update: {
          user_id?: string;
          role?: 'admin' | 'superadmin' | 'staff';
          created_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          customer_id: string;
          type: AddressType;
          first_name: string;
          last_name: string;
          phone: string | null;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          postal_code: string | null;
          country: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          type?: AddressType;
          first_name: string;
          last_name: string;
          phone?: string | null;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          state: string;
          postal_code?: string | null;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          type?: AddressType;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          state?: string;
          postal_code?: string | null;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          price: number;
          compare_at_price: number | null;
          sku: string | null;
          status: ProductStatus;
          material: string | null;
          fit: string | null;
          care_instructions: string | null;
          size_guide: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string;
          price: number;
          compare_at_price?: number | null;
          sku?: string | null;
          status?: ProductStatus;
          material?: string | null;
          fit?: string | null;
          care_instructions?: string | null;
          size_guide?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          price?: number;
          compare_at_price?: number | null;
          sku?: string | null;
          status?: ProductStatus;
          material?: string | null;
          fit?: string | null;
          care_instructions?: string | null;
          size_guide?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          size: string;
          color: string;
          sku: string | null;
          price_override: number | null;
          stock_quantity: number;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          size: string;
          color: string;
          sku?: string | null;
          price_override?: number | null;
          stock_quantity?: number;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          size?: string;
          color?: string;
          sku?: string | null;
          price_override?: number | null;
          stock_quantity?: number;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt_text: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          alt_text?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          url?: string;
          alt_text?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      carts: {
        Row: {
          id: string;
          customer_id: string | null;
          session_token: string;
          status: 'active' | 'converted' | 'abandoned';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          session_token: string;
          status?: 'active' | 'converted' | 'abandoned';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          session_token?: string;
          status?: 'active' | 'converted' | 'abandoned';
          created_at?: string;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          variant_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cart_id: string;
          variant_id: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cart_id?: string;
          variant_id?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      discounts: {
        Row: {
          id: string;
          code: string;
          type: DiscountType;
          value: number;
          min_purchase_amount: number;
          max_discount_amount: number | null;
          starts_at: string;
          expires_at: string | null;
          usage_limit: number | null;
          usage_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          type?: DiscountType;
          value: number;
          min_purchase_amount?: number;
          max_discount_amount?: number | null;
          starts_at?: string;
          expires_at?: string | null;
          usage_limit?: number | null;
          usage_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          type?: DiscountType;
          value?: number;
          min_purchase_amount?: number;
          max_discount_amount?: number | null;
          starts_at?: string;
          expires_at?: string | null;
          usage_limit?: number | null;
          usage_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      delivery_methods: {
        Row: {
          id: string;
          code: string;
          name: string;
          fee: number;
          enabled: boolean;
          instructions: string | null;
          location_details: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          fee?: number;
          enabled?: boolean;
          instructions?: string | null;
          location_details?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          fee?: number;
          enabled?: boolean;
          instructions?: string | null;
          location_details?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          guest_email: string | null;
          guest_name: string | null;
          guest_phone: string | null;
          status: OrderStatus;
          payment_status: PaymentStatus;
          currency: string;
          subtotal: number;
          discount_total: number;
          shipping_fee: number;
          total: number;
          discount_id: string | null;
          delivery_method: string;
          shipping_address: Json;
          billing_address: Json | null;
          payment_gateway: string | null;
          payment_reference: string | null;
          additional_instructions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_id?: string | null;
          guest_email?: string | null;
          guest_name?: string | null;
          guest_phone?: string | null;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          currency?: string;
          subtotal: number;
          discount_total?: number;
          shipping_fee?: number;
          total: number;
          discount_id?: string | null;
          delivery_method: string;
          shipping_address?: Json;
          billing_address?: Json | null;
          payment_gateway?: string | null;
          payment_reference?: string | null;
          additional_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_id?: string | null;
          guest_email?: string | null;
          guest_name?: string | null;
          guest_phone?: string | null;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          currency?: string;
          subtotal?: number;
          discount_total?: number;
          shipping_fee?: number;
          total?: number;
          discount_id?: string | null;
          delivery_method?: string;
          shipping_address?: Json;
          billing_address?: Json | null;
          payment_gateway?: string | null;
          payment_reference?: string | null;
          additional_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          variant_id: string | null;
          product_id: string | null;
          product_name: string;
          variant_title: string;
          sku: string | null;
          price_at_purchase: number;
          quantity: number;
          total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          variant_id?: string | null;
          product_id?: string | null;
          product_name: string;
          variant_title: string;
          sku?: string | null;
          price_at_purchase: number;
          quantity: number;
          total: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          variant_id?: string | null;
          product_id?: string | null;
          product_name?: string;
          variant_title?: string;
          sku?: string | null;
          price_at_purchase?: number;
          quantity?: number;
          total?: number;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          customer_id: string;
          rating: number;
          title: string | null;
          comment: string;
          verified_purchase: boolean;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          customer_id: string;
          rating: number;
          title?: string | null;
          comment: string;
          verified_purchase?: boolean;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          customer_id?: string;
          rating?: number;
          title?: string | null;
          comment?: string;
          verified_purchase?: boolean;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory_logs: {
        Row: {
          id: string;
          variant_id: string;
          change: number;
          balance_after: number;
          reason: string;
          order_id: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          variant_id: string;
          change: number;
          balance_after: number;
          reason: string;
          order_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          variant_id?: string;
          change?: number;
          balance_after?: number;
          reason?: string;
          order_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      decrement_order_inventory: {
        Args: { p_order_id: string };
        Returns: void;
      };
      restore_order_inventory: {
        Args: { p_order_id: string; p_reason?: string };
        Returns: void;
      };
    };
  };
}
