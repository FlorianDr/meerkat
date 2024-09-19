import { useCallback, useEffect, useRef } from "react";

interface ReactionProps {
  id: number;
  icon: JSX.Element;
  setReactions: React.Dispatch<React.SetStateAction<{ id: number }[]>>;
}

export function Reaction({ id, icon, setReactions }: ReactionProps) {
  const reactionRef = useRef(null);

  const removeReaction = useCallback((id: number) => {
    setReactions((prevReactions) => {
      return prevReactions.filter((reaction) => reaction.id !== id);
    });
  }, [id]);

  useEffect(() => {
    const reactionElement = reactionRef.current;
    // Remove reaction after animation ends
    const handleAnimationEnd = () => {
      removeReaction(id);
    };

    reactionElement.addEventListener("animationend", handleAnimationEnd);

    return () => {
      reactionElement.removeEventListener("animationend", handleAnimationEnd);
    };
  }, [id, removeReaction]);

  // "Random" starting position
  const right = ((id % 100) / 100) * 2 + 5;
  return (
    <div className="reaction" ref={reactionRef} style={{ right: `${right}%` }}>
      {icon}
    </div>
  );
}
