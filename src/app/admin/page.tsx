import { redirect } from "next/navigation";

/** Page d'accueil admin : atterrit directement sur les recharges. */
export default function AdminIndexPage() {
  redirect("/admin/recharges");
}
