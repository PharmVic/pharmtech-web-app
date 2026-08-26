import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import ShopCatalog from "@/components/ShopCatalog";

export const dynamic = "force-dynamic";

export default async function CategoryProductsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    // Fetch categories
    const { data: categories, error: catError } = await supabase
        .from("product_categories")
        .select("*")
        .order("name");

    if (catError) console.error("Error fetching categories:", catError);

    // Verify current category exists
    const currentCategory = categories?.find((c) => c.slug === slug);
    if (!currentCategory && slug !== "all") {
        notFound();
    }

    // Fetch all products with categories
    const { data: products, error: prodError } = await supabase
        .from("products")
        .select(`
            *,
            product_categories (
                id,
                name,
                slug
            )
        `)
        .order("is_available", { ascending: false, nullsFirst: true })
        .order("is_featured", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

    if (prodError) console.error("Error fetching products:", prodError);

    return (
        <ShopCatalog
            initialProducts={products || []}
            categories={categories || []}
        />
    );
}
