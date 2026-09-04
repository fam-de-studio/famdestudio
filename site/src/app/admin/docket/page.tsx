import { redirect } from "next/navigation";
import { currentAdmin, DEV_BYPASS } from "@/lib/auth";
import { DocketApp } from "@/components/docket/DocketApp";

export const dynamic = "force-dynamic";

export default async function DocketPage() {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  const storage = process.env.DOCKET_SHEET_ID ? "sheet" : "file";
  return <DocketApp user={{ name: admin.name, email: admin.email }} storage={storage} devBypass={DEV_BYPASS} />;
}
