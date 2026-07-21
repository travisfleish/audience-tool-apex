type GeniusStripeTheme = "green" | "softGreen" | "navy" | "red" | "blue";
type GeniusStripeScale = "default" | "site";
type GeniusStripeMask = "none" | "heroRight";

type GeniusStripeRailProps = {
  theme: GeniusStripeTheme;
  className?: string;
  dimmed?: boolean;
  fadeTone?: "light" | "dark";
  scale?: GeniusStripeScale;
  mask?: GeniusStripeMask;
};

type StripeThemeConfig = {
  assetUrl: string;
};

const stripeThemeConfig: Record<GeniusStripeTheme, StripeThemeConfig> = {
  green: {
    assetUrl: "/genius-assets/bright-green-lines.png"
  },
  softGreen: {
    assetUrl: "/genius-assets/green-lines.png"
  },
  navy: {
    assetUrl: "/genius-assets/navy-lines.png"
  },
  red: {
    assetUrl: "/genius-assets/light-red-lines.png"
  },
  blue: {
    assetUrl: "/genius-assets/blue-lines.png"
  }
};

function GeniusStripeRail({
  theme,
  className,
  dimmed = false,
  fadeTone = "light",
  scale = "default",
  mask = "none"
}: GeniusStripeRailProps) {
  const config = stripeThemeConfig[theme];
  const scaleClass = scale === "site" ? "gs-stripe-surface-site" : "";
  const maskClass = mask === "heroRight" ? "gs-stripe-mask-hero-right" : "";

  return (
    <div className={className} aria-hidden="true">
      <div
        className={`absolute inset-0 ${scaleClass} ${maskClass}`}
        style={{
          backgroundImage: `url("${config.assetUrl}")`,
          backgroundPosition: "center right",
          backgroundRepeat: "no-repeat",
          backgroundSize: scale === "site" ? undefined : "cover",
          opacity: scale === "site" ? undefined : dimmed ? 0.55 : 0.95
        }}
      />
      <div
        className={`absolute inset-0 ${
          fadeTone === "dark"
            ? "bg-gradient-to-l from-transparent via-transparent to-[#0A1330]/70"
            : "bg-gradient-to-l from-transparent via-transparent to-white/70"
        }`}
      />
    </div>
  );
}

export default GeniusStripeRail;
