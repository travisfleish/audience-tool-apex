type HeroDisplayTitleProps = {
  title: string;
  titleLine2?: string;
  className?: string;
};

export function HeroDisplayTitle({ title, titleLine2, className }: HeroDisplayTitleProps) {
  if (titleLine2) {
    return (
      <h1 className={className}>
        <span className="block">{title}</span>
        <span className="block">{titleLine2}</span>
      </h1>
    );
  }

  return <h1 className={className}>{title}</h1>;
}
