import { BookOpen, Grid3X3, Headphones, ImageIcon, Puzzle } from 'lucide-react';
import ResourceCard from '@/components/toppers/ResourceCard';
import type { ResourceTile, ResourceTypeKey } from '@/components/toppers/types';

const iconMap = {
  notes: BookOpen,
  podcasts: Headphones,
  crosswords: Puzzle,
  memes: ImageIcon,
  gridlocks: Grid3X3,
};

const accentMap: Record<ResourceTypeKey, string> = {
  notes: 'text-primary',
  podcasts: 'text-warning',
  crosswords: 'text-success',
  memes: 'text-primary',
  gridlocks: 'text-warning',
};

type ResourceTypeGridProps = {
  tiles: ResourceTile[];
  onSelect: (key: ResourceTypeKey) => void;
};

export default function ResourceTypeGrid({ tiles, onSelect }: ResourceTypeGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {tiles.map((tile) => {
        const Icon = iconMap[tile.key];
        return (
          <ResourceCard
            key={tile.key}
            tile={tile}
            icon={Icon}
            accentClass={accentMap[tile.key]}
            onClick={() => onSelect(tile.key)}
          />
        );
      })}
    </div>
  );
}
