import { useState, useEffect, useCallback } from 'react'; // <--- CORREÇÃO 1: Importa o useCallback
import Card from './components/card';

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
  Trophy,
  type LucideIcon,
} from 'lucide-react';

interface Card {
  id: number;
  icon: LucideIcon;
  isFlipped: boolean;
  isMatched: boolean;
}

interface RankingEntry {
  name: string;
  moves: number;
}

const cardIcons = [Coffee, Bell, Crown, Heart, Star, Zap, Gift, Key];

const shuffleArray = (array: Card[]): Card[] => {
  return array.sort(() => Math.random() - 0.5);
};

function App() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [isBlockingClicks, setIsBlockingClicks] = useState<boolean>(false);

  const [gameState, setGameState] = useState<'idle' | 'playing'>('idle');
  const [playerName, setPlayerName] = useState<string>('');
  const [rankings, setRankings] = useState<RankingEntry[]>([]);

  useEffect(() => {
    try {
      const savedRankings = localStorage.getItem('memoryGameRankings');
      if (savedRankings) {
        setRankings(JSON.parse(savedRankings));
      }
    } catch (error) {
      console.error("Failed to load rankings from localStorage", error);
    }
  }, []);
  
  const initializeGame = () => {
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

  const handleStartGame = () => {
    if (playerName.trim() === '') {
      alert('Por favor, insira um nome para começar a jogar!');
      return;
    }
    initializeGame();
    setGameState('playing');
  };

  // --- CORREÇÃO 2: Usa o useCallback corretamente com suas dependências ---
  const handleWin = useCallback(() => {
    setHasWon(true);
    const newScore: RankingEntry = { name: playerName, moves: moves + 1 }; // moves + 1 para contar a última jogada
    
    const updatedRankings = [...rankings, newScore]
      .sort((a, b) => a.moves - b.moves)
      .slice(0, 5); 
      
    setRankings(updatedRankings);
    // Pequeno bug corrigido aqui para salvar o array correto
    localStorage.setItem('memoryGameRankings', JSON.stringify(updatedRankings));
  }, [playerName, moves, rankings]); // Adiciona as dependências da função
  
  useEffect(() => {
    // A condição de vitória agora é moves > 0 para não disparar no início
    if (matches === cardIcons.length && gameState === 'playing' && moves > 0) {
      handleWin();
    }
  }, [matches, gameState, moves, handleWin]);

  const handleCardClick = (clickedCardId: number) => {
    if (isBlockingClicks) return;

    setCards((prevCards) => 
      prevCards.map((card) =>
        card.id === clickedCardId ? { ...card, isFlipped: true } : card
      )
    );

    setFlippedCards((prevFlipped) => 
      prevFlipped.length < 2 ? [...prevFlipped, clickedCardId] : prevFlipped
    );
  };
  
  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsBlockingClicks(true);
      setMoves((prevMoves) => prevMoves + 1);

      const [firstCardId, secondCardId] = flippedCards;
      const firstCard = cards.find((c) => c.id === firstCardId);
      const secondCard = cards.find((c) => c.id === secondCardId);

      if (firstCard?.icon === secondCard?.icon) {
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.id === firstCardId || card.id === secondCardId
              ? { ...card, isMatched: true }
              : card
          )
        );
        setMatches((prevMatches) => prevMatches + 1);
        setFlippedCards([]);
        setIsBlockingClicks(false);
      } else {
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === firstCardId || card.id === secondCardId
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
          setIsBlockingClicks(false);
        }, 1000);
      }
    }
  }, [flippedCards, cards]);
  
  const playAgain = () => {
      setGameState('idle');
      setPlayerName('');
  }

  if (gameState === 'idle') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center text-center">
            <Gamepad2 className="text-blue-400 w-16 h-16 mb-4 animate-bounce" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
            Jogo da Memória
            </h1>
            <p className="text-gray-400 mb-8">
            Insira seu nome para começar!
            </p>
        </div>

        <div className="w-full max-w-sm mb-8">
            <input
                type="text"
                placeholder="Seu nome"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white text-center focus:outline-none focus:border-blue-500"
            />
            <button
                onClick={handleStartGame}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-200 transform hover:scale-105"
            >
            Jogar
            </button>
        </div>

        <div className="w-full max-w-sm text-left">
            <h2 className='text-2xl font-bold text-blue-400 mb-4 flex items-center'><Trophy className="mr-2" /> Ranking (Top 5)</h2>
            {rankings.length > 0 ? (
                <ol className="list-decimal list-inside bg-gray-800 p-4 rounded-lg">
                    {rankings.map((entry, index) => (
                        <li key={index} className="text-lg mb-2">
                           <span className="font-bold">{entry.name}</span> - {entry.moves} jogadas
                        </li>
                    ))}
                </ol>
            ) : (
                <p className="text-gray-500">O ranking ainda está vazio. Seja o primeiro a jogar!</p>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="flex justify-between items-center w-full max-w-xl mb-6 font-bold text-lg text-gray-300">
        <p>Jogador: <span className='text-blue-400'>{playerName}</span></p>
        <p>Jogadas: {moves}</p>
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
              Parabéns, {playerName}!
            </h2>
            <p className="text-xl text-gray-700 mb-6">
              Você venceu o jogo em <span className="font-bold">{moves}</span> jogadas!
            </p>
            <button
              onClick={playAgain}
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