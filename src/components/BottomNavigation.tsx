import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BottomNavigationProps {
  items: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  }[];
}

export function BottomNavigation({ items }: BottomNavigationProps) {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200">
      <div className="flex justify-around">
        {items.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 ${
                isActive ? 'text-black' : 'text-gray-500'
              }`}
            >
              {item.icon && <div className="mb-1">{item.icon}</div>}
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 