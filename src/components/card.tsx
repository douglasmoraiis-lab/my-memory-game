import type { LucideIcon } from 'lucide-react';

// Define a interface para o objeto de carta,
// essencial para o TypeScript
interface CardProps {
  id: number;
  icon: LucideIcon;
  isFlipped: boolean;
  isMatched: boolean;
  onCardClick: (id: number) => void;
}

// Componente individual da carta
export default function Card({ id, icon: Icon, isFlipped, isMatched, onCardClick }: CardProps) {
  return (
    <div
      onClick={() => !isFlipped && !isMatched && onCardClick(id)}
      className={`
        w-full aspect-square rounded-xl flex items-center justify-center
        transform transition-all duration-300 cursor-pointer
        ${
          isFlipped
            ? 'bg-blue-500 transform rotate-y-180'
            : 'bg-gray-700 hover:bg-gray-600'
        }
        ${isMatched ? 'opacity-50' : 'hover:scale-105'}
      `}
    >
      {isFlipped && (
        <Icon
          className="text-white w-10 h-10 transition-opacity duration-300"
          style={{ opacity: isFlipped ? 1 : 0 }}
        />
      )}
    </div>
  );
}
