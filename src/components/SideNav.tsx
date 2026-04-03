import { AlertTriangle, Leaf, CloudLightning, Ghost, Dna, LayoutDashboard } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", id: "overview", iconClass: "icon-3d" },
  { icon: AlertTriangle, label: "Thermal Regret", id: "regret", iconClass: "icon-3d-warning" },
  { icon: Leaf, label: "Carbon Debt", id: "carbon", iconClass: "icon-3d-accent" },
  { icon: CloudLightning, label: "Forecast", id: "forecast", iconClass: "icon-3d-primary" },
  { icon: Ghost, label: "Vampires", id: "vampires", iconClass: "icon-3d-destructive" },
  { icon: Dna, label: "Genome", id: "genome", iconClass: "icon-3d-primary" },
];

interface SideNavProps {
  active: string;
  onNavigate: (id: string) => void;
}

const SideNav = ({ active, onNavigate }: SideNavProps) => {
  return (
    <nav className="w-20 glass border-r border-border/30 flex flex-col items-center py-6 gap-3">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all w-14 ${
            active === item.id
              ? "bg-primary/5"
              : "hover:bg-muted/20"
          }`}
          title={item.label}
        >
          <div className={`${active === item.id ? item.iconClass : "icon-3d"} transition-all`}>
            <item.icon
              className={`h-4 w-4 ${active === item.id ? "text-foreground" : "text-muted-foreground"}`}
              strokeWidth={1.5}
            />
          </div>
          <span className={`text-[9px] font-mono ${active === item.id ? "text-foreground" : "text-muted-foreground"}`}>
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
};

export default SideNav;
