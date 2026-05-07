"use client";

import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
  Download, Plus, Info, ArrowRight, X, Check, AlertTriangle,
  ChevronLeft, Search, Filter, Eye, Edit2, Trash2, FileText,
  User, Calendar, DollarSign, Hash, Building, Phone, Mail,
  CheckCircle, Clock, XCircle, ChevronDown, Printer, RefreshCw
} from "lucide-react";
import './TDS.css';

/* ─────────────── Types ─────────────── */
type Page = 'dashboard' | 'new-entry' | 'challans' | 'register' | 'certificate' | 'payee-master' | 'report';

interface TDSEntry {
  id: string; payee: string; pan: string; type: string;
  gross: number; rate: number; tds: number; net: number;
  date: string; status: 'pending' | 'deposited' | 'overdue';
}
interface Challan {
  id: string; challanNo: string; bank: string; bsr: string;
  amount: number; depositDate: string; period: string;
  status: 'pending' | 'deposited' | 'overdue'; revenueCode: string;
}
interface Payee {
  id: string; name: string; pan: string; type: string;
  phone: string; email: string; threshold: number; category: string;
}

/* ─────────────── Corrected IRD Nepal TDS Rates (FY 2081-82) ─────────────── */
// Source: Income Tax Act 2058 | Finance Act 2081 | Baker Tilly Tax Fact 2081/82
const tdsRates = [
  { rate: "1%",   desc: "Salary — Social Security Tax (SST)",       threshold: "Individual ≤ NPR 5,00,000 | Couple ≤ NPR 6,00,000", revenueCode: "11211", final: false },
  { rate: "Slab", desc: "Salary — Remuneration Income Tax",          threshold: "10%/20%/30%/36%/39% progressive above SST band",     revenueCode: "11111", final: false },
  { rate: "10%",  desc: "Rent — Buildings & Land",                   threshold: "No minimum threshold (Final WHT)",                   revenueCode: "11131", final: true  },
  { rate: "10%",  desc: "Rent — Aircraft / Satellite / Telecom",     threshold: "No minimum threshold (Final WHT)",                   revenueCode: "11131", final: true  },
  { rate: "1.5%", desc: "Rent — Carriage / Vehicle (VAT registered)","threshold": "No minimum threshold",                             revenueCode: "11131", final: false },
  { rate: "2.5%", desc: "Rent — Carriage / Vehicle (unregistered)",  threshold: "No minimum threshold",                               revenueCode: "11131", final: false },
  { rate: "15%",  desc: "Consultancy / Professional Service Fee",    threshold: "No minimum threshold",                               revenueCode: "11131", final: false },
  { rate: "15%",  desc: "Royalty (general)",                         threshold: "No minimum threshold",                               revenueCode: "11131", final: false },
  { rate: "1.5%", desc: "Royalty — Literature writing",              threshold: "No minimum threshold",                               revenueCode: "11131", final: false },
  { rate: "1.5%", desc: "Contract / Service payments",              threshold: "Applies above NPR 50,000 per payment",               revenueCode: "11131", final: false },
  { rate: "5%",   desc: "Interest on bank / FI deposits",           threshold: "Final withholding tax",                             revenueCode: "11131", final: true  },
  { rate: "5%",   desc: "Dividend from resident entities",          threshold: "Final withholding tax",                             revenueCode: "11131", final: true  },
  { rate: "15%",  desc: "Meeting allowance / Occasional lecture",   threshold: "Final withholding tax",                             revenueCode: "11131", final: true  },
];

const rateMap: Record<string, number> = {
  'Salary (SST 1%)':          1,
  'Salary (Remuneration Tax)': 10, 
  'Rent (Building/Land)':     10,
  'Rent — Vehicle (VAT reg.)': 1.5,
  'Rent — Vehicle (unreg.)':   2.5,
  'Consultancy/Service Fee':  15,
  'Royalty (general)':        15,
  'Royalty (literature)':      1.5,
  'Contract Payment':          1.5,
  'Interest on Deposit':       5,
  'Dividend':                  5,
  'Meeting Allowance':        15,
};

// Revenue code map
const revenueCodeMap: Record<string, string> = {
  'Salary (SST 1%)':           '11211',
  'Salary (Remuneration Tax)': '11111',
  'Rent (Building/Land)':      '11131',
  'Rent — Vehicle (VAT reg.)': '11131',
  'Rent — Vehicle (unreg.)':   '11131',
  'Consultancy/Service Fee':   '11131',
  'Royalty (general)':         '11131',
  'Royalty (literature)':      '11131',
  'Contract Payment':          '11131',
  'Interest on Deposit':       '11131',
  'Dividend':                  '11131',
  'Meeting Allowance':         '11131',
};

/* ─────────────── Mock Data (corrected rates) ─────────────── */
const mockEntries: TDSEntry[] = [
  { id:'1', payee:'Ram Prasad Sharma',  pan:'ABCPS1234D', type:'Salary (SST 1%)',      gross:85000,  rate:1,  tds:850,   net:84150,  date:'2081-12-01', status:'deposited' },
  { id:'2', payee:'Sunrise Consultancy',pan:'XYZSC5678E', type:'Consultancy/Service Fee', gross:50000,  rate:15, tds:7500,  net:42500,  date:'2081-12-05', status:'pending'   },
  { id:'3', payee:'Metro Properties',   pan:'METPP9012F', type:'Rent (Building/Land)', gross:30000,  rate:10, tds:3000,  net:27000,  date:'2081-12-10', status:'overdue'   },
  { id:'4', payee:'Sita Devi Thapa',    pan:'SDTPS3456G', type:'Salary (SST 1%)',      gross:65000,  rate:1,  tds:650,   net:64350,  date:'2081-12-15', status:'deposited' },
  { id:'5', payee:'Tech Solutions Pvt', pan:'TSPVT7890H', type:'Consultancy/Service Fee', gross:120000, rate:15, tds:18000, net:102000, date:'2081-12-20', status:'pending'   },
];

const mockChallans: Challan[] = [
  { id:'1', challanNo:'CHN-2081-001', bank:'Nepal Bank Ltd',        bsr:'NBL001234', amount:12500, depositDate:'2081-11-25', period:'Mangsir 2081', status:'deposited', revenueCode:'11131' },
  { id:'2', challanNo:'CHN-2081-002', bank:'Rastriya Banijya Bank', bsr:'RBB005678', amount:8750,  depositDate:'2081-12-25', period:'Poush 2081',   status:'pending',   revenueCode:'11211' },
  { id:'3', challanNo:'CHN-2081-003', bank:'Nepal Bank Ltd',        bsr:'NBL009012', amount:5200,  depositDate:'2081-10-25', period:'Kartik 2081',  status:'deposited', revenueCode:'11131' },
  { id:'4', challanNo:'CHN-2081-004', bank:'Agricultural Dev Bank', bsr:'ADB003456', amount:15300, depositDate:'2081-09-25', period:'Ashwin 2081',  status:'overdue',   revenueCode:'11111' },
];

const mockPayees: Payee[] = [
  { id:'1', name:'Ram Prasad Sharma',  pan:'ABCPS1234D', type:'Employee', phone:'9841234567', email:'ram@school.edu.np',   threshold:500000, category:'Salary (SST 1%)' },
  { id:'2', name:'Sunrise Consultancy',pan:'XYZSC5678E', type:'Vendor',   phone:'9851234567', email:'info@sunrise.com.np', threshold:0,      category:'Consultancy/Service Fee' },
  { id:'3', name:'Metro Properties',   pan:'METPP9012F', type:'Vendor',   phone:'9861234567', email:'metro@property.np',   threshold:0,      category:'Rent (Building/Land)' },
  { id:'4', name:'Sita Devi Thapa',    pan:'SDTPS3456G', type:'Employee', phone:'9871234567', email:'sita@school.edu.np',  threshold:500000, category:'Salary (SST 1%)' },
];

/* ─────────────── Helpers ─────────────── */
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
    deposited: { cls:'badge-green',  icon:<CheckCircle size={11}/>, label:'Deposited' },
    pending:   { cls:'badge-yellow', icon:<Clock size={11}/>,       label:'Pending'   },
    overdue:   { cls:'badge-red',    icon:<XCircle size={11}/>,     label:'Overdue'   },
  };
  const s = map[status] ?? map.pending;
  return <span className={`tds-badge ${s.cls}`}>{s.icon}{s.label}</span>;
};

/* ── Sidebar nav config ── */
const NAV_ITEMS: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard',    label: 'Overview',          icon: <Info size={15}/> },
  { page: 'new-entry',    label: 'New TDS Entry',     icon: <Plus size={15}/> },
  { page: 'register',     label: 'TDS Register',      icon: <FileText size={15}/> },
  { page: 'challans',     label: 'Manage Challans',   icon: <Building size={15}/> },
  { page: 'certificate',  label: 'Certificates',      icon: <CheckCircle size={15}/> },
  { page: 'payee-master', label: 'Payee Master',      icon: <User size={15}/> },
  { page: 'report',       label: 'Generate Report',   icon: <Download size={15}/> },
];


/* ── New TDS Entry ── */
const NewEntryPage = () => {
  const [form, setForm] = useState({ payee:'', pan:'', type:'Salary (SST 1%)', gross:'', date:'', narration:'' });
  const [saved, setSaved] = useState(false);

  const rate = rateMap[form.type] ?? 0;
  const revenueCode = revenueCodeMap[form.type] ?? '11131';
  const gross = parseFloat(form.gross) || 0;
  const tds = +(gross * rate / 100).toFixed(2);
  const net = +(gross - tds).toFixed(2);
  const isSlab = form.type === 'Salary (Remuneration Tax)';

  const handleSave = () => { setSaved(true); setTimeout(() => { setSaved(false); }, 1500); };

  return (
    <div className="tds-subpage">
      <div className="tds-subpage-header">
        <div>
          <h2 className="tds-subpage-title">New TDS Entry</h2>
          <p className="tds-subpage-sub">Record a new tax deduction at source</p>
        </div>
      </div>

      {/* IRD Note */}
      <div className="tds-ird-note">
        <Info size={14}/>
        <span>TDS must be deposited to IRD within <strong>25 days</strong> of month-end. Late filing penalty: <strong>NPR 100/day</strong>. Use eTDS at <strong>ird.gov.np</strong>.</span>
      </div>

      <div className="tds-entry-grid">
        {/* Form */}
        <div className="tds-card tds-entry-form">
          <h3 className="tds-section-title">Entry Details</h3>
          <div className="tds-form-grid">
            <div className="tds-field">
              <label>Payee Name *</label>
              <div className="tds-input-wrap"><User size={14}/><input placeholder="Select or type payee" value={form.payee} onChange={e=>setForm({...form,payee:e.target.value})}/></div>
            </div>
            <div className="tds-field">
              <label>PAN Number *</label>
              <div className="tds-input-wrap"><Hash size={14}/><input placeholder="9-digit PAN (e.g. 123456789)" value={form.pan} onChange={e=>setForm({...form,pan:e.target.value})}/></div>
            </div>
            <div className="tds-field">
              <label>Payment Type *</label>
              <div className="tds-input-wrap"><ChevronDown size={14}/>
                <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                  {Object.keys(rateMap).map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="tds-field">
              <label>Date *</label>
              <div className="tds-input-wrap"><Calendar size={14}/><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
            </div>
            <div className="tds-field tds-field-full">
              <label>Gross Amount (NPR) *</label>
              <div className="tds-input-wrap"><DollarSign size={14}/><input type="number" placeholder="0.00" value={form.gross} onChange={e=>setForm({...form,gross:e.target.value})}/></div>
            </div>
            {form.type === 'Contract Payment' && (
              <div className="tds-field tds-field-full">
                <div className="tds-inline-alert tds-alert-yellow">
                  <AlertTriangle size={13}/> Contract TDS (1.5%) applies only to payments exceeding NPR 50,000 per transaction (Sec. 89, ITA 2058).
                </div>
              </div>
            )}
            {isSlab && (
              <div className="tds-field tds-field-full">
                <div className="tds-inline-alert tds-alert-blue">
                  <Info size={13}/> Remuneration tax is slab-based. The 10% shown is indicative — use actual tax computation per employee. Refer to IRD salary tax slabs.
                </div>
              </div>
            )}
            <div className="tds-field">
              <label>IRD Revenue Code</label>
              <div className="tds-input-wrap tds-input-readonly"><Hash size={14}/><input readOnly value={revenueCode}/></div>
              <span className="tds-field-hint">Auto-assigned per payment type</span>
            </div>
            <div className="tds-field tds-field-full">
              <label>Narration</label>
              <textarea rows={2} placeholder="Optional description..." value={form.narration} onChange={e=>setForm({...form,narration:e.target.value})} className="tds-textarea"/>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="tds-entry-summary-col">
          <div className="tds-card">
            <h3 className="tds-section-title">TDS Calculation</h3>
            <div className="tds-calc-rows">
              <div className="tds-calc-row"><span>Gross Amount</span><span>NPR {gross.toLocaleString()}</span></div>
              <div className="tds-calc-row tds-calc-rate"><span>TDS Rate</span><span className="rate-chip">{isSlab ? 'Slab' : `${rate}%`}</span></div>
              <div className="tds-calc-row"><span>Revenue Code</span><span className="tds-mono">{revenueCode}</span></div>
              <div className="tds-calc-row tds-calc-tds"><span>TDS Deducted</span><span className="tds-red">− NPR {tds.toLocaleString()}</span></div>
              <div className="tds-calc-divider"/>
              <div className="tds-calc-row tds-calc-net"><span>Net Payable</span><span className="tds-green">NPR {net.toLocaleString()}</span></div>
            </div>
          </div>

          <div className="tds-card tds-rate-ref">
            <h3 className="tds-section-title">Rate Reference (IRD 2081-82)</h3>
            <div className="tds-rate-ref-scroll">
              {tdsRates.slice(0,7).map((r,i)=>(
                <div key={i} className={`tds-ref-row ${form.type.toLowerCase().includes(r.desc.split('—')[0].toLowerCase().trim()) ? 'tds-ref-active':''}`}>
                  <span className="ref-rate">{r.rate}</span>
                  <div>
                    <p className="ref-desc">{r.desc}</p>
                    <p className="ref-thresh">{r.threshold}</p>
                    <p className="ref-code">Code: {r.revenueCode}{r.final ? ' · Final WHT' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="tds-entry-actions">
        <button className="tds-btn-ghost">Cancel</button>
        <button className="tds-btn-primary" onClick={handleSave}>
          {saved ? <><Check size={14}/> Saved!</> : <><Plus size={14}/> Save Entry</>}
        </button>
      </div>
    </div>
  );
};

/* ── Challan Management ── */
const ChallansPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ challanNo:'', bank:'', bsr:'', amount:'', period:'', depositDate:'', revenueCode:'11131' });

  const filtered = mockChallans.filter(c=>
    c.challanNo.toLowerCase().includes(search.toLowerCase()) ||
    c.bank.toLowerCase().includes(search.toLowerCase())
  );

  const IRD_BANKS = ['Nepal Bank Ltd','Rastriya Banijya Bank','Agricultural Development Bank','Nabil Bank','NIC Asia Bank','Global IME Bank','Everest Bank'];

  return (
    <div className="tds-subpage">
      <div className="tds-subpage-header">
        <div>
          <h2 className="tds-subpage-title">Challan Management</h2>
          <p className="tds-subpage-sub">Track and manage TDS deposit challans — due by 25th of each month</p>
        </div>
        <button className="tds-btn-primary" onClick={()=>setShowForm(!showForm)}><Plus size={14}/> New Challan</button>
      </div>

      <div className="tds-ird-note">
        <Info size={14}/>
        <span>Deposit TDS via IRD Taxpayer Portal (ird.gov.np) or at an IRD-approved bank. Revenue Codes: <strong>11211</strong> (SST) · <strong>11111</strong> (Remuneration Tax) · <strong>11131</strong> (Service/Rent/Contract)</span>
      </div>

      <div className="tds-challan-pills">
        <div className="pill pill-blue"><span>Total Challans</span><strong>{mockChallans.length}</strong></div>
        <div className="pill pill-green"><span>Deposited</span><strong>{mockChallans.filter(c=>c.status==='deposited').length}</strong></div>
        <div className="pill pill-yellow"><span>Pending</span><strong>{mockChallans.filter(c=>c.status==='pending').length}</strong></div>
        <div className="pill pill-red"><span>Overdue</span><strong>{mockChallans.filter(c=>c.status==='overdue').length}</strong></div>
      </div>

      {showForm && (
        <div className="tds-card tds-inline-form">
          <div className="tds-inline-form-header">
            <h3 className="tds-section-title">Add New Challan</h3>
            <button className="tds-icon-btn" onClick={()=>setShowForm(false)}><X size={16}/></button>
          </div>
          <div className="tds-form-grid">
            <div className="tds-field"><label>Challan Number</label><div className="tds-input-wrap"><Hash size={14}/><input placeholder="CHN-2081-005" value={form.challanNo} onChange={e=>setForm({...form,challanNo:e.target.value})}/></div></div>
            <div className="tds-field">
              <label>Bank Name (IRD-approved)</label>
              <div className="tds-input-wrap"><Building size={14}/>
                <select value={form.bank} onChange={e=>setForm({...form,bank:e.target.value})}>
                  <option value="">Select bank...</option>
                  {IRD_BANKS.map(b=><option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="tds-field"><label>BSR Code</label><div className="tds-input-wrap"><Hash size={14}/><input placeholder="Bank BSR Code" value={form.bsr} onChange={e=>setForm({...form,bsr:e.target.value})}/></div></div>
            <div className="tds-field"><label>Amount (NPR)</label><div className="tds-input-wrap"><DollarSign size={14}/><input type="number" placeholder="0" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></div></div>
            <div className="tds-field"><label>Period (Nepali Month)</label><div className="tds-input-wrap"><Calendar size={14}/>
              <select value={form.period} onChange={e=>setForm({...form,period:e.target.value})}>
                <option value="">Select month...</option>
                {['Shrawan 2081','Bhadra 2081','Ashwin 2081','Kartik 2081','Mangsir 2081','Poush 2081','Magh 2081','Falgun 2081','Chaitra 2081','Baishak 2082','Jestha 2082','Ashadh 2082'].map(m=><option key={m}>{m}</option>)}
              </select>
            </div></div>
            <div className="tds-field"><label>Deposit Date</label><div className="tds-input-wrap"><Calendar size={14}/><input type="date" value={form.depositDate} onChange={e=>setForm({...form,depositDate:e.target.value})}/></div></div>
            <div className="tds-field">
              <label>IRD Revenue Code (Shirshak)</label>
              <div className="tds-input-wrap"><Hash size={14}/>
                <select value={form.revenueCode} onChange={e=>setForm({...form,revenueCode:e.target.value})}>
                  <option value="11211">11211 — Social Security Tax (SST 1%)</option>
                  <option value="11111">11111 — Remuneration Income Tax</option>
                  <option value="11131">11131 — Service Fee / Rent / Contract / Royalty</option>
                </select>
              </div>
            </div>
          </div>
          <div className="tds-inline-form-footer">
            <button className="tds-btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="tds-btn-primary" onClick={()=>setShowForm(false)}><Check size={14}/> Save Challan</button>
          </div>
        </div>
      )}

      <div className="tds-search-bar">
        <div className="tds-input-wrap tds-search-input"><Search size={14}/><input placeholder="Search challans..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
      </div>

      <div className="tds-card tds-table-card">
        <div className="tds-table-wrap">
          <table className="tds-table">
            <thead><tr><th>Challan No.</th><th>Bank</th><th>BSR Code</th><th>Revenue Code</th><th>Period</th><th>Amount</th><th>Deposit Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(c=>(
                <tr key={c.id}>
                  <td><span className="tds-mono">{c.challanNo}</span></td>
                  <td>{c.bank}</td>
                  <td><span className="tds-mono">{c.bsr}</span></td>
                  <td><span className="code-chip">{c.revenueCode}</span></td>
                  <td>{c.period}</td>
                  <td><strong>NPR {c.amount.toLocaleString()}</strong></td>
                  <td>{c.depositDate}</td>
                  <td><StatusBadge status={c.status}/></td>
                  <td><div className="tds-row-actions">
                    <button className="tds-icon-btn" title="View"><Eye size={14}/></button>
                    <button className="tds-icon-btn" title="Edit"><Edit2 size={14}/></button>
                    <button className="tds-icon-btn tds-icon-red" title="Delete"><Trash2 size={14}/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ── TDS Register ── */
const RegisterPage = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const filtered = mockEntries.filter(e=>{
    const matchSearch = e.payee.toLowerCase().includes(search.toLowerCase()) || e.pan.toLowerCase().includes(search.toLowerCase());
    const matchType   = filterType==='All' || e.type===filterType;
    const matchStatus = filterStatus==='All' || e.status===filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const totalTDS   = filtered.reduce((s,e)=>s+e.tds,0);
  const totalGross = filtered.reduce((s,e)=>s+e.gross,0);

  return (
    <div className="tds-subpage">
      <div className="tds-subpage-header">
        <div>
          <h2 className="tds-subpage-title">TDS Register</h2>
          <p className="tds-subpage-sub">Monthly ledger of all TDS deductions — FY 2081-82</p>
        </div>
        <div className="tds-header-actions">
          <button className="tds-btn-ghost"><Printer size={14}/> Print</button>
          <button className="tds-btn-secondary"><Download size={14}/> Export</button>
        </div>
      </div>

      <div className="tds-register-summary">
        <div className="tds-card reg-sum-card"><p>Total Gross</p><h3>NPR {totalGross.toLocaleString()}</h3></div>
        <div className="tds-card reg-sum-card"><p>Total TDS</p><h3 className="tds-red">NPR {totalTDS.toLocaleString()}</h3></div>
        <div className="tds-card reg-sum-card"><p>Total Net</p><h3 className="tds-green">NPR {(totalGross-totalTDS).toLocaleString()}</h3></div>
        <div className="tds-card reg-sum-card"><p>Entries</p><h3>{filtered.length}</h3></div>
      </div>

      <div className="tds-filters-row">
        <div className="tds-input-wrap tds-search-input"><Search size={14}/><input placeholder="Search payee or PAN..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        <div className="tds-input-wrap"><Filter size={14}/>
          <select value={filterType} onChange={e=>setFilterType(e.target.value)}>
            {['All',...Object.keys(rateMap)].map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="tds-input-wrap"><Filter size={14}/>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
            {['All','deposited','pending','overdue'].map(s=><option key={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div className="tds-card tds-table-card">
        <div className="tds-table-wrap">
          <table className="tds-table">
            <thead><tr><th>Date</th><th>Payee</th><th>PAN</th><th>Type</th><th>Revenue Code</th><th>Gross Amount</th><th>Rate</th><th>TDS Amount</th><th>Net Amount</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(e=>(
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td><strong>{e.payee}</strong></td>
                  <td><span className="tds-mono">{e.pan}</span></td>
                  <td><span className="type-chip">{e.type}</span></td>
                  <td><span className="code-chip">{revenueCodeMap[e.type] ?? '11131'}</span></td>
                  <td>NPR {e.gross.toLocaleString()}</td>
                  <td>{e.rate}%</td>
                  <td className="tds-red">NPR {e.tds.toLocaleString()}</td>
                  <td className="tds-green">NPR {e.net.toLocaleString()}</td>
                  <td><StatusBadge status={e.status}/></td>
                  <td><div className="tds-row-actions">
                    <button className="tds-icon-btn"><Eye size={14}/></button>
                    <button className="tds-icon-btn"><Edit2 size={14}/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ── TDS Certificate ── */
const CertificatePage = () => {
  const [selected, setSelected] = useState<string|null>(null);
  const [generated, setGenerated] = useState(false);

  return (
    <div className="tds-subpage">
      <div className="tds-subpage-header">
        <h2 className="tds-subpage-title">TDS Certificate Generator</h2>
        <p className="tds-subpage-sub">Generate TDS certificates for employees and vendors as per IRD requirements</p>
      </div>

      <div className="tds-cert-grid">
        <div className="tds-card">
          <h3 className="tds-section-title">Select Payee</h3>
          <div className="tds-cert-list">
            {mockPayees.map(p=>(
              <div key={p.id} className={`tds-cert-payee-row ${selected===p.id?'tds-cert-selected':''}`} onClick={()=>{setSelected(p.id);setGenerated(false);}}>
                <div className="cert-avatar">{p.name.charAt(0)}</div>
                <div>
                  <p className="cert-name">{p.name}</p>
                  <p className="cert-pan">{p.pan} · {p.category}</p>
                </div>
                {selected===p.id && <Check size={16} className="cert-check"/>}
              </div>
            ))}
          </div>
        </div>

        <div className="tds-card tds-cert-preview-card">
          <h3 className="tds-section-title">Certificate Preview</h3>
          {!selected ? (
            <div className="tds-cert-empty"><FileText size={40}/><p>Select a payee to preview certificate</p></div>
          ) : (()=>{
            const p = mockPayees.find(x=>x.id===selected)!;
            const entries = mockEntries.filter(e=>e.payee===p.name);
            const totalTDS   = entries.reduce((s,e)=>s+e.tds,0);
            const totalGross = entries.reduce((s,e)=>s+e.gross,0);
            return (
              <>
                <div className="tds-cert-doc">
                  <div className="cert-doc-header">
                    <div className="cert-school-logo">S</div>
                    <div>
                      <h4>SchoolHub Education Pvt. Ltd.</h4>
                      <p>TDS Certificate — FY 2081-82 | As per Sec. 90, ITA 2058</p>
                    </div>
                  </div>
                  <div className="cert-doc-body">
                    <div className="cert-doc-row"><span>Certificate No.</span><strong>TDS/2081-82/{p.id.padStart(4,'0')}</strong></div>
                    <div className="cert-doc-row"><span>Withholdee Name</span><strong>{p.name}</strong></div>
                    <div className="cert-doc-row"><span>PAN Number</span><strong>{p.pan}</strong></div>
                    <div className="cert-doc-row"><span>Payment Category</span><strong>{p.category}</strong></div>
                    <div className="cert-doc-row"><span>Revenue Code</span><strong>{revenueCodeMap[p.category] ?? '11131'}</strong></div>
                    <div className="cert-doc-row"><span>Gross Amount Paid</span><strong>NPR {totalGross.toLocaleString()}</strong></div>
                    <div className="cert-doc-row cert-doc-highlight"><span>Total TDS Deducted</span><strong>NPR {totalTDS.toLocaleString()}</strong></div>
                    <div className="cert-doc-row"><span>Net Amount Paid</span><strong>NPR {(totalGross-totalTDS).toLocaleString()}</strong></div>
                    <div className="cert-doc-row"><span>Fiscal Year</span><strong>2081-82 (2024-25)</strong></div>
                  </div>
                  <div className="cert-doc-footer">
                    <p>Certified that the above TDS has been deducted and deposited as per the Income Tax Act, 2058 and IRD regulations. This certificate is valid for the fiscal year stated above.</p>
                  </div>
                </div>
                <div className="tds-cert-actions">
                  <button className="tds-btn-ghost"><Printer size={14}/> Print</button>
                  <button className="tds-btn-secondary"><Download size={14}/> Download PDF</button>
                  <button className="tds-btn-primary" onClick={()=>setGenerated(true)}>
                    {generated ? <><Check size={14}/> Generated!</> : <><FileText size={14}/> Generate</>}
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

/* ── Payee Master ── */
const PayeeMasterPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]     = useState('');
  const [form, setForm] = useState({ name:'', pan:'', type:'Employee', phone:'', email:'', threshold:'', category:'Salary (SST 1%)' });

  const filtered = mockPayees.filter(p=>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.pan.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="tds-subpage">
      <div className="tds-subpage-header">
        <div>
          <h2 className="tds-subpage-title">Payee Master</h2>
          <p className="tds-subpage-sub">Manage vendors and employees with PAN — required for eTDS filing</p>
        </div>
        <button className="tds-btn-primary" onClick={()=>setShowForm(!showForm)}><Plus size={14}/> Add Payee</button>
      </div>

      <div className="tds-ird-note">
        <Info size={14}/>
        <span>PAN is mandatory for all TDS deductions. Without PAN, deduct TDS at <strong>25%</strong> as per ITA 2058 Sec. 90(3). eTDS filing requires the withholdee&apos;s PAN.</span>
      </div>

      {showForm && (
        <div className="tds-card tds-inline-form">
          <div className="tds-inline-form-header">
            <h3 className="tds-section-title">Add New Payee</h3>
            <button className="tds-icon-btn" onClick={()=>setShowForm(false)}><X size={16}/></button>
          </div>
          <div className="tds-form-grid">
            <div className="tds-field"><label>Full Name *</label><div className="tds-input-wrap"><User size={14}/><input placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div></div>
            <div className="tds-field"><label>PAN Number * (9 digits)</label><div className="tds-input-wrap"><Hash size={14}/><input placeholder="123456789" maxLength={9} value={form.pan} onChange={e=>setForm({...form,pan:e.target.value})}/></div></div>
            <div className="tds-field"><label>Type</label><div className="tds-input-wrap"><ChevronDown size={14}/><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option>Employee</option><option>Vendor</option></select></div></div>
            <div className="tds-field"><label>TDS Category</label><div className="tds-input-wrap"><ChevronDown size={14}/><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{Object.keys(rateMap).map(c=><option key={c}>{c}</option>)}</select></div></div>
            <div className="tds-field"><label>Phone</label><div className="tds-input-wrap"><Phone size={14}/><input placeholder="98XXXXXXXX" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div></div>
            <div className="tds-field"><label>Email</label><div className="tds-input-wrap"><Mail size={14}/><input placeholder="email@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div></div>
            <div className="tds-field tds-field-full"><label>Exempt Threshold (NPR) — 0 if none</label><div className="tds-input-wrap"><DollarSign size={14}/><input type="number" placeholder="e.g. 500000 for salary SST band" value={form.threshold} onChange={e=>setForm({...form,threshold:e.target.value})}/></div></div>
          </div>
          <div className="tds-inline-form-footer">
            <button className="tds-btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button>
            <button className="tds-btn-primary" onClick={()=>setShowForm(false)}><Check size={14}/> Save Payee</button>
          </div>
        </div>
      )}

      <div className="tds-search-bar">
        <div className="tds-input-wrap tds-search-input"><Search size={14}/><input placeholder="Search by name or PAN..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
      </div>

      <div className="tds-payee-grid">
        {filtered.map(p=>(
          <div key={p.id} className="tds-card tds-payee-card">
            <div className="payee-card-top">
              <div className="payee-avatar">{p.name.charAt(0)}</div>
              <div className="payee-info">
                <h4>{p.name}</h4>
                <span className={`payee-type-chip ${p.type==='Employee'?'chip-blue':'chip-purple'}`}>{p.type}</span>
              </div>
              <div className="tds-row-actions">
                <button className="tds-icon-btn"><Edit2 size={14}/></button>
                <button className="tds-icon-btn tds-icon-red"><Trash2 size={14}/></button>
              </div>
            </div>
            <div className="payee-card-details">
              <div className="payee-detail"><Hash size={12}/><span>PAN: {p.pan}</span></div>
              <div className="payee-detail"><Phone size={12}/><span>{p.phone}</span></div>
              <div className="payee-detail"><Mail size={12}/><span>{p.email}</span></div>
              <div className="payee-detail"><DollarSign size={12}/><span>{p.category} — Code: {revenueCodeMap[p.category]??'11131'}</span></div>
              {p.threshold>0 && <div className="payee-detail"><AlertTriangle size={12}/><span>Exempt up to NPR {p.threshold.toLocaleString()}</span></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Generate Report ── */
const ReportPage = () => {
  const [fy, setFy]           = useState('2081-82');
  const [month, setMonth]     = useState('All');
  const [type, setType]       = useState('All');
  const [generating, setGenerating] = useState(false);
  const [done, setDone]       = useState(false);

  const handleGen = () => { setGenerating(true); setTimeout(()=>{setGenerating(false);setDone(true);},1800); };

  return (
    <div className="tds-subpage">
      <div className="tds-subpage-header">
        <h2 className="tds-subpage-title">Generate TDS Report</h2>
        <p className="tds-subpage-sub">Create IRD-compliant TDS reports for compliance and auditing</p>
      </div>

      <div className="tds-report-grid">
        <div className="tds-card">
          <h3 className="tds-section-title">Report Configuration</h3>
          <div className="tds-form-grid">
            <div className="tds-field"><label>Fiscal Year</label><div className="tds-input-wrap"><Calendar size={14}/><select value={fy} onChange={e=>setFy(e.target.value)}><option>2081-82</option><option>2080-81</option><option>2079-80</option></select></div></div>
            <div className="tds-field"><label>Month</label><div className="tds-input-wrap"><Filter size={14}/><select value={month} onChange={e=>setMonth(e.target.value)}>{['All','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra','Baishak','Jestha','Ashadh'].map(m=><option key={m}>{m}</option>)}</select></div></div>
            <div className="tds-field"><label>Payment Type</label><div className="tds-input-wrap"><Filter size={14}/><select value={type} onChange={e=>setType(e.target.value)}>{['All',...Object.keys(rateMap)].map(t=><option key={t}>{t}</option>)}</select></div></div>
          </div>
          <div className="tds-report-types">
            <h4>Report Type</h4>
            {['Monthly TDS Summary','Annual TDS Register','Challan-wise Report','Party-wise Report','eTDS Annexure (IRD format)'].map(r=>(
              <label key={r} className="tds-report-option">
                <input type="radio" name="rtype" defaultChecked={r==='Monthly TDS Summary'}/><span>{r}</span>
              </label>
            ))}
          </div>
          <div className="tds-report-formats">
            <h4>Export Format</h4>
            <div className="tds-format-row">
              {[{icon:'📄',label:'PDF'},{icon:'📊',label:'Excel'},{icon:'📋',label:'CSV'}].map(f=>(
                <label key={f.label} className="tds-format-chip">
                  <input type="radio" name="fmt" defaultChecked={f.label==='PDF'}/>
                  <span>{f.icon} {f.label}</span>
                </label>
              ))}
            </div>
          </div>
          <button className="tds-btn-primary tds-btn-full" onClick={handleGen} disabled={generating}>
            {generating ? <><RefreshCw size={14} className="spin"/> Generating...</> : done ? <><Check size={14}/> Generated — Download Ready</> : <><Download size={14}/> Generate Report</>}
          </button>
        </div>

        <div className="tds-card">
          <h3 className="tds-section-title">Preview — {fy}</h3>
          <div className="tds-report-preview">
            {mockEntries.map(e=>(
              <div key={e.id} className="tds-preview-row">
                <div>
                  <p className="preview-payee">{e.payee}</p>
                  <p className="preview-type">{e.type} · {e.date}</p>
                </div>
                <div className="preview-amounts">
                  <span className="preview-gross">NPR {e.gross.toLocaleString()}</span>
                  <span className="preview-tds tds-red">−{e.tds.toLocaleString()}</span>
                </div>
              </div>
            ))}
            <div className="tds-preview-total">
              <span>Total TDS Deducted</span>
              <strong className="tds-red">NPR {mockEntries.reduce((s,e)=>s+e.tds,0).toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TDSDashboard = ({ onNavigate }: { onNavigate: (p: Page) => void }) => {
  const stats = [
    { label:"Deducted this month",  value:"NPR 45,000",   variant:"tds-stat-green" },
    { label:"Pending Deposits",     value:"NPR 12,500",   variant:"tds-stat-red", alert:true },
    { label:"Total Deducted (YTD)", value:"NPR 5,45,000", variant:"" },
    { label:"Active Payees",        value:"24",           variant:"" },
  ];

  // Show only key rates on dashboard
  const dashRates = [
    { rate:"1%",   desc:"Salary — SST",          threshold:"Individual ≤ NPR 5L | Couple ≤ NPR 6L", revenueCode:"11211", final:false },
    { rate:"Slab", desc:"Salary — Remuneration",  threshold:"Progressive slabs: 10%–39%",            revenueCode:"11111", final:false },
    { rate:"10%",  desc:"Rent — Buildings/Land",  threshold:"Final WHT — No threshold",              revenueCode:"11131", final:true  },
    { rate:"15%",  desc:"Consultancy / Services", threshold:"No threshold",                           revenueCode:"11131", final:false },
    { rate:"1.5%", desc:"Contract Payments",      threshold:"Applies above NPR 50,000",              revenueCode:"11131", final:false },
    { rate:"5%",   desc:"Interest / Dividend",    threshold:"Final WHT",                             revenueCode:"11131", final:true  },
  ];

  return (
    <div className="tds-page">
      <div className="tds-ird-note">
        <Info size={14}/>
        <span>TDS rates as per <strong>Income Tax Act 2058</strong> and <strong>Finance Act 2081</strong>. Deposit via eTDS at <strong>ird.gov.np</strong> within 25th of next Nepali month. Late penalty: <strong>NPR 100/day</strong>.</span>
      </div>

      <div className="tds-top-grid">
        {/* Rates */}
        <div className="tds-card">
          <h2 className="tds-card-title">TDS Rates (FY 2081-82)</h2>
          <div className="tds-rates-list">
            {dashRates.map((item,idx)=>(
              <div key={idx} className="tds-rate-item">
                <div className="tds-rate-header">
                  <p className="tds-rate-val">{item.rate}</p>
                  {item.final && <span className="final-tag">Final WHT</span>}
                </div>
                <p className="tds-rate-desc">{item.desc}</p>
                <p className="tds-rate-thresh">{item.threshold}</p>
                <p className="tds-rate-code">Revenue Code: {item.revenueCode}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="tds-card">
          <h2 className="tds-card-title">Quick Stats</h2>
          <div className="tds-stats-list">
            {stats.map((stat,idx)=>(
              <div key={idx} className="tds-stat">
                <p className="tds-stat-label">{stat.label}</p>
                <p className={`tds-stat-val ${stat.variant}`}>
                  {stat.value}
                  {stat.alert && <span className="tds-overdue-tag"><AlertTriangle size={11}/> Due in 5 days</span>}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="tds-card">
          <h2 className="tds-card-title">Quick Actions</h2>
          <div className="tds-actions-list">
            <button className="tds-action-btn tds-action-primary"    onClick={()=>onNavigate('new-entry')}>New TDS Entry <Plus className="tds-action-icon"/></button>
            <button className="tds-action-btn tds-action-secondary"  onClick={()=>onNavigate('report')}>Generate Report <Download className="tds-action-icon"/></button>
            <button className="tds-action-btn tds-action-secondary"  onClick={()=>onNavigate('challans')}>Manage Challans <ArrowRight className="tds-action-icon"/></button>
            <button className="tds-action-btn tds-action-secondary"  onClick={()=>onNavigate('register')}>TDS Register <ArrowRight className="tds-action-icon"/></button>
            <button className="tds-action-btn tds-action-secondary"  onClick={()=>onNavigate('certificate')}>Generate Certificate <FileText className="tds-action-icon"/></button>
            <button className="tds-action-btn tds-action-secondary"  onClick={()=>onNavigate('payee-master')}>Payee Master <ArrowRight className="tds-action-icon"/></button>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="tds-card">
        <div className="tds-recent-header">
          <h2 className="tds-card-title" style={{margin:0}}>Recent TDS Entries</h2>
          <button className="tds-link-btn" onClick={()=>onNavigate('register')}>View All <ArrowRight size={13}/></button>
        </div>
        <div className="tds-table-wrap">
          <table className="tds-table">
            <thead><tr><th>Payee</th><th>Type</th><th>Revenue Code</th><th>Gross</th><th>TDS</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {mockEntries.slice(0,4).map(e=>(
                <tr key={e.id}>
                  <td><strong>{e.payee}</strong></td>
                  <td><span className="type-chip">{e.type}</span></td>
                  <td><span className="code-chip">{revenueCodeMap[e.type]??'11131'}</span></td>
                  <td>NPR {e.gross.toLocaleString()}</td>
                  <td className="tds-red">NPR {e.tds.toLocaleString()}</td>
                  <td>{e.date}</td>
                  <td><StatusBadge status={e.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Banner */}
      <div className="tds-coming-soon">
        <Info className="tds-coming-icon"/>
        <h3 className="tds-coming-title">Tax Year Closing — Action Required</h3>
        <p className="tds-coming-text">
          The current fiscal year (2081-82) ends in 45 days. Ensure all TDS challans are deposited, eTDS returns are verified on ird.gov.np, and TDS certificates are issued to all withholdees within 30 days of year-end as per ITA 2058.
        </p>
      </div>
    </div>
  );
};

const TDS = () => {
  const [page, setPage] = useState<Page>('dashboard');
  const back = () => setPage('dashboard');
  const isDashboard = page === 'dashboard';

  const renderContent = () => {
    switch(page){
      case 'new-entry':    return <NewEntryPage    />;
      case 'challans':     return <ChallansPage    />;
      case 'register':     return <RegisterPage    />;
      case 'certificate':  return <CertificatePage />;
      case 'payee-master': return <PayeeMasterPage />;
      case 'report':       return <ReportPage      />;
      default:             return <TDSDashboard    onNavigate={setPage}/>;
    }
  };

  return (
    <Layout>
      {isDashboard ? (
        renderContent()
      ) : (
        <div className="tds-shell">
          {/* ── Subpage Sidebar ── */}
          <aside className="tds-sidenav">
            <div className="tds-sidenav-header">
              <button className="tds-back-btn" onClick={back}>
                <ChevronLeft size={16}/> Back to TDS
              </button>
            </div>
            <nav className="tds-sidenav-nav">
              {NAV_ITEMS.filter(i => i.page !== 'dashboard').map(item => (
                <button
                  key={item.page}
                  className={`tds-sidenav-item ${page === item.page ? 'active' : ''}`}
                  onClick={() => setPage(item.page)}
                >
                  <span className="tds-sidenav-icon">{item.icon}</span>
                  <span className="tds-sidenav-label">{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* ── Main Content ── */}
          <main className="tds-main">
            {renderContent()}
          </main>
        </div>
      )}
    </Layout>
  );
};

export default TDS;