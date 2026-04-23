import { TermDetail } from "@/components/term-detail";

export default async function TermDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <TermDetail termId={id} />;
}
