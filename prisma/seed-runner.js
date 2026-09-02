// seed-runner.js - compiled seed to avoid ts-node dependency
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Site Config
  const configs = [
    { key: "hero_titulo", value: "Vive en el campo, invierte en el futuro" },
    { key: "hero_subtitulo", value: "Proyectos campestres de alta calidad en Colombia" },
    { key: "empresa_hectareas", value: "39" },
    { key: "empresa_lotes", value: "554" },
    { key: "empresa_proyectos", value: "3" },
    { key: "empresa_area_desde", value: "300" },
    { key: "empresa_descripcion", value: "Desarrollamos proyectos campestres pensados para el retiro y la inversión, combinando urbanismo de alta calidad con la tranquilidad del entorno natural." },
    { key: "contacto_telefono", value: "(+57) 324 6425561" },
    { key: "contacto_email", value: "Promotorafullcartera.arizona@gmail.com" },
    { key: "contacto_direccion", value: "TR 34 Cl 36-2, Barrio Boston, Sincelejo — Sucre" },
    { key: "contacto_horario", value: "Lunes a domingo · 8:00 a.m. — 5:00 p.m." },
    { key: "social_facebook", value: "#" },
    { key: "social_instagram", value: "#" },
    { key: "social_whatsapp", value: "https://wa.me/573246425561" },
    { key: "footer_disclaimer", value: "Las imágenes y planos son una representación artística del diseño del proyecto y están sujetas a cambios sin previo aviso." },
  ];

  for (const config of configs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
  }

  // Projects
  const lagos = await prisma.project.upsert({
    where: { slug: "lagos-del-palmar" },
    update: {},
    create: {
      nombre: "Lagos del Palmar",
      slug: "lagos-del-palmar",
      descripcion: "39 hectáreas trazadas alrededor de nueve lagos, con senderos internos, zonas comunes y reserva natural dentro del perímetro.",
      descripcionLarga: "Vive en un lugar donde la naturaleza es tu vecina más cercana. Lagos del Palmar es un proyecto campestre de gran escala pensado para quienes buscan retiro, tranquilidad y conexión con la naturaleza.",
      lotes: 554,
      areaDesde: 310,
      reserva: "$1.000.000",
      planPago: "Cuotas sin intereses",
      estado: "activo",
      logo: "/assets/real/logo.png",
      imgHero: "/assets/real/Lagos-del-palmar.jpeg",
      ubicacionTexto: "Sincelejo, Sucre. Acceso pavimentado, a 15 minutos del centro.",
      googleMapsUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15764.577583626242!2d-75.3995!3d9.2985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e5914fa6163351b%3A0xc392fa94179e8e4a!2sSincelejo%2C%20Sucre!5e0!3m2!1sen!2sco!4v1700000000000!5m2!1sen!2sco",
      amenidades: JSON.stringify(["9 Lagos Naturales", "Senderos Internos", "Zonas Verdes", "Portería 24h", "Vías Pavimentadas", "Áreas de Picnic", "Reserva Natural"]),
      orden: 1,
      publicado: true,
    },
  });

  // Project images
  const existingImages = await prisma.projectImage.findMany({ where: { projectId: lagos.id } });
  if (existingImages.length === 0) {
    await prisma.projectImage.createMany({
      data: [
        { projectId: lagos.id, url: "/assets/real/Lagos-del-palmar.jpeg", alt: "Vista aérea Lagos del Palmar", tipo: "hero", orden: 0 },
        { projectId: lagos.id, url: "/assets/real/WhatsApp-Image-2025-08-11-at-10.55.24-AM.jpeg", alt: "Zona de lagos", tipo: "galeria", orden: 1 },
        { projectId: lagos.id, url: "/assets/real/WhatsApp-Image-2025-08-11-at-11.27.53-AM.jpeg", alt: "Entorno natural", tipo: "galeria", orden: 2 },
      ],
    });
  }

  await prisma.project.upsert({
    where: { slug: "riviera-esmeralda" },
    update: {},
    create: {
      nombre: "Riviera Esmeralda",
      slug: "riviera-esmeralda",
      descripcion: "Lotes campestres con vista abierta al valle, pensados para casa de descanso y con acceso pavimentado hasta la portería.",
      lotes: 120,
      areaDesde: 300,
      reserva: "$1.000.000",
      estado: "activo",
      logo: "/assets/real/logo.png",
      imgHero: "/assets/real/IMG-20250414-WA0007.jpg",
      ubicacionTexto: "Sincelejo, Sucre.",
      amenidades: JSON.stringify(["Vista al Valle", "Acceso Pavimentado", "Portería", "Zonas Verdes"]),
      orden: 2,
      publicado: true,
    },
  });

  await prisma.project.upsert({
    where: { slug: "balmoral" },
    update: {},
    create: {
      nombre: "Balmoral",
      slug: "balmoral",
      descripcion: "Un proyecto de escala íntima con lotes desde 300 m², cerca de los servicios de la ciudad y con plan de pago sin intereses.",
      lotes: 80,
      areaDesde: 300,
      reserva: "$1.000.000",
      planPago: "Sin intereses",
      estado: "activo",
      logo: "/assets/real/logo.png",
      imgHero: "/assets/real/WhatsApp-Image-2025-08-11-at-11.27.53-AM.jpeg",
      ubicacionTexto: "Sincelejo, Sucre.",
      amenidades: JSON.stringify(["Lotes desde 300 m²", "Plan de Pago Sin Intereses", "Cerca al Casco Urbano", "Portería"]),
      orden: 3,
      publicado: true,
    },
  });

  // Advisors
  const existingAdvisors = await prisma.advisor.findMany();
  if (existingAdvisors.length === 0) {
    await prisma.advisor.createMany({
      data: [
        { nombre: "Asesor Comercial", rol: "Lagos del Palmar", proyectoAsignado: "lagos-del-palmar", whatsapp: "https://wa.me/573246425561", img: "/assets/real/IMG-20250414-WA0007.jpg", orden: 1 },
        { nombre: "Asesor Comercial", rol: "Riviera Esmeralda", proyectoAsignado: "riviera-esmeralda", whatsapp: "https://wa.me/573246425561", img: "/assets/real/IMG-20250414-WA0007.jpg", orden: 2 },
        { nombre: "Asesor Comercial", rol: "Balmoral", proyectoAsignado: "balmoral", whatsapp: "https://wa.me/573246425561", img: "/assets/real/IMG-20250414-WA0007.jpg", orden: 3 },
      ],
    });
  }

  // Como Comprar Steps
  const existingSteps = await prisma.comoComprarStep.findMany();
  if (existingSteps.length === 0) {
    await prisma.comoComprarStep.createMany({
      data: [
        { numero: "01", titulo: "Elige tu lote", texto: "Un asesor te acompaña a revisar disponibilidad, áreas y ubicación dentro del masterplan de manera personalizada.", orden: 1 },
        { numero: "02", titulo: "Reserva", texto: "Con $1.000.000 el lote queda separado a tu nombre mientras formalizamos la negociación y preparamos la documentación.", orden: 2 },
        { numero: "03", titulo: "Plan de pago", texto: "Cuotas flexibles y sin intereses, diseñadas a la medida de tu capacidad financiera y al plazo que elijas.", orden: 3 },
        { numero: "04", titulo: "Escrituración", texto: "Al completar el pago total del lote, se realiza la escritura pública y la entrega material y formal de tu propiedad.", orden: 4 },
      ],
    });
  }

  // News
  const newsItems = [
    { titulo: "Nueva etapa habilitada en Lagos del Palmar", slug: "nueva-etapa-lagos-palmar", resumen: "Se abre la comercialización de lotes con frente al segundo lago, con áreas desde 310 m².", imgDestacada: "/assets/real/Lagos-del-palmar.jpeg", publicado: true },
    { titulo: "Avance de obra: vías internas y portería", slug: "avance-obra-vias", resumen: "Los trabajos de urbanismo avanzan según cronograma en el acceso principal del proyecto.", imgDestacada: "/assets/real/WhatsApp-Image-2025-08-11-at-10.55.24-AM.jpeg", publicado: true },
    { titulo: "Recorridos guiados todos los fines de semana", slug: "recorridos-guiados", resumen: "Agenda tu visita y conoce el masterplan en sitio con un asesor del proyecto.", imgDestacada: "/assets/real/WhatsApp-Image-2025-08-11-at-11.27.53-AM.jpeg", publicado: true },
    { titulo: "Lanzamiento exitoso de Riviera Esmeralda", slug: "lanzamiento-riviera-esmeralda", resumen: "Con la presencia de más de 200 asistentes, lanzamos nuestro segundo gran proyecto de lotes.", imgDestacada: "/assets/real/Escena-4.png", publicado: true },
  ];
  for (const n of newsItems) {
    await prisma.news.upsert({ where: { slug: n.slug }, update: {}, create: n });
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
