import { useState, useEffect, useCallback } from "react";
import Card from "./components/card";

import {
  Coffee,
  Bell,
  Crown,
  Heart,
  Star,
  Zap,
  Gift,
  Key,
  Camera,
  Anchor,
  Moon,
  Sun,
  Gamepad2,
  Trophy,
  type LucideIcon,
} from "lucide-react";

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

// Lista maior de ícones para variar a cada jogo
const allCardIcons: LucideIcon[] = [
  Coffee,
  Bell,
  Crown,
  Heart,
  Star,
  Zap,
  Gift,
  Key,
  Camera,
  Anchor,
  Moon,
  Sun,
];

const shuffleArray = <T,>(array: T[]): T[] =>
  array.sort(() => Math.random() - 0.5);

function App() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [isBlockingClicks, setIsBlockingClicks] = useState<boolean>(false);

  const [gameState, setGameState] = useState<"idle" | "playing">("idle");
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [boardSize, setBoardSize] = useState<4 | 8 | 12>(4);

  const playerName = "Jogador"; // nome fixo

  useEffect(() => {
    try {
      const savedRankings = localStorage.getItem("memoryGameRankings");
      if (savedRankings) setRankings(JSON.parse(savedRankings));
    } catch (error) {
      console.error("Failed to load rankings from localStorage", error);
    }
  }, []);

  const initializeGame = () => {
    const totalPairs = (boardSize * boardSize) / 2;

    // Embaralha todos os ícones e pega apenas os necessários para a partida
    const shuffledIcons = shuffleArray(allCardIcons);
    const iconsNeeded: LucideIcon[] = Array.from(
      { length: totalPairs },
      (_, i) => shuffledIcons[i % shuffledIcons.length]
    );

    const initialCards: Card[] = shuffleArray(
      [...iconsNeeded, ...iconsNeeded].map((Icon, index) => ({
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
    initializeGame();
    setGameState("playing");
  };

  const handleWin = useCallback(() => {
    setHasWon(true);
    const newScore: RankingEntry = { name: playerName, moves: moves + 1 };
    const updatedRankings = [...rankings, newScore]
      .sort((a, b) => a.moves - b.moves)
      .slice(0, 5);
    setRankings(updatedRankings);
    localStorage.setItem("memoryGameRankings", JSON.stringify(updatedRankings));
  }, [moves, rankings]);

  useEffect(() => {
    if (matches === cards.length / 2 && gameState === "playing" && moves > 0)
      handleWin();
  }, [matches, gameState, moves, handleWin, cards.length]);

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

  useEffect(() => {
    const startNewGame = (e: KeyboardEvent | MouseEvent) => {
      if (hasWon) {
        if (e instanceof KeyboardEvent && e.code !== "Space") return;
        initializeGame();
        setGameState("playing");
      }
    };

    window.addEventListener("keydown", startNewGame);
    window.addEventListener("click", startNewGame);

    return () => {
      window.removeEventListener("keydown", startNewGame);
      window.removeEventListener("click", startNewGame);
    };
  }, [hasWon]);

  const goToHome = () => {
    setGameState("idle");
    setHasWon(false);
  };

  if (gameState === "idle") {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center text-center">
          <Gamepad2 className="text-blue-400 w-16 h-16 mb-4 animate-bounce" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
            Jogo da Memória
          </h1>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          {[4, 8, 12].map((size) => (
            <button
              key={size}
              onClick={() => setBoardSize(size as 4 | 8 | 12)}
              className={`px-4 py-2 rounded-lg font-bold transition ${
                boardSize === size
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {size}x{size}
            </button>
          ))}
        </div>

        <button
          onClick={handleStartGame}
          className="w-full max-w-sm mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-200 transform hover:scale-105"
        >
          Jogar
        </button>

        <div className="w-full max-w-sm text-left mt-8">
          <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center">
            <Trophy className="mr-2" /> Ranking (Top 5)
          </h2>
          {rankings.length > 0 ? (
            <ol className="list-decimal list-inside bg-gray-800 p-4 rounded-lg">
              {rankings.map((entry, index) => (
                <li key={index} className="text-lg mb-2">
                  <span className="font-bold">{entry.name}</span> -{" "}
                  {entry.moves} jogadas
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-gray-500">
              O ranking ainda está vazio. Seja o primeiro a jogar!
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="flex justify-between items-center w-full max-w-xl mb-6 font-bold text-lg text-gray-300">
        <p>
          Jogador: <span className="text-blue-400">{playerName}</span>
        </p>
        <p>Jogadas: {moves}</p>
        <button
          onClick={goToHome}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg transition duration-200"
        >
          Voltar
        </button>
      </div>

      <div
        className="grid gap-4 w-full max-w-xl"
        style={{
          gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
        }}
      >
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
              Você venceu o jogo em <span className="font-bold">{moves}</span>{" "}
              jogadas!
            </p>
            <p className="mb-4 text-gray-500">
              Clique na tela ou pressione espaço para jogar novamente.
            </p>
            <button
              onClick={goToHome}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-200 transform hover:scale-105"
            >
              Voltar para Início
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
