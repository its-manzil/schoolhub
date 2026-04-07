import React, { useState, useEffect } from 'react';
import {
  Plus, Info, X, Check, Hash, Building, DollarSign, Calendar,
  Search, Eye, Edit2, Trash2, CheckCircle, Clock, XCircle
} from "lucide-react";
import { 
  fetchChallans, 
  saveChallan,
  fetchPendingEntries
} from '../configuration/services/api';

/* ── Types ── */
interface Challan {
  _id: string;
  challanNo: string;
  bank: string;
  bsr: string;
  amount: number;
  period: string;
  depositDate: string;
  revenueCode: string;
  status: 'pending' | 'deposited' | 'overdue';
  createdAt: string;
  updatedAt: string;
}

interface PendingEntry {
  _id: string;
  payeeName: string;
  payeePAN: string;
  ruleName: string;
  revenueCode: string;
  tds: number;
  gross: number;
  date: string;
}

/* ── Status Badge Component ── */
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
    deposited: { cls:'badge-green',  icon:<CheckCircle size={11}/>, label:'Deposited' },
    pending:   { cls:'badge-yellow', icon:<Clock size={11}/>,       label:'Pending'   },
    overdue:   { cls:'badge-red',    icon:<XCircle size={11}/>,     label:'Overdue'   },
  };
  const s = map[status] ?? map.pending;
  return <span className={`tds-badge ${s.cls}`}>{s.icon}{s.label}</span>;
};

/* ── Challan Management with Entry Linking ── */
const ChallansPage = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [pendingEntries, setPendingEntries] = useState<PendingEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ 
    challanNo: '', 
    bank: '', 
    bsr: '', 
    amount: '', 
    period: '', 
    depositDate: '', 
    revenueCode: '11131',
    selectedEntries: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [challansRes, pendingRes] = await Promise.all([
          fetchChallans(),
          fetchPendingEntries()
        ]);

        if (challansRes.success) {
          setChallans(challansRes.data || []);
        }
        if (pendingRes.success) {
          setPendingEntries(pendingRes.data || []);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  const filtered = challans.filter(c =>
    c.challanNo.toLowerCase().includes(search.toLowerCase()) ||
    c.bank.toLowerCase().includes(search.toLowerCase())
  );

  const handleEntryToggle = (entryId: string) => {
    const isSelected = form.selectedEntries.includes(entryId);
    if (isSelected) {
      setForm({
        ...form,
        selectedEntries: form.selectedEntries.filter(id => id !== entryId)
      });
    } else {
      setForm({
        ...form,
        selectedEntries: [...form.selectedEntries, entryId]
      });
    }
  };

  const calculateTotalFromEntries = () => {
    return form.selectedEntries.reduce((total, entryId) => {
      const entry = pendingEntries.find(e => e._id === entryId);
      return total + (entry?.tds || 0);
    }, 0);
  };

  const handleSave = async () => {
    if (!form.challanNo || !form.bank || !form.amount || !form.period || !form.depositDate || !form.revenueCode) {
      alert('Please fill all required fields');
      return;
    }

    const totalFromEntries = calculateTotalFromEntries();
    const amount = parseFloat(form.amount);

    if (form.selectedEntries.length > 0 && Math.abs(totalFromEntries - amount) > 0.01) {
      alert(`Amount (${amount}) must match total TDS from selected entries (${totalFromEntries})`);
      return;
    }

    setIsLoading(true);
    try {
      await saveChallan({
        challanNo: form.challanNo,
        bank: form.bank,
        bsr: form.bsr,
        amount,
        period: form.period,
        depositDate: form.depositDate,
        revenueCode: form.revenueCode,
        entryIds: form.selectedEntries
      } as {
        challanNo: string;
        bank: string;
        bsr: string;
        amount: number;
        period: string;
        depositDate: string;
        revenueCode: string;
        entryIds: string[];
      });

      // Reload data
      const [challansRes, pendingRes] = await Promise.all([
        fetchChallans(),
        fetchPendingEntries()
      ]);

      if (challansRes.success) setChallans(challansRes.data || []);
      if (pendingRes.success) setPendingEntries(pendingRes.data || []);

      setShowForm(false);
      setForm({ 
        challanNo: '', 
        bank: '', 
        bsr: '', 
        amount: '', 
        period: '', 
        depositDate: '', 
        revenueCode: '11131',
        selectedEntries: []
      });
    } catch (error) {
      console.error('Failed to save challan:', error);
      alert('Failed to save challan');
    } finally {
      setIsLoading(false);
    }
  };

  const IRD_BANKS = ['Nepal Bank Ltd','Rastriya Banijya Bank','Agricultural Development Bank','Nabil Bank','NIC Asia Bank','Global IME Bank','Everest Bank'];

  return (
    <div className="tds-subpage">
      <div className="tds-subpage-header">
        <div>
          <h2 className="tds-subpage-title">Challan Management</h2>
          <p className="tds-subpage-sub">Track and manage TDS deposit challans — due by 25th of each month</p>
        </div>
        <button className="tds-btn-primary" onClick={()=>setShowForm(!showForm)}>
          <Plus size={14}/> New Challan
        </button>
      </div>

      <div className="tds-ird-note">
        <Info size={14}/>
        <span>Deposit TDS via IRD Taxpayer Portal (ird.gov.np) or at an IRD-approved bank. Revenue Codes: <strong>11211</strong> (SST) · <strong>11111</strong> (Remuneration Tax) · <strong>11131</strong> (Service/Rent/Contract)</span>
      </div>

      <div className="tds-challan-pills">
        <div className="pill pill-blue"><span>Total Challans</span><strong>{challans.length}</strong></div>
        <div className="pill pill-green"><span>Deposited</span><strong>{challans.filter(c=>c.status==='deposited').length}</strong></div>
        <div className="pill pill-yellow"><span>Pending</span><strong>{challans.filter(c=>c.status==='pending').length}</strong></div>
        <div className="pill pill-red"><span>Overdue</span><strong>{challans.filter(c=>c.status==='overdue').length}</strong></div>
        <div className="pill pill-purple"><span>Pending Entries</span><strong>{pendingEntries.length}</strong></div>
      </div>

      {showForm && (
        <div className="tds-card tds-inline-form">
          <div className="tds-inline-form-header">
            <h3 className="tds-section-title">Add New Challan</h3>
            <button className="tds-icon-btn" onClick={()=>setShowForm(false)}>
              <X size={16}/>
            </button>
          </div>
          
          {/* Pending Entries Selection */}
          {pendingEntries.length > 0 && (
            <div className="tds-field tds-field-full">
              <label>Select Pending TDS Entries to Link</label>
              <div className="tds-entries-selection">
                <div className="tds-entries-list">
                  {pendingEntries.map(entry => (
                    <div key={entry._id} className="tds-entry-item">
                      <input
                        type="checkbox"
                        checked={form.selectedEntries.includes(entry._id)}
                        onChange={() => handleEntryToggle(entry._id)}
                      />
                      <div className="tds-entry-details">
                        <strong>{entry.payeeName}</strong>
                        <span>{entry.payeePAN} · {entry.ruleName}</span>
                        <span>NPR {entry.tds.toLocaleString()} TDS</span>
                      </div>
                    </div>
                  ))}
                </div>
                {form.selectedEntries.length > 0 && (
                  <div className="tds-selection-summary">
                    <span>Selected {form.selectedEntries.length} entries</span>
                    <span>Total TDS: NPR {calculateTotalFromEntries().toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="tds-form-grid">
            <div className="tds-field">
              <label>Challan Number</label>
              <div className="tds-input-wrap">
                <Hash size={14}/>
                <input 
                  placeholder="CHN-2081-005" 
                  value={form.challanNo} 
                  onChange={e=>setForm({...form,challanNo:e.target.value})}
                />
              </div>
            </div>
            <div className="tds-field">
              <label>Bank Name (IRD-approved)</label>
              <div className="tds-input-wrap">
                <Building size={14}/>
                <select value={form.bank} onChange={e=>setForm({...form,bank:e.target.value})}>
                  <option value="">Select bank...</option>
                  {IRD_BANKS.map(b=><option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="tds-field">
              <label>BSR Code</label>
              <div className="tds-input-wrap">
                <Hash size={14}/>
                <input 
                  placeholder="Bank BSR Code" 
                  value={form.bsr} 
                  onChange={e=>setForm({...form,bsr:e.target.value})}
                />
              </div>
            </div>
            <div className="tds-field">
              <label>Amount (NPR)</label>
              <div className="tds-input-wrap">
                <DollarSign size={14}/>
                <input 
                  type="number" 
                  placeholder="0" 
                  value={form.amount} 
                  onChange={e=>setForm({...form,amount:e.target.value})}
                />
                {form.selectedEntries.length > 0 && (
                  <span className="tds-field-hint">
                    Auto-calculated: NPR {calculateTotalFromEntries().toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <div className="tds-field">
              <label>Period (Nepali Month)</label>
              <div className="tds-input-wrap">
                <Calendar size={14}/>
                <select value={form.period} onChange={e=>setForm({...form,period:e.target.value})}>
                  <option value="">Select month...</option>
                  {['Shrawan 2081','Bhadra 2081','Ashwin 2081','Kartik 2081','Mangsir 2081','Poush 2081','Magh 2081','Falgun 2081','Chaitra 2081','Baishak 2082','Jestha 2082','Ashadh 2082'].map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="tds-field">
              <label>Deposit Date</label>
              <div className="tds-input-wrap">
                <Calendar size={14}/>
                <input 
                  type="date" 
                  value={form.depositDate} 
                  onChange={e=>setForm({...form,depositDate:e.target.value})}
                />
              </div>
            </div>
            <div className="tds-field">
              <label>IRD Revenue Code (Shirshak)</label>
              <div className="tds-input-wrap">
                <Hash size={14}/>
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
            <button 
              className="tds-btn-primary" 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : <><Check size={14}/> Save Challan</>}
            </button>
          </div>
        </div>
      )}

      <div className="tds-search-bar">
        <div className="tds-input-wrap tds-search-input">
          <Search size={14}/>
          <input 
            placeholder="Search challans..." 
            value={search} 
            onChange={e=>setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="tds-card tds-table-card">
        <div className="tds-table-wrap">
          <table className="tds-table">
            <thead>
              <tr>
                <th>Challan No.</th><th>Bank</th><th>BSR Code</th><th>Revenue Code</th>
                <th>Period</th><th>Amount</th><th>Deposit Date</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c=>(
                <tr key={c._id}>
                  <td><span className="tds-mono">{c.challanNo}</span></td>
                  <td>{c.bank}</td>
                  <td><span className="tds-mono">{c.bsr}</span></td>
                  <td><span className="code-chip">{c.revenueCode}</span></td>
                  <td>{c.period}</td>
                  <td><strong>NPR {c.amount.toLocaleString()}</strong></td>
                  <td>{c.depositDate}</td>
                  <td><StatusBadge status={c.status}/></td>
                  <td>
                    <div className="tds-row-actions">
                      <button className="tds-icon-btn" title="View"><Eye size={14}/></button>
                      <button className="tds-icon-btn" title="Edit"><Edit2 size={14}/></button>
                      <button className="tds-icon-btn tds-icon-red" title="Delete"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChallansPage;
