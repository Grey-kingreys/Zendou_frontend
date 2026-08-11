import { redirect } from "next/navigation";

/** Seule entrée de nav pour l'instant : on atterrit directement dessus. */
export default function AdminIndexPage() {
  redirect("/admin/recharges");
}
