import { getAdminProducts } from "@/lib/actions/admin";
import { AdminProductList } from "@/components/admin/admin-product-list";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{products.length} productos en el catálogo global</p>
      <AdminProductList products={products} />
    </div>
  );
}
