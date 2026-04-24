// app/admin/tokens/page.tsx
export const dynamic = "force-dynamic";
import { createToken } from "@/actions";
import { getAllTokens } from "@/actions";
import { Button } from "@/components/ui/button";

export default async function TokenAdminPage() {
  const tokens = await getAllTokens();

  async function handleCreate() {
    "use server";
    await createToken();
  }

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4 text-primary">Token Management</h1>

      <form action={handleCreate}>
        <Button type="submit" className="mb-6">
          Generate New Token
        </Button>
      </form>

      <div className="space-y-3">
        {tokens.length === 0 ? (
          <p className="text-gray-500">No tokens created yet.</p>
        ) : (
          tokens.map((token) => (
            <div
              key={token.id}
              className="p-3 border rounded-md bg-white shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="font-mono text-sm text-gray-800">{token.value}</p>
                <p className="text-xs text-gray-500">
                  Created: {new Date(token.createdAt).toLocaleString()}
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${
                  token.used
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {token.used ? "Used" : "Unused"}
              </span>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
