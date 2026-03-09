-- 1. Setup Storage Policies for the 'products' bucket
-- Allow public to view product images
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- Allow authenticated admins to upload product images
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'products' AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Allow authenticated admins to update/delete product images
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'products' AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'products' AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);


-- 2. Setup Table Policies for products and product_categories
-- Allow admins to insert/update/delete categories
CREATE POLICY "Admins can manage categories"
ON public.product_categories
FOR ALL 
TO authenticated
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' )
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- Allow admins to insert/update/delete products
CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL 
TO authenticated
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' )
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
