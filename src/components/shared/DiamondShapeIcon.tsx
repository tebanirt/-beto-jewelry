export type StoneShapeKey =
  | "round"
  | "oval"
  | "cushion"
  | "emerald"
  | "radiant"
  | "pear"
  | "marquise"
  | "princess"
  | "asscher"
  | "heart";

interface Props {
  shape: StoneShapeKey;
  className?: string;
}

const STROKE = "#C9A86A";

function Outline({ d, gradientId }: { d: string; gradientId: string }) {
  return <path d={d} stroke={STROKE} strokeWidth={1.4} fill={`url(#${gradientId})`} strokeLinejoin="round" />;
}

function Facets({ d }: { d: string }) {
  return <path d={d} stroke={STROKE} strokeWidth={0.8} fill="none" strokeLinecap="round" opacity={0.75} />;
}

/** Stylized line-art icon representing the top-down facet pattern of a diamond cut. */
export default function DiamondShapeIcon({ shape, className }: Props) {
  const gradientId = `diamond-glow-${shape}`;

  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#C9A86A" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#C9A86A" stopOpacity="0" />
        </radialGradient>
      </defs>
      {shape === "round" && (
        <>
          <Outline gradientId={gradientId} d="M50,16 A36,36 0 1,1 49.99,16 Z" />
          <circle cx={50} cy={52} r={16} stroke={STROKE} strokeWidth={0.8} fill="none" opacity={0.75} />
          <Facets d="M86,52 L66,52 M75.5,77.5 L61.3,63.3 M50,88 L50,68 M24.5,77.5 L38.7,63.3 M14,52 L34,52 M24.5,26.5 L38.7,40.7 M50,16 L50,36 M75.5,26.5 L61.3,40.7" />
        </>
      )}

      {shape === "oval" && (
        <>
          <Outline gradientId={gradientId} d="M50,12 A28,40 0 1,1 49.99,12 Z" />
          <ellipse cx={50} cy={52} rx={12} ry={20} stroke={STROKE} strokeWidth={0.8} fill="none" opacity={0.75} />
          <Facets d="M78,52 L62,52 M69.8,80.3 L58.5,66.1 M50,92 L50,72 M30.2,80.3 L41.5,66.1 M22,52 L38,52 M30.2,23.7 L41.5,37.9 M50,12 L50,32 M69.8,23.7 L58.5,37.9" />
        </>
      )}

      {shape === "cushion" && (
        <>
          <Outline gradientId={gradientId} d="M37,13 L63,13 Q85,13 85,35 L85,69 Q85,91 63,91 L37,91 Q15,91 15,69 L15,35 Q15,13 37,13 Z" />
          <path d="M42,34 L58,34 Q66,34 66,42 L66,62 Q66,70 58,70 L42,70 Q34,70 34,62 L34,42 Q34,34 42,34 Z" stroke={STROKE} strokeWidth={0.8} fill="none" opacity={0.75} />
          <Facets d="M32,34 L15,35 M68,34 L85,35 M32,70 L15,69 M68,70 L85,69 M50,34 L50,13 M50,70 L50,91 M34,52 L15,52 M66,52 L85,52" />
        </>
      )}

      {shape === "emerald" && (
        <>
          <Outline gradientId={gradientId} d="M34,12 L66,12 L80,26 L80,78 L66,92 L34,92 L20,78 L20,26 Z" />
          <path d="M39,20 L61,20 L72,31 L72,73 L61,84 L39,84 L28,73 L28,31 Z" stroke={STROKE} strokeWidth={0.8} fill="none" opacity={0.75} />
          <path d="M44,28 L56,28 L64,36 L64,68 L56,76 L44,76 L36,68 L36,36 Z" stroke={STROKE} strokeWidth={0.8} fill="none" opacity={0.75} />
        </>
      )}

      {shape === "radiant" && (
        <>
          <Outline gradientId={gradientId} d="M33,17 L67,17 L80,30 L80,74 L67,87 L33,87 L20,74 L20,30 Z" />
          <path d="M42,32 L58,32 L65,39 L65,65 L58,72 L42,72 L35,65 L35,39 Z" stroke={STROKE} strokeWidth={0.8} fill="none" opacity={0.75} />
          <Facets d="M42,32 L33,17 M58,32 L67,17 M65,39 L80,30 M65,65 L80,74 M58,72 L67,87 M42,72 L33,87 M35,65 L20,74 M35,39 L20,30" />
        </>
      )}

      {shape === "pear" && (
        <>
          <Outline gradientId={gradientId} d="M50,90 C30,70 12,50 12,34 C12,16 29,8 50,8 C71,8 88,16 88,34 C88,50 70,70 50,90 Z" />
          <Facets d="M50,50 L50,88 M50,50 L50,12 M50,50 L16,34 M50,50 L84,34 M50,50 L22,58 M50,50 L78,58" />
        </>
      )}

      {shape === "marquise" && (
        <>
          <Outline gradientId={gradientId} d="M50,8 A60,60 0 0,1 50,96 A60,60 0 0,0 50,8 Z" />
          <path d="M50,30 A27,27 0 0,1 50,74 A27,27 0 0,0 50,30 Z" stroke={STROKE} strokeWidth={0.8} fill="none" opacity={0.75} />
          <Facets d="M50,52 L50,10 M50,52 L50,94 M50,52 L11,52 M50,52 L89,52" />
        </>
      )}

      {shape === "princess" && (
        <>
          <Outline gradientId={gradientId} d="M15,15 L85,15 L85,85 L15,85 Z" />
          <Facets d="M50,50 L15,15 M50,50 L85,15 M50,50 L85,85 M50,50 L15,85 M50,50 L50,15 M50,50 L85,50 M50,50 L50,85 M50,50 L15,50" />
        </>
      )}

      {shape === "asscher" && (
        <>
          <Outline gradientId={gradientId} d="M30,14 L70,14 L86,30 L86,70 L70,86 L30,86 L14,70 L14,30 Z" />
          <path d="M37,26 L63,26 L74,37 L74,63 L63,74 L37,74 L26,63 L26,37 Z" stroke={STROKE} strokeWidth={0.8} fill="none" opacity={0.75} />
          <path d="M44,38 L56,38 L62,44 L62,56 L56,62 L44,62 L38,56 L38,44 Z" stroke={STROKE} strokeWidth={0.8} fill="none" opacity={0.75} />
        </>
      )}

      {shape === "heart" && (
        <>
          <Outline gradientId={gradientId} d="M50,88 C20,65 8,45 8,28 C8,12 22,4 35,4 C44,4 50,10 50,20 C50,10 56,4 65,4 C78,4 92,12 92,28 C92,45 80,65 50,88 Z" />
          <Facets d="M50,50 L50,88 M50,50 L20,16 M50,50 L80,16 M50,50 L10,36 M50,50 L90,36 M50,50 L50,10" />
        </>
      )}
    </svg>
  );
}
