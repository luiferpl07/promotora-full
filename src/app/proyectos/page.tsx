import { prisma } from "@/lib/prisma";
import ProyectosGallery from "./ProyectosGallery";

export const revalidate = 60;

export default async function Proyectos() {
  const proyectos = await prisma.project.findMany({
    where: { publicado: true },
    orderBy: { orden: "asc" },
    include: { images: { orderBy: { orden: "asc" } } },
  });

  return <ProyectosGallery proyectos={proyectos} />;
}
