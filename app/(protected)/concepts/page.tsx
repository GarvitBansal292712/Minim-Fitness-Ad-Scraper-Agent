import ConceptsGridClient from "@/components/concepts/ConceptsGridClient";
import {
  getConceptsPageData,
  type ConceptsStatusFilter,
} from "@/lib/queries/concepts";

const validFilters: ConceptsStatusFilter[] = ["pending", "approved", "rejected"];

function normalizeStatusFilter(value: unknown): ConceptsStatusFilter {
  if (typeof value !== "string") return "pending";
  return validFilters.includes(value as ConceptsStatusFilter)
    ? (value as ConceptsStatusFilter)
    : "pending";
}

export default async function ConceptsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = searchParams ? await searchParams : {};
  const statusFilter = normalizeStatusFilter(sp.status);
  const data = await getConceptsPageData({ statusFilter });

  return (
    <ConceptsGridClient items={data.items} statusFilter={data.statusFilter} />
  );
}

