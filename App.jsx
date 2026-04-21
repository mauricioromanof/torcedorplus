
import { useState, useMemo, useEffect, useRef } from "react";
import { useAuth, useClub, useDashboard, useMembers, usePlans, useRaffles } from "./lib/hooks";
import {
  Shield, Star, Crown, Check, Users, Trophy, Gift, Ticket,
  Package, Zap, ChevronRight, X, ArrowRight, Phone, Mail,
  MapPin, CreditCard, User, Hash, CheckCircle, AlertCircle,
  Lock, Heart, Calendar, Eye, EyeOff, Home, Settings, LogOut,
  Bell, Menu, TrendingUp, DollarSign, Plus, Download, Filter,
  Search, ArrowUpDown, ChevronLeft, ChevronDown, ChevronUp,
  Edit3, Trash2, Save, ToggleLeft, ToggleRight, GripVertical,
  Percent, MoreVertical, PartyPopper, Sparkles, Timer, Tag,
  ExternalLink, BarChart2, MessageCircle, RotateCcw
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// GLOBAL STYLES
// ═══════════════════════════════════════════════════════════
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,700;0,800;1,800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0f0d; color: #fff; font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes slideIn  { from{transform:translateX(100%)} to{transform:translateX(0)} }
  @keyframes popIn    { from{opacity:0;transform:translate(-50%,-48%) scale(0.95)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes shimmer  { from{background-position:200% center} to{background-position:-200% center} }
  @keyframes orbitA   { from{transform:rotate(0deg) translateY(-80px)} to{transform:rotate(360deg) translateY(-80px)} }
  @keyframes orbitB   { from{transform:rotate(180deg) translateY(-80px)} to{transform:rotate(540deg) translateY(-80px)} }
  input[type=date]::-webkit-calendar-picker-indicator,
  input[type=time]::-webkit-calendar-picker-indicator { filter: invert(0.4); cursor: pointer; }
  input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
  select option { background: #111a15; color: #fff; }
  textarea { font-family: 'DM Sans', sans-serif; }
  .tp-row:hover { background: rgba(22,163,74,0.06) !important; }
  .tp-nav-btn:hover { background: rgba(255,255,255,0.05) !important; }
`;

// ═══════════════════════════════════════════════════════════
// CONSTANTS & MOCK DATA
// ═══════════════════════════════════════════════════════════
const CLUB = {
  name: "Esporte Clube Sertãozinho", slug: "ecsertaozinho",
  city: "Sertãozinho", state: "SP", founded: 1948,
  primary_color: "#16a34a", total_members: 243,
  monthly_revenue: 7854.00, total_revenue: 34210.50,
};

const PLAN_CFG = {
  "Torcedor": { color: "#64748b", bg: "rgba(100,116,139,0.15)", icon: Star,   chances: 1 },
  "Campeão":  { color: "#16a34a", bg: "rgba(22,163,74,0.15)",   icon: Shield, chances: 3 },
  "Lenda":    { color: "#d97706", bg: "rgba(217,119,6,0.15)",   icon: Crown,  chances: 5 },
};

const STATUS_CFG = {
  active:    { label: "Ativo",         color: "#4ade80", bg: "rgba(74,222,128,0.1)",   icon: CheckCircle },
  overdue:   { label: "Inadimplente",  color: "#fb923c", bg: "rgba(251,146,60,0.1)",  icon: AlertCircle },
  cancelled: { label: "Cancelado",     color: "#f87171", bg: "rgba(248,113,113,0.1)", icon: X },
};

const METHOD_CFG = {
  pix:         { label: "Pix",    color: "#34d399" },
  credit_card: { label: "Cartão", color: "#60a5fa" },
  boleto:      { label: "Boleto", color: "#facc15" },
};

const MEMBERS = [
  { id:1,  num:1001, name:"Carlos Eduardo Silva",    email:"carlos@email.com",    whatsapp:"(16) 99123-4567", cpf:"123.456.789-00", plan:"Lenda",    price:79.9,  status:"active",    method:"credit_card", next_billing:"2026-05-01", start:"2025-08-01", city:"Sertãozinho", payments:9  },
  { id:2,  num:1002, name:"Fernanda Oliveira Santos", email:"fe@gmail.com",       whatsapp:"(16) 98765-4321", cpf:"234.567.890-11", plan:"Campeão",  price:49.9,  status:"active",    method:"pix",         next_billing:"2026-05-03", start:"2025-09-03", city:"Sertãozinho", payments:8  },
  { id:3,  num:1003, name:"Roberto Nascimento",       email:"rob@hotmail.com",    whatsapp:"(16) 97654-3210", cpf:"345.678.901-22", plan:"Torcedor", price:29.9,  status:"overdue",   method:"boleto",      next_billing:"2026-04-15", start:"2025-10-15", city:"Ribeirão Preto", payments:6  },
  { id:4,  num:1004, name:"Juliana Martins Costa",    email:"juju@gmail.com",     whatsapp:"(16) 96543-2109", cpf:"456.789.012-33", plan:"Campeão",  price:49.9,  status:"active",    method:"credit_card", next_billing:"2026-05-06", start:"2025-11-06", city:"Sertãozinho", payments:5  },
  { id:5,  num:1005, name:"Anderson Costa",           email:"anderson@email.com", whatsapp:"(16) 95432-1098", cpf:"567.890.123-44", plan:"Lenda",    price:79.9,  status:"active",    method:"pix",         next_billing:"2026-05-08", start:"2025-07-08", city:"Sertãozinho", payments:10 },
  { id:6,  num:1006, name:"Patricia Lima",            email:"pati@gmail.com",     whatsapp:"(16) 94321-0987", cpf:"678.901.234-55", plan:"Torcedor", price:29.9,  status:"active",    method:"pix",         next_billing:"2026-05-10", start:"2026-01-10", city:"Jardinópolis", payments:3  },
  { id:7,  num:1007, name:"Marcos Vinícius Torres",   email:"mv@email.com",       whatsapp:"(16) 93210-9876", cpf:"789.012.345-66", plan:"Campeão",  price:49.9,  status:"overdue",   method:"boleto",      next_billing:"2026-04-10", start:"2025-12-10", city:"Sertãozinho", payments:4  },
  { id:8,  num:1008, name:"Bruna Ferreira",           email:"bruna@hotmail.com",  whatsapp:"(16) 92109-8765", cpf:"890.123.456-77", plan:"Torcedor", price:29.9,  status:"active",    method:"credit_card", next_billing:"2026-05-12", start:"2026-02-12", city:"Sertãozinho", payments:2  },
  { id:9,  num:1009, name:"Lucas Rodrigues",          email:"lucas@gmail.com",    whatsapp:"(16) 91098-7654", cpf:"901.234.567-88", plan:"Lenda",    price:79.9,  status:"cancelled", method:"pix",         next_billing:null,         start:"2025-06-01", city:"Ribeirão Preto", payments:10 },
  { id:10, num:1010, name:"Aline Souza",              email:"aline@email.com",    whatsapp:"(16) 90987-6543", cpf:"012.345.678-99", plan:"Campeão",  price:49.9,  status:"active",    method:"pix",         next_billing:"2026-05-15", start:"2026-03-15", city:"Sertãozinho", payments:1  },
];

const PLANS_INIT = [
  { id:1, name:"Torcedor", description:"Para quem ama o clube.", price:29.90, raffle_chances:1, is_active:true, color:"#64748b", icon:"star",   members:98,
    benefits:[{id:1,type:"carteirinha_digital",description:"Carteirinha digital com QR Code",discount:null},{id:2,type:"ingresso_desconto",description:"10% de desconto em ingressos",discount:10}] },
  { id:2, name:"Campeão",  description:"Para o torcedor que vai além.", price:49.90, raffle_chances:3, is_active:true, color:"#16a34a", icon:"shield", members:87,
    benefits:[{id:1,type:"carteirinha_digital",description:"Carteirinha digital com QR Code",discount:null},{id:2,type:"meia_entrada",description:"Meia entrada em todos os jogos",discount:50},{id:3,type:"produto_exclusivo",description:"Camisa comemorativa anual",discount:null},{id:4,type:"conteudo_exclusivo",description:"Acesso aos bastidores",discount:null}] },
  { id:3, name:"Lenda",    description:"O nível máximo.", price:79.90, raffle_chances:5, is_active:true, color:"#d97706", icon:"crown",  members:33,
    benefits:[{id:1,type:"carteirinha_digital",description:"Carteirinha Premium",discount:null},{id:2,type:"meia_entrada",description:"Meia entrada em todos os jogos",discount:50},{id:3,type:"area_vip",description:"Acesso à Área VIP",discount:null},{id:4,type:"produto_exclusivo",description:"Kit completo do clube",discount:null},{id:5,type:"conteudo_exclusivo",description:"Treinos abertos exclusivos",discount:null}] },
];

const RAFFLES_INIT = [
  { id:1, name:"Sorteio de Abril",    prize_name:"Camisa Oficial Autografada",  draw_date:"2026-04-30T20:00:00", status:"open",  total_entries:30, participants:10, winner:null },
  { id:2, name:"Sorteio de Março",    prize_name:"Kit Completo do Clube",        draw_date:"2026-03-30T20:00:00", status:"drawn", total_entries:28, participants:9,  winner:{name:"Fernanda Oliveira", num:1002, plan:"Campeão"} },
  { id:3, name:"Sorteio de Fevereiro",prize_name:"Ingresso VIP para 2 Pessoas", draw_date:"2026-02-28T20:00:00", status:"drawn", total_entries:22, participants:8,  winner:{name:"Anderson Costa",    num:1005, plan:"Lenda"} },
];

const BENEFIT_TYPES = [
  { key:"ingresso_desconto",  label:"Desconto em Ingresso",  icon:Ticket,   color:"#60a5fa" },
  { key:"meia_entrada",       label:"Meia Entrada",          icon:Tag,      color:"#34d399" },
  { key:"produto_exclusivo",  label:"Produto Exclusivo",     icon:Package,  color:"#f472b6" },
  { key:"area_vip",           label:"Área VIP",              icon:Star,     color:"#fbbf24" },
  { key:"carteirinha_digital",label:"Carteirinha Digital",   icon:Shield,   color:"#a78bfa" },
  { key:"conteudo_exclusivo", label:"Conteúdo Exclusivo",    icon:Zap,      color:"#fb923c" },
  { key:"outro",              label:"Outro",                 icon:Gift,     color:"#94a3b8" },
];

const PLAN_COLORS = ["#64748b","#16a34a","#d97706","#3b82f6","#ec4899","#8b5cf6","#ef4444","#0ea5e9"];
const PLAN_ICONS_CFG = [
  {key:"star",  icon:Star,  label:"Estrela"},
  {key:"shield",icon:Shield,label:"Escudo"},
  {key:"crown", icon:Crown, label:"Coroa"},
  {key:"zap",   icon:Zap,   label:"Raio"},
];

const NAV = [
  { id:"dashboard", label:"Dashboard",    icon:Home },
  { id:"members",   label:"Sócios",       icon:Users },
  { id:"plans",     label:"Planos",       icon:Star },
  { id:"raffles",   label:"Sorteios",     icon:Gift },
  { id:"payments",  label:"Pagamentos",   icon:CreditCard },
  { id:"preview",   label:"Pág. Pública", icon:ExternalLink },
  { id:"settings",  label:"Configurações",icon:Settings },
];

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
const initials = (name) => name.split(" ").map(n=>n[0]).slice(0,2).join("");
const fmtBRL   = (v) => `R$ ${Number(v).toFixed(2).replace(".",",")}`;
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("pt-BR") : "—";
const getPlanIcon = (key) => (PLAN_ICONS_CFG.find(p=>p.key===key)||PLAN_ICONS_CFG[0]).icon;
const getBenefit  = (type) => BENEFIT_TYPES.find(b=>b.key===type)||BENEFIT_TYPES[BENEFIT_TYPES.length-1];

function inp(extra={}) {
  return {
    background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
    borderRadius:10, padding:"11px 14px", color:"#fff", fontSize:14,
    outline:"none", width:"100%", fontFamily:"'DM Sans',sans-serif",
    transition:"border-color 0.2s", ...extra
  };
}

const lbl = { color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:600,
  textTransform:"uppercase", letterSpacing:0.8, display:"block", marginBottom:7 };

// ═══════════════════════════════════════════════════════════
// SHARED: ANIMATED NUMBER
// ═══════════════════════════════════════════════════════════
function AnimNum({value, prefix="", suffix="", dec=0}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let cur=0; const end=parseFloat(value), dur=1000, step=(end/dur)*16;
    const t = setInterval(()=>{ cur+=step; if(cur>=end){setN(end);clearInterval(t);}else setN(cur); },16);
    return ()=>clearInterval(t);
  },[value]);
  return <span>{prefix}{dec>0?n.toLocaleString("pt-BR",{minimumFractionDigits:dec,maximumFractionDigits:dec}):Math.floor(n).toLocaleString("pt-BR")}{suffix}</span>;
}

// ═══════════════════════════════════════════════════════════
// SHARED: STAT CARD
// ═══════════════════════════════════════════════════════════
function StatCard({icon:Icon, label, value, prefix, suffix, dec, delta, color, delay=0}) {
  const pos = delta >= 0;
  return (
    <div style={{background:"#111a15",border:`1px solid ${color}18`,borderRadius:16,padding:"20px 22px",
      animation:`fadeUp 0.5s ease ${delay}ms both`, position:"relative", overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,right:0,width:80,height:80,
        background:`radial-gradient(circle at 100% 0%, ${color}12 0%, transparent 70%)`,pointerEvents:"none"}}/>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{width:38,height:38,borderRadius:9,background:`${color}15`,border:`1px solid ${color}25`,
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Icon size={17} color={color}/>
        </div>
        <span style={{fontSize:11,fontWeight:600,color:pos?"#4ade80":"#f87171",display:"flex",alignItems:"center",gap:3}}>
          {pos?"↑":"↓"}{Math.abs(delta)}%
        </span>
      </div>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:800,color:"#fff",lineHeight:1}}>
        <AnimNum value={value} prefix={prefix} suffix={suffix} dec={dec}/>
      </div>
      <div style={{color:"rgba(255,255,255,0.38)",fontSize:12,marginTop:5}}>{label}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════════
function Sidebar({page, setPage, collapsed, setCollapsed, onLogout}) {
  return (
    <aside style={{width:collapsed?68:230,minHeight:"100vh",background:"#0c1410",
      borderRight:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",
      transition:"width 0.22s ease",flexShrink:0}}>
      {/* Logo */}
      <div style={{padding:collapsed?"18px 0":"18px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",
        display:"flex",alignItems:"center",justifyContent:collapsed?"center":"space-between"}}>
        {!collapsed && (
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#16a34a,#15803d)",
              display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 12px rgba(22,163,74,0.35)"}}>
              <Shield size={17} color="#fff"/>
            </div>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:800,color:"#fff",letterSpacing:0.5}}>
              TORCEDOR<span style={{color:"#16a34a"}}>+</span>
            </span>
          </div>
        )}
        {collapsed && <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#16a34a,#15803d)",
          display:"flex",alignItems:"center",justifyContent:"center"}}><Shield size={17} color="#fff"/></div>}
        <button onClick={()=>setCollapsed(!collapsed)} style={{background:"none",border:"none",
          color:"rgba(255,255,255,0.3)",cursor:"pointer",display:"flex",padding:4,borderRadius:6}}>
          <Menu size={15}/>
        </button>
      </div>

      {/* Club chip */}
      {!collapsed && (
        <div style={{margin:"10px 10px 0",padding:"10px 12px",background:"rgba(22,163,74,0.07)",
          borderRadius:10,border:"1px solid rgba(22,163,74,0.15)"}}>
          <div style={{color:"#fff",fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {CLUB.name.split(" ").slice(0,3).join(" ")}
          </div>
          <div style={{color:"rgba(255,255,255,0.3)",fontSize:11,marginTop:2}}>{CLUB.city} · {CLUB.state}</div>
        </div>
      )}

      {/* Nav */}
      <nav style={{flex:1,padding:"12px 8px",display:"flex",flexDirection:"column",gap:2}}>
        {NAV.map(n=>{
          const active = page === n.id;
          return (
            <button key={n.id} className="tp-nav-btn" onClick={()=>setPage(n.id)} style={{
              display:"flex",alignItems:"center",gap:10,padding:collapsed?"9px 0":"9px 10px",
              borderRadius:9,border:"none",cursor:"pointer",
              justifyContent:collapsed?"center":"flex-start",
              background:active?"rgba(22,163,74,0.14)":"transparent",
              color:active?"#16a34a":"rgba(255,255,255,0.42)",
              fontSize:13,fontWeight:active?600:400,transition:"all 0.13s",
              fontFamily:"'DM Sans',sans-serif",width:"100%"}}>
              <n.icon size={16}/>
              {!collapsed && <span style={{flex:1,textAlign:"left"}}>{n.label}</span>}
              {!collapsed && active && <ChevronRight size={12}/>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{padding:"10px 8px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <button onClick={onLogout} style={{display:"flex",alignItems:"center",gap:10,
          padding:collapsed?"9px 0":"9px 10px",borderRadius:9,border:"none",cursor:"pointer",
          justifyContent:collapsed?"center":"flex-start",background:"transparent",
          color:"rgba(255,255,255,0.28)",fontSize:13,width:"100%",fontFamily:"'DM Sans',sans-serif",
          transition:"color 0.15s"}}
          onMouseEnter={e=>e.currentTarget.style.color="#f87171"}
          onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.28)"}>
          <LogOut size={16}/>{!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════
// TOPBAR
// ═══════════════════════════════════════════════════════════
function TopBar({page}) {
  const label = NAV.find(n=>n.id===page)?.label || "";
  return (
    <div style={{height:56,borderBottom:"1px solid rgba(255,255,255,0.06)",
      display:"flex",alignItems:"center",justifyContent:"space-between",
      padding:"0 28px",background:"#0c1410",flexShrink:0}}>
      <span style={{color:"rgba(255,255,255,0.28)",fontSize:13}}>{label}</span>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",
          borderRadius:9,width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",
          cursor:"pointer",color:"rgba(255,255,255,0.35)",position:"relative"}}>
          <Bell size={15}/>
          <span style={{position:"absolute",top:7,right:7,width:6,height:6,
            background:"#16a34a",borderRadius:"50%",border:"1.5px solid #0c1410"}}/>
        </button>
        <div style={{width:34,height:34,borderRadius:9,
          background:"linear-gradient(135deg,#16a34a,#15803d)",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:12,color:"#fff",cursor:"pointer"}}>
          GE
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE: LOGIN
// ═══════════════════════════════════════════════════════════
function LoginPage({onLogin}) {
  const [email,setEmail]=useState(""); const [pwd,setPwd]=useState("");
  const [show,setShow]=useState(false); const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const go=()=>{
    if(!email||!pwd){setErr("Preencha todos os campos.");return;}
    setLoading(true);setErr("");
    setTimeout(()=>{setLoading(false);onLogin();},1400);
  };
  return (
    <div style={{minHeight:"100vh",background:"#0a0f0d",display:"flex",alignItems:"center",
      justifyContent:"center",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(22,163,74,0.12) 0%,transparent 70%)",
        top:-100,left:-100,pointerEvents:"none"}}/>
      <div style={{position:"absolute",inset:0,opacity:0.03,pointerEvents:"none",
        backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 60px,#16a34a 60px,#16a34a 61px),repeating-linear-gradient(90deg,transparent,transparent 60px,#16a34a 60px,#16a34a 61px)"}}/>
      <div style={{width:"100%",maxWidth:400,padding:"0 24px",animation:"fadeUp 0.5s ease both"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:60,height:60,borderRadius:14,background:"linear-gradient(135deg,#16a34a,#15803d)",
            display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",
            boxShadow:"0 8px 28px rgba(22,163,74,0.4)"}}>
            <Shield size={28} color="#fff"/>
          </div>
          <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:800,color:"#fff",margin:0,letterSpacing:1}}>
            TORCEDOR<span style={{color:"#16a34a"}}>PLUS</span>
          </h1>
          <p style={{color:"rgba(255,255,255,0.35)",fontSize:12,marginTop:5}}>Plataforma de Sócio-Torcedor</p>
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",
          borderRadius:18,padding:28,backdropFilter:"blur(12px)"}}>
          <h2 style={{color:"#fff",fontWeight:600,fontSize:17,margin:"0 0 4px"}}>Acesso do Gestor</h2>
          <p style={{color:"rgba(255,255,255,0.3)",fontSize:12,margin:"0 0 24px"}}>Entre com suas credenciais</p>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <input style={inp()} type="email" placeholder="seu@email.com" value={email}
              onChange={e=>setEmail(e.target.value)}
              onFocus={e=>e.target.style.borderColor="#16a34a"}
              onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
            <div style={{position:"relative"}}>
              <input style={inp({paddingRight:44})} type={show?"text":"password"} placeholder="Senha"
                value={pwd} onChange={e=>setPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}
                onFocus={e=>e.target.style.borderColor="#16a34a"}
                onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              <button onClick={()=>setShow(!show)} style={{position:"absolute",right:12,top:"50%",
                transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",
                color:"rgba(255,255,255,0.3)",display:"flex"}}>
                {show?<EyeOff size={16}/>:<Eye size={16}/>}
              </button>
            </div>
            {err && <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",
              borderRadius:8,padding:"9px 12px",color:"#f87171",fontSize:12,display:"flex",alignItems:"center",gap:7}}>
              <AlertCircle size={13}/>{err}</div>}
            <button onClick={go} disabled={loading} style={{background:loading?"rgba(22,163,74,0.5)":"#16a34a",
              color:"#fff",border:"none",borderRadius:10,padding:"13px",width:"100%",fontSize:14,
              fontWeight:600,cursor:loading?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",
              transition:"all 0.2s"}}>
              {loading ? <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <span style={{width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",
                  borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>Entrando...</span>
              : "Entrar na Plataforma"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE: DASHBOARD
// ═══════════════════════════════════════════════════════════
function DashboardPage({setPage}) {
  const recent = MEMBERS.slice(0,5);
  const planDist = Object.entries(PLAN_CFG).map(([name,cfg])=>({
    name, color:cfg.color,
    count: MEMBERS.filter(m=>m.plan===name).length,
    pct: Math.round((MEMBERS.filter(m=>m.plan===name).length / MEMBERS.length)*100)
  }));
  return (
    <div style={{padding:"24px 28px",overflowY:"auto",flex:1}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <div>
          <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:30,fontWeight:800,color:"#fff",margin:0,letterSpacing:0.5}}>Dashboard</h1>
          <p style={{color:"rgba(255,255,255,0.3)",fontSize:12,marginTop:4}}>Temporada 2026 · Atualizado agora</p>
        </div>
        <button onClick={()=>setPage("members")} style={{display:"flex",alignItems:"center",gap:7,
          background:"#16a34a",color:"#fff",border:"none",borderRadius:10,padding:"9px 16px",
          cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,
          boxShadow:"0 4px 16px rgba(22,163,74,0.35)"}}>
          <Plus size={14}/> Novo Sócio
        </button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        <StatCard icon={Users}      label="Sócios Ativos"   value={MEMBERS.filter(m=>m.status==="active").length}  color="#16a34a" delta={8}  delay={0}/>
        <StatCard icon={TrendingUp} label="Receita Mensal"  value={CLUB.monthly_revenue} prefix="R$ " dec={2}       color="#3b82f6" delta={12} delay={80}/>
        <StatCard icon={AlertCircle}label="Inadimplentes"   value={MEMBERS.filter(m=>m.status==="overdue").length} color="#f59e0b" delta={-3} delay={160}/>
        <StatCard icon={Trophy}     label="Total Acumulado" value={CLUB.total_revenue}   prefix="R$ " dec={2}       color="#a855f7" delta={5}  delay={240}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:18}}>
        {/* Recent members */}
        <div style={{background:"#111a15",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:22,
          animation:"fadeUp 0.5s ease 280ms both"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
            <h3 style={{color:"#fff",fontWeight:600,fontSize:15,margin:0}}>Últimos Sócios</h3>
            <button onClick={()=>setPage("members")} style={{background:"none",border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:8,color:"rgba(255,255,255,0.4)",fontSize:12,padding:"5px 11px",cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif"}}>Ver todos →</button>
          </div>
          {recent.map((m,i)=>{
            const plan=PLAN_CFG[m.plan]; const st=STATUS_CFG[m.status]; const StatusIco=st.icon;
            return (
              <div key={m.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 12px",
                borderRadius:10,background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.04)",
                marginBottom:i<recent.length-1?8:0,transition:"background 0.12s",cursor:"default"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.025)"}>
                <div style={{width:36,height:36,borderRadius:9,background:plan.bg,border:`1px solid ${plan.color}30`,
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                  fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:12,color:plan.color}}>
                  {initials(m.name)}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:"#fff",fontSize:13,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.name}</div>
                  <div style={{color:"rgba(255,255,255,0.28)",fontSize:11,marginTop:1}}>Sócio #{m.num}</div>
                </div>
                <span style={{fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20,background:st.bg,color:st.color}}>{st.label}</span>
                <span style={{fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20,background:plan.bg,color:plan.color}}>{m.plan}</span>
                <span style={{color:"#fff",fontWeight:700,fontSize:13,minWidth:56,textAlign:"right"}}>{fmtBRL(m.price)}</span>
              </div>
            );
          })}
        </div>

        {/* Right col */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Plan dist */}
          <div style={{background:"#111a15",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:20,
            animation:"fadeUp 0.5s ease 340ms both"}}>
            <h3 style={{color:"#fff",fontWeight:600,fontSize:14,margin:"0 0 16px"}}>Distribuição por Plano</h3>
            {planDist.map(p=>(
              <div key={p.name} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{color:"rgba(255,255,255,0.6)",fontSize:12}}>{p.name}</span>
                  <span style={{color:"#fff",fontSize:12,fontWeight:600}}>{p.count} · {p.pct}%</span>
                </div>
                <div style={{height:5,background:"rgba(255,255,255,0.07)",borderRadius:99}}>
                  <div style={{height:"100%",borderRadius:99,width:`${p.pct}%`,background:p.color,transition:"width 1.2s ease"}}/>
                </div>
              </div>
            ))}
          </div>

          {/* Next raffle */}
          <div style={{background:"#111a15",border:"1px solid rgba(22,163,74,0.2)",borderRadius:16,padding:18,
            animation:"fadeUp 0.5s ease 400ms both"}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}>
              <Gift size={14} color="#16a34a"/>
              <span style={{color:"#16a34a",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>Próximo Sorteio</span>
            </div>
            <div style={{color:"#fff",fontWeight:700,fontSize:15,marginBottom:3}}>Camisa Oficial Autografada</div>
            <div style={{color:"rgba(255,255,255,0.35)",fontSize:12,marginBottom:14}}>Sorteio de Abril · 9 dias</div>
            <button onClick={()=>setPage("raffles")} style={{width:"100%",background:"rgba(22,163,74,0.12)",
              border:"1px solid rgba(22,163,74,0.25)",borderRadius:9,color:"#4ade80",padding:"9px",
              fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              Gerenciar Sorteio →
            </button>
          </div>

          {/* My revenue */}
          <div style={{background:"#111a15",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:18,
            animation:"fadeUp 0.5s ease 460ms both"}}>
            <div style={{color:"rgba(255,255,255,0.35)",fontSize:11,marginBottom:8}}>Minha receita (10%)</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:30,fontWeight:800,color:"#16a34a"}}>
              <AnimNum value={CLUB.monthly_revenue*0.1} prefix="R$ " dec={2}/>
            </div>
            <div style={{marginTop:10,height:4,background:"rgba(255,255,255,0.07)",borderRadius:99}}>
              <div style={{height:"100%",width:"72%",borderRadius:99,background:"linear-gradient(90deg,#16a34a,#4ade80)"}}/>
            </div>
            <div style={{color:"rgba(255,255,255,0.22)",fontSize:11,marginTop:5}}>72% da meta atingida</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE: MEMBERS
// ═══════════════════════════════════════════════════════════
function MemberDrawer({member, onClose}) {
  const [tab,setTab]=useState("info");
  const plan=PLAN_CFG[member.plan]; const st=STATUS_CFG[member.status]; const StIco=st.icon;
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:40,backdropFilter:"blur(2px)",animation:"fadeIn 0.2s ease both"}}/>
      <div style={{position:"fixed",right:0,top:0,bottom:0,width:460,background:"#0f1811",
        borderLeft:"1px solid rgba(255,255,255,0.07)",zIndex:50,display:"flex",flexDirection:"column",
        animation:"slideIn 0.28s cubic-bezier(0.32,0.72,0,1) both",overflowY:"auto"}}>
        <div style={{padding:"18px 22px",borderBottom:"1px solid rgba(255,255,255,0.07)",background:"#0d1410",
          position:"sticky",top:0,zIndex:1,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:11}}>
            <div style={{width:42,height:42,borderRadius:11,background:plan.bg,border:`1px solid ${plan.color}30`,
              display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Barlow Condensed',sans-serif",
              fontWeight:800,fontSize:15,color:plan.color}}>{initials(member.name)}</div>
            <div>
              <div style={{color:"#fff",fontWeight:600,fontSize:14}}>{member.name}</div>
              <div style={{color:"rgba(255,255,255,0.3)",fontSize:11}}>Sócio #{member.num}</div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:8,color:"rgba(255,255,255,0.4)",cursor:"pointer",width:30,height:30,
            display:"flex",alignItems:"center",justifyContent:"center"}}><X size={14}/></button>
        </div>

        <div style={{display:"flex",gap:8,padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
          {[{color:st.color,bg:st.bg,label:st.label,ico:st.icon},{color:plan.color,bg:plan.bg,label:member.plan,ico:plan.icon}].map((b,i)=>(
            <span key={i} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600,
              padding:"5px 11px",borderRadius:20,background:b.bg,color:b.color}}>
              <b.ico size={12}/>{b.label}
            </span>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,background:"rgba(255,255,255,0.04)"}}>
          {[{label:"Mensalidade",value:fmtBRL(member.price),color:"#4ade80"},
            {label:"Meses Ativo",value:`${member.payments} meses`,color:"#60a5fa"}].map(s=>(
            <div key={s.label} style={{background:"#0f1811",padding:"14px",textAlign:"center"}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:800,color:s.color}}>{s.value}</div>
              <div style={{color:"rgba(255,255,255,0.28)",fontSize:11,marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"0 20px"}}>
          {["info","pagamentos","ações"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"12px 0",marginRight:18,border:"none",background:"none",
              color:tab===t?"#16a34a":"rgba(255,255,255,0.32)",borderBottom:tab===t?"2px solid #16a34a":"2px solid transparent",
              fontSize:12,fontWeight:tab===t?600:400,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textTransform:"capitalize"}}>
              {t}
            </button>
          ))}
        </div>

        <div style={{padding:"18px 20px",flex:1}}>
          {tab==="info" && (
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {[{icon:Mail,label:"E-mail",value:member.email},{icon:Phone,label:"WhatsApp",value:member.whatsapp},
                {icon:Shield,label:"CPF",value:member.cpf},{icon:MapPin,label:"Cidade",value:`${member.city} · ${member.state}`},
                {icon:Calendar,label:"Sócio desde",value:fmtDate(member.start)},
                {icon:CreditCard,label:"Pagamento",value:METHOD_CFG[member.method]?.label||member.method},
                {icon:Calendar,label:"Próx. cobrança",value:fmtDate(member.next_billing)}
              ].map(r=>(
                <div key={r.label} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 12px",
                  background:"rgba(255,255,255,0.03)",borderRadius:9,border:"1px solid rgba(255,255,255,0.05)"}}>
                  <div style={{width:30,height:30,borderRadius:7,background:"rgba(22,163,74,0.1)",
                    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <r.icon size={13} color="#16a34a"/>
                  </div>
                  <div>
                    <div style={{color:"rgba(255,255,255,0.3)",fontSize:10,marginBottom:1}}>{r.label}</div>
                    <div style={{color:"#fff",fontSize:13}}>{r.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab==="pagamentos" && (
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {Array.from({length:Math.min(member.payments,5)},(_,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                  padding:"11px 12px",background:"rgba(255,255,255,0.03)",borderRadius:9,
                  border:"1px solid rgba(255,255,255,0.05)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:"#4ade80",boxShadow:"0 0 5px #4ade80"}}/>
                    <div>
                      <div style={{color:"#fff",fontSize:12,fontWeight:500}}>
                        {new Date(2026,3-i,5).toLocaleDateString("pt-BR",{month:"long",year:"numeric"})}
                      </div>
                      <div style={{color:"rgba(255,255,255,0.28)",fontSize:11}}>Confirmado</div>
                    </div>
                  </div>
                  <span style={{color:"#4ade80",fontWeight:700,fontSize:13}}>{fmtBRL(member.price)}</span>
                </div>
              ))}
            </div>
          )}
          {tab==="ações" && (
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[{ico:MessageCircle,label:"Enviar mensagem via WhatsApp",color:"#4ade80",bg:"rgba(74,222,128,0.08)",border:"rgba(74,222,128,0.2)"},
                {ico:Edit3,label:"Editar dados do sócio",color:"#60a5fa",bg:"rgba(96,165,250,0.08)",border:"rgba(96,165,250,0.2)"},
                {ico:Download,label:"Baixar carteirinha digital",color:"#c084fc",bg:"rgba(192,132,252,0.08)",border:"rgba(192,132,252,0.2)"},
                {ico:Trash2,label:"Cancelar assinatura",color:"#f87171",bg:"rgba(248,113,113,0.08)",border:"rgba(248,113,113,0.2)"}
              ].map(a=>(
                <button key={a.label} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",
                  borderRadius:11,background:a.bg,border:`1px solid ${a.border}`,color:a.color,cursor:"pointer",
                  width:"100%",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,
                  transition:"opacity 0.15s",textAlign:"left"}}
                  onMouseEnter={e=>e.currentTarget.style.opacity="0.7"}
                  onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                  <a.ico size={15}/>{a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function MembersPage() {
  const [search,setSearch]=useState(""); const [fStatus,setFStatus]=useState("all");
  const [fPlan,setFPlan]=useState("all"); const [page,setPage]=useState(1);
  const [selected,setSelected]=useState(null); const PER=8;

  const filtered=useMemo(()=>{
    let d=[...MEMBERS];
    if(search){const q=search.toLowerCase();d=d.filter(m=>m.name.toLowerCase().includes(q)||m.email.includes(q)||m.cpf.includes(q)||String(m.num).includes(q));}
    if(fStatus!=="all") d=d.filter(m=>m.status===fStatus);
    if(fPlan!=="all")   d=d.filter(m=>m.plan===fPlan);
    return d;
  },[search,fStatus,fPlan]);

  const paged=filtered.slice((page-1)*PER,page*PER);
  const totalPages=Math.ceil(filtered.length/PER);
  const counts={total:MEMBERS.length,active:MEMBERS.filter(m=>m.status==="active").length,overdue:MEMBERS.filter(m=>m.status==="overdue").length,cancelled:MEMBERS.filter(m=>m.status==="cancelled").length};

  return (
    <div style={{padding:"24px 28px",overflowY:"auto",flex:1}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22}}>
        <div>
          <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,fontWeight:800,margin:0,letterSpacing:0.5}}>SÓCIOS</h1>
          <p style={{color:"rgba(255,255,255,0.3)",fontSize:12,marginTop:4}}>{counts.total} cadastrados · {counts.active} ativos</p>
        </div>
        <button style={{display:"flex",alignItems:"center",gap:7,background:"#16a34a",color:"#fff",border:"none",
          borderRadius:10,padding:"9px 16px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,
          boxShadow:"0 4px 14px rgba(22,163,74,0.35)"}}>
          <Plus size={14}/> Novo Sócio
        </button>
      </div>

      {/* Summary */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
        {[{label:"Total",value:counts.total,color:"#60a5fa",icon:Users},
          {label:"Ativos",value:counts.active,color:"#4ade80",icon:CheckCircle},
          {label:"Inadimplentes",value:counts.overdue,color:"#fb923c",icon:AlertCircle},
          {label:"Cancelados",value:counts.cancelled,color:"#f87171",icon:X}
        ].map(c=>(
          <div key={c.label} style={{background:"#111a15",border:`1px solid ${c.color}18`,borderRadius:13,
            padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:36,height:36,borderRadius:9,background:`${c.color}12`,border:`1px solid ${c.color}22`,
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <c.icon size={16} color={c.color}/>
            </div>
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:800,color:c.color,lineHeight:1}}>{c.value}</div>
              <div style={{color:"rgba(255,255,255,0.3)",fontSize:11,marginTop:2}}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div style={{display:"flex",gap:10,marginBottom:14}}>
        <div style={{flex:1,position:"relative"}}>
          <Search size={14} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,0.22)",pointerEvents:"none"}}/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
            placeholder="Buscar por nome, e-mail, CPF ou nº..."
            style={inp({paddingLeft:36})}
            onFocus={e=>e.target.style.borderColor="#16a34a"}
            onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
        </div>
        <select value={fStatus} onChange={e=>{setFStatus(e.target.value);setPage(1);}}
          style={inp({width:"auto",paddingRight:32,cursor:"pointer",appearance:"none"})}>
          <option value="all">Todos status</option>
          <option value="active">Ativos</option>
          <option value="overdue">Inadimplentes</option>
          <option value="cancelled">Cancelados</option>
        </select>
        <select value={fPlan} onChange={e=>{setFPlan(e.target.value);setPage(1);}}
          style={inp({width:"auto",paddingRight:32,cursor:"pointer",appearance:"none"})}>
          <option value="all">Todos planos</option>
          <option value="Torcedor">Torcedor</option>
          <option value="Campeão">Campeão</option>
          <option value="Lenda">Lenda</option>
        </select>
      </div>

      {/* Table */}
      <div style={{background:"#111a15",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"44px 1fr 130px 120px 100px 110px 40px",
          padding:"10px 18px",borderBottom:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.02)"}}>
          {["#","Sócio","Plano","Status","Mensalidade","Próx. Cobrança",""].map(h=>(
            <div key={h} style={{color:"rgba(255,255,255,0.35)",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:0.7}}>{h}</div>
          ))}
        </div>
        {paged.length===0 ? (
          <div style={{padding:"48px",textAlign:"center",color:"rgba(255,255,255,0.2)",fontSize:13}}>Nenhum sócio encontrado.</div>
        ) : paged.map((m,i)=>{
          const plan=PLAN_CFG[m.plan]; const st=STATUS_CFG[m.status]; const StIco=st.icon; const mth=METHOD_CFG[m.method];
          return (
            <div key={m.id} className="tp-row" onClick={()=>setSelected(m)} style={{
              display:"grid",gridTemplateColumns:"44px 1fr 130px 120px 100px 110px 40px",
              padding:"12px 18px",borderBottom:i<paged.length-1?"1px solid rgba(255,255,255,0.04)":"none",
              background:"transparent",cursor:"pointer",transition:"background 0.12s",
              animation:`fadeUp 0.3s ease ${i*35}ms both`}}>
              <div style={{color:"rgba(255,255,255,0.22)",fontSize:11,display:"flex",alignItems:"center"}}>#{m.num}</div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:33,height:33,borderRadius:8,background:plan.bg,border:`1px solid ${plan.color}28`,
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                  fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:12,color:plan.color}}>
                  {initials(m.name)}
                </div>
                <div style={{minWidth:0}}>
                  <div style={{color:"#fff",fontSize:13,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.name}</div>
                  <div style={{color:"rgba(255,255,255,0.25)",fontSize:11}}>{m.email}</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center"}}>
                <span style={{fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20,background:plan.bg,color:plan.color}}>{m.plan}</span>
              </div>
              <div style={{display:"flex",alignItems:"center"}}>
                <span style={{display:"flex",alignItems:"center",gap:4,fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20,background:st.bg,color:st.color}}>
                  <StIco size={10}/>{st.label}
                </span>
              </div>
              <div style={{display:"flex",alignItems:"center"}}>
                <div>
                  <div style={{color:"#fff",fontSize:13,fontWeight:700}}>{fmtBRL(m.price)}</div>
                  <div style={{fontSize:10,color:mth?.color,fontWeight:600}}>{mth?.label}</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center"}}>
                <span style={{color:m.status==="overdue"?"#fb923c":"rgba(255,255,255,0.4)",fontSize:12}}>{fmtDate(m.next_billing)}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end"}}>
                <button onClick={e=>{e.stopPropagation();setSelected(m);}} style={{background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(255,255,255,0.08)",borderRadius:7,color:"rgba(255,255,255,0.35)",cursor:"pointer",
                  width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.12s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(22,163,74,0.15)";e.currentTarget.style.color="#16a34a";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color="rgba(255,255,255,0.35)";}}>
                  <Eye size={12}/>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages>1 && (
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:14}}>
          <span style={{color:"rgba(255,255,255,0.28)",fontSize:12}}>{filtered.length} resultado(s) · Página {page}/{totalPages}</span>
          <div style={{display:"flex",gap:5}}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{background:"#111a15",
              border:"1px solid rgba(255,255,255,0.08)",borderRadius:7,color:page===1?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.4)",
              cursor:page===1?"not-allowed":"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <ChevronLeft size={14}/>
            </button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)} style={{background:p===page?"#16a34a":"#111a15",
                border:p===page?"none":"1px solid rgba(255,255,255,0.08)",borderRadius:7,
                color:p===page?"#fff":"rgba(255,255,255,0.38)",cursor:"pointer",width:32,height:32,
                fontSize:12,fontWeight:p===page?700:400,fontFamily:"'DM Sans',sans-serif"}}>{p}</button>
            ))}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{background:"#111a15",
              border:"1px solid rgba(255,255,255,0.08)",borderRadius:7,color:page===totalPages?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.4)",
              cursor:page===totalPages?"not-allowed":"pointer",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <ChevronRight size={14}/>
            </button>
          </div>
        </div>
      )}
      {selected && <MemberDrawer member={selected} onClose={()=>setSelected(null)}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE: PLANS
// ═══════════════════════════════════════════════════════════
function PlansPage() {
  const [plans,setPlans]=useState(PLANS_INIT);
  const [editing,setEditing]=useState(null);
  const [deleting,setDeleting]=useState(null);

  const handleSave=(form)=>{
    if(editing?.id) setPlans(ps=>ps.map(p=>p.id===editing.id?{...p,...form}:p));
    else setPlans(ps=>[...ps,{...form,id:Date.now(),members:0}]);
    setEditing(null);
  };

  const totalRev=plans.reduce((s,p)=>s+p.members*p.price,0);

  return (
    <div style={{padding:"24px 28px",overflowY:"auto",flex:1}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22}}>
        <div>
          <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,fontWeight:800,margin:0,letterSpacing:0.5}}>PLANOS</h1>
          <p style={{color:"rgba(255,255,255,0.3)",fontSize:12,marginTop:4}}>{plans.filter(p=>p.is_active).length} ativos · {plans.reduce((s,p)=>s+p.members,0)} sócios</p>
        </div>
        <button onClick={()=>setEditing({benefits:[]})} style={{display:"flex",alignItems:"center",gap:7,
          background:"#16a34a",color:"#fff",border:"none",borderRadius:10,padding:"9px 16px",cursor:"pointer",
          fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,boxShadow:"0 4px 14px rgba(22,163,74,0.35)"}}>
          <Plus size={14}/> Criar Plano
        </button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:22}}>
        {[{label:"Receita Mensal",value:fmtBRL(totalRev),color:"#4ade80",icon:TrendingUp},
          {label:"Total de Sócios",value:plans.reduce((s,p)=>s+p.members,0),color:"#60a5fa",icon:Users},
          {label:"Planos Ativos",value:plans.filter(p=>p.is_active).length,color:"#fbbf24",icon:Zap}
        ].map(c=>(
          <div key={c.label} style={{background:"#111a15",border:`1px solid ${c.color}18`,borderRadius:13,
            padding:"16px 18px",display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:40,height:40,borderRadius:10,background:`${c.color}12`,border:`1px solid ${c.color}22`,
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <c.icon size={18} color={c.color}/>
            </div>
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:800,color:c.color,lineHeight:1}}>{c.value}</div>
              <div style={{color:"rgba(255,255,255,0.28)",fontSize:11,marginTop:2}}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {editing!==null && (
        <PlanForm plan={editing} onSave={handleSave} onCancel={()=>setEditing(null)}/>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {plans.map((plan,i)=>{
          const IcoComp=getPlanIcon(plan.icon);
          const [exp,setExp]=useState(false);
          return (
            <div key={plan.id} style={{background:"#111a15",border:`1px solid ${plan.is_active?plan.color+"28":"rgba(255,255,255,0.06)"}`,
              borderRadius:16,overflow:"hidden",opacity:plan.is_active?1:0.6,
              animation:`fadeUp 0.4s ease ${i*60}ms both`,transition:"opacity 0.2s"}}>
              <div style={{height:3,background:plan.is_active?`linear-gradient(90deg,${plan.color},${plan.color}55)`:"rgba(255,255,255,0.08)"}}/>
              <div style={{padding:"20px 22px"}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:48,height:48,borderRadius:13,background:`${plan.color}14`,border:`1px solid ${plan.color}28`,
                      display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <IcoComp size={22} color={plan.color}/>
                    </div>
                    <div>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:800,color:"#fff"}}>{plan.name}</div>
                      <div style={{color:"rgba(255,255,255,0.32)",fontSize:12,marginTop:1}}>{plan.description}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    {[{ico:plan.is_active?Eye:EyeOff,fn:()=>setPlans(ps=>ps.map(p=>p.id===plan.id?{...p,is_active:!p.is_active}:p)),c:"rgba(255,255,255,0.35)"},
                      {ico:Edit3,fn:()=>setEditing(plan),hc:"#16a34a"},
                      {ico:Trash2,fn:()=>setDeleting(plan),hc:"#f87171"}
                    ].map((b,bi)=>(
                      <button key={bi} onClick={b.fn} style={{background:"rgba(255,255,255,0.05)",
                        border:"1px solid rgba(255,255,255,0.08)",borderRadius:7,color:"rgba(255,255,255,0.32)",
                        cursor:"pointer",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.13s"}}
                        onMouseEnter={e=>{if(b.hc){e.currentTarget.style.color=b.hc;e.currentTarget.style.background=b.hc+"15";}}}
                        onMouseLeave={e=>{e.currentTarget.style.color="rgba(255,255,255,0.32)";e.currentTarget.style.background="rgba(255,255,255,0.05)";}}>
                        <b.ico size={13}/>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:14}}>
                  {[{label:"Mensalidade",value:fmtBRL(plan.price),color:"#4ade80"},
                    {label:"Sócios",value:plan.members,color:"#60a5fa"},
                    {label:"Receita Mensal",value:fmtBRL(plan.members*plan.price),color:"#f9a8d4"},
                    {label:"Chances Sorteio",value:`${plan.raffle_chances}×`,color:plan.color}
                  ].map(s=>(
                    <div key={s.label} style={{padding:"9px 11px",background:"rgba(255,255,255,0.03)",borderRadius:8,border:"1px solid rgba(255,255,255,0.04)"}}>
                      <div style={{color:"#fff",fontWeight:700,fontSize:14}}>{s.value}</div>
                      <div style={{color:"rgba(255,255,255,0.28)",fontSize:10,marginTop:2}}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <button onClick={()=>setExp(!exp)} style={{display:"flex",alignItems:"center",gap:5,
                  background:"none",border:"none",color:"rgba(255,255,255,0.35)",cursor:"pointer",
                  fontSize:12,fontFamily:"'DM Sans',sans-serif",padding:0}}>
                  {exp?<ChevronUp size={13}/>:<ChevronDown size={13}/>}
                  {exp?"Ocultar":`Ver ${plan.benefits.length} benefícios`}
                </button>

                {exp && (
                  <div style={{display:"flex",flexDirection:"column",gap:7,marginTop:12,animation:"fadeUp 0.2s ease both"}}>
                    {plan.benefits.map(b=>{
                      const cfg=getBenefit(b.type);
                      return (
                        <div key={b.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 11px",
                          background:"rgba(255,255,255,0.03)",borderRadius:8,border:"1px solid rgba(255,255,255,0.04)"}}>
                          <div style={{width:26,height:26,borderRadius:6,background:`${cfg.color}14`,
                            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            <cfg.icon size={12} color={cfg.color}/>
                          </div>
                          <div style={{flex:1}}>
                            <div style={{color:"rgba(255,255,255,0.65)",fontSize:12}}>{b.description}</div>
                            <div style={{color:cfg.color,fontSize:10,fontWeight:600,marginTop:1}}>{cfg.label}</div>
                          </div>
                          {b.discount && <span style={{fontSize:11,fontWeight:700,padding:"2px 7px",borderRadius:20,background:"rgba(74,222,128,0.1)",color:"#4ade80"}}>-{b.discount}%</span>}
                          <CheckCircle size={13} color={plan.color}/>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {deleting && (
        <>
          <div onClick={()=>setDeleting(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:40,backdropFilter:"blur(2px)"}}/>
          <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
            background:"#111a15",border:"1px solid rgba(248,113,113,0.3)",borderRadius:18,
            padding:28,width:380,zIndex:50,animation:"popIn 0.25s ease both"}}>
            <div style={{width:48,height:48,borderRadius:12,background:"rgba(248,113,113,0.1)",
              border:"1px solid rgba(248,113,113,0.2)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16}}>
              <AlertCircle size={22} color="#f87171"/>
            </div>
            <h3 style={{color:"#fff",fontWeight:700,fontSize:17,margin:"0 0 8px"}}>Excluir plano "{deleting.name}"?</h3>
            <p style={{color:"rgba(255,255,255,0.38)",fontSize:13,margin:"0 0 22px",lineHeight:1.6}}>
              {deleting.members} sócios neste plano precisarão ser migrados antes da exclusão.
            </p>
            <div style={{display:"flex",gap:9}}>
              <button onClick={()=>setDeleting(null)} style={{flex:1,padding:"10px",background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.1)",borderRadius:9,color:"rgba(255,255,255,0.45)",
                cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13}}>Cancelar</button>
              <button onClick={()=>{setPlans(ps=>ps.filter(p=>p.id!==deleting.id));setDeleting(null);}}
                style={{flex:1,padding:"10px",background:"rgba(248,113,113,0.15)",border:"1px solid rgba(248,113,113,0.3)",
                borderRadius:9,color:"#f87171",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600}}>
                Excluir
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PlanForm({plan,onSave,onCancel}) {
  const isNew=!plan.id;
  const [form,setForm]=useState({name:plan.name||"",description:plan.description||"",price:plan.price||"",
    raffle_chances:plan.raffle_chances||1,color:plan.color||"#16a34a",icon:plan.icon||"star",
    is_active:plan.is_active!==undefined?plan.is_active:true,benefits:plan.benefits||[]});
  const IcoComp=getPlanIcon(form.icon);
  const addB=()=>setForm(f=>({...f,benefits:[...f.benefits,{id:Date.now(),type:"outro",description:"",discount:null}]}));
  const updB=(id,u)=>setForm(f=>({...f,benefits:f.benefits.map(b=>b.id===id?u:b)}));
  const remB=(id)=>setForm(f=>({...f,benefits:f.benefits.filter(b=>b.id!==id)}));
  return (
    <div style={{background:"#111a15",border:`1px solid ${form.color}28`,borderRadius:18,padding:24,marginBottom:20,
      animation:"fadeUp 0.3s ease both",boxShadow:`0 0 36px ${form.color}08`}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:800,margin:0,color:"#fff"}}>
          {isNew?"Criar Novo Plano":`Editar — ${plan.name}`}
        </h3>
        <button onClick={onCancel} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:8,color:"rgba(255,255,255,0.38)",cursor:"pointer",width:30,height:30,
          display:"flex",alignItems:"center",justifyContent:"center"}}><X size={14}/></button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{padding:"14px 16px",borderRadius:12,background:`${form.color}0d`,border:`1px solid ${form.color}22`,
            display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:46,height:46,borderRadius:12,background:`${form.color}18`,border:`1px solid ${form.color}35`,
              display:"flex",alignItems:"center",justifyContent:"center"}}><IcoComp size={22} color={form.color}/></div>
            <div>
              <div style={{color:form.color,fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:800}}>{form.name||"Nome"}</div>
              <div style={{color:"rgba(255,255,255,0.35)",fontSize:12}}>R$ {form.price||"0"}/mês · {form.raffle_chances}× sorteio</div>
            </div>
          </div>
          <div><label style={lbl}>Nome</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={inp()} placeholder="Ex: Torcedor, Campeão..." onFocus={e=>e.target.style.borderColor=form.color} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/></div>
          <div><label style={lbl}>Descrição</label><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={2} style={{...inp(),resize:"none"}} placeholder="Descreva o plano..." onFocus={e=>e.target.style.borderColor=form.color} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/></div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
            <div><label style={lbl}>Mensalidade (R$)</label>
              <input value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} type="number" min="0" step="0.01" placeholder="0,00" style={inp()} onFocus={e=>e.target.style.borderColor=form.color} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
            </div>
            <div><label style={lbl}>Chances (1-5)</label>
              <div style={{display:"flex",gap:5}}>
                {[1,2,3,4,5].map(n=>(
                  <button key={n} onClick={()=>setForm(f=>({...f,raffle_chances:n}))} style={{flex:1,height:40,borderRadius:8,border:"1px solid",
                    borderColor:form.raffle_chances===n?form.color:"rgba(255,255,255,0.1)",
                    background:form.raffle_chances===n?`${form.color}1a`:"rgba(255,255,255,0.04)",
                    color:form.raffle_chances===n?form.color:"rgba(255,255,255,0.28)",fontWeight:700,fontSize:13,cursor:"pointer"}}>{n}</button>
                ))}
              </div>
            </div>
          </div>
          <div><label style={lbl}>Cor</label>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {PLAN_COLORS.map(c=>(
                <button key={c} onClick={()=>setForm(f=>({...f,color:c}))} style={{width:28,height:28,borderRadius:7,background:c,cursor:"pointer",
                  border:form.color===c?"2px solid #fff":"2px solid transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform 0.13s",
                  transform:form.color===c?"scale(1.12)":"scale(1)"}}>
                  {form.color===c && <Check size={12} color="#fff"/>}
                </button>
              ))}
            </div>
          </div>
          <div><label style={lbl}>Ícone</label>
            <div style={{display:"flex",gap:7}}>
              {PLAN_ICONS_CFG.map(p=>(
                <button key={p.key} onClick={()=>setForm(f=>({...f,icon:p.key}))} style={{flex:1,height:40,borderRadius:9,cursor:"pointer",
                  background:form.icon===p.key?`${form.color}1a`:"rgba(255,255,255,0.04)",
                  border:`1px solid ${form.icon===p.key?form.color:"rgba(255,255,255,0.1)"}`,
                  color:form.icon===p.key?form.color:"rgba(255,255,255,0.28)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,transition:"all 0.13s"}}>
                  <p.icon size={14}/><span style={{fontSize:9,fontFamily:"'DM Sans',sans-serif"}}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 13px",
            background:"rgba(255,255,255,0.03)",borderRadius:9,border:"1px solid rgba(255,255,255,0.06)"}}>
            <div>
              <div style={{color:"#fff",fontSize:13,fontWeight:500}}>Plano Ativo</div>
              <div style={{color:"rgba(255,255,255,0.28)",fontSize:11}}>{form.is_active?"Visível para novos sócios":"Oculto"}</div>
            </div>
            <button onClick={()=>setForm(f=>({...f,is_active:!f.is_active}))} style={{background:"none",border:"none",cursor:"pointer",padding:0,color:form.is_active?"#4ade80":"rgba(255,255,255,0.2)"}}>
              {form.is_active?<ToggleRight size={32}/>:<ToggleLeft size={32}/>}
            </button>
          </div>
        </div>
      </div>
      <div style={{borderTop:"1px solid rgba(255,255,255,0.07)",paddingTop:16,marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{color:"#fff",fontWeight:600,fontSize:14}}>Benefícios <span style={{color:"rgba(255,255,255,0.3)",fontSize:12,fontWeight:400}}>({form.benefits.length})</span></div>
          <button onClick={addB} style={{display:"flex",alignItems:"center",gap:5,background:`${form.color}14`,border:`1px solid ${form.color}28`,
            borderRadius:8,padding:"6px 12px",color:form.color,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            <Plus size={12}/> Adicionar
          </button>
        </div>
        {form.benefits.length===0 ? (
          <div style={{padding:"24px",textAlign:"center",border:"1px dashed rgba(255,255,255,0.08)",borderRadius:10,color:"rgba(255,255,255,0.2)",fontSize:12}}>
            Nenhum benefício. Clique em "Adicionar".
          </div>
        ) : form.benefits.map(b=>{
          const cfg=getBenefit(b.type);
          return (
            <div key={b.id} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 11px",
              background:"rgba(255,255,255,0.03)",borderRadius:9,border:"1px solid rgba(255,255,255,0.06)",marginBottom:7}}>
              <select value={b.type} onChange={e=>updB(b.id,{...b,type:e.target.value})} style={{background:`${cfg.color}14`,
                border:`1px solid ${cfg.color}28`,borderRadius:7,padding:"5px 9px",color:cfg.color,fontSize:11,
                fontWeight:600,cursor:"pointer",outline:"none",fontFamily:"'DM Sans',sans-serif"}}>
                {BENEFIT_TYPES.map(bt=><option key={bt.key} value={bt.key}>{bt.label}</option>)}
              </select>
              <input value={b.description} onChange={e=>updB(b.id,{...b,description:e.target.value})} placeholder="Descreva o benefício..."
                style={{...inp({fontSize:12,padding:"6px 10px"}),flex:1}}/>
              <input value={b.discount||""} onChange={e=>updB(b.id,{...b,discount:e.target.value?Number(e.target.value):null})}
                type="number" min="0" max="100" placeholder="%" style={{...inp({fontSize:12,padding:"6px 10px"}),width:60}}/>
              <button onClick={()=>remB(b.id)} style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.2)",
                borderRadius:6,color:"#f87171",cursor:"pointer",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <X size={11}/>
              </button>
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:9}}>
        <button onClick={onCancel} style={{padding:"10px 18px",background:"transparent",border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:9,color:"rgba(255,255,255,0.38)",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Cancelar</button>
        <button onClick={()=>onSave(form)} style={{padding:"10px 22px",background:form.color,border:"none",borderRadius:9,
          color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
          display:"flex",alignItems:"center",gap:7,boxShadow:`0 4px 14px ${form.color}35`}}>
          <Save size={13}/>{isNew?"Criar Plano":"Salvar"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE: RAFFLES
// ═══════════════════════════════════════════════════════════
function DrawMachine({members, onComplete}) {
  const [display,setDisplay]=useState(""); const [phase,setPhase]=useState("spinning"); const [winner,setWinner]=useState(null);
  useEffect(()=>{
    const pool=[]; members.forEach(m=>{for(let i=0;i<m.chances;i++)pool.push(m);});
    const picked=pool[Math.floor(Math.random()*pool.length)];
    let speed=60,count=0,max=38;
    const t=setInterval(()=>{
      setDisplay(pool[Math.floor(Math.random()*pool.length)].name);
      count++;
      if(count>max*0.65) speed=130; if(count>max*0.85) speed=240;
      if(count>=max){clearInterval(t);setDisplay(picked.name);setWinner(picked);setPhase("done");setTimeout(()=>onComplete(picked),900);}
    },speed);
    return ()=>clearInterval(t);
  },[]);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"36px 24px",gap:20}}>
      <div style={{width:180,height:180,borderRadius:"50%",position:"relative",
        background:"radial-gradient(circle,rgba(22,163,74,0.14) 0%,rgba(22,163,74,0.04) 70%,transparent 100%)",
        border:"2px solid rgba(22,163,74,0.28)",display:"flex",alignItems:"center",justifyContent:"center",
        boxShadow:phase==="done"?"0 0 60px rgba(22,163,74,0.45), 0 0 120px rgba(22,163,74,0.18)":"0 0 28px rgba(22,163,74,0.18)",
        transition:"box-shadow 0.8s ease"}}>
        {phase==="spinning" && [0,1,2,3,4,5].map(i=>(
          <div key={i} style={{position:"absolute",width:7,height:7,borderRadius:"50%",background:"#16a34a",opacity:0.55+i*0.07,
            transform:`rotate(${i*60}deg) translateY(-80px)`,animation:`orbit${i%2===0?"A":"B"} ${1.1+i*0.1}s linear infinite`}}/>
        ))}
        <div style={{textAlign:"center",padding:"0 18px"}}>
          {phase==="done"?<Trophy size={36} color="#fbbf24" style={{marginBottom:8}}/>:<Gift size={32} color="#16a34a" style={{marginBottom:8}}/>}
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:800,
            color:phase==="done"?"#fbbf24":"#4ade80",lineHeight:1.2,transition:"color 0.3s"}}>{display||"..."}</div>
        </div>
      </div>
      {phase==="done"&&winner&&<div style={{textAlign:"center"}}>
        <div style={{color:"#fbbf24",fontWeight:600,fontSize:14,marginBottom:3}}>🎉 Ganhador!</div>
        <div style={{color:"rgba(255,255,255,0.38)",fontSize:12}}>Sócio #{winner.num} · Plano {winner.plan}</div>
      </div>}
      <style>{`@keyframes orbitA{from{transform:rotate(0deg) translateY(-80px)}to{transform:rotate(360deg) translateY(-80px)}}@keyframes orbitB{from{transform:rotate(180deg) translateY(-80px)}to{transform:rotate(540deg) translateY(-80px)}}`}</style>
    </div>
  );
}

function RafflesPage() {
  const [raffles,setRaffles]=useState(RAFFLES_INIT);
  const [creating,setCreating]=useState(false);
  const [selected,setSelected]=useState(null);
  const [drawerTab,setDrawerTab]=useState("participants");
  const [drawing,setDrawing]=useState(false);
  const [drawn,setDrawn]=useState(false);
  const [drawerWinner,setDrawerWinner]=useState(null);
  const [newForm,setNewForm]=useState({name:"",prize_name:"",draw_date:"",draw_time:"20:00"});
  const rafMembers=MEMBERS.filter(m=>m.status==="active").map(m=>({...m,chances:PLAN_CFG[m.plan]?.chances||1}));
  const totalTickets=rafMembers.reduce((s,m)=>s+m.chances,0);

  const handleCreate=()=>{
    if(!newForm.name||!newForm.prize_name||!newForm.draw_date) return;
    setRaffles(rs=>[{id:Date.now(),name:newForm.name,prize_name:newForm.prize_name,
      draw_date:`${newForm.draw_date}T${newForm.draw_time}:00`,status:"open",
      total_entries:totalTickets,participants:rafMembers.length,winner:null},...rs]);
    setCreating(false); setNewForm({name:"",prize_name:"",draw_date:"",draw_time:"20:00"});
  };

  const openRaffle=(r)=>{setSelected(r);setDrawerTab("participants");setDrawing(false);setDrawn(false);setDrawerWinner(r.winner||null);};

  const handleDrawComplete=(w)=>{
    setDrawerWinner(w);
    setTimeout(()=>{setDrawn(true);setDrawing(false);setRaffles(rs=>rs.map(r=>r.id===selected.id?{...r,status:"drawn",winner:w}:r));},900);
  };

  const open=raffles.filter(r=>r.status==="open");
  const done=raffles.filter(r=>r.status==="drawn");

  return (
    <div style={{padding:"24px 28px",overflowY:"auto",flex:1}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22}}>
        <div>
          <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,fontWeight:800,margin:0,letterSpacing:0.5}}>SORTEIOS</h1>
          <p style={{color:"rgba(255,255,255,0.3)",fontSize:12,marginTop:4}}>{open.length} aberto(s) · {done.length} realizado(s)</p>
        </div>
        <button onClick={()=>setCreating(!creating)} style={{display:"flex",alignItems:"center",gap:7,
          background:"#16a34a",color:"#fff",border:"none",borderRadius:10,padding:"9px 16px",cursor:"pointer",
          fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,boxShadow:"0 4px 14px rgba(22,163,74,0.35)"}}>
          <Plus size={14}/> Novo Sorteio
        </button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:22}}>
        {[{icon:Gift,label:"Realizados",value:done.length,color:"#fbbf24"},
          {icon:Users,label:"Sócios Elegíveis",value:rafMembers.length,color:"#60a5fa"},
          {icon:Hash,label:"Bilhetes na Urna",value:totalTickets,color:"#4ade80"}
        ].map(c=>(
          <div key={c.label} style={{background:"#111a15",border:`1px solid ${c.color}18`,borderRadius:13,
            padding:"16px 18px",display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:40,height:40,borderRadius:10,background:`${c.color}12`,border:`1px solid ${c.color}22`,
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <c.icon size={18} color={c.color}/>
            </div>
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:800,color:c.color,lineHeight:1}}>{c.value}</div>
              <div style={{color:"rgba(255,255,255,0.28)",fontSize:11,marginTop:2}}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {creating && (
        <div style={{background:"#111a15",border:"1px solid rgba(22,163,74,0.22)",borderRadius:16,padding:22,marginBottom:20,animation:"fadeUp 0.3s ease both"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
            <h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:19,fontWeight:800,margin:0,color:"#fff"}}>Criar Novo Sorteio</h3>
            <button onClick={()=>setCreating(false)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:7,color:"rgba(255,255,255,0.38)",cursor:"pointer",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <X size={13}/>
            </button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {[{k:"name",label:"Nome do Sorteio",ph:"Ex: Sorteio de Maio"},
              {k:"prize_name",label:"Nome do Prêmio",ph:"Ex: Camisa Autografada"},
              {k:"draw_date",label:"Data",ph:"",type:"date"},
              {k:"draw_time",label:"Horário",ph:"",type:"time"}
            ].map(f=>(
              <div key={f.k}>
                <label style={lbl}>{f.label}</label>
                <input value={newForm[f.k]} onChange={e=>setNewForm(n=>({...n,[f.k]:e.target.value}))}
                  type={f.type||"text"} placeholder={f.ph}
                  style={{...inp(),colorScheme:"dark"}}
                  onFocus={e=>e.target.style.borderColor="#16a34a"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              </div>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:9,marginTop:18}}>
            <button onClick={()=>setCreating(false)} style={{padding:"9px 16px",background:"transparent",border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:9,color:"rgba(255,255,255,0.38)",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Cancelar</button>
            <button onClick={handleCreate} style={{padding:"9px 20px",background:"#16a34a",border:"none",borderRadius:9,
              color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
              display:"flex",alignItems:"center",gap:6,boxShadow:"0 4px 14px rgba(22,163,74,0.35)"}}>
              <Save size={13}/> Criar Sorteio
            </button>
          </div>
        </div>
      )}

      {/* Open */}
      {open.length>0 && (
        <div style={{marginBottom:28}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:"#4ade80",boxShadow:"0 0 7px #4ade80"}}/>
            <h2 style={{color:"#fff",fontWeight:600,fontSize:15,margin:0}}>Sorteios Abertos</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:14}}>
            {open.map((r,i)=>(
              <div key={r.id} onClick={()=>openRaffle(r)} style={{background:"#111a15",border:"1px solid rgba(22,163,74,0.15)",
                borderRadius:16,overflow:"hidden",cursor:"pointer",transition:"transform 0.2s,box-shadow 0.2s",
                animation:`fadeUp 0.4s ease ${i*60}ms both`}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 28px rgba(22,163,74,0.14)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
                <div style={{height:3,background:"linear-gradient(90deg,#16a34a,#16a34a66)"}}/>
                <div style={{padding:"18px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:14}}>
                    <div style={{width:44,height:44,borderRadius:11,background:"rgba(22,163,74,0.12)",border:"1px solid rgba(22,163,74,0.24)",
                      display:"flex",alignItems:"center",justifyContent:"center"}}><Gift size={20} color="#4ade80"/></div>
                    <div>
                      <div style={{color:"#fff",fontWeight:600,fontSize:15}}>{r.name}</div>
                      <div style={{color:"rgba(255,255,255,0.35)",fontSize:12,marginTop:1}}>{r.prize_name}</div>
                    </div>
                    <span style={{marginLeft:"auto",fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:99,
                      background:"rgba(74,222,128,0.12)",color:"#4ade80",textTransform:"uppercase",letterSpacing:0.6}}>Aberto</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:14}}>
                    {[{label:"Participantes",value:r.participants},{label:"Bilhetes",value:r.total_entries},
                      {label:"Data",value:fmtDate(r.draw_date)}].map(s=>(
                      <div key={s.label} style={{padding:"9px 11px",background:"rgba(255,255,255,0.03)",borderRadius:8,border:"1px solid rgba(255,255,255,0.04)"}}>
                        <div style={{color:"#fff",fontWeight:700,fontSize:13}}>{s.value}</div>
                        <div style={{color:"rgba(255,255,255,0.28)",fontSize:10,marginTop:1}}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <button style={{flex:1,background:"rgba(22,163,74,0.12)",border:"1px solid rgba(22,163,74,0.24)",
                      borderRadius:9,color:"#4ade80",padding:"9px",fontSize:12,fontWeight:600,cursor:"pointer",
                      fontFamily:"'DM Sans',sans-serif"}}>Ver detalhes / Realizar Sorteio</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Done */}
      {done.length>0 && (
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <Trophy size={15} color="#fbbf24"/>
            <h2 style={{color:"#fff",fontWeight:600,fontSize:15,margin:0}}>Sorteios Realizados</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:14}}>
            {done.map((r,i)=>(
              <div key={r.id} onClick={()=>openRaffle(r)} style={{background:"#111a15",border:"1px solid rgba(251,191,36,0.18)",
                borderRadius:16,overflow:"hidden",cursor:"pointer",animation:`fadeUp 0.4s ease ${i*60}ms both`,
                transition:"transform 0.2s,box-shadow 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 28px rgba(251,191,36,0.12)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
                <div style={{height:3,background:"linear-gradient(90deg,#fbbf24,#fbbf2466)"}}/>
                <div style={{padding:"18px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:12}}>
                    <div style={{width:44,height:44,borderRadius:11,background:"rgba(251,191,36,0.12)",border:"1px solid rgba(251,191,36,0.24)",
                      display:"flex",alignItems:"center",justifyContent:"center"}}><Trophy size={20} color="#fbbf24"/></div>
                    <div style={{flex:1}}>
                      <div style={{color:"#fff",fontWeight:600,fontSize:15}}>{r.name}</div>
                      <div style={{color:"rgba(255,255,255,0.35)",fontSize:12,marginTop:1}}>{r.prize_name}</div>
                    </div>
                    <span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:99,
                      background:"rgba(251,191,36,0.12)",color:"#fbbf24",textTransform:"uppercase",letterSpacing:0.6}}>Encerrado</span>
                  </div>
                  {r.winner && (
                    <div style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",
                      background:"rgba(251,191,36,0.07)",borderRadius:9,border:"1px solid rgba(251,191,36,0.18)"}}>
                      <Trophy size={14} color="#fbbf24"/>
                      <div>
                        <div style={{color:"#fbbf24",fontWeight:600,fontSize:13}}>{r.winner.name}</div>
                        <div style={{color:"rgba(255,255,255,0.28)",fontSize:11}}>Sócio #{r.winner.num} · {r.winner.plan}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drawer */}
      {selected && (
        <>
          <div onClick={()=>setSelected(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:40,backdropFilter:"blur(2px)",animation:"fadeIn 0.2s ease both"}}/>
          <div style={{position:"fixed",right:0,top:0,bottom:0,width:500,background:"#0f1811",
            borderLeft:"1px solid rgba(255,255,255,0.07)",zIndex:50,display:"flex",flexDirection:"column",
            animation:"slideIn 0.28s cubic-bezier(0.32,0.72,0,1) both",overflowY:"auto"}}>
            <div style={{padding:"18px 22px",borderBottom:"1px solid rgba(255,255,255,0.07)",background:"#0d1410",
              position:"sticky",top:0,zIndex:1,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:11}}>
                <div style={{width:40,height:40,borderRadius:10,background:selected.status==="drawn"?"rgba(251,191,36,0.14)":"rgba(22,163,74,0.14)",
                  border:`1px solid ${selected.status==="drawn"?"rgba(251,191,36,0.28)":"rgba(22,163,74,0.28)"}`,
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {selected.status==="drawn"?<Trophy size={18} color="#fbbf24"/>:<Gift size={18} color="#4ade80"/>}
                </div>
                <div>
                  <div style={{color:"#fff",fontWeight:600,fontSize:14}}>{selected.name}</div>
                  <div style={{color:"rgba(255,255,255,0.3)",fontSize:11}}>{selected.prize_name}</div>
                </div>
              </div>
              <button onClick={()=>setSelected(null)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:7,color:"rgba(255,255,255,0.38)",cursor:"pointer",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <X size={13}/>
              </button>
            </div>

            {(drawerWinner) && (
              <div style={{margin:"14px 18px 0",padding:"14px 16px",borderRadius:13,
                background:"linear-gradient(135deg,rgba(251,191,36,0.1),rgba(251,191,36,0.04))",
                border:"1px solid rgba(251,191,36,0.28)",animation:"fadeUp 0.4s ease both"}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
                  <PartyPopper size={14} color="#fbbf24"/>
                  <span style={{color:"#fbbf24",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.7}}>Ganhador</span>
                </div>
                <div style={{color:"#fff",fontWeight:700,fontSize:16}}>{drawerWinner.name}</div>
                <div style={{color:"rgba(255,255,255,0.32)",fontSize:12,marginTop:2}}>Sócio #{drawerWinner.num} · {drawerWinner.plan}</div>
                <button style={{display:"flex",alignItems:"center",gap:6,marginTop:12,width:"100%",padding:"9px",
                  background:"rgba(74,222,128,0.1)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:9,
                  color:"#4ade80",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",justifyContent:"center"}}>
                  <Phone size={12}/> Notificar via WhatsApp
                </button>
              </div>
            )}

            <div style={{display:"flex",padding:"0 18px",borderBottom:"1px solid rgba(255,255,255,0.07)",marginTop:14}}>
              {["participants","distribution",...(selected.status==="open"&&!drawerWinner?["draw"]:[])].map(t=>(
                <button key={t} onClick={()=>setDrawerTab(t)} style={{padding:"11px 0",marginRight:16,border:"none",background:"none",
                  color:drawerTab===t?"#16a34a":"rgba(255,255,255,0.3)",
                  borderBottom:drawerTab===t?"2px solid #16a34a":"2px solid transparent",
                  fontSize:12,fontWeight:drawerTab===t?600:400,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
                  textTransform:"capitalize"}}>
                  {t==="participants"?"Participantes":t==="distribution"?"Distribuição":"Realizar Sorteio"}
                </button>
              ))}
            </div>

            <div style={{padding:"18px",flex:1}}>
              {drawerTab==="participants" && (
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {rafMembers.map((m,i)=>{
                    const plan=PLAN_CFG[m.plan]; const pct=Math.round((m.chances/totalTickets)*100);
                    return (
                      <div key={m.id} style={{display:"flex",alignItems:"center",gap:11,padding:"10px 12px",
                        background:"rgba(255,255,255,0.03)",borderRadius:9,border:"1px solid rgba(255,255,255,0.04)",
                        animation:`fadeUp 0.3s ease ${i*25}ms both`}}>
                        <div style={{width:33,height:33,borderRadius:8,background:plan.bg,border:`1px solid ${plan.color}28`,
                          display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                          fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:11,color:plan.color}}>
                          {initials(m.name)}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{color:"#fff",fontSize:12,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.name}</div>
                          <div style={{color:plan.color,fontSize:10,fontWeight:600,marginTop:1}}>{m.plan}</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{color:"#fff",fontSize:12,fontWeight:700}}>{m.chances} bilhete{m.chances!==1?"s":""}</div>
                          <div style={{color:"rgba(255,255,255,0.25)",fontSize:10}}>{pct}% chance</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {drawerTab==="distribution" && (
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {Object.entries(PLAN_CFG).map(([planName,cfg])=>{
                    const ms=rafMembers.filter(m=>m.plan===planName);
                    const tickets=ms.reduce((s,m)=>s+m.chances,0);
                    const pct=Math.round((tickets/totalTickets)*100);
                    return (
                      <div key={planName} style={{background:cfg.bg,border:`1px solid ${cfg.color}22`,borderRadius:13,padding:"14px 16px"}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                          <div style={{color:cfg.color,fontWeight:700,fontSize:14}}>{planName}</div>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:800,color:cfg.color}}>{pct}%</div>
                        </div>
                        <div style={{height:6,background:"rgba(255,255,255,0.07)",borderRadius:99}}>
                          <div style={{height:"100%",borderRadius:99,width:`${pct}%`,background:cfg.color,transition:"width 1s ease"}}/>
                        </div>
                        <div style={{color:"rgba(255,255,255,0.3)",fontSize:11,marginTop:6}}>{ms.length} sócios · {tickets} bilhetes · {cfg.chances} por sócio</div>
                      </div>
                    );
                  })}
                  <div style={{padding:"12px 14px",background:"rgba(255,255,255,0.03)",borderRadius:11,
                    border:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{color:"rgba(255,255,255,0.4)",fontSize:13}}>Total de bilhetes</span>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:800,color:"#fff"}}>{totalTickets}</span>
                  </div>
                </div>
              )}
              {drawerTab==="draw" && !drawing && !drawn && (
                <div style={{textAlign:"center",animation:"fadeUp 0.3s ease both"}}>
                  <div style={{width:72,height:72,borderRadius:18,background:"rgba(22,163,74,0.1)",border:"1px solid rgba(22,163,74,0.2)",
                    display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
                    <Sparkles size={32} color="#16a34a"/>
                  </div>
                  <h3 style={{color:"#fff",fontWeight:700,fontSize:18,marginBottom:8}}>Pronto para sortear?</h3>
                  <p style={{color:"rgba(255,255,255,0.32)",fontSize:13,marginBottom:22,lineHeight:1.7}}>
                    {totalTickets} bilhetes de {rafMembers.length} sócios. O resultado será enviado automaticamente por WhatsApp.
                  </p>
                  <button onClick={()=>setDrawing(true)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:9,
                    width:"100%",padding:"14px",background:"#16a34a",border:"none",borderRadius:13,color:"#fff",
                    fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 6px 22px rgba(22,163,74,0.4)"}}>
                    <Zap size={16}/> Realizar Sorteio Agora
                  </button>
                  <p style={{color:"rgba(255,255,255,0.18)",fontSize:11,marginTop:10}}>Esta ação não pode ser desfeita</p>
                </div>
              )}
              {drawerTab==="draw" && drawing && (
                <DrawMachine members={rafMembers} onComplete={handleDrawComplete}/>
              )}
              {drawerTab==="draw" && drawn && drawerWinner && (
                <div style={{textAlign:"center",animation:"fadeUp 0.4s ease both"}}>
                  <div style={{fontSize:48,marginBottom:14}}>🎉</div>
                  <h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:800,color:"#fbbf24",marginBottom:6}}>{drawerWinner.name}</h3>
                  <p style={{color:"rgba(255,255,255,0.35)",fontSize:13,marginBottom:22}}>Sócio #{drawerWinner.num} · Plano {drawerWinner.plan}</p>
                  <button style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,width:"100%",padding:"13px",
                    background:"rgba(74,222,128,0.14)",border:"1px solid rgba(74,222,128,0.28)",borderRadius:12,
                    color:"#4ade80",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                    <Phone size={15}/> Notificar todos via WhatsApp
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE: PREVIEW (Public Page Teaser)
// ═══════════════════════════════════════════════════════════
function PreviewPage() {
  return (
    <div style={{padding:"24px 28px",overflowY:"auto",flex:1}}>
      <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,fontWeight:800,margin:"0 0 6px",letterSpacing:0.5}}>
        PÁGINA PÚBLICA
      </h1>
      <p style={{color:"rgba(255,255,255,0.3)",fontSize:12,marginBottom:24}}>
        Essa é a página que o torcedor acessa para se cadastrar como sócio
      </p>
      <div style={{background:"#111a15",border:"1px solid rgba(22,163,74,0.2)",borderRadius:16,padding:"24px",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
          <div style={{width:42,height:42,borderRadius:11,background:"rgba(22,163,74,0.14)",border:"1px solid rgba(22,163,74,0.28)",
            display:"flex",alignItems:"center",justifyContent:"center"}}><ExternalLink size={20} color="#16a34a"/></div>
          <div>
            <div style={{color:"#fff",fontWeight:600,fontSize:15}}>Link da sua página</div>
            <div style={{color:"rgba(255,255,255,0.35)",fontSize:12,marginTop:2}}>Compartilhe com os torcedores</div>
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <div style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:9,padding:"11px 14px",color:"#4ade80",fontSize:13,fontFamily:"monospace"}}>
            ecsertaozinho.torcedorplus.com.br
          </div>
          <button style={{background:"#16a34a",border:"none",borderRadius:9,color:"#fff",padding:"11px 18px",
            cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Copiar</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        {[{label:"Conversão média",value:"18%",sub:"visitantes → sócios",color:"#4ade80"},
          {label:"Visitas no mês",value:"1.240",sub:"acessos únicos",color:"#60a5fa"},
          {label:"Sócios via página",value:"87",sub:"de 243 totais",color:"#fbbf24"}
        ].map(c=>(
          <div key={c.label} style={{background:"#111a15",border:`1px solid ${c.color}18`,borderRadius:13,padding:"18px 20px"}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:30,fontWeight:800,color:c.color,marginBottom:4}}>{c.value}</div>
            <div style={{color:"#fff",fontSize:13,fontWeight:600,marginBottom:2}}>{c.label}</div>
            <div style={{color:"rgba(255,255,255,0.3)",fontSize:11}}>{c.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE: SETTINGS / PAYMENTS (placeholder)
// ═══════════════════════════════════════════════════════════
function PlaceholderPage({label, icon:Icon}) {
  return (
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{width:56,height:56,borderRadius:14,background:"rgba(22,163,74,0.1)",border:"1px solid rgba(22,163,74,0.2)",
        display:"flex",alignItems:"center",justifyContent:"center"}}>
        <Icon size={26} color="#16a34a"/>
      </div>
      <span style={{color:"rgba(255,255,255,0.2)",fontSize:14,fontFamily:"'DM Sans',sans-serif"}}>{label} — em breve</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [loggedIn,setLoggedIn]=useState(false);
  const [page,setPage]=useState("dashboard");
  const [collapsed,setCollapsed]=useState(false);

  if(!loggedIn) return (
    <>
      <style>{GLOBAL_CSS}</style>
      <LoginPage onLogin={()=>setLoggedIn(true)}/>
    </>
  );

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{display:"flex",minHeight:"100vh",background:"#0a0f0d"}}>
        <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} onLogout={()=>setLoggedIn(false)}/>
        <main style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
          <TopBar page={page}/>
          <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
            {page==="dashboard" && <DashboardPage setPage={setPage}/>}
            {page==="members"   && <MembersPage/>}
            {page==="plans"     && <PlansPage/>}
            {page==="raffles"   && <RafflesPage/>}
            {page==="preview"   && <PreviewPage/>}
            {page==="payments"  && <PlaceholderPage label="Pagamentos" icon={CreditCard}/>}
            {page==="settings"  && <PlaceholderPage label="Configurações" icon={Settings}/>}
          </div>
        </main>
      </div>
    </>
  );
}

// ─── AUTH WRAPPER (substitui App Root padrão) ─────────────────
// O export default acima usa estado local (mock).
// Para produção com Supabase, use AuthApp abaixo:
//
// Em src/main.jsx, troque:
//   import App from "./App.jsx"
// por:
//   import { AuthApp as App } from "./App.jsx"

export function AuthApp() {
  const { user, loading: authLoading, logout } = useAuth();
  const { club } = useClub(user?.id);
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  if (authLoading) return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{minHeight:"100vh",background:"#0a0f0d",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{textAlign:"center"}}>
          <div style={{width:44,height:44,border:"3px solid rgba(22,163,74,0.25)",borderTopColor:"#16a34a",
            borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 14px"}}/>
          <div style={{color:"rgba(255,255,255,0.28)",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>Carregando...</div>
        </div>
      </div>
    </>
  );

  if (!user) {
    const handleLogin = () => {}; // useAuth cuida do estado via onAuthStateChange
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <AuthLoginPage/>
      </>
    );
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{display:"flex",minHeight:"100vh",background:"#0a0f0d"}}>
        <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} onLogout={logout}/>
        <main style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
          <TopBar page={page}/>
          <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
            {page==="dashboard" && <DashboardPage setPage={setPage}/>}
            {page==="members"   && <MembersPage/>}
            {page==="plans"     && <PlansPage/>}
            {page==="raffles"   && <RafflesPage/>}
            {page==="preview"   && <PreviewPage/>}
            {page==="payments"  && <PlaceholderPage label="Pagamentos" icon={CreditCard}/>}
            {page==="settings"  && <PlaceholderPage label="Configurações" icon={Settings}/>}
          </div>
        </main>
      </div>
    </>
  );
}

// Login com Supabase Auth real
function AuthLoginPage() {
  const { login } = useAuth();
  const [email,setEmail]=useState(""); const [pwd,setPwd]=useState("");
  const [show,setShow]=useState(false); const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");

  const go = async () => {
    if(!email||!pwd){setErr("Preencha todos os campos.");return;}
    setLoading(true); setErr("");
    const { error } = await login(email, pwd);
    if (error) { setErr("E-mail ou senha incorretos."); setLoading(false); }
    // Se login OK, useAuth atualiza user automaticamente via onAuthStateChange
  };

  return (
    <div style={{minHeight:"100vh",background:"#0a0f0d",display:"flex",alignItems:"center",
      justifyContent:"center",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(22,163,74,0.12) 0%,transparent 70%)",
        top:-100,left:-100,pointerEvents:"none"}}/>
      <div style={{position:"absolute",inset:0,opacity:0.03,pointerEvents:"none",
        backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 60px,#16a34a 60px,#16a34a 61px),repeating-linear-gradient(90deg,transparent,transparent 60px,#16a34a 60px,#16a34a 61px)"}}/>
      <div style={{width:"100%",maxWidth:400,padding:"0 24px",animation:"fadeUp 0.5s ease both"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:60,height:60,borderRadius:14,background:"linear-gradient(135deg,#16a34a,#15803d)",
            display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",
            boxShadow:"0 8px 28px rgba(22,163,74,0.4)"}}>
            <Shield size={28} color="#fff"/>
          </div>
          <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:800,color:"#fff",margin:0,letterSpacing:1}}>
            TORCEDOR<span style={{color:"#16a34a"}}>PLUS</span>
          </h1>
          <p style={{color:"rgba(255,255,255,0.35)",fontSize:12,marginTop:5}}>Plataforma de Sócio-Torcedor</p>
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",
          borderRadius:18,padding:28,backdropFilter:"blur(12px)"}}>
          <h2 style={{color:"#fff",fontWeight:600,fontSize:17,margin:"0 0 4px"}}>Acesso do Gestor</h2>
          <p style={{color:"rgba(255,255,255,0.3)",fontSize:12,margin:"0 0 24px"}}>Entre com suas credenciais</p>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <input style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"11px 14px",color:"#fff",fontSize:14,outline:"none",width:"100%",fontFamily:"'DM Sans',sans-serif",transition:"border-color 0.2s",boxSizing:"border-box"}}
              type="email" placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)}
              onFocus={e=>e.target.style.borderColor="#16a34a"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
            <div style={{position:"relative"}}>
              <input style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"11px 44px 11px 14px",color:"#fff",fontSize:14,outline:"none",width:"100%",fontFamily:"'DM Sans',sans-serif",transition:"border-color 0.2s",boxSizing:"border-box"}}
                type={show?"text":"password"} placeholder="Senha" value={pwd}
                onChange={e=>setPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}
                onFocus={e=>e.target.style.borderColor="#16a34a"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
              <button onClick={()=>setShow(!show)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.3)",display:"flex"}}>
                {show?<EyeOff size={16}/>:<Eye size={16}/>}
              </button>
            </div>
            {err && <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,padding:"9px 12px",color:"#f87171",fontSize:12,display:"flex",alignItems:"center",gap:7}}>
              <AlertCircle size={13}/>{err}</div>}
            <button onClick={go} disabled={loading} style={{background:loading?"rgba(22,163,74,0.5)":"#16a34a",color:"#fff",border:"none",borderRadius:10,padding:"13px",width:"100%",fontSize:14,fontWeight:600,cursor:loading?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s"}}>
              {loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <span style={{width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>Entrando...</span>
              :"Entrar na Plataforma"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
