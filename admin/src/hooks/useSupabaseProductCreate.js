import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getInternalSupplierId } from '@/lib/internalSupplier';

export function useSupabaseProductCreate() {
  const [submitting, setSubmitting] = useState(false);

  const createProduct = useCallback(async ({ name, description, category_id, price, stock_quantity, currency = 'XOF', variants = [], imageFiles = [] }) => {
    setSubmitting(true);
    try {
      const sellerId = await getInternalSupplierId();

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          seller_id: sellerId,
          name,
          description,
          category_id: category_id || null,
          price,
          currency,
          stock_quantity,
          status: 'approved',
        })
        .select()
        .single();
      if (productError) throw productError;

      if (imageFiles.length > 0) {
        const uploaded = [];
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const ext = file.name.split('.').pop();
          const path = `products/${product.id}/${Date.now()}_${i}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(path, file, { contentType: file.type });
          if (uploadError) throw uploadError;
          const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
          uploaded.push({ product_id: product.id, url: publicUrl, is_primary: i === 0, sort_order: i });
        }
        const { error: imagesError } = await supabase.from('product_images').insert(uploaded);
        if (imagesError) throw imagesError;
      }

      if (variants.length > 0) {
        const variantRows = variants.map((v, idx) => ({
          product_id: product.id,
          type: v.type,
          value: v.value,
          stock_quantity: v.stock_quantity || 0,
          price_modifier: v.price_modifier || 0,
          sort_order: idx,
        }));
        const { error: variantsError } = await supabase.from('product_variants').insert(variantRows);
        if (variantsError) throw variantsError;
      }

      return { success: true, product };
    } catch (err) {
      console.error('Error creating product:', err);
      return { success: false, error: err.message };
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { createProduct, submitting };
}
