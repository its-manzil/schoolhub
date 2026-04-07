"use client";

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Download, Plus, Info, ArrowRight, X, Check, AlertTriangle,
  ChevronLeft, Search, Filter, Eye, Edit2, Trash2, FileText,
  User, Calendar, DollarSign, Hash, Building, Phone, Mail,
  CheckCircle, Clock, XCircle, ChevronDown, Printer
} from "lucide-react";
import './TDS.css';
import { 
  fetchTaxSettings, 
  fetchTDSEntries, 
  saveTDSEntry,
  fetchPayees, 
  savePayee,
  fetchReportStats
} from '../configuration/services/api';
import { TaxRule } from '../configuration/services/types';
import ChallansPageComplete from './challan-complete';

/* ─────────────── Types ─────────────── */
type Page = 'dashboard' | 'new-entry' | 'challans' | 'register' | 'certificate' | 'payee-master' | 'report';

interface TDSEntry {
  _id: string;
  payeeId: string;
  ruleId: string;
  gross: number;
  tds: number;
  net: number;
  date: string;
  narration?: string;
  status: 'pending' | 'deposited' | 'overdue';
  createdAt: string;
  updatedAt: string;
}

interface Payee {
  _id: string;
  name: string;
  pan: string;
  type: 'Employee' | 'Vendor';
  phone?: string;
  email?: string;
  category?: string;
  threshold?: number;
  createdAt: string;
  updatedAt: string;
}

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

// TDS Calculation Engine
const calculateTDS = (gross: number, rule: TaxRule): number => {
  if (rule.type === 'FIXED' || rule.type === 'FINAL') {
    return gross * (rule.rate || 0) / 100;
  } else if (rule.type === 'SLAB' && rule.slabs) {
    let tax = 0;
    for (const slab of rule.slabs) {
      if (gross > slab.from) {
        const taxable = Math.min(gross, slab.to || gross) - slab.from;
        tax += taxable * slab.rate / 100;
      }
    }
    return tax;
  }
  return 0;
};

/* ── Sidebar nav config ── */
const NAV_ITEMS: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard',    label: 'Overview',          icon: <Info size={15}/> },
  { page: 'new-entry',    label: 'New TDS Entry',     icon: <Plus size={15}/> },
  { page: 'challans',     label: 'Manage Challans',   icon: <Building size={15}/> },
  { page: 'register',     label: 'TDS Register',      icon: <FileText size={15}/> },
  { page: 'certificate',  label: 'Certificates',      icon: <CheckCircle size={15}/> },
  { page: 'payee-master', label: 'Payee Master',      icon: <User size={15}/> },
  { page: 'report',       label: 'Generate Report',   icon: <Download size={15}/> },
];

/* ── New TDS Entry ── */
const NewEntryPage = () => {
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [payees, setPayees] = useState<Payee[]>([]);
  const [payeeSearch, setPayeeSearch] = useState('');
  const [showPayeeDropdown, setShowPayeeDropdown] = useState(false);
  const [form, setForm] = useState({ 
    payeeId: '', 
    ruleId: '', 
    gross: '', 
    date: '', 
    narration: '' 
  });
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load tax rules and payees
  useEffect(() => {
    const loadData = async () => {
      try {
        const taxResponse = await fetchTaxSettings();
        if (taxResponse.success && taxResponse.data) {
          setTaxRules(taxResponse.data.taxRules || []);
        }
        
        const payeeResponse = await fetchPayees();
        if (payeeResponse.success && payeeResponse.data) {
          setPayees(payeeResponse.data);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    
    loadData();
  }, []);

  const selectedRule = taxRules.find(r => r.id === form.ruleId);
  const selectedPayee = payees.find(p => p._id === form.payeeId);
  const gross = parseFloat(form.gross) || 0;
  const tds = selectedRule ? calculateTDS(gross, selectedRule) : 0;
  const net = gross - tds;

  // Filter payees based on search
  const filteredPayees = payees.filter(p => 
    p.name.toLowerCase().includes(payeeSearch.toLowerCase()) ||
    p.pan.toLowerCase().includes(payeeSearch.toLowerCase())
  );

  const handlePayeeSelect = (payeeId: string) => {
    setForm({...form, payeeId});
    setPayeeSearch(payees.find(p => p._id === payeeId)?.name || '');
    setShowPayeeDropdown(false);
  };

  const handleSave = async () => {
    if (!form.payeeId || !form.ruleId || !form.gross || !form.date) {
      alert('Please fill all required fields');
      return;
    }

    if (gross <= 0) {
      alert('Gross amount must be greater than 0');
      return;
    }

    setIsLoading(true);
    try {
      await saveTDSEntry({
        payeeId: form.payeeId,
        ruleId: form.ruleId,
        gross,
        tds,
        net,
        date: form.date,
        narration: form.narration
      });
      
      setSaved(true);
      setTimeout(() => { 
        setSaved(false); 
        // Navigate back to dashboard
      }, 1500);
    } catch (error) {
      console.error('Failed to save TDS entry:', error);
      alert('Failed to save TDS entry');
    } finally {
      setIsLoading(false);
    }
  };

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
              <div className="tds-input-wrap">
                <User size={14}/>
                <input 
                  type="text"
                  placeholder="Search payee by name or PAN..."
                  value={payeeSearch}
                  onChange={e => {
                    setPayeeSearch(e.target.value);
                    setShowPayeeDropdown(true);
                  }}
                  onFocus={() => setShowPayeeDropdown(true)}
                  onBlur={() => setTimeout(() => setShowPayeeDropdown(false), 200)}
                />
                {showPayeeDropdown && payeeSearch && (
                  <div className="tds-dropdown">
                    {filteredPayees.length > 0 ? (
                      filteredPayees.map(p => (
                        <div 
                          key={p._id}
                          className="tds-dropdown-item"
                          onClick={() => handlePayeeSelect(p._id)}
                        >
                          <div className="dropdown-payee-info">
                            <strong>{p.name}</strong>
                            <span>{p.pan} · {p.type}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="tds-dropdown-empty">No payees found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {selectedPayee && (
              <div className="tds-field">
                <label>PAN Number</label>
                <div className="tds-input-wrap tds-input-readonly">
                  <Hash size={14}/>
                  <input readOnly value={selectedPayee.pan} />
                </div>
              </div>
            )}

            <div className="tds-field">
              <label>Payment Type *</label>
              <div className="tds-input-wrap">
                <ChevronDown size={14}/>
                <select 
                  value={form.ruleId} 
                  onChange={e=>setForm({...form,ruleId:e.target.value})}
                >
                  <option value="">Select tax rule...</option>
                  {taxRules.map(rule=>(
                    <option key={rule.id} value={rule.id}>
                      {rule.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="tds-field">
              <label>Date *</label>
              <div className="tds-input-wrap">
                <Calendar size={14}/>
                <input 
                  type="date" 
                  value={form.date} 
                  onChange={e=>setForm({...form,date:e.target.value})}
                />
              </div>
            </div>

            <div className="tds-field tds-field-full">
              <label>Gross Amount (NPR) *</label>
              <div className="tds-input-wrap">
                <DollarSign size={14}/>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={form.gross} 
                  onChange={e=>setForm({...form,gross:e.target.value})}
                />
              </div>
            </div>

            {selectedRule && selectedRule.threshold && (
              <div className="tds-field tds-field-full">
                <div className="tds-inline-alert tds-alert-blue">
                  <Info size={13}/> 
                  Threshold: NPR {selectedRule.threshold.individual || selectedRule.threshold.couple || 'N/A'}
                </div>
              </div>
            )}

            {selectedRule && (
              <div className="tds-field">
                <label>IRD Revenue Code</label>
                <div className="tds-input-wrap tds-input-readonly">
                  <Hash size={14}/>
                  <input readOnly value={selectedRule.revenueCode} />
                </div>
                <span className="tds-field-hint">Auto-assigned per payment type</span>
              </div>
            )}

            <div className="tds-field tds-field-full">
              <label>Narration</label>
              <textarea 
                rows={2} 
                placeholder="Optional description..." 
                value={form.narration} 
                onChange={e=>setForm({...form,narration:e.target.value})} 
                className="tds-textarea"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="tds-entry-summary-col">
          <div className="tds-card">
            <h3 className="tds-section-title">TDS Calculation</h3>
            <div className="tds-calc-rows">
              <div className="tds-calc-row">
                <span>Gross Amount</span>
                <span>NPR {gross.toLocaleString()}</span>
              </div>
              <div className="tds-calc-row tds-calc-rate">
                <span>TDS Rate</span>
                <span className="rate-chip">
                  {selectedRule?.type === 'SLAB' ? 'Slab' : `${selectedRule?.rate || 0}%`}
                </span>
              </div>
              <div className="tds-calc-row">
                <span>Revenue Code</span>
                <span className="tds-mono">{selectedRule?.revenueCode || 'N/A'}</span>
              </div>
              <div className="tds-calc-row tds-calc-tds">
                <span>TDS Deducted</span>
                <span className="tds-red">− NPR {tds.toLocaleString()}</span>
              </div>
              <div className="tds-calc-divider"/>
              <div className="tds-calc-row tds-calc-net">
                <span>Net Payable</span>
                <span className="tds-green">NPR {net.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {selectedRule && (
            <div className="tds-card tds-rate-ref">
              <h3 className="tds-section-title">Tax Rule Details</h3>
              <div className="tds-rate-ref-scroll">
                <div className="tds-ref-row tds-ref-active">
                  <span className="ref-rate">
                    {selectedRule.type === 'SLAB' ? 'Slab' : `${selectedRule.rate}%`}
                  </span>
                  <div>
                    <p className="ref-desc">{selectedRule.name}</p>
                    <p className="ref-thresh">{selectedRule.category}</p>
                    <p className="ref-code">Code: {selectedRule.revenueCode}</p>
                    {selectedRule.description && (
                      <p className="ref-desc">{selectedRule.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="tds-entry-actions">
        <button className="tds-btn-ghost" onClick={() => {}}>Cancel</button>
        <button 
          className="tds-btn-primary" 
          onClick={handleSave}
          disabled={isLoading || saved}
        >
          {saved ? <><Check size={14}/> Saved!</> : isLoading ? 'Saving...' : <><Plus size={14}/> Save Entry</>}
        </button>
      </div>
    </div>
  );
};

/* ── TDS Register ── */
const RegisterPage = () => {
  const [entries, setEntries] = useState<TDSEntry[]>([]);
  const [payees, setPayees] = useState<Payee[]>([]);
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [entriesRes, payeesRes, taxRes] = await Promise.all([
          fetchTDSEntries(),
          fetchPayees(),
          fetchTaxSettings()
        ]);

        if (entriesRes.success) setEntries(entriesRes.data || []);
        if (payeesRes.success) setPayees(payeesRes.data || []);
        if (taxRes.success) setTaxRules(taxRes.data?.taxRules || []);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filtered = entries.filter(e => {
    const payee = payees.find(p => p._id === e.payeeId);
    const rule = taxRules.find(r => r.id === e.ruleId);
    
    const matchSearch = !search || (
      (payee?.name.toLowerCase().includes(search.toLowerCase())) ||
      (payee?.pan.toLowerCase().includes(search.toLowerCase()))
    );
    
    const matchType = filterType === 'All' || rule?.category === filterType;
    const matchStatus = filterStatus === 'All' || e.status === filterStatus;
    
    return matchSearch && matchType && matchStatus;
  });

  const totalTDS = filtered.reduce((s, e) => s + e.tds, 0);
  const totalGross = filtered.reduce((s, e) => s + e.gross, 0);

  if (isLoading) {
    return <div className="tds-subpage"><p>Loading...</p></div>;
  }

  return (
    <div className="tds-subpage">
      <div className="tds-subpage-header">
        <div>
          <h2 className="tds-subpage-title">TDS Register</h2>
          <p className="tds-subpage-sub">Monthly ledger of all TDS deductions</p>
        </div>
        <div className="tds-header-actions">
          <button className="tds-btn-ghost"><Printer size={14}/> Print</button>
          <button className="tds-btn-secondary"><Download size={14}/> Export</button>
        </div>
      </div>

      <div className="tds-register-summary">
        <div className="tds-card reg-sum-card"><p>Total Gross</p><h3>NPR {totalGross.toLocaleString()}</h3></div>
        <div className="tds-card reg-sum-card"><p>Total TDS</p><h3 className="tds-red">NPR {totalTDS.toLocaleString()}</h3></div>
        <div className="tds-card reg-sum-card"><p>Total Net</p><h3 className="tds-green">NPR {(totalGross - totalTDS).toLocaleString()}</h3></div>
        <div className="tds-card reg-sum-card"><p>Entries</p><h3>{filtered.length}</h3></div>
      </div>

      <div className="tds-filters-row">
        <div className="tds-input-wrap tds-search-input">
          <Search size={14}/>
          <input 
            placeholder="Search payee or PAN..." 
            value={search} 
            onChange={e=>setSearch(e.target.value)}
          />
        </div>
        <div className="tds-input-wrap">
          <Filter size={14}/>
          <select value={filterType} onChange={e=>setFilterType(e.target.value)}>
            <option value="All">All Types</option>
            {Array.from(new Set(taxRules.map(r => r.category))).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="tds-input-wrap">
          <Filter size={14}/>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            <option value="deposited">Deposited</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="tds-card tds-table-card">
        <div className="tds-table-wrap">
          <table className="tds-table">
            <thead>
              <tr>
                <th>Date</th><th>Payee</th><th>PAN</th>
                <th>Type</th><th>Revenue Code</th><th>Gross Amount</th>
                <th>Rate</th><th>TDS Amount</th><th>Net Amount</th>
                <th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const payee = payees.find(p => p._id === e.payeeId);
                const rule = taxRules.find(r => r.id === e.ruleId);
                
                return (
                  <tr key={e._id}>
                    <td>{e.date}</td>
                    <td><strong>{payee?.name || 'Unknown'}</strong></td>
                    <td><span className="tds-mono">{payee?.pan || 'N/A'}</span></td>
                    <td><span className="type-chip">{rule?.name || 'Unknown'}</span></td>
                    <td><span className="code-chip">{rule?.revenueCode || 'N/A'}</span></td>
                    <td>NPR {e.gross.toLocaleString()}</td>
                    <td>
                      {rule?.type === 'SLAB' ? 'Slab' : `${rule?.rate || 0}%`}
                    </td>
                    <td className="tds-red">NPR {e.tds.toLocaleString()}</td>
                    <td className="tds-green">NPR {e.net.toLocaleString()}</td>
                    <td><StatusBadge status={e.status}/></td>
                    <td>
                      <div className="tds-row-actions">
                        <button className="tds-icon-btn"><Eye size={14}/></button>
                        <button className="tds-icon-btn"><Edit2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ── Payee Master ── */
const PayeeMasterPage = () => {
  const [payees, setPayees] = useState<Payee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ 
    name: '', 
    pan: '', 
    type: 'Employee' as ('Employee' | 'Vendor'), 
    phone: '', 
    email: '', 
    category: '', 
    threshold: '' 
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadPayees = async () => {
      try {
        const response = await fetchPayees();
        if (response.success) {
          setPayees(response.data || []);
        }
      } catch (error) {
        console.error('Failed to load payees:', error);
      }
    };

    loadPayees();
  }, []);

  const filtered = payees.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.pan.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.name || !form.pan || !form.type) {
      alert('Please fill all required fields');
      return;
    }

    if (!/^\d{9}$/.test(form.pan)) {
      alert('PAN must be exactly 9 digits');
      return;
    }

    setIsLoading(true);
    try {
      await savePayee({
        name: form.name,
        pan: form.pan,
        type: form.type,
        phone: form.phone,
        email: form.email,
        category: form.category,
        threshold: parseFloat(form.threshold) || 0
      });

      // Reload payees
      const response = await fetchPayees();
      if (response.success) {
        setPayees(response.data || []);
      }

      setShowForm(false);
      setForm({ name: '', pan: '', type: 'Employee', phone: '', email: '', category: '', threshold: '' });
    } catch (error) {
      console.error('Failed to save payee:', error);
      alert('Failed to save payee');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="tds-subpage">
      <div className="tds-subpage-header">
        <div>
          <h2 className="tds-subpage-title">Payee Master</h2>
          <p className="tds-subpage-sub">Manage vendors and employees with PAN — required for eTDS filing</p>
        </div>
        <button className="tds-btn-primary" onClick={()=>setShowForm(!showForm)}>
          <Plus size={14}/> Add Payee
        </button>
      </div>

      <div className="tds-ird-note">
        <Info size={14}/>
        <span>PAN is mandatory for all TDS deductions. Without PAN, deduct TDS at <strong>25%</strong> as per ITA 2058 Sec. 90(3). eTDS filing requires the withholdee&apos;s PAN.</span>
      </div>

      {showForm && (
        <div className="tds-card tds-inline-form">
          <div className="tds-inline-form-header">
            <h3 className="tds-section-title">Add New Payee</h3>
            <button className="tds-icon-btn" onClick={()=>setShowForm(false)}>
              <X size={16}/>
            </button>
          </div>
          <div className="tds-form-grid">
            <div className="tds-field">
              <label>Full Name *</label>
              <div className="tds-input-wrap">
                <User size={14}/>
                <input 
                  placeholder="Full name" 
                  value={form.name} 
                  onChange={e=>setForm({...form,name:e.target.value})}
                />
              </div>
            </div>
            <div className="tds-field">
              <label>PAN Number * (9 digits)</label>
              <div className="tds-input-wrap">
                <Hash size={14}/>
                <input 
                  placeholder="123456789" 
                  maxLength={9} 
                  value={form.pan} 
                  onChange={e=>setForm({...form,pan:e.target.value.replace(/\D/g, '')})}
                />
              </div>
            </div>
            <div className="tds-field">
              <label>Type</label>
              <div className="tds-input-wrap">
                <ChevronDown size={14}/>
                <select value={form.type} onChange={e=>setForm({...form,type:e.target.value as ('Employee' | 'Vendor')})}>
                  <option value="Employee">Employee</option>
                  <option value="Vendor">Vendor</option>
                </select>
              </div>
            </div>
            <div className="tds-field">
              <label>Phone</label>
              <div className="tds-input-wrap">
                <Phone size={14}/>
                <input 
                  placeholder="98XXXXXXXX" 
                  value={form.phone} 
                  onChange={e=>setForm({...form,phone:e.target.value})}
                />
              </div>
            </div>
            <div className="tds-field">
              <label>Email</label>
              <div className="tds-input-wrap">
                <Mail size={14}/>
                <input 
                  placeholder="email@example.com" 
                  value={form.email} 
                  onChange={e=>setForm({...form,email:e.target.value})}
                />
              </div>
            </div>
            <div className="tds-field tds-field-full">
              <label>Exempt Threshold (NPR) — 0 if none</label>
              <div className="tds-input-wrap">
                <DollarSign size={14}/>
                <input 
                  type="number" 
                  placeholder="e.g. 500000 for salary SST band" 
                  value={form.threshold} 
                  onChange={e=>setForm({...form,threshold:e.target.value})}
                />
              </div>
            </div>
          </div>
          <div className="tds-inline-form-footer">
            <button className="tds-btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button>
            <button 
              className="tds-btn-primary" 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : <><Check size={14}/> Save Payee</>}
            </button>
          </div>
        </div>
      )}

      <div className="tds-search-bar">
        <div className="tds-input-wrap tds-search-input">
          <Search size={14}/>
          <input 
            placeholder="Search by name or PAN..." 
            value={search} 
            onChange={e=>setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="tds-payee-grid">
        {filtered.map(p=>(
          <div key={p._id} className="tds-card tds-payee-card">
            <div className="payee-card-top">
              <div className="payee-avatar">{p.name.charAt(0)}</div>
              <div className="payee-info">
                <h4>{p.name}</h4>
                <span className={`payee-type-chip ${p.type==='Employee'?'chip-blue':'chip-purple'}`}>
                  {p.type}
                </span>
              </div>
              <div className="tds-row-actions">
                <button className="tds-icon-btn"><Edit2 size={14}/></button>
                <button className="tds-icon-btn tds-icon-red"><Trash2 size={14}/></button>
              </div>
            </div>
            <div className="payee-card-details">
              <div className="payee-detail">
                <Hash size={12}/>
                <span>PAN: {p.pan}</span>
              </div>
              {p.phone && (
                <div className="payee-detail">
                  <Phone size={12}/>
                  <span>{p.phone}</span>
                </div>
              )}
              {p.email && (
                <div className="payee-detail">
                  <Mail size={12}/>
                  <span>{p.email}</span>
                </div>
              )}
              {p.category && (
                <div className="payee-detail">
                  <DollarSign size={12}/>
                  <span>{p.category}</span>
                </div>
              )}
              {p.threshold && p.threshold > 0 && (
                <div className="payee-detail">
                  <AlertTriangle size={12}/>
                  <span>Exempt up to NPR {p.threshold.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Dashboard ── */
const TDSDashboard = ({ onNavigate: _onNavigate }: { onNavigate: (p: Page) => void }) => {
  const [entries, setEntries] = useState<TDSEntry[]>([]);
  const [payees, setPayees] = useState<Payee[]>([]);
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [stats, setStats] = useState<{
    totalTDSThisMonth: number;
    totalTDSYTD: number;
    pendingDeposits: number;
    totalPayees: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [entriesRes, payeesRes, taxRes, statsRes] = await Promise.all([
          fetchTDSEntries(),
          fetchPayees(),
          fetchTaxSettings(),
          fetchReportStats()
        ]);

        if (entriesRes.success) setEntries(entriesRes.data || []);
        if (payeesRes.success) setPayees(payeesRes.data || []);
        if (taxRes.success) setTaxRules(taxRes.data?.taxRules || []);
        if (statsRes.success) setStats(statsRes.data);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Use stats from MongoDB aggregation or fallback to client calculation
  const dashboardStats = [
    { 
      label: "Deducted this month",  
      value: `NPR ${(stats?.totalTDSThisMonth || 0).toLocaleString()}`, 
      variant: "tds-stat-green" 
    },
    { 
      label: "Pending Deposits",     
      value: `NPR ${(stats?.pendingDeposits || 0).toLocaleString()}`, 
      variant: "tds-stat-red", 
      alert: (stats?.pendingDeposits || 0) > 0 
    },
    { 
      label: "Total Deducted (YTD)", 
      value: `NPR ${(stats?.totalTDSYTD || 0).toLocaleString()}`, 
      variant: "" 
    },
    { 
      label: "Active Payees",        
      value: (stats?.totalPayees || payees.length).toString(),           
      variant: "" 
    },
  ];

  if (isLoading) {
    return <div className="tds-page"><p>Loading...</p></div>;
  }

  return (
    <div className="tds-page">
      <div className="tds-ird-note">
        <Info size={14}/>
        <span>TDS rates configured in Tax Settings. Deposit via eTDS at <strong>ird.gov.np</strong> within 25th of next Nepali month. Late penalty: <strong>NPR 100/day</strong>.</span>
      </div>

      <div className="tds-top-grid">
        {/* Tax Rules */}
        <div className="tds-card">
          <h2 className="tds-card-title">Configured Tax Rules</h2>
          <div className="tds-rates-list">
            {taxRules.slice(0, 6).map((rule, idx) => (
              <div key={idx} className="tds-rate-item">
                <div className="tds-rate-header">
                  <p className="tds-rate-val">
                    {rule.type === 'SLAB' ? 'Slab' : `${rule.rate}%`}
                  </p>
                  {rule.type === 'FINAL' && <span className="final-tag">Final WHT</span>}
                </div>
                <p className="tds-rate-desc">{rule.name}</p>
                <p className="tds-rate-thresh">{rule.category}</p>
                <p className="tds-rate-code">Revenue Code: {rule.revenueCode}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="tds-card">
          <h2 className="tds-card-title">Quick Stats</h2>
          <div className="tds-stats-list">
            {dashboardStats.map((stat, idx) => (
              <div key={idx} className="tds-stat">
                <p className="tds-stat-label">{stat.label}</p>
                <p className={`tds-stat-val ${stat.variant}`}>
                  {stat.value}
                  {stat.alert && (
                    <span className="tds-overdue-tag">
                      <AlertTriangle size={11}/> Action Required
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="tds-card">
          <h2 className="tds-card-title">Quick Actions</h2>
          <div className="tds-actions-list">
            <button 
              className="tds-action-btn tds-action-primary"    
              onClick={()=>_onNavigate('new-entry')}
            >
              New TDS Entry <Plus className="tds-action-icon"/>
            </button>
            <button 
              className="tds-action-btn tds-action-secondary"  
              onClick={()=>_onNavigate('report')}
            >
              Generate Report <Download className="tds-action-icon"/>
            </button>
            <button 
              className="tds-action-btn tds-action-secondary"  
              onClick={()=>_onNavigate('challans')}
            >
              Manage Challans <ArrowRight className="tds-action-icon"/>
            </button>
            <button 
              className="tds-action-btn tds-action-secondary"  
              onClick={()=>_onNavigate('register')}
            >
              TDS Register <ArrowRight className="tds-action-icon"/>
            </button>
            <button 
              className="tds-action-btn tds-action-secondary"  
              onClick={()=>_onNavigate('certificate')}
            >
              Generate Certificate <FileText className="tds-action-icon"/>
            </button>
            <button 
              className="tds-action-btn tds-action-secondary"  
              onClick={()=>_onNavigate('payee-master')}
            >
              Payee Master <ArrowRight className="tds-action-icon"/>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="tds-card">
        <div className="tds-recent-header">
          <h2 className="tds-card-title" style={{margin:0}}>Recent TDS Entries</h2>
          <button className="tds-link-btn" onClick={()=>_onNavigate('register')}>
            View All <ArrowRight size={13}/>
          </button>
        </div>
        <div className="tds-table-wrap">
          <table className="tds-table">
            <thead>
              <tr>
                <th>Payee</th><th>Type</th><th>Revenue Code</th>
                <th>Gross</th><th>TDS</th><th>Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.slice(0, 4).map(e => {
                const payee = payees.find(p => p._id === e.payeeId);
                const rule = taxRules.find(r => r.id === e.ruleId);
                
                return (
                  <tr key={e._id}>
                    <td><strong>{payee?.name || 'Unknown'}</strong></td>
                    <td><span className="type-chip">{rule?.name || 'Unknown'}</span></td>
                    <td><span className="code-chip">{rule?.revenueCode || 'N/A'}</span></td>
                    <td>NPR {e.gross.toLocaleString()}</td>
                    <td className="tds-red">NPR {e.tds.toLocaleString()}</td>
                    <td>{e.date}</td>
                    <td><StatusBadge status={e.status}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ── Placeholder pages for remaining functionality ── */
const ChallansPage = () => {
  return <ChallansPageComplete />;
};

const CertificatePage = () => (
  <div className="tds-subpage">
    <div className="tds-subpage-header">
      <h2 className="tds-subpage-title">TDS Certificate Generator</h2>
      <p className="tds-subpage-sub">Generate TDS certificates for employees and vendors as per IRD requirements</p>
    </div>
    <div className="tds-card">
      <div className="tds-coming-soon">
        <Info className="tds-coming-icon"/>
        <h3 className="tds-coming-title">Coming Soon</h3>
        <p className="tds-coming-text">
          TDS Certificate generation will be available once entries and payees are properly configured.
        </p>
      </div>
    </div>
  </div>
);

const ReportPage = () => (
  <div className="tds-subpage">
    <div className="tds-subpage-header">
      <h2 className="tds-subpage-title">Generate TDS Report</h2>
      <p className="tds-subpage-sub">Create IRD-compliant TDS reports for compliance and auditing</p>
    </div>
    <div className="tds-card">
      <div className="tds-coming-soon">
        <Info className="tds-coming-icon"/>
        <h3 className="tds-coming-title">Coming Soon</h3>
        <p className="tds-coming-text">
          Advanced reporting features will be available once sufficient data is collected.
        </p>
      </div>
    </div>
  </div>
);

/* ── Main Component ── */
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
