// R4: app/careers/[slug]/page.tsx, per-page canonical and og:url
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const url = `https://www.cynbit.in/careers/${params.slug}`;
  return { alternates: { canonical: url }, openGraph: { url } };
}
