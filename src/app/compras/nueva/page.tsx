import { getStores, createShoppingSession, createStore } from "@/lib/actions/shopping";
import { NewStoreForm } from "@/components/shopping/new-store-form";

export default async function NewShoppingPage() {
  const stores = await getStores();

  return (
    <div className="space-y-6 max-w-md">
      <h1 className="text-2xl font-bold">Nueva compra</h1>
      <p className="text-muted-foreground">Selecciona la tienda donde vas a comprar</p>

      <form action={createShoppingSession} className="space-y-4">
        <fieldset className="space-y-2">
          {stores.map((store) => (
            <label
              key={store.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input type="radio" name="storeId" value={store.id} className="accent-primary" required />
              <div>
                <span className="font-medium">{store.name}</span>
                {store.address && (
                  <p className="text-xs text-muted-foreground">{store.address}</p>
                )}
              </div>
            </label>
          ))}
        </fieldset>
        <button
          type="submit"
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Iniciar compra
        </button>
      </form>

      {/* Add custom store */}
      <details className="rounded-xl border p-4">
        <summary className="cursor-pointer text-sm font-medium">
          ¿No encuentras tu tienda? Agregar nueva
        </summary>
        <NewStoreForm action={createStore} />
      </details>
    </div>
  );
}
