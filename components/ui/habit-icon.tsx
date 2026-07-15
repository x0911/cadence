import * as Icons from "lucide-react";

interface HabitIconProps extends Omit<React.ComponentProps<"svg">, "ref"> {
  name: string;
  size?: number;
}

// Map configured string identifiers to actual Lucide Icon components
const iconMap: Record<string, React.ComponentType<Icons.LucideProps>> = {
  Dumbbell: Icons.Dumbbell,
  Droplets: Icons.Droplets,
  Book: Icons.Book,
  Moon: Icons.Moon,
  Brain: Icons.Brain,
  Heart: Icons.Heart,
  Leaf: Icons.Leaf,
  Music: Icons.Music,
  Pencil: Icons.Pencil,
  Coffee: Icons.Coffee,
  Bike: Icons.Bike,
  Run: Icons.Footprints, // Map run key to footprints
  Pill: Icons.Pill,
  Sun: Icons.Sun,
  Zap: Icons.Zap,
  Smile: Icons.Smile,
  Target: Icons.Target,
  Timer: Icons.Timer,
  Flame: Icons.Flame,
  Star: Icons.Star,
};

export function HabitIcon({ name, size = 20, className, ...props }: HabitIconProps) {
  const IconComponent = iconMap[name] || Icons.HelpCircle;
  return <IconComponent size={size} className={className} {...props} />;
}
