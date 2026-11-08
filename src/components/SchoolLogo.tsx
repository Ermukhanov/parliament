import Image from 'next/image';

interface SchoolLogoProps {
  className?: string;
  variant?: 'blue-on-white' | 'white-on-blue';
  priority?: boolean;
}

// Uses the original AQL Council crest, recoloured to brand blue / white with a transparent background.
export default function SchoolLogo({
  className = 'w-11 h-11',
  variant = 'blue-on-white',
  priority = false,
}: SchoolLogoProps) {
  const src = variant === 'white-on-blue' ? '/logo-white.png' : '/logo-blue.png';

  return (
    <Image
      src={src}
      alt="AQL Council"
      width={505}
      height={508}
      priority={priority}
      className={`${className} object-contain select-none`}
      draggable={false}
    />
  );
}
