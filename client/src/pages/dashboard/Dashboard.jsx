import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import Layout from "../../components/Layout";
import {
  FileText, BookOpen, Clock, CheckCircle, Award,
  ChevronRight, Search, PlayCircle, Lock, User, Download, TrendingUp, MapPin,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [dashboard,    setDashboard]    = useState(null);
  const [transcript,   setTranscript]   = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [activeTab,    setActiveTab]    = useState("overview");
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [q,            setQ]            = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, transcriptRes, certsRes] = await Promise.all([
          API.get("/dashboard"),
          API.get("/dashboard/transcript"),
          API.get("/certificates"),
        ]);
        setDashboard(dashRes.data);
        setTranscript(transcriptRes.data);
        const raw = certsRes.data?.certificates || [];
        setCertificates(raw.map((c) => ({
          _id:             c._id,
          course_id:       String(c.course_id || ""),
          course_title:    c.course_title  || "—",
          course_type:     c.course_type   || "—",
          credit_hours:    c.credit_hours,
          nmls_course_id:  c.nmls_course_id || "—",
          completed_at:    c.completed_at,
          certificate_url: c.certificate_url || null,
        })));
      } catch { setError("Failed to load dashboard"); }
      finally  { setLoading(false); }
    };
    fetchData();
  }, []);

  const profile          = dashboard?.profile          || {};
  const completions      = dashboard?.completions      || {};
  const orders           = dashboard?.orders           || [];
  const availableCourses = dashboard?.available_courses || [];
  const ceTracker        = dashboard?.ce_tracker       || null;
  const paidCourseIds = new Set(
  orders
    .filter(o => ["paid", "completed"].includes(String(o.status).toLowerCase()))
    .flatMap(o => (o.items || []).map(i => String(i.course_id?._id || i.course_id)))
);

const inProgressCount = availableCourses.filter(
  c => !c.already_completed && paidCourseIds.has(String(c.course_id))
).length;
  const recentCompletions = useMemo(() => {
    const fromDash = [...(completions?.PE || []), ...(completions?.CE || [])];
    const list = fromDash.length > 0 ? fromDash : certificates.map(c => ({
      course_id: { title: c.course_title, type: c.course_type, credit_hours: c.credit_hours },
      completed_at: c.completed_at, certificate_url: c.certificate_url,
    }));
    return [...list].sort((a, b) => new Date(b?.completed_at||0) - new Date(a?.completed_at||0)).slice(0, 5);
  }, [completions, certificates]);

  const filteredTranscript = useMemo(() => {
    const rows = transcript?.transcript || [];
    if (!q.trim()) return rows;
    const n = q.toLowerCase();
    return rows.filter(t =>
      String(t.course_title||"").toLowerCase().includes(n) ||
      String(t.nmls_course_id||"").toLowerCase().includes(n) ||
      String(t.type||"").toLowerCase().includes(n)
    );
  }, [transcript, q]);

  const profileFields = [
    { label: "Email verified",  done: true               },
    { label: "Password set",    done: true               },
    { label: "Mailing address", done: !!profile?.address },
    { label: "Phone number",    done: !!profile?.phone   },
    { label: "NMLS ID number",  done: !!profile?.nmls_id },
  ];
  const profilePct = Math.round((profileFields.filter(f => f.done).length / profileFields.length) * 100);

  const renewalYear   = ceTracker?.renewal_year    || new Date().getFullYear();
  const ceDeadline    = ceTracker?.deadline        || `Dec 31, ${renewalYear}`;
  const ceDaysLeft    = ceTracker?.days_left       ?? null;
  const ceRequired    = ceTracker?.required_hours  || 8;
  const ceCompleted   = ceTracker?.completed_hours || 0;
  const ceStillNeeded = Math.max(0, ceRequired - ceCompleted);
  const ceSubjects    = ceTracker?.subjects        || [];
  const studentId     = profile?.nmls_id || user?.nmls_id ? `#NM-${profile?.nmls_id || user?.nmls_id}` : "—";

  if (loading) return <Layout><style>{CSS}</style><div style={S.fullCenter}><div className="dash-spin" /></div></Layout>;
  if (error)   return <Layout><div style={S.fullCenter}><div style={{ color: "#ef4444" }}>{error}</div></div></Layout>;

  return (
    <Layout>
      <style>{CSS}</style>
<div style={S.wrap} className="dash-wrap">

        {/* Page header */}
        <div style={S.pageHead}>
          <div style={S.breadcrumb}>Student Portal › Dashboard</div>
          <h1 style={S.pageTitle}>Dashboard</h1>
          <p style={S.pageSubtitle}>Your enrolled courses, certificates, and recent activity — all in one place.</p>
          <div style={S.headDivider} />
        </div>

        {/* Stat cards */}
<div style={S.statGrid} className="dash-stat-grid">
          <StatCard color="#2EABFE" icon={<BookOpen size={24} style={{color:"#2EABFE"}}/>} value={availableCourses.length} label="Courses Enrolled" badge="TOTAL" badgeColor="#2EABFE"/>
          <StatCard color="#008000" icon={<Award size={24} style={{color:"#008000"}}/>}    value={certificates.length}     label="Certificates Earned" badge={certificates.length > 0 ? `+${certificates.length}` : "0"} badgeColor="#008000"/>
          <StatCard color="#F59E0B" icon={<Clock size={24} style={{color:"#F59E0B"}}/>}    value={inProgressCount}          label="In Progress" badge={inProgressCount > 0 ? "Active" : "None"} badgeColor="#F59E0B"/>
          <StatCard color="#9569F7" icon={<User size={24} style={{color:"#9569F7"}}/>}     value={studentId}                label="Student ID" badge="ST" badgeColor="#9569F7"/>
        </div>

        {/* Middle row */}
        <div style={S.midRow} className="dash-mid-row">
          <div style={S.panel}>
            <div style={S.panelHdr}>
              <div style={S.panelHdrLeft}>
                <div style={S.panelIcon}><BookOpen size={15} style={{color:"#2EABFE"}}/></div>
                <div><div style={S.panelTitle}>My Courses</div><div style={S.panelSub}>All enrolled courses</div></div>
              </div>
              <button style={S.viewAllBtn} onClick={() => navigate("/my-courses")} type="button">View all →</button>
            </div>
            <div style={S.divider}/>
            {availableCourses.filter(c =>
    ["paid","completed"].includes(String(
      orders.find(o => (o.items||[]).some(i => String(i.course_id?._id||i.course_id) === String(c.course_id)))?.status || ""
    ).toLowerCase())
  ).length === 0
  ? <div style={S.emptyMsg}>No courses enrolled yet.</div>
  : availableCourses
      .filter(c =>
        ["paid","completed"].includes(String(
          orders.find(o => (o.items||[]).some(i => String(i.course_id?._id||i.course_id) === String(c.course_id)))?.status || ""
        ).toLowerCase())
      )
      .slice(0,5)
      .map((c,i) => <CourseRow key={i} course={c} onStart={() => navigate(`/courses/${c.course_id}/learn`)}/>)
}
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:14,flex:1,minWidth:0}}>
            {/* Profile completion */}
            <div style={S.panel}>
              <div style={S.panelHdr}>
                <div style={S.panelTitle}>Profile Completion</div>
                <span style={{fontSize:24,fontWeight:700,color:"#2EABFE",fontFamily:"'Poppins',sans-serif"}}>{profilePct}%</span>
              </div>
              <div style={S.divider}/>
              <div style={{padding:"8px 0 4px"}}>
                <div style={S.progressTrack}><div style={{...S.progressFill,width:`${profilePct}%`,background:"#2EABFE"}}/></div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:7,marginTop:8}}>
                {profileFields.map((f,i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                    {f.done
                      ? <CheckCircle size={14} style={{color:"#008000",flexShrink:0}}/>
                      : <div style={{width:12,height:12,borderRadius:"50%",border:"1px solid #7FA8C4",flexShrink:0}}/>
                    }
                    <span style={{fontSize:13,color:"#091925",fontFamily:"'Poppins',sans-serif",fontWeight:f.done?500:400}}>{f.label}</span>
                  </div>
                ))}
              </div>
              <div style={{...S.divider,margin:"12px 0"}}/>
              <button style={S.ctaBlue} onClick={() => navigate("/account-setup")} type="button">
                COMPLETE PROFILE <span style={{marginLeft:8,borderLeft:"1.5px solid #091925",paddingLeft:8}}>→</span>
              </button>
            </div>

            {/* Certificates */}
            <div style={S.panel}>
              <div style={S.panelHdr}>
                <div style={S.panelTitle}>Certificates</div>
                <div style={{padding:"3px 10px",borderRadius:999,background:"rgba(0,128,0,0.10)",border:"0.5px solid #008000",color:"#008000",fontSize:10,fontWeight:800}}>{certificates.length} EARNED</div>
              </div>
              <div style={S.divider}/>
              {certificates.length === 0
                ? <div style={S.emptyMsg}>No certificates yet.</div>
                : certificates.slice(0,2).map((c,i) => <CertRow key={i} item={c}/>)
              }
              <div style={{marginTop:12}}>
                <button style={S.ctaGreen} onClick={() => navigate("/certificates")} type="button">
                  VIEW ALL CERTIFICATES <span style={{marginLeft:8,borderLeft:"1.5px solid #fff",paddingLeft:8}}>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={S.midRow} className="dash-mid-row">
          {/* CE Tracker */}
          <div style={{...S.panel,border:"0.5px solid #F59E0B",background:"rgba(245,158,11,0.03)"}}>
            <div style={S.panelHdr}>
              <div style={S.panelHdrLeft}>
                <div style={{...S.panelIcon,background:"rgba(208,235,255,0.25)",border:"0.5px solid #2EABFE"}}>
                  <Clock size={15} style={{color:"#2EABFE"}}/>
                </div>
                <div>
                  <div style={S.panelTitle}>Annual CE Tracker</div>
                  <div style={S.panelSub}>{renewalYear} renewal · Deadline {ceDeadline}</div>
                </div>
              </div>
              {ceDaysLeft !== null && (
                <div style={{padding:"3px 10px",borderRadius:999,background:"rgba(46,171,254,0.10)",border:"0.5px solid #2EABFE",color:"#2EABFE",fontSize:10,fontWeight:800,flexShrink:0}}>
                  {ceDaysLeft} days left
                </div>
              )}
            </div>
            <div style={{...S.divider,borderColor:"#F59E0B"}}/>
            {ceTracker ? (
              <>
                <p style={{fontSize:13,color:"#091925",lineHeight:1.6,fontFamily:"'Poppins',sans-serif",marginBottom:12}}>
                  Required: <strong>{ceRequired} hrs</strong> by <strong>{ceDeadline}</strong>.
                  {ceStillNeeded > 0
                    ? <> Still need <strong>{ceStillNeeded} hr{ceStillNeeded!==1?"s":""}</strong>.</>
                    : <> All hours completed ✓</>}
                </p>
                {ceSubjects.map((row,i) => {
                  const pct = row.total > 0 ? Math.round((row.completed/row.total)*100) : 0;
                  const col = pct===100?"#008000":pct>0?"#F59E0B":"#EF4444";
                  return (
                    <div key={i} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:13,color:"#091925",fontFamily:"'Poppins',sans-serif"}}>{row.label}</span>
                        <span style={{fontSize:13,fontWeight:700,color:col}}>{row.completed}/{row.total}</span>
                      </div>
                      <div style={S.progressTrack}><div style={{...S.progressFill,width:`${pct}%`,background:col}}/></div>
                    </div>
                  );
                })}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4,marginBottom:4}}>
                  <span style={{fontSize:11,color:"#7FA8C4"}}>{ceStillNeeded>0?`${ceStillNeeded} hr${ceStillNeeded!==1?"s":""} needed`:"Complete ✓"}</span>
                  <span style={{fontSize:18,fontWeight:700,color:"#2EABFE",fontFamily:"'Poppins',sans-serif"}}>{ceCompleted}/{ceRequired} hrs</span>
                </div>
              </>
            ) : <div style={S.emptyMsg}>Complete a CE course to begin tracking.</div>}
            <div style={{...S.divider,borderColor:"#F59E0B"}}/>
            <button style={S.ctaAmber} onClick={() => navigate("/courses")} type="button">
              COMPLETE CE NOW <span style={{marginLeft:8,borderLeft:"1.5px solid #fff",paddingLeft:8}}>→</span>
            </button>
          </div>

          {/* Recent Completions */}
          <div style={{...S.panel,flex:1,minWidth:0}}>
            <div style={S.panelHdr}><div style={S.panelTitle}>Recent completions</div></div>
            <div style={S.divider}/>
            {recentCompletions.length === 0 ? (
              <div style={{textAlign:"center",padding:"32px 16px"}}>
                <div style={{fontSize:14,fontWeight:600,color:"#091925",marginBottom:6,fontFamily:"'Poppins',sans-serif"}}>No completions yet</div>
                <div style={{fontSize:12,color:"#7FA8C4",marginBottom:14,fontFamily:"'Poppins',sans-serif"}}>Complete a course to see your record here.</div>
                <button style={S.ctaGreen} onClick={() => navigate("/courses")} type="button">BROWSE COURSES →</button>
              </div>
            ) : recentCompletions.map((c,i) => <CompletionRow key={i} item={c}/>)}
          </div>
        </div>

        {/* Tabs */}
        <div style={S.tabsCard}>
          <div style={S.tabBar} className="dash-tab-bar">
            <TabBtn label="Overview"   active={activeTab==="overview"}   onClick={() => setActiveTab("overview")}/>
            <TabBtn label="Transcript" active={activeTab==="transcript"} onClick={() => setActiveTab("transcript")}/>
            <TabBtn label="Orders"     active={activeTab==="orders"}     onClick={() => setActiveTab("orders")}/>
            <button style={S.backBtn} onClick={() => navigate("/my-courses")} type="button">My Courses ›</button>
            {activeTab === "transcript" && (
              <div style={S.tabSearch}>
                <Search size={13} style={{color:"rgba(9,25,37,0.55)",flexShrink:0}}/>
                <input style={S.tabSearchInput} value={q} onChange={e => setQ(e.target.value)} placeholder="Search…"/>
              </div>
            )}
          </div>

          {activeTab === "overview" && (
            <div style={S.tabBody}>
              <div style={S.overviewGrid} className="dash-overview-grid">
                <div style={S.innerPanel}>
                  <div style={S.innerHdr}>
                    <div style={S.innerTitle}>Recent completions</div>
                    <button style={S.ghostBtn} onClick={() => setActiveTab("transcript")} type="button">
                      View transcript <ChevronRight size={13}/>
                    </button>
                  </div>
                  {recentCompletions.length===0
                    ? <div style={S.emptyMsg}>No completions yet.</div>
                    : recentCompletions.map((c,i) => <CompletionRow key={i} item={c}/>)
                  }
                </div>
                <div style={S.panel}>
                  <div style={S.panelHdr}><div style={S.panelTitle}>Quick actions</div></div>
                  <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:4}}>
                    {[
                      {icon:<BookOpen size={18}/>, title:"Browse courses",       sub:"Find PE and CE courses",            path:"/courses"},
                      {icon:<TrendingUp size={18}/>,title:"CE Tracker",          sub:"Track renewal progress",            path:"/ce-tracker"},
                      {icon:<FileText size={18}/>,  title:"View transcript",     sub:"Download and verify details",       tab:"transcript"},
                      {icon:<Clock size={18}/>,     title:"My orders",           sub:"Track payment and status",          tab:"orders"},
                      {icon:<MapPin size={18}/>,    title:"State requirements",  sub:"View state licensing and CE rules", path:"/state-requirements"},
                    ].map((a,i) => (
                      <button key={i} style={S.actionCard} type="button"
                        onClick={() => a.tab ? setActiveTab(a.tab) : navigate(a.path)}>
                        <div style={S.actionIcon}>{a.icon}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={S.actionTitle}>{a.title}</div>
                          <div style={S.actionSub}>{a.sub}</div>
                        </div>
                        <ChevronRight size={18} style={{flexShrink:0}}/>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "transcript" && (
            <div style={S.tabBody}>
              <div style={S.innerHdr}>
                <div>
                  <div style={S.innerTitle}>Transcript</div>
                  <div style={{fontSize:11,color:"#7FA8C4",marginTop:2}}>
                    {transcript?.student?.name ? `NMLS Transcript — ${transcript.student.name}` : "Your completed courses"}
                  </div>
                </div>
              </div>
              {filteredTranscript.length===0
                ? <div style={S.emptyMsg}>{q.trim()?"No matches found.":"Complete a course to populate your transcript."}</div>
                : (
                  <div style={S.tableWrap}>
                    <table style={S.table}>
                      <thead>
                        <tr style={{background:"rgba(2,8,23,0.02)"}}>
                          {["Course","NMLS ID","Type","Credit Hrs","Completed","Certificate"].map(h => (
                            <th key={h} style={S.th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTranscript.map((t,i) => (
                          <tr key={i} className="tr-hover">
                            <td style={S.td}><span style={{fontWeight:700}}>{t.course_title}</span></td>
                            <td style={S.td}>{t.nmls_course_id||"—"}</td>
                            <td style={S.td}><TypeBadge type={t.type}/></td>
                            <td style={S.td}>{t.credit_hours??"—"}</td>
                            <td style={S.td}>{t.completed_at?new Date(t.completed_at).toLocaleDateString():"—"}</td>
                            <td style={S.td}>
                              {t.certificate_url
                                ? <a href={t.certificate_url} target="_blank" rel="noreferrer" style={{color:"#2EABFE",fontWeight:700,display:"inline-flex",alignItems:"center",gap:5,textDecoration:"none"}}>
                                    <Award size={13}/> View
                                  </a>
                                : <span style={{color:"rgba(11,18,32,0.35)"}}>—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          )}

          {activeTab === "orders" && (
            <div style={S.tabBody}>
              <div style={S.innerHdr}>
                <div>
                  <div style={S.innerTitle}>Orders</div>
                  <div style={{fontSize:11,color:"#7FA8C4",marginTop:2}}>Your purchases, receipts, and payment methods</div>
                </div>
              </div>
              {orders.length===0
                ? <div style={S.emptyMsg}>No orders yet.</div>
                : (
                  <div style={{display:"flex",flexDirection:"column",gap:11}}>
                    {orders.slice(0,3).map((order,i) => {
                      const isPaid = String(order?.status||"").toLowerCase()==="paid";
                      return (
                        <div key={i} style={S.orderCard}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,gap:8}}>
                            <div style={{minWidth:0}}>
                              <div style={{fontWeight:700,color:"#091925",display:"flex",alignItems:"center",gap:7,fontSize:12}}>
                                <FileText size={13} style={{flexShrink:0}}/> Order #{String(order?._id||"").slice(-6).toUpperCase()}
                              </div>
                              <div style={{fontSize:11,color:"#7FA8C4",marginTop:3,display:"flex",alignItems:"center",gap:4}}>
                                <Clock size={10}/> {order?.createdAt?new Date(order.createdAt).toLocaleDateString():"—"}
                              </div>
                            </div>
                            <StatusBadge status={order?.status}/>
                          </div>
                          <div style={{display:"flex",flexDirection:"column",gap:7}}>
                            {(order?.items||[]).map((item,j) => (
                              <div key={j} style={{display:"flex",alignItems:"center",gap:11,padding:"9px 11px",borderRadius:7,border:"0.5px solid rgba(2,8,23,0.07)",background:"rgba(2,8,23,0.01)"}}>
                                <div style={{width:30,height:30,borderRadius:7,background:"rgba(46,171,254,0.10)",border:"0.5px solid rgba(46,171,254,0.18)",display:"grid",placeItems:"center",flexShrink:0}}>
                                  <BookOpen size={12} style={{color:"#2EABFE"}}/>
                                </div>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontWeight:600,fontSize:12,color:"#091925",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                    {item?.course_id?.title||"Course"}
                                  </div>
                                </div>
                                {isPaid&&item?.course_id?._id
                                  ? <button style={S.startBtn} onClick={() => navigate(`/courses/${item.course_id._id}/learn`)} type="button"><PlayCircle size={11}/> Start</button>
                                  : <div style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:6,border:"0.5px solid rgba(245,158,11,0.28)",background:"rgba(245,158,11,0.08)",color:"rgba(140,90,0,1)",fontSize:10,fontWeight:700,flexShrink:0}}><Lock size={9}/> Pending</div>
                                }
                              </div>
                            ))}
                          </div>
                          <div style={{marginTop:9,paddingTop:9,borderTop:"0.5px solid rgba(2,8,23,0.06)",display:"flex",justifyContent:"flex-end"}}>
                            <span style={{fontSize:12,fontWeight:700,color:"#091925"}}>Total: <strong>${Number(order?.total_amount||0).toFixed(2)}</strong></span>
                          </div>
                        </div>
                      );
                    })}
                    {orders.length>3 && (
                      <button style={{...S.ctaBlue,maxWidth:200,margin:"0 auto"}} onClick={() => navigate("/orders")} type="button">View All Orders →</button>
                    )}
                  </div>
                )}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

const StatCard = ({ color, icon, value, label, badge, badgeColor }) => (
  <div style={{background:"#fff",borderRadius:10,overflow:"hidden",boxShadow:`0 3px 0 0 ${color},0 2px 10px rgba(2,8,23,0.07)`}}>
    <div style={{padding:"16px 15px 13px"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:11}}>
        <div style={{width:46,height:46,borderRadius:11,border:`1px solid ${color}30`,background:`${color}15`,display:"grid",placeItems:"center",flexShrink:0}}>{icon}</div>
        <div style={{padding:"3px 8px",borderRadius:999,background:`${badgeColor}18`,fontSize:9,fontWeight:800,color:badgeColor,textAlign:"center"}}>{badge}</div>
      </div>
      <div style={{fontSize:26,fontWeight:800,color:"#091925",lineHeight:1.1,fontFamily:"'Poppins',sans-serif",wordBreak:"break-all"}}>{value}</div>
      <div style={{fontSize:11,color:"rgba(9,25,37,0.55)",marginTop:3,fontFamily:"'Poppins',sans-serif"}}>{label}</div>
    </div>
  </div>
);

const CourseRow = ({ course, onStart }) => {
  const progress=course.progress||0, isComplete=course.already_completed;
  const col=isComplete?"#008000":progress>0?"#F59E0B":"#2EABFE";
  const lbl=isComplete?"Complete":progress>0?"In Progress":"Not Started";
  return (
    <div>
      <div style={{display:"flex",alignItems:"flex-start",gap:11,padding:"12px 0"}}>
        <div style={{width:32,height:32,borderRadius:7,flexShrink:0,background:isComplete?"rgba(0,128,0,0.10)":"rgba(245,158,11,0.10)",border:`1px solid ${isComplete?"#008000":"#F59E0B"}40`,display:"grid",placeItems:"center"}}>
          <BookOpen size={14} style={{color:isComplete?"#008000":"#F59E0B"}}/>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,color:"#091925",fontFamily:"'Poppins',sans-serif",marginBottom:4,lineHeight:1.4,fontWeight:500}}>{course.title}</div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:11,color:"#7FA8C4"}}>Progress</span>
            <span style={{fontSize:11,fontWeight:700,color:col}}>{isComplete?"100%":`${progress}%`}</span>
          </div>
          <div style={S.progressTrack}><div style={{...S.progressFill,width:isComplete?"100%":`${progress}%`,background:col}}/></div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5,flexShrink:0}}>
          <div style={{padding:"3px 8px",borderRadius:999,background:`${col}18`,border:`1px solid ${col}40`,fontSize:10,fontWeight:800,color:col,display:"flex",alignItems:"center",gap:3}}>
            <div style={{width:4,height:4,borderRadius:"50%",background:col}}/>{lbl}
          </div>
          {!isComplete && <button onClick={onStart} type="button" style={{fontSize:11,fontWeight:700,color:"#2EABFE",background:"none",border:"none",cursor:"pointer",padding:0}}>Resume →</button>}
        </div>
      </div>
      <div style={S.divider}/>
    </div>
  );
};

const CertRow = ({ item }) => {
  const title=item?.course_title||item?.course?.title||"Certificate";
  const date=item?.completed_at?new Date(item.completed_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"";
  return (
    <div style={{display:"flex",alignItems:"center",gap:11,padding:"10px 0"}}>
      <div style={{width:40,height:40,borderRadius:9,background:"rgba(0,128,0,0.10)",border:"1px solid #00800030",display:"grid",placeItems:"center",flexShrink:0}}><Award size={18} style={{color:"#008000"}}/></div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:12,fontWeight:600,color:"#091925",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{title}</div>
        {date && <div style={{fontSize:11,color:"rgba(9,25,37,0.55)",marginTop:2}}>Issued {date}</div>}
      </div>
      {item?.certificate_url && (
        <a href={item.certificate_url} target="_blank" rel="noreferrer" style={{width:34,height:34,borderRadius:7,background:"rgba(91,115,132,0.10)",border:"1px solid rgba(91,115,132,0.20)",display:"grid",placeItems:"center",flexShrink:0}}>
          <Download size={12} style={{color:"#5B7384"}}/>
        </a>
      )}
    </div>
  );
};

const CompletionRow = ({ item }) => {
  const title=item?.course?.title||item?.course_id?.title||"Course";
  const type=item?.course?.type||item?.course_id?.type||"";
  const hrs=item?.course?.credit_hours??item?.course_id?.credit_hours??"—";
  const date=item?.completed_at?new Date(item.completed_at).toLocaleDateString():"—";
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"8px 0",borderBottom:"0.5px solid rgba(2,8,23,0.06)"}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:600,fontSize:12,color:"#091925",marginBottom:3,fontFamily:"'Poppins',sans-serif"}}>{title}</div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <TypeBadge type={type}/>
          <span style={{fontSize:11,color:"rgba(11,18,32,0.55)",display:"flex",alignItems:"center",gap:3}}><Clock size={10}/> {hrs} hrs</span>
          <span style={{fontSize:11,color:"rgba(11,18,32,0.55)",display:"flex",alignItems:"center",gap:3}}><CheckCircle size={10}/> {date}</span>
        </div>
      </div>
      <ChevronRight size={14} style={{color:"rgba(9,25,37,0.35)",flexShrink:0}}/>
    </div>
  );
};

const TypeBadge = ({ type }) => {
  const t=String(type||"").toUpperCase();
  const s=t==="PE"?{color:"#2EABFE",background:"rgba(46,171,254,0.12)",border:"0.5px solid rgba(46,171,254,0.22)"}
    :t==="CE"?{color:"rgba(0,140,140,1)",background:"rgba(0,180,180,0.12)",border:"0.5px solid rgba(0,180,180,0.20)"}
    :{color:"rgba(9,25,37,0.78)",background:"rgba(2,8,23,0.06)",border:"0.5px solid rgba(2,8,23,0.10)"};
  return <span style={{...s,display:"inline-flex",alignItems:"center",padding:"2px 7px",borderRadius:999,fontSize:9,fontWeight:800}}>{t||"—"}</span>;
};

const StatusBadge = ({ status }) => {
  const s=String(status||"").toLowerCase();
  const st=s==="paid"||s==="completed"?{color:"rgba(0,140,140,1)",background:"rgba(0,180,180,0.12)",border:"0.5px solid rgba(0,180,180,0.20)"}
    :s==="pending"?{color:"rgba(180,120,0,1)",background:"rgba(245,158,11,0.12)",border:"0.5px solid rgba(245,158,11,0.22)"}
    :{color:"rgba(200,50,50,1)",background:"rgba(239,68,68,0.10)",border:"0.5px solid rgba(239,68,68,0.20)"};
  return <span style={{...st,display:"inline-flex",alignItems:"center",padding:"4px 9px",borderRadius:999,fontSize:11,fontWeight:700,textTransform:"capitalize",whiteSpace:"nowrap"}}>{status}</span>;
};

const TabBtn = ({ label, active, onClick }) => (
  <button onClick={onClick} type="button" style={{padding:"12px 14px",border:"none",background:active?"#2EABFE":"transparent",color:active?"#091925":"#5B7384",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'Poppins',sans-serif",borderRadius:0,whiteSpace:"nowrap",flexShrink:0}}>
    {label}
  </button>
);

const CSS = `
.dash-spin{width:34px;height:34px;border-radius:50%;border:3px solid rgba(2,8,23,0.10);border-top-color:#2EABFE;animation:dspin 1s linear infinite;}
@keyframes dspin{to{transform:rotate(360deg);}}
.tr-hover:hover{background:rgba(46,171,254,0.04);}

/* ── Responsive overrides ── */
@media (max-width: 640px) {
  .dash-wrap        { padding: 14px 14px 32px !important; }
  .dash-page-title  { font-size: 22px !important; }
  .dash-stat-grid   { grid-template-columns: repeat(2,1fr) !important; gap: 9px !important; }
  .dash-mid-row     { grid-template-columns: 1fr !important; }
  .dash-overview-grid { grid-template-columns: 1fr !important; }
  .dash-tab-bar     { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .dash-tab-search  { min-width: 0; max-width: none !important; flex:1; }
  .dash-back-btn    { margin-left: 0 !important; }
}
@media (min-width: 641px) and (max-width: 900px) {
  .dash-stat-grid   { grid-template-columns: repeat(2,1fr) !important; }
  .dash-mid-row     { grid-template-columns: 1fr !important; }
  .dash-overview-grid { grid-template-columns: 1fr !important; }
}
`;

const S = {
  fullCenter:   {minHeight:"60vh",display:"grid",placeItems:"center"},
  wrap:         {padding:"20px 24px 40px"},
  pageHead:     {marginBottom:18},
  breadcrumb:   {fontSize:12,fontWeight:600,color:"#2EABFE",fontFamily:"'Poppins',sans-serif",marginBottom:4},
  pageTitle:    {fontSize:30,fontWeight:800,color:"#091925",fontFamily:"'Poppins',sans-serif",lineHeight:1.1,marginBottom:4,margin:0},
  pageSubtitle: {fontSize:13,fontWeight:500,color:"#5B7384",fontFamily:"'Poppins',sans-serif",marginBottom:10,marginTop:4},
  headDivider:  {height:"1.5px",background:"linear-gradient(90deg,#2EABFE,transparent)",borderRadius:99,marginBottom:16},
  statGrid:     {display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:14},
  midRow:       {display:"grid",gridTemplateColumns:"1fr 1fr",gap:13,marginBottom:14},
  overviewGrid: {display:"grid",gridTemplateColumns:"1.4fr 0.8fr",gap:14},
  panel:        {background:"#fff",borderRadius:10,padding:"15px 17px",display:"flex",flexDirection:"column",boxShadow:"0 2px 8px rgba(2,8,23,0.06)",border:"0.5px solid rgba(2,8,23,0.07)"},
  panelHdr:     {display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:9,flexWrap:"wrap"},
  panelHdrLeft: {display:"flex",alignItems:"center",gap:9,minWidth:0},
  panelIcon:    {width:32,height:32,borderRadius:8,background:"rgba(208,235,255,0.25)",border:"0.5px solid #2EABFE",display:"grid",placeItems:"center",flexShrink:0},
  panelTitle:   {fontSize:13,fontWeight:700,color:"#091925",fontFamily:"'Poppins',sans-serif"},
  panelSub:     {fontSize:10,color:"#7FA8C4",fontFamily:"'Poppins',sans-serif",marginTop:1},
  divider:      {height:"0.5px",background:"#7FA8C4",opacity:0.3,margin:"3px 0"},
  viewAllBtn:   {padding:"5px 11px",borderRadius:6,background:"rgba(46,171,254,0.10)",border:"1px solid rgba(46,171,254,0.22)",color:"#2EABFE",fontWeight:700,fontSize:11,cursor:"pointer",flexShrink:0},
  progressTrack:{height:6,borderRadius:999,background:"rgba(9,25,37,0.07)",overflow:"hidden"},
  progressFill: {height:"100%",borderRadius:999,transition:"width 0.4s"},
  ctaBlue:  {display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"11px",borderRadius:7,border:"none",background:"#2EABFE",color:"#091925",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"'Poppins',sans-serif",marginTop:"auto"},
  ctaGreen: {display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"11px",borderRadius:7,border:"none",background:"#008000",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"'Poppins',sans-serif"},
  ctaAmber: {display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"11px",borderRadius:7,border:"none",background:"#F59E0B",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"'Poppins',sans-serif",marginTop:10},
  tabsCard:     {background:"#fff",borderRadius:10,overflow:"hidden",boxShadow:"0 2px 8px rgba(2,8,23,0.06)",border:"0.5px solid rgba(2,8,23,0.07)"},
  tabBar:       {display:"flex",alignItems:"center",borderBottom:"0.5px solid rgba(2,8,23,0.08)",overflowX:"auto",WebkitOverflowScrolling:"touch"},
  tabSearch:    {display:"flex",alignItems:"center",gap:7,padding:"0 11px",height:46,borderLeft:"0.5px solid rgba(2,8,23,0.08)",minWidth:120,maxWidth:240,flex:1},
  tabSearchInput:{flex:1,border:"none",outline:"none",fontSize:12,fontFamily:"'Poppins',sans-serif",background:"transparent",color:"#091925",minWidth:0},
  backBtn:      {marginLeft:"auto",padding:"0 14px",height:46,border:"none",borderLeft:"0.5px solid rgba(2,8,23,0.08)",background:"transparent",color:"#5B7384",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'Poppins',sans-serif",whiteSpace:"nowrap",flexShrink:0},
  tabBody:      {padding:"14px"},
  innerPanel:   {background:"#fff",borderRadius:7,border:"0.5px solid rgba(2,8,23,0.08)",padding:"12px"},
  innerHdr:     {display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:9,flexWrap:"wrap"},
  innerTitle:   {fontSize:12,fontWeight:700,color:"#091925",fontFamily:"'Poppins',sans-serif"},
  ghostBtn:     {display:"inline-flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:999,border:"0.5px solid rgba(2,8,23,0.10)",background:"rgba(2,8,23,0.02)",cursor:"pointer",fontWeight:700,fontSize:11,color:"rgba(11,18,32,0.65)",fontFamily:"'Poppins',sans-serif",whiteSpace:"nowrap"},
  actionCard:   {display:"flex",alignItems:"center",gap:11,padding:"9px 11px",borderRadius:7,border:"0.5px solid rgba(2,8,23,0.07)",background:"rgba(2,8,23,0.01)",cursor:"pointer",width:"100%",textAlign:"left"},
  actionIcon:   {width:32,height:32,borderRadius:7,background:"rgba(46,171,254,0.10)",border:"0.5px solid rgba(46,171,254,0.15)",display:"grid",placeItems:"center",color:"#091925",flexShrink:0},
  actionTitle:  {fontSize:12,fontWeight:700,color:"rgba(11,18,32,0.85)",fontFamily:"'Poppins',sans-serif"},
  actionSub:    {fontSize:10,fontWeight:500,color:"rgba(11,18,32,0.50)",fontFamily:"'Poppins',sans-serif",marginTop:2},
  tableWrap:    {overflowX:"auto",borderRadius:7,border:"0.5px solid rgba(2,8,23,0.08)",WebkitOverflowScrolling:"touch"},
  table:        {width:"100%",borderCollapse:"separate",borderSpacing:0,minWidth:560},
  th:           {textAlign:"left",fontSize:10,fontWeight:700,color:"rgba(11,18,32,0.55)",padding:"8px 11px",borderBottom:"0.5px solid rgba(2,8,23,0.08)",background:"rgba(2,8,23,0.02)",fontFamily:"'Poppins',sans-serif",whiteSpace:"nowrap"},
  td:           {padding:"8px 11px",borderBottom:"0.5px solid rgba(2,8,23,0.05)",fontSize:12,color:"rgba(11,18,32,0.78)",fontFamily:"'Poppins',sans-serif"},
  orderCard:    {borderRadius:8,border:"0.5px solid rgba(2,8,23,0.08)",background:"#fff",padding:12},
  startBtn:     {display:"inline-flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:6,border:"none",background:"#2EABFE",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:10,flexShrink:0},
  emptyMsg:     {fontSize:12,color:"#7FA8C4",padding:"16px 0",textAlign:"center",fontFamily:"'Poppins',sans-serif"},
};

export default Dashboard;