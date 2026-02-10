import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900">
      <Image src="/taflologo.png" alt="TaFlo" width={220} height={72} className="h-14 w-auto opacity-90" priority />
    </div>
  );
}
