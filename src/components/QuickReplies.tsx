interface QuickRepliesProps {
  options: string[];
  onPick: (option: string) => void;
}

// Clickable pill buttons so the buyer can respond without typing — used by both agents.
const QuickReplies = ({ options, onPick }: QuickRepliesProps) => {
  if (!options.length) return null;
  return (
    <div className="agent-quick-replies">
      {options.map((option) => (
        <button key={option} className="agent-quick-reply-chip" onClick={() => onPick(option)}>
          {option}
        </button>
      ))}
    </div>
  );
};

export default QuickReplies;
