import { useState, useEffect } from 'react';
import Card from './components/card'; // Importa o novo componente Card

import {
  Coffee,
  Bell,
  Crown,
  Heart,
  Star,
  Zap,
  Gift,
  Key,
  Gamepad2,
  type LucideIcon,
} from 'lucide-react';

// Define a interface para o objeto de carta,
// o que é essencial para o TypeScript entender a estrutura do estado.
interface Card {
  id: number;
  icon: LucideIcon;
  isFlipped: boolean;
  isMatched: boolean;
}

// Define as opções de ícones para o jogo
const cardIcons = [Coffee, Bell, Crown, Heart, Star, Zap, Gift, Key];

// Função utilitária para embaralhar um array
// O uso de `Card[]` na tipagem da função garante a segurança do tipo.
const shuffleArray = (array: Card[]): Card[] => {
  return array.sort(() => Math.random() - 0.5);
};

// O componente principal da aplicação do jogo
function App() {
  // Estado para armazenar as cartas do jogo, tipado como `Card[]`
  const [cards, setCards] = useState<Card[]>([]);
  // Estado para armazenar os IDs das cartas viradas, tipado como `number[]`
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  // Estado para contar os pares encontrados
  const [matches, setMatches] = useState<number>(0);
  // Estado para contar as jogadas
  const [moves, setMoves] = useState<number>(0);
  // Estado para verificar se o usuário venceu o jogo
  const [hasWon, setHasWon] = useState<boolean>(false);
  // Estado para controlar se as cartas podem ser clicadas
  const [isBlockingClicks, setIsBlockingClicks] = useState<boolean>(false);

  // Inicializa o jogo
  const initializeGame = () => {
    // Cria pares de cartas com IDs e ícones únicos
    const initialCards: Card[] = shuffleArray(
      [...cardIcons, ...cardIcons].map((Icon, index) => ({
        id: index,
        icon: Icon,
        isFlipped: false,
        isMatched: false,
      }))
    );

    setCards(initialCards);
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setHasWon(false);
  };

  // Efeito para iniciar o jogo na montagem do componente
  useEffect(() => {
    initializeGame();
  }, []);

  // Efeito para verificar se o usuário venceu o jogo
  useEffect(() => {
    if (matches === cardIcons.length) {
      setHasWon(true);
    }
  }, [matches]);

  // Função para lidar com o clique em uma carta
  const handleCardClick = (clickedCardId: number) => {
    // Ignora cliques se os cliques estiverem bloqueados ou a carta já estiver virada/encontrada
    if (isBlockingClicks) return;

    setCards((prevCards) => {
      // Encontra a carta clicada
      const newCards = prevCards.map((card) =>
        card.id === clickedCardId ? { ...card, isFlipped: true } : card
      );
      return newCards;
    });

    setFlippedCards((prevFlipped) => {
      // Se já houver duas cartas viradas, não faz nada
      if (prevFlipped.length === 2) {
        return prevFlipped;
      }
      return [...prevFlipped, clickedCardId];
    });
  };

  // Efeito para verificar se as duas cartas viradas são um par
  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsBlockingClicks(true); // Bloqueia cliques
      setMoves((prevMoves) => prevMoves + 1); // Incrementa as jogadas

      const [firstCardId, secondCardId] = flippedCards;
      const firstCard = cards.find((c) => c.id === firstCardId);
      const secondCard = cards.find((c) => c.id === secondCardId);

      // Verifica se os ícones são iguais
      if (firstCard?.icon === secondCard?.icon) {
        // Se forem iguais, marca-os como encontrados
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.id === firstCardId || card.id === secondCardId
              ? { ...card, isMatched: true, isFlipped: true }
              : card
          )
        );
        setMatches((prevMatches) => prevMatches + 1); // Incrementa os pares encontrados
        setFlippedCards([]); // Limpa as cartas viradas
        setIsBlockingClicks(false); // Desbloqueia cliques
      } else {
        // Se não forem um par, vira-os de volta após um atraso
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === firstCardId || card.id === secondCardId
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]); // Limpa as cartas viradas
          setIsBlockingClicks(false); // Desbloqueia cliques
        }, 1000);
      }
    }
  }, [flippedCards, cards]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center">
        <Gamepad2 className="text-blue-400 w-16 h-16 mb-4 animate-bounce" />
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
          Jogo da Memória
        </h1>
        <p className="text-gray-400 text-center mb-6">
          Encontre os pares de ícones para vencer!
        </p>
      </div>

      <div className="flex justify-between w-full max-w-xl mb-6 font-bold text-lg text-gray-300">
        <p>Jogadas: {moves}</p>
        <button
          onClick={initializeGame}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-200 transform hover:scale-105"
        >
          Reiniciar
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 max-w-xl w-full">
        {cards.map((card) => (
          <Card
            key={card.id}
            id={card.id}
            icon={card.icon}
            isFlipped={card.isFlipped}
            isMatched={card.isMatched}
            onCardClick={handleCardClick}
          />
        ))}
      </div>

      {hasWon && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-50">
          <div className="bg-white p-10 rounded-2xl shadow-2xl text-center transform scale-105 animate-pop-in">
            <h2 className="text-4xl font-extrabold text-blue-600 mb-4">
              Parabéns!
            </h2>
            <p className="text-xl text-gray-700 mb-6">
              Você venceu o jogo em <span className="font-bold">{moves}</span> jogadas!
            </p>
            <button
              onClick={initializeGame}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-200 transform hover:scale-105"
            >
              Jogar de novo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
