import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PriceDisplay } from './PriceDisplay';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

interface SortablePriceDisplayProps {
  id: string;
  symbol: string;
  onRemove: () => void;
  onSelectSymbol: (symbol: string) => void;
}

export const SortablePriceDisplay = ({
  id,
  symbol,
  onRemove,
  onSelectSymbol
}: SortablePriceDisplayProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center
                   rounded-full bg-white/5 text-gray-300 opacity-0 group-hover:opacity-100
                   hover:bg-white/10 hover:text-white transition-all duration-200 cursor-grab z-10"
        title="Drag to reorder"
      >
        <DragIndicatorIcon fontSize="small" />
      </div>
      
      <PriceDisplay
        symbol={symbol}
        onRemove={onRemove}
        onSelectSymbol={onSelectSymbol}
      />
    </div>
  );
};