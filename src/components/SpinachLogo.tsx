type SpinachLogoProps = {
  size?: number;
  className?: string;
  /** Rounded dark frame matching the favicon asset */
  withFrame?: boolean;
  alt?: string;
};

const SpinachLogo = ({
  size = 24,
  className = "",
  withFrame = false,
  alt = "Spinach",
}: SpinachLogoProps) => {
  const logo = (
    <img
      src={`${process.env.PUBLIC_URL}/favicon.svg`}
      alt={alt}
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
    />
  );

  if (!withFrame) {
    return logo;
  }

  const frameSize = Math.round(size * 1.28);
  return (
    <span
      className="inline-flex items-center justify-center shrink-0 rounded-lg bg-neutral-950 border border-neutral-800"
      style={{ width: frameSize, height: frameSize }}
    >
      {logo}
    </span>
  );
};

export default SpinachLogo;
