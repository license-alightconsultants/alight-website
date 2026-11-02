import {
  Boxes, Briefcase, Building2, Cloud, Globe, GraduationCap, Landmark, Map, Milk,
  Palette, PenTool, ShoppingBag, Smartphone, Sparkles, Workflow, CircleDot,
  Layers, ShieldCheck, Phone, Users, Cpu, Newspaper, BadgeCheck, Code2, Package,
} from 'lucide-react';

// Explicit map keeps the bundle small (no import of the whole icon set) and lets the CMS store icon names.
const icons = { Boxes, Briefcase, Building2, Cloud, Globe, GraduationCap, Landmark, Map, Milk, Palette, PenTool, ShoppingBag, Smartphone, Sparkles, Workflow, Layers, ShieldCheck, Phone, Users, Cpu, Newspaper, BadgeCheck, Code2, Package };

export default function Icon({ name, ...props }) {
  const Cmp = icons[name] || CircleDot;
  return <Cmp {...props} />;
}
