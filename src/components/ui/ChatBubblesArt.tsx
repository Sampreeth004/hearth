import { cn } from "@/lib/utils";

export function ChatBubblesArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 170"
      aria-hidden="true"
      className={cn("h-32 w-40", className)}
    >
      <g className="opacity-60">
        <rect
          x="82"
          y="10"
          width="102"
          height="76"
          rx="22"
          className="fill-[#FF8BA7]/20"
        />
        <path
          d="M160 82 L172 100 L140 84 Z"
          className="fill-[#FF8BA7]/20"
        />
      </g>

      <rect
        x="16"
        y="42"
        width="116"
        height="76"
        rx="22"
        className="fill-[#FFC6C7]/35"
      />
      <path
        d="M44 114 L32 136 L68 116 Z"
        className="fill-[#FFC6C7]/35"
      />
      <circle cx="52" cy="80" r="5.5" className="fill-[#FF8BA7]" />
      <circle cx="74" cy="80" r="5.5" className="fill-[#FF8BA7]" />
      <circle cx="96" cy="80" r="5.5" className="fill-[#FF8BA7]" />

      <rect
        x="108"
        y="92"
        width="80"
        height="60"
        rx="20"
        className="fill-[#C3F0CA]/45"
      />
      <path
        d="M166 150 L180 166 L146 152 Z"
        className="fill-[#C3F0CA]/45"
      />
      <text
        x="148"
        y="130"
        textAnchor="middle"
        fontSize="26"
        fontWeight="700"
        className="fill-[#33272A]"
      >
        1
      </text>
    </svg>
  );
}
