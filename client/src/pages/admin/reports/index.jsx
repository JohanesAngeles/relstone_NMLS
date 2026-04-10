import { useEffect, useState, useCallback } from 'react';
import {
  DollarSign, Users, BookOpen, TrendingUp,
  ShoppingCart, Award, BarChart2, Clock,
  CheckCircle, XCircle, RefreshCw, AlertTriangle,
  Download, Calendar,
} from 'lucide-react';
import API from '../../../api/axios';

const fmt = (n) =>
  Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtInt = (n) => Number(n || 0).toLocaleString('en-US');
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_SHORT = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const toISO = (d) => {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
};

/* ─── PDF Generator ──────────────────────────────────────────────── */
const generateRangePDF = (data, startDate, endDate) => {
  const rows = (items, cols, rowFn) => items.length === 0
    ? `<tr><td colspan="${cols}" style="text-align:center;color:#7FA8C4;padding:14px">No data for this period.</td></tr>`
    : items.map(rowFn).join('');

  const statusBadge = (s) => {
    const map = { paid:'#10b981', completed:'#10b981', pending:'#f59e0b', cancelled:'#ef4444', in_progress:'#2EABFE', not_started:'#7FA8C4' };
    const label = (s||'—').replace(/_/g,' ');
    const color = map[s] || '#7FA8C4';
    return `<span style="background:${color}22;color:${color};padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;text-transform:capitalize">${label}</span>`;
  };

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>Report ${fmtDate(startDate)} — ${fmtDate(endDate)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#091925;padding:40px;font-size:13px}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #2EABFE}
.brand{font-size:22px;font-weight:900;color:#091925}.brand span{color:#2EABFE}
.period{text-align:right}.period .label{font-size:10px;color:#7FA8C4;text-transform:uppercase;letter-spacing:.06em}
.period .dates{font-size:14px;font-weight:700;color:#091925;margin-top:2px}
.section-title{font-size:11px;font-weight:700;color:#091925;margin:24px 0 10px;padding-bottom:6px;border-bottom:1px solid #e2e8f0;text-transform:uppercase;letter-spacing:.06em}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:4px}
.card{background:#f8fafc;border-radius:10px;padding:12px 14px}
.card .val{font-size:18px;font-weight:800;color:#091925;margin-top:3px}
.card .lbl{font-size:9px;color:#7FA8C4;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
.card .sub{font-size:10px;color:#7FA8C4;margin-top:2px}
table{width:100%;border-collapse:collapse;margin-bottom:4px;font-size:11px}
th{background:#f8fafc;padding:8px 10px;text-align:left;font-size:9px;font-weight:700;color:#7FA8C4;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e2e8f0}
td{padding:8px 10px;border-bottom:1px solid #f1f5f9;color:#091925;vertical-align:middle}
tr:last-child td{border-bottom:none}
.pw{background:#e2e8f0;border-radius:99px;height:5px;width:70px;display:inline-block;vertical-align:middle}
.pb{height:100%;border-radius:99px}
.footer{margin-top:32px;padding-top:14px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;color:#7FA8C4;font-size:10px}
</style></head><body>
<div class="header">
  <div>
    <div class="brand">RELSTONE <span>NMLS</span></div>
    <div style="font-size:11px;color:#7FA8C4;margin-top:3px">Admin Report</div>
  </div>
  <div class="period">
    <div class="label">Reporting Period</div>
    <div class="dates">${fmtDate(startDate)} — ${fmtDate(endDate)}</div>
    <div style="font-size:10px;color:#7FA8C4;margin-top:2px">Generated ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</div>
  </div>
</div>

<div class="section-title">Summary</div>
<div class="cards">
  <div class="card"><div class="lbl">Revenue</div><div class="val" style="color:#10b981">$${fmt(data.weekRevenue)}</div><div class="sub">${fmtInt(data.paidCount)} paid orders</div></div>
  <div class="card"><div class="lbl">Orders</div><div class="val">${fmtInt(data.totalOrders)}</div><div class="sub">${fmtInt(data.pendingCount)} pending · ${fmtInt(data.cancelledCount)} cancelled</div></div>
  <div class="card"><div class="lbl">Enrollments</div><div class="val">${fmtInt(data.totalEnrollments)}</div><div class="sub">${fmtInt(data.completedCount)} completed</div></div>
  <div class="card"><div class="lbl">New Students</div><div class="val">${fmtInt(data.newStudents)}</div><div class="sub">Registered this period</div></div>
</div>

<div class="section-title">Top Courses</div>
<table>
  <thead><tr><th>Course</th><th>Type</th><th>Enrolled</th><th>Completed</th><th>Rate</th></tr></thead>
  <tbody>${rows(data.topCourses||[], 5, c => {
    const rate = c.enrolled ? Math.round((c.completed/c.enrolled)*100) : 0;
    return `<tr><td style="font-weight:600">${c.title||'—'}</td><td style="color:#7FA8C4">${c.type||'—'}</td><td style="font-weight:700">${c.enrolled}</td><td style="color:#10b981;font-weight:600">${c.completed}</td><td><div style="display:flex;align-items:center;gap:5px"><div class="pw"><div class="pb" style="width:${rate}%;background:#10b981"></div></div><span style="font-size:10px;font-weight:700">${rate}%</span></div></td></tr>`;
  })}</tbody>
</table>

<div class="section-title">Orders</div>
<table>
  <thead><tr><th>Student</th><th>Courses</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
  <tbody>${rows(data.orders||[], 5, o => `<tr>
    <td><div style="font-weight:600">${o.user_id?.name||'—'}</div><div style="font-size:10px;color:#7FA8C4">${o.user_id?.email||''}</div></td>
    <td style="color:#7FA8C4;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(o.items||[]).map(i=>i.course_id?.title).filter(Boolean).join(', ')||'—'}</td>
    <td style="font-weight:700">$${fmt(o.total_amount||0)}</td>
    <td>${statusBadge(o.status)}</td>
    <td style="color:#7FA8C4">${new Date(o.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</td>
  </tr>`)}</tbody>
</table>

<div class="section-title">Enrollments</div>
<table>
  <thead><tr><th>Student</th><th>Course</th><th>Progress</th><th>Status</th><th>Date</th></tr></thead>
  <tbody>${rows(data.enrollments||[], 5, e => `<tr>
    <td><div style="font-weight:600">${e.user_id?.name||'—'}</div><div style="font-size:10px;color:#7FA8C4">${e.user_id?.email||''}</div></td>
    <td><div style="font-weight:500">${e.course_id?.title||'—'}</div><div style="font-size:10px;color:#7FA8C4">${e.course_id?.type||''}</div></td>
    <td><div style="display:flex;align-items:center;gap:5px"><div class="pw"><div class="pb" style="width:${e.progress||0}%;background:#2EABFE"></div></div><span style="font-size:10px;font-weight:700">${e.progress||0}%</span></div></td>
    <td>${statusBadge(e.status)}</td>
    <td style="color:#7FA8C4">${new Date(e.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</td>
  </tr>`)}</tbody>
</table>

<div class="footer">
  <span>RELSTONE NMLS Platform — Confidential</span>
  <span>Generated by Admin Panel · ${new Date().toLocaleString()}</span>
</div>
</body></html>`;

  const win = window.open('', '_blank', 'width=950,height=750');
  win.document.write(html);
  win.document.close();
  win.onload = () => setTimeout(() => { win.focus(); win.print(); }, 400);
};

/* ─── Reusable Components ────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, sub, color, isCurrency = false }) => (
  <div style={{ background:'#fff', borderRadius:16, padding:'20px 22px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', display:'flex', alignItems:'flex-start', gap:14, transition:'box-shadow .2s' }}
    onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.10)'}
    onMouseLeave={e=>e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.06)'}
  >
    <div style={{ width:46, height:46, borderRadius:12, flexShrink:0, background:`${color}18`, display:'grid', placeItems:'center' }}>
      <Icon size={20} color={color} />
    </div>
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ fontSize:11, fontWeight:600, color:'#7FA8C4', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:800, color:'#091925', lineHeight:1 }}>{isCurrency ? `$${fmt(value)}` : fmtInt(value)}</div>
      {sub && <div style={{ fontSize:11, color:'#7FA8C4', marginTop:4 }}>{sub}</div>}
    </div>
  </div>
);

const MiniBarChart = ({ data, color = '#2EABFE', isCurrency = false }) => {
  if (!data?.length) return <div style={{ color:'#7FA8C4', fontSize:12, padding:'20px 0', textAlign:'center' }}>No data available yet.</div>;
  const max = Math.max(...data.map(d => d.total), 1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:90, padding:'0 2px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
          <div title={isCurrency ? `$${fmt(d.total)}` : fmtInt(d.total)} style={{ width:'100%', borderRadius:'4px 4px 0 0', background:`linear-gradient(180deg,${color},${color}99)`, height:`${Math.max((d.total/max)*74,4)}px`, transition:'height .4s ease' }} />
          <span style={{ fontSize:9, color:'#7FA8C4', fontWeight:600, whiteSpace:'nowrap' }}>{MONTHS[(d._id?.month??1)-1]}</span>
        </div>
      ))}
    </div>
  );
};

const SectionHeader = ({ title, sub }) => (
  <div style={{ marginBottom:16 }}>
    <h2 style={{ fontSize:15, fontWeight:700, color:'#091925', margin:0 }}>{title}</h2>
    {sub && <p style={{ fontSize:12, color:'#7FA8C4', margin:'3px 0 0' }}>{sub}</p>}
  </div>
);

const Badge = ({ status }) => {
  const map = { paid:{bg:'rgba(16,185,129,0.1)',color:'#10b981',label:'Paid'}, completed:{bg:'rgba(16,185,129,0.1)',color:'#10b981',label:'Completed'}, pending:{bg:'rgba(251,191,36,0.12)',color:'#f59e0b',label:'Pending'}, cancelled:{bg:'rgba(239,68,68,0.1)',color:'#ef4444',label:'Cancelled'}, in_progress:{bg:'rgba(46,171,254,0.1)',color:'#2EABFE',label:'In Progress'}, not_started:{bg:'rgba(127,160,196,0.1)',color:'#7FA8C4',label:'Not Started'}, removed:{bg:'rgba(239,68,68,0.08)',color:'#ef4444',label:'Removed'} };
  const s = map[status] || { bg:'#f1f5f9', color:'#7FA8C4', label:status||'—' };
  return <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:99, background:s.bg, color:s.color, whiteSpace:'nowrap' }}>{s.label}</span>;
};

const ProgressRow = ({ label, value, total, color, icon: Icon }) => {
  const pct = total > 0 ? Math.round((value/total)*100) : 0;
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {Icon && <Icon size={13} color={color} />}
          <span style={{ fontSize:12, fontWeight:600, color:'#091925' }}>{label}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:12, fontWeight:700, color }}>{fmtInt(value)}</span>
          <span style={{ fontSize:10, color:'#7FA8C4' }}>({pct}%)</span>
        </div>
      </div>
      <div style={{ height:7, borderRadius:99, background:'#f1f5f9', overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', borderRadius:99, background:color, transition:'width .5s ease' }} />
      </div>
    </div>
  );
};

const EmptyRow = ({ cols, message }) => (
  <tr><td colSpan={cols} style={{ textAlign:'center', padding:'32px 16px', color:'#7FA8C4', fontSize:13 }}>
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}><AlertTriangle size={24} color="#e2e8f0" />{message}</div>
  </td></tr>
);

const TableWrapper = ({ headers, children }) => (
  <div style={{ overflowX:'auto' }}>
    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, minWidth:560 }}>
      <thead>
        <tr style={{ background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
          {headers.map(h => <th key={h} style={{ textAlign:'left', padding:'11px 16px', fontSize:11, fontWeight:600, color:'#7FA8C4', whiteSpace:'nowrap' }}>{h}</th>)}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

/* ─── Mini Calendar ──────────────────────────────────────────────── */
const MiniCalendar = ({ year, month, rangeStart, rangeEnd, hoverDate, onPickDay, onHoverDay, showPrev, showNext, onNavMonth }) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);
  const cells = [];

  DAYS_SHORT.forEach(d => cells.push(
    <div key={`lbl-${d}`} style={{ fontSize:10, color:'#7FA8C4', textAlign:'center', padding:'4px 0', fontWeight:600 }}>{d}</div>
  ));

  for (let i = 0; i < firstDay; i++)
    cells.push(<div key={`e-${i}`} />);

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const ts = date.getTime();
    const s  = rangeStart?.getTime();
    const e  = rangeEnd?.getTime();
    const h  = hoverDate?.getTime();

    const isStart    = s && ts === s;
    const isEnd      = e && ts === e;
    const inRange    = s && e && ts > s && ts < e;
    const inHover    = s && !e && h && ts > s && ts <= h;
    const isToday    = ts === today.getTime();
    const isFuture   = date > today;

    cells.push(
      <div
        key={d}
        onClick={() => !isFuture && onPickDay(date)}
        onMouseEnter={() => onHoverDay(isFuture ? null : date)}
        onMouseLeave={() => onHoverDay(null)}
        style={{
          fontSize:12, textAlign:'center', padding:'6px 2px', borderRadius:4,
          cursor: isFuture ? 'not-allowed' : 'pointer',
          fontWeight: isStart || isEnd ? 700 : isToday ? 600 : 400,
          background: isStart || isEnd ? '#2EABFE' : (inRange || inHover) ? '#2EABFE22' : 'transparent',
          color: isFuture ? '#c8d8e4' : isStart || isEnd ? '#fff' : (inRange || inHover) ? '#2EABFE' : '#091925',
          textDecoration: isToday && !isStart && !isEnd ? 'underline' : 'none',
          userSelect:'none',
          transition:'background .1s',
        }}
      >
        {d}
      </div>
    );
  }

  return (
    <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', padding:16, minWidth:230 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        {showPrev
          ? <button onClick={() => onNavMonth(-1)} style={{ border:'1px solid #e2e8f0', background:'#f8fafc', borderRadius:7, width:28, height:28, display:'grid', placeItems:'center', cursor:'pointer', color:'#5B7384', fontSize:16 }}>‹</button>
          : <span style={{ width:28 }} />}
        <span style={{ fontSize:13, fontWeight:700, color:'#091925' }}>{MONTHS_FULL[month]} {year}</span>
        {showNext
          ? <button onClick={() => onNavMonth(1)} style={{ border:'1px solid #e2e8f0', background:'#f8fafc', borderRadius:7, width:28, height:28, display:'grid', placeItems:'center', cursor:'pointer', color:'#5B7384', fontSize:16 }}>›</button>
          : <span style={{ width:28 }} />}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>{cells}</div>
    </div>
  );
};

/* ─── Date Range Report Tab ──────────────────────────────────────── */
const WeeklyReportTab = () => {
  const today = new Date(); today.setHours(0,0,0,0);

  const [rangeStart,  setRangeStart]  = useState(null);
  const [rangeEnd,    setRangeEnd]    = useState(null);
  const [hoverDate,   setHoverDate]   = useState(null);
  const [picking,     setPicking]     = useState('start'); // 'start' | 'end'
  const [viewYear,    setViewYear]    = useState(today.getFullYear());
  const [viewMonth,   setViewMonth]   = useState(today.getMonth() === 0 ? 0 : today.getMonth() - 1);

  const [rangeData,   setRangeData]   = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [pdfLoading,  setPdfLoading]  = useState(false);

  // Second calendar month
  const secondMonth = viewMonth === 11 ? 0  : viewMonth + 1;
  const secondYear  = viewMonth === 11 ? viewYear + 1 : viewYear;

  const navMonth = (dir) => {
    let m = viewMonth + dir, y = viewYear;
    if (m < 0)  { m = 11; y--; }
    if (m > 11) { m = 0;  y++; }
    setViewMonth(m); setViewYear(y);
  };

  const pickDay = (date) => {
    if (picking === 'start' || (rangeStart && rangeEnd)) {
      // Start fresh
      setRangeStart(date);
      setRangeEnd(null);
      setRangeData(null);
      setPicking('end');
    } else {
      // Second click = end
      if (date < rangeStart) {
        setRangeEnd(rangeStart);
        setRangeStart(date);
      } else {
        setRangeEnd(date);
      }
      setPicking('start');
    }
  };

  const fetchRange = useCallback(async (s, e) => {
    setLoading(true); setError(null);
    try {
      const res = await API.get(`/admin/reports/weekly?start=${toISO(s)}&end=${toISO(e)}`);
      setRangeData(res.data);
    } catch (err) {
      console.error('Range report error:', err);
      setError('Failed to load data for this range.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (rangeStart && rangeEnd) fetchRange(rangeStart, rangeEnd);
  }, [rangeStart, rangeEnd, fetchRange]);

  const handleDownload = () => {
    if (!rangeData || !rangeStart || !rangeEnd) return;
    setPdfLoading(true);
    setTimeout(() => { generateRangePDF(rangeData, rangeStart, rangeEnd); setPdfLoading(false); }, 100);
  };

  const handleClear = () => {
    setRangeStart(null); setRangeEnd(null);
    setRangeData(null); setPicking('start');
  };

  const dayCount = rangeStart && rangeEnd
    ? Math.round((rangeEnd - rangeStart) / 86400000) + 1
    : null;

  const canDownload = !!rangeData && !loading && !pdfLoading;

  return (
    <div>
      {/* ── Range Status Bar ── */}
      <div style={{ background:'#fff', borderRadius:14, padding:'14px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Calendar size={15} color="#2EABFE" />
          <span style={{ fontSize:13, fontWeight:700, color:'#091925' }}>
            {rangeStart
              ? <span style={{ color:'#091925' }}>{fmtDate(rangeStart)}</span>
              : <span style={{ color:'#7FA8C4' }}>Start date</span>}
            <span style={{ color:'#7FA8C4', margin:'0 6px' }}>→</span>
            {rangeEnd
              ? <span style={{ color:'#091925' }}>{fmtDate(rangeEnd)}</span>
              : <span style={{ color:'#7FA8C4' }}>End date</span>}
          </span>
          {dayCount && (
            <span style={{ fontSize:11, color:'#2EABFE', background:'#2EABFE18', borderRadius:99, padding:'2px 8px', fontWeight:600 }}>
              {dayCount} day{dayCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:11, fontWeight:600, color: picking === 'start' && !rangeStart ? '#f59e0b' : picking === 'end' ? '#2EABFE' : '#7FA8C4' }}>
            {!rangeStart ? '● Click a start date on the calendar' : picking === 'end' ? '● Now click an end date' : '● Range selected'}
          </span>
          {(rangeStart || rangeEnd) && (
            <button onClick={handleClear} style={{ fontSize:11, padding:'5px 10px', borderRadius:8, border:'1px solid #e2e8f0', background:'#f8fafc', color:'#5B7384', cursor:'pointer', fontFamily:"'Poppins',sans-serif" }}>
              Clear
            </button>
          )}
          <button
            onClick={handleDownload}
            disabled={!canDownload}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, border:'none', background: canDownload ? '#2EABFE' : '#e2e8f0', color: canDownload ? '#fff' : '#7FA8C4', fontWeight:700, fontSize:12, cursor: canDownload ? 'pointer' : 'not-allowed', fontFamily:"'Poppins',sans-serif", transition:'all .15s' }}
          >
            <Download size={13} />
            {pdfLoading ? 'Preparing…' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* ── Two-Month Calendar ── */}
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:20 }}>
        <MiniCalendar
          year={viewYear} month={viewMonth}
          rangeStart={rangeStart} rangeEnd={rangeEnd} hoverDate={hoverDate}
          onPickDay={pickDay} onHoverDay={setHoverDate}
          showPrev showNext={false} onNavMonth={navMonth}
        />
        <MiniCalendar
          year={secondYear} month={secondMonth}
          rangeStart={rangeStart} rangeEnd={rangeEnd} hoverDate={hoverDate}
          onPickDay={pickDay} onHoverDay={setHoverDate}
          showPrev={false} showNext onNavMonth={navMonth}
        />
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ padding:'48px 0', textAlign:'center', color:'#7FA8C4' }}>
          <div style={{ width:28, height:28, borderRadius:'50%', margin:'0 auto 10px', border:'3px solid #e2e8f0', borderTopColor:'#2EABFE', animation:'spin .8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Loading report data…
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div style={{ padding:'32px', textAlign:'center', color:'#ef4444', fontSize:13 }}>
          <AlertTriangle size={24} style={{ marginBottom:8 }} /><div>{error}</div>
        </div>
      )}

      {/* ── No range selected yet ── */}
      {!loading && !error && !rangeData && !rangeStart && (
        <div style={{ padding:'40px 0', textAlign:'center', color:'#7FA8C4', fontSize:13 }}>
          <Calendar size={32} color="#e2e8f0" style={{ marginBottom:10 }} />
          <div>Select a start and end date on the calendar above to generate a report.</div>
        </div>
      )}

      {/* ── Results ── */}
      {!loading && rangeData && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Summary Cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12 }}>
            <StatCard icon={DollarSign}   label="Revenue"       value={rangeData.weekRevenue}      color="#10b981" isCurrency sub={`${fmtInt(rangeData.paidCount)} paid orders`} />
            <StatCard icon={ShoppingCart} label="Orders"        value={rangeData.totalOrders}      color="#2EABFE" sub={`${fmtInt(rangeData.pendingCount)} pending`} />
            <StatCard icon={TrendingUp}   label="Enrollments"   value={rangeData.totalEnrollments} color="#8b5cf6" sub={`${fmtInt(rangeData.completedCount)} completed`} />
            <StatCard icon={Users}        label="New Students"  value={rangeData.newStudents}      color="#f59e0b" sub="Registered this period" />
          </div>

          {/* Top Courses */}
          <div style={{ background:'#fff', borderRadius:14, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <SectionHeader title="Top Courses" sub="By enrollment count for selected period" />
            <TableWrapper headers={['Course','Type','Enrolled','Completed','Rate']}>
              {(rangeData.topCourses||[]).length===0
                ? <EmptyRow cols={5} message="No enrollments in this period." />
                : (rangeData.topCourses||[]).map((c,i) => {
                    const rate = c.enrolled ? Math.round((c.completed/c.enrolled)*100) : 0;
                    return (
                      <tr key={i} style={{ borderBottom:'1px solid #f8fafc' }}
                        onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                      >
                        <td style={{ padding:'10px 16px', fontWeight:600, color:'#091925' }}>{c.title||'—'}</td>
                        <td style={{ padding:'10px 16px', color:'#7FA8C4', fontSize:12 }}>{c.type||'—'}</td>
                        <td style={{ padding:'10px 16px', fontWeight:700 }}>{c.enrolled}</td>
                        <td style={{ padding:'10px 16px', color:'#10b981', fontWeight:600 }}>{c.completed}</td>
                        <td style={{ padding:'10px 16px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ flex:1, height:6, borderRadius:99, background:'#f1f5f9', minWidth:60 }}><div style={{ width:`${rate}%`, height:'100%', borderRadius:99, background:'#10b981' }} /></div>
                            <span style={{ fontSize:11, fontWeight:700, color:'#091925', minWidth:32 }}>{rate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </TableWrapper>
          </div>

          {/* Orders */}
          <div style={{ background:'#fff', borderRadius:14, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9' }}>
              <SectionHeader title="Orders" sub={`${fmtInt((rangeData.orders||[]).length)} orders in selected period`} />
            </div>
            <TableWrapper headers={['Student','Courses','Amount','Status','Date']}>
              {(rangeData.orders||[]).length===0
                ? <EmptyRow cols={5} message="No orders in this period." />
                : (rangeData.orders||[]).map(o => (
                    <tr key={o._id} style={{ borderBottom:'1px solid #f8fafc' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    >
                      <td style={{ padding:'11px 16px' }}><div style={{ fontWeight:600, color:'#091925' }}>{o.user_id?.name||'—'}</div><div style={{ fontSize:11, color:'#7FA8C4' }}>{o.user_id?.email||''}</div></td>
                      <td style={{ padding:'11px 16px', color:'#7FA8C4', fontSize:12, maxWidth:180 }}><div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{(o.items||[]).map(i=>i.course_id?.title).filter(Boolean).join(', ')||'—'}</div></td>
                      <td style={{ padding:'11px 16px', fontWeight:700, color:'#091925', whiteSpace:'nowrap' }}>${fmt(o.total_amount||0)}</td>
                      <td style={{ padding:'11px 16px' }}><Badge status={o.status} /></td>
                      <td style={{ padding:'11px 16px', color:'#7FA8C4', fontSize:12, whiteSpace:'nowrap' }}>{new Date(o.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</td>
                    </tr>
                  ))}
            </TableWrapper>
          </div>

          {/* Enrollments */}
          <div style={{ background:'#fff', borderRadius:14, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9' }}>
              <SectionHeader title="Enrollments" sub={`${fmtInt((rangeData.enrollments||[]).length)} enrollments in selected period`} />
            </div>
            <TableWrapper headers={['Student','Course','Progress','Status','Date']}>
              {(rangeData.enrollments||[]).length===0
                ? <EmptyRow cols={5} message="No enrollments in this period." />
                : (rangeData.enrollments||[]).map(e => (
                    <tr key={e._id} style={{ borderBottom:'1px solid #f8fafc' }}
                      onMouseEnter={ev=>ev.currentTarget.style.background='#f8fafc'}
                      onMouseLeave={ev=>ev.currentTarget.style.background='transparent'}
                    >
                      <td style={{ padding:'11px 16px' }}><div style={{ fontWeight:600, color:'#091925' }}>{e.user_id?.name||'—'}</div><div style={{ fontSize:11, color:'#7FA8C4' }}>{e.user_id?.email||''}</div></td>
                      <td style={{ padding:'11px 16px' }}><div style={{ fontWeight:500, color:'#091925' }}>{e.course_id?.title||'—'}</div><div style={{ fontSize:11, color:'#7FA8C4' }}>{e.course_id?.type||''}</div></td>
                      <td style={{ padding:'11px 16px' }}><div style={{ display:'flex', alignItems:'center', gap:8 }}><div style={{ width:80, height:6, borderRadius:99, background:'#f1f5f9' }}><div style={{ width:`${e.progress||0}%`, height:'100%', borderRadius:99, background:'#2EABFE' }} /></div><span style={{ fontSize:11, fontWeight:700, color:'#091925' }}>{e.progress||0}%</span></div></td>
                      <td style={{ padding:'11px 16px' }}><Badge status={e.status} /></td>
                      <td style={{ padding:'11px 16px', color:'#7FA8C4', fontSize:12, whiteSpace:'nowrap' }}>{new Date(e.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</td>
                    </tr>
                  ))}
            </TableWrapper>
          </div>

        </div>
      )}
    </div>
  );
};

/* ─── AdminReports ───────────────────────────────────────────────── */
const AdminReports = () => {
  const [stats,             setStats]             = useState(null);
  const [recentOrders,      setRecentOrders]      = useState([]);
  const [topCourses,        setTopCourses]        = useState([]);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState(null);
  const [tab,               setTab]               = useState('overview');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [statsRes, ordersRes, coursesRes, enrollRes] = await Promise.all([
        API.get('/admin/reports/stats'),
        API.get('/admin/reports/recent-orders'),
        API.get('/admin/reports/top-courses'),
        API.get('/admin/reports/recent-enrollments'),
      ]);
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.orders||[]);
      setTopCourses(coursesRes.data.courses||[]);
      setRecentEnrollments(enrollRes.data.enrollments||[]);
    } catch (err) {
      console.error('Reports load error:', err);
      setError('Failed to load report data. Please try again.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div style={{ padding:'60px 0', textAlign:'center', color:'#7FA8C4', fontFamily:"'Poppins',sans-serif" }}>
      <div style={{ width:32, height:32, borderRadius:'50%', margin:'0 auto 12px', border:'3px solid #e2e8f0', borderTopColor:'#2EABFE', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Loading reports…
    </div>
  );

  if (error) return (
    <div style={{ padding:'40px 0', textAlign:'center', fontFamily:"'Poppins',sans-serif" }}>
      <AlertTriangle size={32} color="#ef4444" style={{ marginBottom:12 }} />
      <p style={{ color:'#ef4444', marginBottom:16 }}>{error}</p>
      <button onClick={load} style={{ padding:'10px 20px', borderRadius:10, border:'none', background:'#2EABFE', color:'#fff', fontWeight:600, cursor:'pointer', fontFamily:"'Poppins',sans-serif", display:'inline-flex', alignItems:'center', gap:8 }}>
        <RefreshCw size={14} /> Retry
      </button>
    </div>
  );

  const completionRate = stats?.totalEnrollments ? Math.round((stats.completedEnrollments/stats.totalEnrollments)*100) : 0;

  return (
    <div style={{ padding:'28px 0', fontFamily:"'Poppins',sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom:28, display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <BarChart2 size={22} color="#2EABFE" />
            <h1 style={{ fontSize:26, fontWeight:800, color:'#091925', margin:0 }}>Reports</h1>
          </div>
          <p style={{ fontSize:13, color:'#5B7384', margin:0 }}>Platform-wide analytics and activity overview.</p>
          <div style={{ height:2, background:'linear-gradient(90deg,#2EABFE,transparent)', borderRadius:99, marginTop:12, width:200 }} />
        </div>
        {tab !== 'custom' && (
          <button onClick={load} style={{ padding:'9px 14px', borderRadius:10, border:'1px solid #e2e8f0', background:'#fff', color:'#5B7384', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600, fontFamily:"'Poppins',sans-serif" }}>
            <RefreshCw size={13} /> Refresh
          </button>
        )}
      </div>

      {/* Stat Cards */}
      {tab !== 'custom' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14, marginBottom:28 }}>
          <StatCard icon={DollarSign}   label="Total Revenue"     value={stats?.totalRevenue??0}           color="#10b981" isCurrency sub={`Avg/order: $${fmt(stats?.avgOrderValue??0)}`} />
          <StatCard icon={ShoppingCart} label="Total Orders"      value={stats?.totalOrders??0}            color="#2EABFE" sub={`${fmtInt(stats?.paidOrders??0)} paid · ${fmtInt(stats?.pendingOrders??0)} pending`} />
          <StatCard icon={Users}        label="Total Students"    value={stats?.totalStudents??0}          color="#8b5cf6" sub={`${fmtInt(stats?.activeStudents??0)} active`} />
          <StatCard icon={BookOpen}     label="Total Courses"     value={stats?.totalCourses??0}           color="#f59e0b" sub={`${fmtInt(stats?.activeCourses??0)} active`} />
          <StatCard icon={TrendingUp}   label="Total Enrollments" value={stats?.totalEnrollments??0}       color="#2EABFE" sub={`${fmtInt(stats?.inProgressEnrollments??0)} in progress`} />
          <StatCard icon={Award}        label="Completions"       value={stats?.completedEnrollments??0}   color="#10b981" sub={`${completionRate}% completion rate`} />
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:24, background:'#f8fafc', borderRadius:12, padding:4, width:'fit-content' }}>
        {[
          { key:'overview',    label:'Overview'        },
          { key:'orders',      label:'Orders'          },
          { key:'enrollments', label:'Enrollments'     },
          { key:'custom',      label:'Custom Report'   },
        ].map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)} style={{
            padding:'8px 18px', borderRadius:9, border:'none',
            background: tab===t.key ? (t.key==='custom'?'#2EABFE':'#fff') : 'transparent',
            color: tab===t.key ? (t.key==='custom'?'#fff':'#091925') : '#7FA8C4',
            fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:"'Poppins',sans-serif",
            boxShadow: tab===t.key?'0 1px 4px rgba(0,0,0,0.08)':'none',
            transition:'all .15s', display:'flex', alignItems:'center', gap:6,
          }}>
            {t.key==='custom' && <Download size={12} />}{t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab==='overview' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div style={{ background:'#fff', borderRadius:16, padding:22, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <SectionHeader title="Monthly Revenue" sub="Last 12 months" />
            <MiniBarChart data={stats?.revenueByMonth} color="#2EABFE" isCurrency />
            <div style={{ marginTop:12, display:'flex', justifyContent:'space-between', fontSize:11, color:'#7FA8C4', flexWrap:'wrap', gap:8 }}>
              <span>Avg / month: <strong style={{ color:'#091925' }}>${fmt(stats?.avgMonthlyRevenue??0)}</strong></span>
              <span>Peak: <strong style={{ color:'#091925' }}>${fmt(stats?.peakMonthRevenue??0)}</strong></span>
            </div>
          </div>
          <div style={{ background:'#fff', borderRadius:16, padding:22, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <SectionHeader title="Monthly Enrollments" sub="Last 12 months" />
            <MiniBarChart data={stats?.enrollmentsByMonth} color="#8b5cf6" />
          </div>
          <div style={{ background:'#fff', borderRadius:16, padding:22, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', gridColumn:'span 2' }}>
            <SectionHeader title="Top Courses by Enrollment" sub="10 most enrolled courses" />
            <TableWrapper headers={['Course','Type','Students','Completions','Completion Rate']}>
              {topCourses.length===0 ? <EmptyRow cols={5} message="No course data yet." />
                : topCourses.map((c,i) => {
                    const rate = c.enrolled ? Math.round((c.completed/c.enrolled)*100) : 0;
                    return (
                      <tr key={i} style={{ borderBottom:'1px solid #f8fafc' }}
                        onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                      >
                        <td style={{ padding:'11px 16px' }}><div style={{ fontWeight:600, color:'#091925' }}>{c.title||'—'}</div><div style={{ fontSize:11, color:'#7FA8C4' }}>{c.nmls_course_id}</div></td>
                        <td style={{ padding:'11px 16px', color:'#7FA8C4', fontSize:12 }}>{c.type||'—'}</td>
                        <td style={{ padding:'11px 16px', fontWeight:700, color:'#091925' }}>{fmtInt(c.enrolled)}</td>
                        <td style={{ padding:'11px 16px', color:'#10b981', fontWeight:600 }}>{fmtInt(c.completed)}</td>
                        <td style={{ padding:'11px 16px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ flex:1, height:6, borderRadius:99, background:'#f1f5f9', minWidth:60 }}><div style={{ width:`${rate}%`, height:'100%', borderRadius:99, background:'#10b981' }} /></div>
                            <span style={{ fontSize:11, fontWeight:700, color:'#091925', minWidth:32 }}>{rate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </TableWrapper>
          </div>
          <div style={{ background:'#fff', borderRadius:16, padding:22, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <SectionHeader title="Order Status Breakdown" sub={`${fmtInt(stats?.totalOrders??0)} total orders`} />
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <ProgressRow label="Paid / Completed" value={stats?.paidOrders??0}      total={stats?.totalOrders??0} color="#10b981" icon={CheckCircle} />
              <ProgressRow label="Pending"          value={stats?.pendingOrders??0}   total={stats?.totalOrders??0} color="#f59e0b" icon={Clock}       />
              <ProgressRow label="Cancelled"        value={stats?.cancelledOrders??0} total={stats?.totalOrders??0} color="#ef4444" icon={XCircle}     />
            </div>
          </div>
          <div style={{ background:'#fff', borderRadius:16, padding:22, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <SectionHeader title="Enrollment Status Breakdown" sub={`${fmtInt(stats?.totalEnrollments??0)} total enrollments`} />
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <ProgressRow label="Completed"   value={stats?.completedEnrollments??0}  total={stats?.totalEnrollments??0} color="#10b981" />
              <ProgressRow label="In Progress" value={stats?.inProgressEnrollments??0} total={stats?.totalEnrollments??0} color="#2EABFE" />
              <ProgressRow label="Not Started" value={stats?.notStartedEnrollments??0} total={stats?.totalEnrollments??0} color="#7FA8C4" />
            </div>
          </div>
        </div>
      )}

      {/* Orders */}
      {tab==='orders' && (
        <div style={{ background:'#fff', borderRadius:14, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>
          <div style={{ padding:'18px 20px', borderBottom:'1px solid #f1f5f9' }}><SectionHeader title="Recent Orders" sub="Last 20 orders on the platform" /></div>
          <TableWrapper headers={['Student','Courses','Amount','Status','Date']}>
            {recentOrders.length===0 ? <EmptyRow cols={5} message="No orders found." />
              : recentOrders.map(o => (
                  <tr key={o._id} style={{ borderBottom:'1px solid #f8fafc' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  >
                    <td style={{ padding:'12px 16px' }}><div style={{ fontWeight:600, color:'#091925' }}>{o.user_id?.name||'—'}</div><div style={{ fontSize:11, color:'#7FA8C4' }}>{o.user_id?.email||'—'}</div></td>
                    <td style={{ padding:'12px 16px', color:'#7FA8C4', fontSize:12, maxWidth:200 }}><div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{(o.items||[]).map(i=>i.course_id?.title).filter(Boolean).join(', ')||'—'}</div></td>
                    <td style={{ padding:'12px 16px', fontWeight:700, color:'#091925', whiteSpace:'nowrap' }}>${fmt(o.total_amount??o.amount??0)}</td>
                    <td style={{ padding:'12px 16px' }}><Badge status={o.status} /></td>
                    <td style={{ padding:'12px 16px', color:'#7FA8C4', fontSize:12, whiteSpace:'nowrap' }}>{o.createdAt?new Date(o.createdAt).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}):'—'}</td>
                  </tr>
                ))}
          </TableWrapper>
        </div>
      )}

      {/* Enrollments */}
      {tab==='enrollments' && (
        <div style={{ background:'#fff', borderRadius:14, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>
          <div style={{ padding:'18px 20px', borderBottom:'1px solid #f1f5f9' }}><SectionHeader title="Recent Enrollments" sub="Last 20 enrollments on the platform" /></div>
          <TableWrapper headers={['Student','Course','Progress','Status','Enrolled Date']}>
            {recentEnrollments.length===0 ? <EmptyRow cols={5} message="No enrollments found." />
              : recentEnrollments.map(e => (
                  <tr key={e._id} style={{ borderBottom:'1px solid #f8fafc' }}
                    onMouseEnter={ev=>ev.currentTarget.style.background='#f8fafc'}
                    onMouseLeave={ev=>ev.currentTarget.style.background='transparent'}
                  >
                    <td style={{ padding:'12px 16px' }}><div style={{ fontWeight:600, color:'#091925' }}>{e.user_id?.name||'—'}</div><div style={{ fontSize:11, color:'#7FA8C4' }}>{e.user_id?.email||'—'}</div></td>
                    <td style={{ padding:'12px 16px' }}><div style={{ fontWeight:500, color:'#091925' }}>{e.course_id?.title||'—'}</div><div style={{ fontSize:11, color:'#7FA8C4' }}>{e.course_id?.type||''}</div></td>
                    <td style={{ padding:'12px 16px' }}><div style={{ display:'flex', alignItems:'center', gap:8 }}><div style={{ width:80, height:6, borderRadius:99, background:'#f1f5f9' }}><div style={{ width:`${e.progress??0}%`, height:'100%', borderRadius:99, background:'#2EABFE' }} /></div><span style={{ fontSize:11, fontWeight:700, color:'#091925' }}>{e.progress??0}%</span></div></td>
                    <td style={{ padding:'12px 16px' }}><Badge status={e.status} /></td>
                    <td style={{ padding:'12px 16px', color:'#7FA8C4', fontSize:12, whiteSpace:'nowrap' }}>{e.createdAt?new Date(e.createdAt).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}):'—'}</td>
                  </tr>
                ))}
          </TableWrapper>
        </div>
      )}

      {/* Custom Date Range Report */}
      {tab==='custom' && <WeeklyReportTab />}
    </div>
  );
};

export default AdminReports;