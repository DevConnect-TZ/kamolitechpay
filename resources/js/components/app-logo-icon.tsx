import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="20" fill="#8DB600" />
            <rect x="20" y="28" width="60" height="10" rx="5" fill="#ffffff" />
            <rect x="20" y="45" width="60" height="10" rx="5" fill="#ffffff" />
            <rect x="20" y="62" width="40" height="10" rx="5" fill="#ffffff" />
            <circle cx="78" cy="67" r="6" fill="#ffffff" />
        </svg>
    );
}
