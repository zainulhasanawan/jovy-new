import { getCategoryIconNode, getVendorCategoryName } from "./categorization";
import { VENDOR_TAXONOMY } from "@/utils/dashboard/vendor-taxonomy";

interface CategoryCoveragePillsProps {
  covered: string[];
}

export function CategoryCoveragePills({ covered }: CategoryCoveragePillsProps) {
  if (covered.length <= 1) return null;

  return (
    <div className="flex items-center gap-1 mt-1.5">
      {covered.slice(0, 4).map((cat) => {
        const label = getVendorCategoryName(
          cat,
          VENDOR_TAXONOMY as Record<string, { name?: string }>,
        );
        return (
          <div
            key={cat}
            title={label}
            className="w-5 h-5 rounded bg-[#5D8A58]/10 flex items-center justify-center"
          >
            {getCategoryIconNode(cat, "w-3 h-3 text-[#5D8A58]")}
          </div>
        );
      })}
      {covered.length > 4 && (
        <span className="text-xs text-[#6B617B]">+{covered.length - 4}</span>
      )}
    </div>
  );
}
