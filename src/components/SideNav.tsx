import { AlertTriangle, Leaf, CloudLightning, Ghost, Dna, LayoutDashboard } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", id: "overview" },
  { icon: AlertTriangle, label: "Thermal Regret", id: "regret" },
  { icon: Leaf, label: "Carbon Debt", id: "carbon" },
  { icon: CloudLightning, label: "Forecast", id: "forecast" },
  { icon: Ghost, label: "Vampires", id: "vampires" },
  { icon: Dna, label: "Genome", id: "genome" },
];

interface SideNavProps {
  active: string;
  onNavigate: (id: string) => void;
}

const SideNav = ({ active, onNavigate }: SideNavProps) => {
  return (
    <nav className="w-16 border-r border-border bg-card/50 flex flex-col items-center py-4 gap-2">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all w-12 ${
            active === item.id
              ? "bg-primary/10 text-primary glow-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
          title={item.label}
        >
          <item.icon className="h-5 w-5" />
          <span className="text-[9px] font-mono">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default SideNav;
