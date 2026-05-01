'use client';

import React, { useState, useEffect } from 'react';
import './ComponentSelector.css';
import { useToast } from '../../../../context/ToastContext';
import { 
  CheckSquare, 
  Square, 
  Calendar, 
  Plus, 
  Minus, 
  Info, 
  Bus, 
  Search, 
  AlertCircle,
  Tag,
  CreditCard,
  Trash2
} from 'lucide-react';

export interface MonthRange {
  fromMonth: number;
  toMonth: number;
}

export interface SelectedComponent {
  id: string;
  name: string;
  qty: number;
  rate: number;
  amount: number;
  frequency?: string;
  monthRange?: MonthRange;
  reason?: string;
  tag?: string;
  instanceId?: string;
  isBusFare?: boolean;
  address?: string;
}

interface FeeComponent {
  id: string;
  name: string;
  category?: string;
  amount: number;
  isActive: boolean;
  frequency?: 'monthly' | 'yearly' | 'weekly' | 'one-time' | 'extra';
}

// Nepali months (Baishakh = 1, Chaitra = 12)
const NEPALI_MONTHS = [
  { value: 1, label: 'Baishakh' },
  { value: 2, label: 'Jestha' },
  { value: 3, label: 'Ashadh' },
  { value: 4, label: 'Shrawan' },
  { value: 5, label: 'Bhadra' },
  { value: 6, label: 'Ashwin' },
  { value: 7, label: 'Kartik' },
  { value: 8, label: 'Mangsir' },
  { value: 9, label: 'Poush' },
  { value: 10, label: 'Magh' },
  { value: 11, label: 'Falgun' },
  { value: 12, label: 'Chaitra' }
];

// Extra fee tag options
const EXTRA_FEE_TAGS = [
  { value: '', label: 'No Tag' },
  { value: 'EXAM', label: 'EXAM' },
  { value: 'FINE', label: 'FINE' },
  { value: 'PENALTY', label: 'PENALTY' },
  { value: 'RETEST', label: 'RETEST' },
  { value: 'OTHER', label: 'OTHER' }
];

interface ComponentSelectorProps {
  selectedComponents: SelectedComponent[];
  onChange: (components: SelectedComponent[]) => void;
  schoolId: number;
  academicYear: string;
  className: string;
  selectedStudentId?: string;
}

// Class mapping: display name -> database storage code
const CLASS_MAPPING: Record<string, string> = {
  'Nursery': '0N',
  'LKG': '0L',
  'UKG': '0U',
  'Class 1': '01',
  'Class 2': '02',
  'Class 3': '03',
  'Class 4': '04',
  'Class 5': '05',
  'Class 6': '06',
  'Class 7': '07',
  'Class 8': '08',
  'Class 9': '09',
  'Class 10': '10',
  'Class 11': '11',
  'Class 12': '12'
};

export default function ComponentSelector({
  selectedComponents,
  onChange,
  schoolId,
  academicYear,
  className,
  selectedStudentId
}: ComponentSelectorProps) {
  const [availableComponents, setAvailableComponents] = useState<FeeComponent[]>([]);
  const [classFees, setClassFees] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [paidComponents, setPaidComponents] = useState<Record<string, { paidMonths: number[]; paidCount: number }>>({});
  const { showToast } = useToast();

  // Bus Fare State
  const [busFareRates, setBusFareRates] = useState<Array<{ _id: string; address: string; displayAddress: string; rate: number }>>([]);
  const [selectedBusFareRate, setSelectedBusFareRate] = useState<{ _id: string; address: string; displayAddress: string; rate: number } | null>(null);
  const [showBusFareLocationSearch, setShowBusFareLocationSearch] = useState(false);
  const [busFareSearchQuery, setBusFareSearchQuery] = useState('');
  const [busFareLoading, setBusFareLoading] = useState(false);
  const [paidBusFareMonths, setPaidBusFareMonths] = useState<number[]>([]);

  useEffect(() => {
    const fetchComponentsAndFees = async () => {
      if (!schoolId || !academicYear) {
        setAvailableComponents([]);
        setClassFees({});
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        // Fetch components
        const componentsResponse = await fetch(
          `http://localhost:2056/api/accounting/fee-management/components?academicYear=${encodeURIComponent(academicYear)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-school-id': schoolId.toString()
            }
          }
        );

        if (!componentsResponse.ok) {
          showToast('Failed to fetch fee components', 'error');
          return;
        }

        const componentsData = await componentsResponse.json();

        if (componentsData.success && componentsData.data) {
          setAvailableComponents(componentsData.data);
        } else {
          setAvailableComponents([]);
        }

        // Fetch class fees for amounts
        if (className) {
          const classCode = CLASS_MAPPING[className] || className;
          const feesResponse = await fetch(
            `http://localhost:2056/api/accounting/fee-management/class-fees?academicYear=${encodeURIComponent(academicYear)}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'x-school-id': schoolId.toString()
              }
            }
          );

          if (feesResponse.ok) {
            const feesData = await feesResponse.json();
            if (feesData.success && feesData.data && feesData.data.length > 0) {
              const classFeeData = feesData.data.find((item: { className: string }) => 
                item.className === classCode
              );
              if (classFeeData && classFeeData.fees) {
                setClassFees(classFeeData.fees);
              } else {
                setClassFees({});
              }
            } else {
              setClassFees({});
            }
          } else {
            setClassFees({});
          }
        }
      } catch (err) {
        console.error('Error fetching components:', err);
        showToast('Failed to load fee components', 'error');
        setAvailableComponents([]);
        setClassFees({});
      } finally {
        setLoading(false);
      }
    };

    fetchComponentsAndFees();
  }, [schoolId, academicYear, className, showToast]);

  const getComponentAmount = (componentId: string): number => {
    // Look up amount from class_fees by component ID (not name)
    return classFees[componentId] || 0;
  };

  // Fetch paid months for student from ledger
  useEffect(() => {
    const fetchPaidMonths = async () => {
      if (!schoolId || !selectedStudentId || !academicYear) {
        setPaidComponents({});
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:2056/api/billing/ledger/${selectedStudentId}?academicYear=${encodeURIComponent(academicYear)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-school-id': schoolId.toString()
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.paidComponents) {
            setPaidComponents(data.data.paidComponents);
          }
        }
      } catch (err) {
        console.error('Error fetching paid months:', err);
      }
    };

    fetchPaidMonths();
  }, [schoolId, selectedStudentId, academicYear]);

  // Fetch bus fare rates when student changes
  useEffect(() => {
    const fetchBusFareData = async () => {
      if (!schoolId || !academicYear || !selectedStudentId) {
        setBusFareRates([]);
        setSelectedBusFareRate(null);
        setPaidBusFareMonths([]);
        return;
      }

      try {
        setBusFareLoading(true);
        const token = localStorage.getItem('token');

        // Fetch student details to get address
        const studentResponse = await fetch(
          `http://localhost:2056/api/students/${selectedStudentId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-school-id': schoolId.toString()
            }
          }
        );

        let address = '';
        if (studentResponse.ok) {
          const studentData = await studentResponse.json();
          if (studentData.success && studentData.data) {
            address = studentData.data.address || '';
          }
        }

        // Fetch all bus fare rates for the academic year
        const ratesResponse = await fetch(
          `http://localhost:2056/api/accounting/bus-fare/rates?academicYear=${encodeURIComponent(academicYear)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-school-id': schoolId.toString()
            }
          }
        );

        if (ratesResponse.ok) {
          const ratesData = await ratesResponse.json();
          if (ratesData.success && ratesData.data) {
            setBusFareRates(ratesData.data);

            // Check if student's address matches any rate
            const matchedRate = ratesData.data.find((r: { address: string }) =>
              address.toLowerCase().includes(r.address.toLowerCase()) ||
              r.address.toLowerCase().includes(address.toLowerCase())
            );

            if (matchedRate) {
              setSelectedBusFareRate(matchedRate);
              setShowBusFareLocationSearch(false);
            } else if (ratesData.data.length > 0) {
              setShowBusFareLocationSearch(true);
            }
          }
        }

        // Fetch paid bus fare months from ledger
        const ledgerResponse = await fetch(
          `http://localhost:2056/api/billing/ledger/${selectedStudentId}?academicYear=${encodeURIComponent(academicYear)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-school-id': schoolId.toString()
            }
          }
        );

        if (ledgerResponse.ok) {
          const ledgerData = await ledgerResponse.json();
          if (ledgerData.success && ledgerData.data && ledgerData.data.paidComponents) {
            const busFarePaid = ledgerData.data.paidComponents['bus-fare'];
            if (busFarePaid) {
              setPaidBusFareMonths(busFarePaid.paidMonths || []);
            } else {
              setPaidBusFareMonths([]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching bus fare data:', err);
      } finally {
        setBusFareLoading(false);
      }
    };

    fetchBusFareData();
  }, [schoolId, selectedStudentId, academicYear]);

  // Handle bus fare checkbox toggle
  const handleBusFareToggle = () => {
    const existingBusFare = selectedComponents.find(c => c.id === 'bus-fare');

    if (existingBusFare) {
      // Remove bus fare
      const updated = selectedComponents.filter(c => c.id !== 'bus-fare');
      onChange(updated);
    } else {
      // Add bus fare - will be added when location is selected
      if (selectedBusFareRate) {
        addBusFareComponent(selectedBusFareRate);
      }
    }
  };

  // Add bus fare component with monthly breakdown
  const addBusFareComponent = (rate: { _id: string; address: string; displayAddress: string; rate: number }) => {
    // Calculate unpaid months (1-12 excluding paid months)
    const allMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const unpaidMonths = allMonths.filter(m => !paidBusFareMonths.includes(m));

    if (unpaidMonths.length === 0) {
      // All months paid
      const busFareComponent: SelectedComponent = {
        id: 'bus-fare',
        name: `Bus Fare (${rate.displayAddress || rate.address})`,
        qty: 0,
        rate: rate.rate,
        amount: 0,
        frequency: 'monthly',
        monthRange: { fromMonth: 1, toMonth: 12 },
        isBusFare: true,
        address: rate.address
      };
      onChange([...selectedComponents, busFareComponent]);
    } else {
      // Add with unpaid month range
      const fromMonth = Math.min(...unpaidMonths);
      const toMonth = Math.max(...unpaidMonths);
      const qty = unpaidMonths.length;

      const busFareComponent: SelectedComponent = {
        id: 'bus-fare',
        name: `Bus Fare (${rate.displayAddress || rate.address})`,
        qty: qty,
        rate: rate.rate,
        amount: rate.rate * qty,
        frequency: 'monthly',
        monthRange: { fromMonth, toMonth },
        isBusFare: true,
        address: rate.address
      };
      onChange([...selectedComponents, busFareComponent]);
    }
  };

  // Handle location selection from search
  const handleLocationSelect = (rate: { _id: string; address: string; displayAddress: string; rate: number }) => {
    setSelectedBusFareRate(rate);
    setShowBusFareLocationSearch(false);

    // If bus fare is already checked, update it
    const existingBusFare = selectedComponents.find(c => c.id === 'bus-fare');
    if (existingBusFare) {
      const updated = selectedComponents.filter(c => c.id !== 'bus-fare');
      onChange(updated);
      setTimeout(() => addBusFareComponent(rate), 0);
    }
  };

  const handleToggleComponent = (component: FeeComponent) => {
    // For extra fees, always create a new instance (allow duplicates)
    if (component.frequency === 'extra') {
      const amount = getComponentAmount(component.id);
      const instanceId = `extra-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newComponent: SelectedComponent = {
        id: component.id,
        instanceId,
        name: component.name,
        qty: 1,
        rate: amount,
        amount: amount,
        frequency: component.frequency,
        reason: '',
        tag: ''
      };
      onChange([...selectedComponents, newComponent]);
      return;
    }

    const existingIndex = selectedComponents.findIndex(c => c.id === component.id);

    if (existingIndex >= 0) {
      // Remove component
      const updated = selectedComponents.filter(c => c.id !== component.id);
      onChange(updated);
    } else {
      // Add component with default qty 1 and amount from class_fees
      const amount = getComponentAmount(component.id);
      
      // For monthly components, calculate default month range
      let monthRange: MonthRange | undefined;
      let qty = 1;
      
      if (component.frequency === 'monthly') {
        const firstUnpaid = getFirstUnpaidMonth(component.id);
        const validToMonth = getValidToMonth(component.id, firstUnpaid);
        if (firstUnpaid <= 12) {
          monthRange = { fromMonth: firstUnpaid, toMonth: validToMonth };
          qty = validToMonth - firstUnpaid + 1;
        }
      } else if (component.frequency === 'yearly') {
        qty = 1;
      }
      
      const newComponent: SelectedComponent = {
        id: component.id,
        name: component.name,
        qty: qty,
        rate: amount,
        amount: amount * qty,
        frequency: component.frequency,
        monthRange
      };
      onChange([...selectedComponents, newComponent]);
    }
  };

  const handleMonthRangeChange = (componentId: string, fromMonth: number, toMonth: number) => {
    const updated = selectedComponents.map(c => {
      if (c.id === componentId) {
        const months = Math.max(1, toMonth - fromMonth + 1);
        return {
          ...c,
          monthRange: { fromMonth, toMonth },
          qty: months,
          amount: months * c.rate
        };
      }
      return c;
    });
    onChange(updated);
  };

  const isMonthPaid = (componentId: string, month: number): boolean => {
    const paidData = paidComponents[componentId];
    return paidData ? paidData.paidMonths.includes(month) : false;
  };

  const isComponentFullyPaid = (component: FeeComponent): boolean => {
    // Extra fees can be repeated, never hide them
    if (component.frequency === 'extra') return false;
    
    const paidData = paidComponents[component.id];
    if (!paidData) return false;
    
    // One-time and yearly: hide if paid once
    if (component.frequency === 'one-time' || component.frequency === 'yearly') {
      return paidData.paidCount > 0;
    }
    
    // Monthly: hide if all 12 months are paid
    if (component.frequency === 'monthly') {
      const paidMonths = paidData.paidMonths || [];
      return paidMonths.length >= 12;
    }
    
    // Weekly: hide if all 52 weeks are paid (assuming 52 weeks in a year)
    if (component.frequency === 'weekly') {
      const paidMonths = paidData.paidMonths || []; // Using paidMonths to store paid weeks
      return paidMonths.length >= 52;
    }
    
    return false;
  };
  
  // Check if component should be shown (for filtering before render)
  const shouldShowComponent = (component: FeeComponent): boolean => {
    // Extra fees always show
    if (component.frequency === 'extra') return true;
    
    // Check if already selected (always show selected components)
    if (isSelected(component.id)) return true;
    
    // Check if fully paid
    return !isComponentFullyPaid(component);
  };
  
  // Get the first unpaid month for monthly fees
  const getFirstUnpaidMonth = (componentId: string): number => {
    const paidData = paidComponents[componentId];
    const paidMonths = paidData?.paidMonths || [];
    
    for (let month = 1; month <= 12; month++) {
      if (!paidMonths.includes(month)) {
        return month;
      }
    }
    return 1; // Fallback to month 1 if all paid (shouldn't happen if filtering works)
  };
  
  // Get the last valid "to" month based on paid months
  const getValidToMonth = (componentId: string, fromMonth: number): number => {
    const paidData = paidComponents[componentId];
    const paidMonths = paidData?.paidMonths || [];
    
    // Find the first paid month after fromMonth
    for (let month = fromMonth + 1; month <= 12; month++) {
      if (paidMonths.includes(month)) {
        return month - 1; // Stop at the month before the paid one
      }
    }
    return 12; // Can go to end of year if no paid months ahead
  };

  const handleQtyChange = (componentId: string, qty: number) => {
    if (qty < 1) qty = 1;

    const updated = selectedComponents.map(c => {
      if (c.id === componentId) {
        return {
          ...c,
          qty,
          amount: qty * c.rate
        };
      }
      return c;
    });

    onChange(updated);
  };

  const isSelected = (componentId: string) => {
    return selectedComponents.some(c => c.id === componentId);
  };

  const getSelectedComponent = (componentId: string) => {
    return selectedComponents.find(c => c.id === componentId);
  };

  // Get all selected instances of an extra fee component
  const getSelectedExtraFeeInstances = (componentId: string) => {
    return selectedComponents.filter(c => c.id === componentId && c.frequency === 'extra');
  };

  // Handle reason change for extra fee instance
  const handleExtraFeeReasonChange = (instanceId: string, reason: string) => {
    const updated = selectedComponents.map(c => {
      if (c.instanceId === instanceId) {
        return { ...c, reason };
      }
      return c;
    });
    onChange(updated);
  };

  // Handle tag change for extra fee instance
  const handleExtraFeeTagChange = (instanceId: string, tag: string) => {
    const updated = selectedComponents.map(c => {
      if (c.instanceId === instanceId) {
        return { ...c, tag };
      }
      return c;
    });
    onChange(updated);
  };

  // Handle rate change for extra fee instance
  const handleExtraFeeRateChange = (instanceId: string, rate: number) => {
    const updated = selectedComponents.map(c => {
      if (c.instanceId === instanceId) {
        return { ...c, rate, amount: rate * c.qty };
      }
      return c;
    });
    onChange(updated);
  };

  // Remove extra fee instance by instanceId
  const handleRemoveExtraFeeInstance = (instanceId: string) => {
    const updated = selectedComponents.filter(c => c.instanceId !== instanceId);
    onChange(updated);
  };

  if (loading) {
    return (
      <div className="component-selector">
        <div className="component-selector-loading">
          <div className="spinner-small"></div>
          <span>Loading components...</span>
        </div>
      </div>
    );
  }

  if (!academicYear || !className) {
    return (
      <div className="component-selector">
        <div className="component-selector-empty">
          <Info size={24} />
          <p>
            {!academicYear 
              ? "Select academic year to view components"
              : "Select class to view fee amounts"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="component-selector">
      <div className="component-selector-header">
        <div className="header-center">
          <CreditCard size="20" className="header-icon" />
          <h3 className="component-selector-title">
            Select Fee Components
            <span className="component-count">{selectedComponents.length} selected</span>
          </h3>
        </div>
      </div>

      <div className="component-selector-content">
        {/* Bus Fare Section */}
        {selectedStudentId && (
          <div className="bus-fare-card">
          {busFareLoading ? (
            <div className="loading-inline">
              <div className="spinner-small"></div>
              <span>Checking bus routes...</span>
            </div>
          ) : busFareRates.length > 0 ? (
            <>
              <div className={`component-item ${isSelected('bus-fare') ? 'selected' : ''}`}>
                <div className="item-checkbox" onClick={handleBusFareToggle}>
                  {isSelected('bus-fare') ? <CheckSquare size={18} className="checked" /> : <Square size={18} />}
                </div>
                <div className="item-info" onClick={handleBusFareToggle}>
                  <div className="item-name-row">
                    <Bus size={16} className="item-icon" />
                    <span className="item-name">Bus Fare</span>
                    {paidBusFareMonths.length === 12 && <span className="paid-badge">Fully Paid</span>}
                  </div>
                  <div className="item-meta">
                    <span className="freq-badge monthly">monthly</span>
                    {selectedBusFareRate && (
                      <span className="location-text">{selectedBusFareRate.displayAddress || selectedBusFareRate.address}</span>
                    )}
                  </div>
                </div>
                
                {!isSelected('bus-fare') && selectedBusFareRate && (
                  <div className="item-price">
                    Rs {selectedBusFareRate.rate.toFixed(2)}/mo
                  </div>
                )}
              </div>

              {!isSelected('bus-fare') && showBusFareLocationSearch && (
                <div className="location-selector-box">
                  <div className="search-box">
                    <Search size={14} className="search-icon" />
                    <input
                      type="text"
                      value={busFareSearchQuery}
                      onChange={(e) => setBusFareSearchQuery(e.target.value)}
                      placeholder="Search route/location..."
                    />
                  </div>
                  <div className="location-list">
                    {busFareRates
                      .filter(rate => 
                        !busFareSearchQuery || 
                        rate.address.toLowerCase().includes(busFareSearchQuery.toLowerCase()) ||
                        rate.displayAddress?.toLowerCase().includes(busFareSearchQuery.toLowerCase())
                      )
                      .map((rate) => (
                        <div 
                          key={rate._id} 
                          className={`location-option ${selectedBusFareRate?._id === rate._id ? 'active' : ''}`}
                          onClick={() => handleLocationSelect(rate)}
                        >
                          <span className="loc-name">{rate.displayAddress || rate.address}</span>
                          <span className="loc-price">Rs {rate.rate.toFixed(2)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {isSelected('bus-fare') && (() => {
                const busFareComponent = selectedComponents.find(c => c.id === 'bus-fare');
                if (!busFareComponent) return null;
                
                return (
                  <div className="range-selector-card">
                    <div className="range-inputs">
                      <div className="range-field">
                        <label>From</label>
                        <select
                          value={busFareComponent.monthRange?.fromMonth || 1}
                          onChange={(e) => {
                            const fromMonth = parseInt(e.target.value);
                            const toMonth = busFareComponent.monthRange?.toMonth || fromMonth;
                            handleMonthRangeChange('bus-fare', fromMonth, Math.max(fromMonth, toMonth));
                          }}
                        >
                          {NEPALI_MONTHS.map((month, idx) => (
                            <option 
                              key={month.value} 
                              value={idx + 1}
                              disabled={paidBusFareMonths.includes(idx + 1)}
                            >
                              {month.label} {paidBusFareMonths.includes(idx + 1) ? '✓' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="range-field">
                        <label>To</label>
                        <select
                          value={busFareComponent.monthRange?.toMonth || busFareComponent.monthRange?.fromMonth || 1}
                          onChange={(e) => {
                            const toMonth = parseInt(e.target.value);
                            const fromMonth = busFareComponent.monthRange?.fromMonth || 1;
                            handleMonthRangeChange('bus-fare', fromMonth, toMonth);
                          }}
                        >
                          {NEPALI_MONTHS.map((month, idx) => (
                            <option 
                              key={month.value} 
                              value={idx + 1}
                              disabled={idx + 1 < (busFareComponent.monthRange?.fromMonth || 1) || paidBusFareMonths.includes(idx + 1)}
                            >
                              {month.label} {paidBusFareMonths.includes(idx + 1) ? '✓' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="range-summary">
                      <Calendar size={14} />
                      <span>{busFareComponent.qty} months × Rs {busFareComponent.rate.toFixed(2)}</span>
                      <span className="total-val">Rs {busFareComponent.amount.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            <div className="no-bus-fare">
              <Info size={16} />
              <span>No bus routes configured for this year</span>
            </div>
          )}
        </div>
      )}

      <div className="component-grid">
        {availableComponents.filter(shouldShowComponent).map((component) => {
          const selected = isSelected(component.id);
          const selectedData = getSelectedComponent(component.id);
          const isFullyPaid = isComponentFullyPaid(component);
          const extraFeeInstances = getSelectedExtraFeeInstances(component.id);
          const isExtraFee = component.frequency === 'extra';

          return (
            <div key={component.id} className="component-card-wrapper">
              <div className={`component-item ${selected ? 'selected' : ''} ${isFullyPaid ? 'paid' : ''}`}>
                <div className="item-checkbox" onClick={() => !isFullyPaid && handleToggleComponent(component)}>
                  {selected ? <CheckSquare size={18} className="checked" /> : <Square size={18} />}
                </div>
                
                <div className="item-info" onClick={() => !isFullyPaid && handleToggleComponent(component)}>
                  <div className="item-name-row">
                    <span className="item-name">{component.name}</span>
                    {isFullyPaid && <span className="paid-badge">Paid</span>}
                    {isExtraFee && <span className="extra-badge">Multiple</span>}
                  </div>
                  <div className="item-meta">
                    {component.category && <span className="cat-badge">{component.category}</span>}
                    {component.frequency && (
                      <span className={`freq-badge ${component.frequency}`}>
                        {component.frequency}
                      </span>
                    )}
                  </div>
                </div>

                {!selected && (
                  <div className="item-price">
                    Rs {getComponentAmount(component.id).toFixed(2)}
                  </div>
                )}

                {selected && selectedData && !isExtraFee && (
                  <div className="item-actions-row">
                    {selectedData.frequency === 'monthly' ? (
                      <div className="range-selector-compact">
                        <select
                          value={selectedData.monthRange?.fromMonth || 1}
                          onChange={(e) => {
                            const fromMonth = parseInt(e.target.value);
                            const toMonth = selectedData.monthRange?.toMonth || fromMonth;
                            handleMonthRangeChange(component.id, fromMonth, Math.max(fromMonth, toMonth));
                          }}
                        >
                          {NEPALI_MONTHS.map((m) => (
                            <option key={m.value} value={m.value} disabled={isMonthPaid(component.id, m.value)}>
                              {m.label.substring(0, 3)}
                            </option>
                          ))}
                        </select>
                        <span className="arrow">→</span>
                        <select
                          value={selectedData.monthRange?.toMonth || 1}
                          onChange={(e) => {
                            const toMonth = parseInt(e.target.value);
                            const fromMonth = selectedData.monthRange?.fromMonth || 1;
                            handleMonthRangeChange(component.id, fromMonth, toMonth);
                          }}
                        >
                          {NEPALI_MONTHS.map((m) => (
                            <option key={m.value} value={m.value} disabled={m.value < (selectedData.monthRange?.fromMonth || 1) || isMonthPaid(component.id, m.value)}>
                              {m.label.substring(0, 3)}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="qty-control">
                        <button onClick={(e) => { e.stopPropagation(); handleQtyChange(component.id, (selectedData.qty || 1) - 1); }}><Minus size={14} /></button>
                        <span>{selectedData.qty}</span>
                        <button onClick={(e) => { e.stopPropagation(); handleQtyChange(component.id, (selectedData.qty || 1) + 1); }}><Plus size={14} /></button>
                      </div>
                    )}
                    <div className="item-total">
                      Rs {selectedData.amount.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              {isExtraFee && extraFeeInstances.length > 0 && (
                <div className="extra-instances-container">
                  {extraFeeInstances.map((instance, idx) => (
                    <div key={instance.instanceId} className="extra-instance-card">
                      <div className="instance-header">
                        <Tag size={14} />
                        <span>Extra Fee #{idx + 1}</span>
                        <button className="remove-instance" onClick={() => handleRemoveExtraFeeInstance(instance.instanceId!)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="instance-body">
                        <input
                          type="text"
                          value={instance.reason || ''}
                          onChange={(e) => handleExtraFeeReasonChange(instance.instanceId!, e.target.value)}
                          placeholder="Reason for extra fee..."
                          className="reason-input"
                        />
                        <div className="instance-row">
                          <select
                            value={instance.tag || ''}
                            onChange={(e) => handleExtraFeeTagChange(instance.instanceId!, e.target.value)}
                          >
                            {EXTRA_FEE_TAGS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                          <div className="price-input-wrapper">
                            <span>Rs</span>
                            <input
                              type="number"
                              value={instance.rate || 0}
                              onChange={(e) => handleExtraFeeRateChange(instance.instanceId!, parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      </div>

      {/* Remove the selection-summary section as requested */}
    </div>
  );
}
