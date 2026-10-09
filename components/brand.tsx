import Image from "next/image";

/** Logo oficial de CundiMarket (public/logo.png). */
export function BrandMark({ size = 48 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="CundiMarket"
      width={size}
      height={size}
      priority
      style={{ width: size, height: size }}
    />
  );
}
