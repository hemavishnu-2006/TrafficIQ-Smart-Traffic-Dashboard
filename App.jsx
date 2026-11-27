import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Bell, Camera,
  CarFront, CheckCircle2, ChevronDown, CircleHelp, Clock3, Download,
  Eye, Gauge, MapPin, Menu, MoreHorizontal, Radio, Search, Settings,
  ShieldAlert, ShieldCheck, Siren, TrendingUp, Video, X, Zap
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

const initialViolations = [
  { id:"TV-24081", plate:"AP 16 DK 4821", type:"No Helmet", location:"Benz Circle", time:"10:42:18", status:"Pending", severity:"High", camera:"CAM-04" },
  { id:"TV-24080", plate:"AP 07 CX 9032", type:"Signal Jump", location:"MG Road Junction", time:"10:40:52", status:"Verified", severity:"Critical", camera:"CAM-02" },
  { id:"TV-24079", plate:"TS 09 EF 1188", type:"Wrong Parking", location:"Governor Peta", time:"10:37:09", status:"Pending", severity:"Medium", camera:"CAM-11" },
  { id:"TV-24078", plate:"AP 16 BN 7710", type:"Triple Riding", location:"Ramavarappadu", time:"10:33:41", status:"Challan Issued", severity:"High", camera:"CAM-07" },
  { id:"TV-24077", plate:"AP 39 GH 5504", type:"No Seatbelt", location:"Eluru Road", time:"10:29:06", status:"Verified", severity:"Medium", camera:"CAM-09" },
  { id:"TV-24076", plate:"AP 16 QZ 2401", type:"Overspeeding", location:"Kanuru Main Road", time:"10:24:33", status:"Pending", severity:"Critical", camera:"CAM-15" },
  { id:"TV-24075", plate:"AP 16 AB 6219", type:"No Helmet", location:"Benz Circle", time:"10:19:20", status:"Challan Issued", severity:"High", camera:"CAM-04" }
];

const chartData = [
  { time:"06 AM", violations:18, resolved:12 }, { time:"08 AM", violations:34, resolved:24 },
  { time:"10 AM", violations:57, resolved:39 }, { time:"12 PM", violations:43, resolved:35 },
  { time:"02 PM", violations:69, resolved:48 }, { time:"04 PM", violations:52, resolved:42 },
  { time:"06 PM", violations:81, resolved:59 }, { time:"08 PM", violations:61, resolved:50 }
];
const violationTypes = [
  { name:"No Helmet", value:38, color:"#36c8ad" },
  { name:"Signal Jump", value:24, color:"#6c8cff" },
  { name:"Overspeeding", value:18, color:"#ffb454" },
  { name:"No Seatbelt", value:12, color:"#b28aff" },
  { name:"Other", value:8, color:"#718096" }
];

const locations = [
  { name:"Benz Circle", count:42, level:"High", x:56, y:34 },
  { name:"MG Road Junction", count:31, level:"High", x:42, y:52 },
  { name:"Ramavarappadu", count:24, level:"Medium", x:76, y:62 },
  { name:"Governor Peta", count:18, level:"Medium", x:28, y:27 },
  { name:"Kanuru Main Road", count:13, level:"Low", x:66, y:79 }
];

function timeNow() {
  return new Date().toLocaleTimeString("en-IN", { hour12:false });
}
function StatCard({ icon:Icon, label, value, change, tone="teal", sub }) {
  return <div className="stat-card">
    <div className="stat-top"><span className={`stat-icon ${tone}`}><Icon size={19}/></span><span className="stat-change"><ArrowUpRight size={13}/>{change}</span></div>
    <div className="stat-value">{value}</div><div className="stat-label">{label}</div><div className="stat-sub">{sub}</div>
  </div>;
}
function Status({ value }) {
  const cls = value === "Verified" ? "verified" : value === "Challan Issued" ? "issued" : "pending";
  return <span className={`status ${cls}`}><i />{value}</span>;
}

export default function App() {
  const [active, setActive] = useState("Overview");
  const [rows, setRows] = useState(initialViolations);
  const [apiReady, setApiReady] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [live, setLive] = useState(true);
  const [now, setNow] = useState(timeNow());
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("");
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/violations")
      .then(response => {
        if (!response.ok) throw new Error("Backend request failed");
        return response.json();
      })
      .then(data => {
        if (!mounted) return;
        setRows(data);
        setApiReady(true);
      })
      .catch(() => {
        if (mounted) setNotice("Backend not connected. Showing demo records; start the backend server to save changes.");
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const clock = setInterval(() => setNow(timeNow()), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    if (!live) return;
    const ticker = setInterval(() => {
      const types = ["No Helmet","Signal Jump","Wrong Parking","Triple Riding","No Seatbelt","Overspeeding"];
      const places = ["Benz Circle","MG Road Junction","Governor Peta","Ramavarappadu","Eluru Road","Kanuru Main Road"];
      const plates = ["AP 16","AP 07","TS 09","AP 39"];
      const n = Math.floor(Math.random()*9000+1000);
      const item = {
        id:`TV-${Math.floor(Math.random()*90000+10000)}`,
        plate:`${plates[Math.floor(Math.random()*plates.length)]} ${String.fromCharCode(65+Math.floor(Math.random()*26))}${String.fromCharCode(65+Math.floor(Math.random()*26))} ${n}`,
        type:types[Math.floor(Math.random()*types.length)],
        location:places[Math.floor(Math.random()*places.length)],
        time:timeNow(), status:"Pending",
        severity:Math.random()>.72?"Critical":Math.random()>.4?"High":"Medium",
        camera:`CAM-${String(Math.floor(Math.random()*18+1)).padStart(2,"0")}`
      };
      fetch("/api/violations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      })
        .then(response => { if (!response.ok) throw new Error("Could not save violation"); return response.json(); })
        .then(saved => setRows(old => [saved, ...old].slice(0, 100)))
        .catch(() => setNotice("New demo event could not be saved. Check the backend server."));
      setNotice(`New ${item.type.toLowerCase()} detected at ${item.location}`);
      setTimeout(() => setNotice(""), 3500);
    }, 11000);
    return () => clearInterval(ticker);
  }, [live]);

  const filteredRows = useMemo(() => rows.filter(r =>
    (filter === "All" || r.status === filter) &&
    `${r.id} ${r.plate} ${r.type} ${r.location}`.toLowerCase().includes(search.toLowerCase())
  ), [rows, filter, search]);

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`/api/violations/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error("Update failed");
      const updated = await response.json();
      setRows(old => old.map(r => r.id === id ? updated : r));
      setSelected(null);
      setNotice(`Incident ${id} updated to ${status}`);
    } catch {
      setNotice("Could not update incident. Make sure the backend is running.");
    }
  };
  const exportCsv = () => {
    const header = ["ID","Vehicle Number","Violation","Location","Time","Status","Severity","Camera"];
    const csv = [header, ...filteredRows.map(r=>[r.id,r.plate,r.type,r.location,r.time,r.status,r.severity,r.camera])]
      .map(line=>line.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    const a = document.createElement("a"); a.href=url; a.download="traffic-violations.csv"; a.click(); URL.revokeObjectURL(url);
  };

  const nav = [
    { label:"Overview", icon:Gauge }, { label:"Violations", icon:ShieldAlert },
    { label:"Live Cameras", icon:Video }, { label:"Analytics", icon:TrendingUp }
  ];

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?"show":""}`}>
      <div className="brand"><div className="brand-mark"><Siren size={21}/></div><div><b>Traffic<span>IQ</span></b><small>SMART CITY COMMAND</small></div><button className="close-nav" onClick={()=>setMobileNav(false)}><X size={18}/></button></div>
      <div className="side-label">WORKSPACE</div>
      <nav>{nav.map(n=><button key={n.label} className={`nav-item ${active===n.label?"active":""}`} onClick={()=>{setActive(n.label);setMobileNav(false)}}><n.icon size={18}/>{n.label}{n.label==="Violations"&&<span className="nav-count">{rows.length}</span>}</button>)}</nav>
      <div className="side-label second">SYSTEM</div>
      <button className="nav-item" onClick={()=>setNotice("Settings panel is a demo placeholder.")}><Settings size={18}/>Settings</button>
      <button className="nav-item" onClick={()=>setNotice("Help center is a demo placeholder.")}><CircleHelp size={18}/>Help & Support</button>
      <div className="sidebar-bottom"><div className="system-status"><span className="pulse-dot"/><div><b>All systems operational</b><small>{apiReady ? "Backend connected · Persistent storage" : "Connecting to backend…"}</small></div></div><div className="profile"><div className="avatar">AD</div><div><b>Admin User</b><small>Traffic Administrator</small></div><MoreHorizontal size={18}/></div></div>
    </aside>

    <main className="main">
      <header className="topbar">
        <button className="menu-btn" onClick={()=>setMobileNav(true)}><Menu size={20}/></button>
        <div className="breadcrumb">Command Center <span>/</span> <b>{active}</b></div>
        <div className="top-actions"><div className="clock"><Clock3 size={15}/>{now}</div><span className="live-pill"><i/> SYSTEM LIVE</span><button className="icon-btn" onClick={()=>setNotice("You are all caught up.")}><Bell size={18}/><em/></button><div className="top-avatar">AD</div></div>
      </header>

      <div className="content">
        <div className="page-heading"><div><div className="eyebrow">CITY TRAFFIC INTELLIGENCE PLATFORM</div><h1>{active === "Overview" ? "Traffic Command Center" : active}</h1><p>Monitor, analyze and manage traffic violations across the city.</p></div><div className="heading-actions"><button className="outline-btn" onClick={exportCsv}><Download size={16}/> Export report</button><button className={`live-toggle ${live?"on":""}`} onClick={()=>setLive(v=>!v)}><span className="toggle-dot"/>{live?"Live feed on":"Live feed paused"}</button></div></div>

        {notice && <div className="toast"><Zap size={16}/>{notice}<button onClick={()=>setNotice("")}><X size={15}/></button></div>}

        <div className="stats-grid">
          <StatCard icon={ShieldAlert} label="Total violations today" value="1,284" change="+12.8%" sub="Compared to yesterday" tone="teal"/>
          <StatCard icon={Eye} label="Detected by AI cameras" value="1,096" change="+8.4%" sub="85.4% of total detections" tone="blue"/>
          <StatCard icon={CheckCircle2} label="Verified violations" value="876" change="+6.2%" sub="68.2% verification rate" tone="purple"/>
          <StatCard icon={IndianRupeeIcon} label="Challan amount generated" value="₹8.42L" change="+14.6%" sub="Across all active zones" tone="orange"/>
        </div>

        <div className="main-grid">
          <section className="panel trend-panel">
            <div className="panel-head"><div><h2>Violation activity</h2><p>Detection trends throughout the day</p></div><div className="period-select">Today <ChevronDown size={14}/></div></div>
            <div className="chart-legend"><span><i className="legend-a"/>Detected</span><span><i className="legend-b"/>Resolved</span></div>
            <div className="trend-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{top:8,right:8,left:-18,bottom:0}}><defs><linearGradient id="detected" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#35c9ad" stopOpacity={.25}/><stop offset="100%" stopColor="#35c9ad" stopOpacity={0}/></linearGradient><linearGradient id="resolved" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7894ff" stopOpacity={.18}/><stop offset="100%" stopColor="#7894ff" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 5" stroke="#253449" vertical={false}/><XAxis dataKey="time" tick={{fill:"#8291a5",fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:"#8291a5",fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:"#111e2e",border:"1px solid #2b3c50",borderRadius:10,color:"#fff"}}/><Area type="monotone" dataKey="violations" name="Detected" stroke="#35c9ad" strokeWidth={2.5} fill="url(#detected)"/><Area type="monotone" dataKey="resolved" name="Resolved" stroke="#7894ff" strokeWidth={2.5} fill="url(#resolved)"/></AreaChart></ResponsiveContainer></div>
          </section>

          <section className="panel distribution-panel">
            <div className="panel-head"><div><h2>Violation breakdown</h2><p>Share by violation category</p></div><MoreHorizontal size={19} className="muted-icon"/></div>
            <div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={violationTypes} dataKey="value" nameKey="name" innerRadius={62} outerRadius={86} paddingAngle={4} stroke="none">{violationTypes.map((v,i)=><Cell key={i} fill={v.color}/>)}</Pie><Tooltip contentStyle={{background:"#111e2e",border:"1px solid #2b3c50",borderRadius:10,color:"#fff"}}/></PieChart></ResponsiveContainer><div className="donut-center"><b>1,284</b><span>Total today</span></div></div>
            <div className="type-legend">{violationTypes.map(v=><div key={v.name}><span><i style={{background:v.color}}/>{v.name}</span><b>{v.value}%</b></div>)}</div>
          </section>
        </div>

        <div className="lower-grid">
          <section className="panel map-panel">
            <div className="panel-head"><div><h2>Violation hotspots</h2><p>High-activity locations · Vijayawada demo zones</p></div><span className="map-tag"><MapPin size={13}/> Zone view</span></div>
            <div className="map-visual">
              <div className="map-grid-lines"/>
              <svg className="roads" viewBox="0 0 600 280" preserveAspectRatio="none"><path d="M-20 210 L180 125 L330 150 L620 35 M60 -10 L210 290 M380 -10 L310 290 M-10 65 L610 235 M500 -10 L440 290" fill="none" stroke="#29445a" strokeWidth="13"/><path d="M-20 210 L180 125 L330 150 L620 35 M60 -10 L210 290 M380 -10 L310 290 M-10 65 L610 235 M500 -10 L440 290" fill="none" stroke="#526a7b" strokeWidth="1.5" strokeDasharray="8 8"/></svg>
              {locations.map((l,i)=><div key={l.name} className={`map-pin pin-${i}`} style={{left:`${l.x}%`,top:`${l.y}%`}} title={`${l.name}: ${l.count} violations`}><span>{l.count}</span><i/></div>)}
              <div className="map-caption"><span className="pulse-dot"/> Live hotspot simulation</div>
            </div>
            <div className="hotspot-list">{locations.slice(0,3).map(l=><div key={l.name}><span className="hotspot-name"><MapPin size={13}/>{l.name}</span><b>{l.count} <small>events</small></b><span className={`risk ${l.level.toLowerCase()}`}>{l.level}</span></div>)}</div>
          </section>

          <section className="panel camera-panel">
            <div className="panel-head"><div><h2>Camera network</h2><p>Connected surveillance devices</p></div><span className="connected-label"><i/> 18 Online</span></div>
            <div className="camera-preview"><div className="camera-overlay"><span><Radio size={13}/> CAM-04 · BENZ CIRCLE</span><span className="rec"><i/> REC</span></div><div className="street-scene"><div className="skyline"/><div className="road-center"/><div className="car car-one"/><div className="car car-two"/><div className="scan-line"/></div><div className="camera-ai"><Activity size={13}/> AI ANALYSIS ACTIVE</div></div>
            <div className="camera-stats"><div><b>18/20</b><span>Active cameras</span></div><div><b>98.6%</b><span>Network uptime</span></div><div><b>24 FPS</b><span>Avg. frame rate</span></div></div>
          </section>
        </div>

        <section className="panel violations-panel">
          <div className="panel-head table-head"><div><h2>Recent violations</h2><p>Latest AI-detected traffic incidents</p></div><button className="text-btn" onClick={()=>setActive("Violations")}>View all <ArrowUpRight size={14}/></button></div>
          <div className="table-tools"><div className="search-box"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search vehicle, ID or location..."/></div><div className="filters">{["All","Pending","Verified","Challan Issued"].map(f=><button key={f} className={filter===f?"selected":""} onClick={()=>setFilter(f)}>{f}</button>)}</div></div>
          <div className="table-scroll"><table><thead><tr><th>INCIDENT ID</th><th>VEHICLE NUMBER</th><th>VIOLATION TYPE</th><th>LOCATION</th><th>TIME</th><th>STATUS</th><th></th></tr></thead><tbody>
            {filteredRows.map(r=><tr key={r.id} onClick={()=>setSelected(r)}><td className="id-cell">{r.id}</td><td className="plate-cell">{r.plate}</td><td><span className="violation-type"><span className={`severity ${r.severity.toLowerCase()}`}/>{r.type}</span></td><td>{r.location}</td><td className="time-cell">{r.time}</td><td><Status value={r.status}/></td><td><button className="row-more" onClick={e=>{e.stopPropagation();setSelected(r)}}><MoreHorizontal size={17}/></button></td></tr>)}
            {filteredRows.length===0&&<tr><td colSpan="7" className="empty">No matching violations found.</td></tr>}
          </tbody></table></div>
          <div className="table-foot">Showing <b>{filteredRows.length}</b> recent records <span>Auto-refresh: {live?"On":"Paused"}</span></div>
        </section>
        <footer>© 2026 TrafficIQ · Smart Traffic Violation Monitoring System <span>Demo dashboard · Connect real camera/API feeds for production use</span></footer>
      </div>
    </main>

    {selected && <div className="modal-backdrop" onClick={()=>setSelected(null)}><div className="detail-modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">INCIDENT DETAILS</span><h2>{selected.id}</h2></div><button className="icon-btn" onClick={()=>setSelected(null)}><X size={18}/></button></div><div className="detail-grid"><div><small>Vehicle number</small><b>{selected.plate}</b></div><div><small>Violation</small><b>{selected.type}</b></div><div><small>Location</small><b>{selected.location}</b></div><div><small>Detection time</small><b>{selected.time}</b></div><div><small>Camera ID</small><b>{selected.camera}</b></div><div><small>Severity</small><b>{selected.severity}</b></div></div><div className="modal-actions"><button className="outline-btn" onClick={()=>updateStatus(selected.id,"Verified")}><CheckCircle2 size={15}/> Mark verified</button><button className="primary-btn" onClick={()=>updateStatus(selected.id,"Challan Issued")}><ShieldCheck size={15}/> Issue challan</button></div><p className="modal-note">Demo action only. No real vehicle owner, police database or payment gateway is connected.</p></div></div>}
  </div>;
}

function IndianRupeeIcon({size=19}) {
  return <span style={{fontSize:size,fontWeight:800,lineHeight:1}}>₹</span>;
}
