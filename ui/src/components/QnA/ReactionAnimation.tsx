import { useEffect, useRef } from "react";

interface ReactionAnimationProps {
  icon: JSX.Element;
  reactions: { id: number }[];
  setReactions: React.Dispatch<React.SetStateAction<{ id: number }[]>>;
}

export function ReactionAnimation({
  icon,
  reactions,
  setReactions,
}: ReactionAnimationProps) {
  // Remove icon after animation ends
  const removeReaction = (id: number) => {
    setReactions((reaction) =>
      reaction.filter((reaction) => reaction.id !== id)
    );
  };

  return (
    <>
      {reactions.map((reaction) => (
        <Reaction
          key={reaction.id}
          id={reaction.id}
          onAnimationEnd={removeReaction}
          icon={icon}
        />
      ))}
    </>
  );
}

interface ReactionProps {
  id: number;
  onAnimationEnd: (id: number) => void;
  icon: JSX.Element;
}

function Reaction({ id, onAnimationEnd, icon }: ReactionProps) {
  const reactionRef = useRef(null);

  useEffect(() => {
    const reactionElement = reactionRef.current;

    // Random starting position
    reactionElement.style.left = Math.random() * 80 + 10 + "%";

    // Remove reaction after animation ends
    const handleAnimationEnd = () => {
      onAnimationEnd(id);
    };

    reactionElement.addEventListener("animationend", handleAnimationEnd);

    return () => {
      reactionElement.removeEventListener("animationend", handleAnimationEnd);
    };
  }, [id, onAnimationEnd]);

  return (
    <div className="reaction" ref={reactionRef}>
      {icon}
    </div>
  );
}
