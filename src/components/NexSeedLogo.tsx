import { Sprout } from "lucide-react";

const NexSeedLogo = ({ collapsed = false, dark = true }: { collapsed?: boolean; dark?: boolean }) => {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-warmth shadow-soft">
        <Sprout className="h-5 w-5 text-white" />
      </div>
      {!collapsed && (
        <span className="font-heading text-xl font-bold">
          <span className={dark ? "text-white" : "text-[#2D4A2D]"}>Nex</span><span className="text-sidebar-primary">Seed</span>
        </span>
      )}
    </div>
  );
};

export default NexSeedLogo;
