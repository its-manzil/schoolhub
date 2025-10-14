"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/teachers", label: "Teachers", roles: ["SUPER_ADMIN","ADMIN_ACADEMIC"] },
  { href: "/classes", label: "Classes", roles: ["SUPER_ADMIN","ADMIN_ACADEMIC","TEACHER"] },
  { href: "/attendance", label: "Attendance", roles: ["SUPER_ADMIN","ADMIN_ACADEMIC","TEACHER"] },
  { href: "/exams", label: "Exams", roles: ["SUPER_ADMIN","ADMIN_ACADEMIC","TEACHER"] },
  { href: "/fees", label: "Fees", roles: ["SUPER_ADMIN","ADMIN_FINANCE","PARENT"] },
  { href: "/library", label: "Library", roles: ["SUPER_ADMIN","ADMIN_INVENTORY"] },
  { href: "/hostel", label: "Hostel", roles: ["SUPER_ADMIN","ADMIN_INVENTORY"] },
  { href: "/inventory", label: "Inventory", roles: ["SUPER_ADMIN","ADMIN_INVENTORY"] },
  { href: "/notices", label: "Notices" },
];

function Icon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? "#111" : "#6b7280";
  const size = 20;
  switch (name) {
    case "Dashboard":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10Zm10 8h8V3h-8v18ZM3 21h8v-6H3v6Z" stroke={stroke} strokeWidth="1.5"/></svg>
      );
    case "Teachers":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke={stroke} strokeWidth="1.5"/><path d="M4 21a8 8 0 0 1 16 0" stroke={stroke} strokeWidth="1.5"/></svg>
      );
    case "Classes":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="14" rx="2" stroke={stroke} strokeWidth="1.5"/><path d="M3 10h18" stroke={stroke} strokeWidth="1.5"/></svg>
      );
    case "Attendance":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2" stroke={stroke} strokeWidth="1.5"/><path d="M8 7h8M8 11h8M8 15h5" stroke={stroke} strokeWidth="1.5"/></svg>
      );
    case "Exams":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M4 4h16v4H4zM4 10h16v10H4z" stroke={stroke} strokeWidth="1.5"/></svg>
      );
    case "Fees":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="1.5"/><path d="M8 12h8M12 8v8" stroke={stroke} strokeWidth="1.5"/></svg>
      );
    case "Library":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M5 4h4v16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm10 0h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4V4Z" stroke={stroke} strokeWidth="1.5"/></svg>
      );
    case "Hostel":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M3 20V9l9-6 9 6v11" stroke={stroke} strokeWidth="1.5"/><path d="M9 20v-6h6v6" stroke={stroke} strokeWidth="1.5"/></svg>
      );
    case "Inventory":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke={stroke} strokeWidth="1.5"/><path d="M3 9h18M9 21V9" stroke={stroke} strokeWidth="1.5"/></svg>
      );
    case "Notices":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M4 4h16v12H7l-3 3V4Z" stroke={stroke} strokeWidth="1.5"/></svg>
      );
    default:
      return null;
  }
}

export default function Nav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const visible = links.filter((l) => !l.roles || (user && l.roles.includes(user.role)));

  return (
    <>
      <header className="topnav" style={{display:"flex",alignItems:"center",gap:12, padding:"10px 16px", borderBottom:"1px solid #eee", position:"sticky", top:0, background:"#fff", zIndex:10}}>
        <Link href="/" style={{fontWeight:700}}>SchoolHub</Link>
        <nav style={{display:"flex",gap:10, flexWrap:"wrap"}}>
          {visible.map((l) => (
            <Link key={l.href} href={l.href} style={{padding:"6px 10px", borderRadius:6, background: pathname===l.href?"#f0f2f5":"#ffffff", color: "#111", border:"1px solid #e5e7eb"}}>{l.label}</Link>
          ))}
        </nav>
        <div style={{marginLeft:"auto", display:"flex", alignItems:"center", gap:8}}>
          {user ? (
            <>
              <span style={{fontSize:13, color:"#666"}}>{user.name} • {user.role}</span>
              <button onClick={logout} style={{padding:"6px 10px", borderRadius:6, border:"1px solid #e5e7eb", background:"#fff"}}>Logout</button>
            </>
          ) : (
            <Link href="/login" style={{padding:"6px 10px", borderRadius:6, border:"1px solid #e5e7eb", background:"#fff", color:"#111"}}>Login</Link>
          )}
        </div>
      </header>

      {/* Bottom nav for mobile */}
      <nav className="bottomnav" style={{position:"fixed", bottom:0, left:0, right:0, background:"#fff", borderTop:"1px solid #e5e7eb", display:"none", padding:"6px 8px", zIndex:10}}>
        <div style={{display:"grid", gridTemplateColumns:`repeat(${visible.length}, 1fr)`, alignItems:"center", gap:4}}>
          {visible.map((l) => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, padding:"6px 4px", color: active?"#111":"#444"}}>
                <Icon name={l.label} active={active} />
                <span style={{fontSize:11}}>{l.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
