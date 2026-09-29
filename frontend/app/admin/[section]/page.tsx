import { notFound } from "next/navigation";
import { AdminSection } from "../admin-section";

const sections = ["berita","program","cabang-olahraga","galeri","prestasi","pesan-masuk","pengguna","pengaturan"] as const;
type Section = typeof sections[number];

export function generateStaticParams(){return sections.map(section=>({section}));}

export default async function AdminSectionPage({params}:{params:Promise<{section:string}>}){
  const {section}=await params;
  if(!sections.includes(section as Section)) notFound();
  return <AdminSection section={section as Section}/>;
}
