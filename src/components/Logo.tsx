// components/Logo.tsx

import Link from 'next/link';
import React from 'react';

interface LogoProps {
  textSize?: string;
}

const Logo: React.FC<LogoProps> = ({}) => {
  return (
    <Link href="/" className="flex items-center">
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            PreparateUC
        </span>
    </Link>
  );
};

export default Logo;