'use client';

import React, { useState } from 'react';
import styles from './BillEdit.module.css';
import { SectionType } from '../../../types/billing';

export const BillEdit: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bill' | 'receipt'>('bill');
  const [discount, setDiscount] = useState(0);
  const [amount, setAmount] = useState(9700);

  const netAmount = amount - discount;

  return (
    <div id="bill-edit" className="content-section active">
      <div className="filter-card">
        <div className="filter-grid" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
          <div className="filter-group">
            <select className="filter-input">
              <option value="THREE(1)">THREE(1)</option>
              <option value="FOUR(1)">FOUR(1)</option>
            </select>
          </div>
          <div className="filter-group">
            <input type="date" className="filter-input" defaultValue="2082-07-15" />
          </div>
        </div>
      </div>

      <div className={styles.editCard}>
        <div className={styles.editCardHeader}>Bill And Receipt Information</div>
        <div className={styles.editFormRow}>
          <div className={styles.editFormGroup}>
            <label>Reg. No :</label>
            <input type="text" className="filter-input" defaultValue="079/035" />
          </div>
          <div className={styles.editFormGroup}>
            <label>Student Name :</label>
            <input type="text" className="filter-input" defaultValue="MANISHA KHATIWATA" />
          </div>
          <button className={styles.btnSearchIcon}><i className="fas fa-search"></i></button>
        </div>

        <div className={styles.editTabs}>
          <div 
            className={`${styles.editTab} ${activeTab === 'bill' ? styles.active : ''}`}
            onClick={() => setActiveTab('bill')}
          >
            Bill Edit
          </div>
          <div 
            className={`${styles.editTab} ${activeTab === 'receipt' ? styles.active : ''}`}
            onClick={() => setActiveTab('receipt')}
          >
            Receipt Edit
          </div>
        </div>

        {activeTab === 'bill' ? (
          <div id="bill-edit-tab">
            <div className={styles.tabActions}>
              <input 
                type="text" 
                defaultValue="847" 
                className="filter-input"
                style={{ width: '150px' }} 
              />
              <button className={styles.btnSearchIcon}><i className="fas fa-search"></i></button>
              <button className={styles.btnCancelReceipt}>Request for Cancel (Receipt)</button>
            </div>

            <div className="table-container">
              <table className={styles.feeEditTable}>
                <thead>
                  <tr>
                    <th>SNo</th>
                    <th>Fee Title</th>
                    <th>Discount</th>
                    <th>Amount</th>
                    <th>Net Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Monthly Fee</td>
                    <td>
                      <input 
                        type="number" 
                        value={discount} 
                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} 
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} 
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={netAmount} 
                        disabled 
                        style={{ background: '#f1f1f1' }} 
                      />
                    </td>
                    <td>
                      <button className={styles.btnPlus}><i className="fas fa-plus"></i></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div id="receipt-edit-tab" className={styles.receiptEditContainer}>
            {/* Student Search Header */}
            <div className={styles.studentSearchHeader}>
              <h3>Student Search & Transaction Lookup</h3>
              <div className={styles.grid + ' ' + styles.gridCols12 + ' ' + styles.gap4}>
                <div className={styles.colSpan3}>
                  <label>Registration No</label>
                  <input 
                    type="text" 
                    className={styles.wFull + ' ' + styles.px3 + ' ' + styles.py2 + ' ' + styles.border + ' ' + styles.borderGray300 + ' ' + styles.roundedMd + ' ' + styles.focusRing2 + ' ' + styles.focusRingBlue500 + ' ' + styles.focusBorderBlue500}
                    placeholder="Enter Reg No"
                  />
                </div>
                <div className={styles.colSpan4}>
                  <label>Student Name</label>
                  <input 
                    type="text" 
                    className={styles.wFull + ' ' + styles.px3 + ' ' + styles.py2 + ' ' + styles.border + ' ' + styles.borderGray300 + ' ' + styles.roundedMd + ' ' + styles.focusRing2 + ' ' + styles.focusRingBlue500 + ' ' + styles.focusBorderBlue500}
                    placeholder="Enter Student Name"
                  />
                </div>
                <div className={styles.colSpan3}>
                  <label>Transaction Lookup</label>
                  <input 
                    type="text" 
                    className={styles.wFull + ' ' + styles.px3 + ' ' + styles.py2 + ' ' + styles.border + ' ' + styles.borderGray300 + ' ' + styles.roundedMd + ' ' + styles.focusRing2 + ' ' + styles.focusRingBlue500 + ' ' + styles.focusBorderBlue500}
                    placeholder="Invoice/Receipt No"
                  />
                </div>
                <div className={styles.colSpan2 + ' ' + styles.flex + ' ' + styles.itemsEnd}>
                  <button className={styles.wFull + ' ' + styles.bgGreen600 + ' ' + styles.textWhite + ' ' + styles.px4 + ' ' + styles.py2 + ' ' + styles.roundedMd + ' ' + styles.hoverBgGreen700 + ' ' + styles.transitionColors}>
                    <i className="fas fa-search mr-2"></i>Search
                  </button>
                </div>
              </div>
            </div>

            {/* Mutation Table */}
            <div className={styles.mutationTableContainer + ' ' + styles.bgWhite + ' ' + styles.roundedLg + ' ' + styles.shadowSm + ' ' + styles.border + ' ' + styles.borderGray200 + ' ' + styles.mb6}>
              <div className={styles.px4 + ' ' + styles.py3 + ' ' + styles.borderB + ' ' + styles.borderGray200}>
                <h4>Transaction Mutations</h4>
              </div>
              <div className={styles.overflowXAuto}>
                <table className={styles.wFull}>
                  <thead className={styles.bgGray50}>
                    <tr>
                      <th className={styles.px4 + ' ' + styles.py3 + ' ' + styles.textLeft + ' ' + styles.textXs + ' ' + styles.fontMedium + ' ' + styles.textGray500 + ' ' + styles.uppercase + ' ' + styles.trackingWider}>Invoice No</th>
                      <th className={styles.px4 + ' ' + styles.py3 + ' ' + styles.textLeft + ' ' + styles.textXs + ' ' + styles.fontMedium + ' ' + styles.textGray500 + ' ' + styles.uppercase + ' ' + styles.trackingWider}>
                        <i className="fas fa-lock text-gray-400 mr-1"></i>Locked Date
                      </th>
                      <th className={styles.px4 + ' ' + styles.py3 + ' ' + styles.textLeft + ' ' + styles.textXs + ' ' + styles.fontMedium + ' ' + styles.textGray500 + ' ' + styles.uppercase + ' ' + styles.trackingWider}>
                        <i className="fas fa-lock text-gray-400 mr-1"></i>Tax Field
                      </th>
                      <th className={styles.px4 + ' ' + styles.py3 + ' ' + styles.textLeft + ' ' + styles.textXs + ' ' + styles.fontMedium + ' ' + styles.textGray500 + ' ' + styles.uppercase + ' ' + styles.trackingWider}>Original Due</th>
                      <th className={styles.px4 + ' ' + styles.py3 + ' ' + styles.textLeft + ' ' + styles.textXs + ' ' + styles.fontMedium + ' ' + styles.textGray500 + ' ' + styles.uppercase + ' ' + styles.trackingWider}>Discount</th>
                      <th className={styles.px4 + ' ' + styles.py3 + ' ' + styles.textLeft + ' ' + styles.textXs + ' ' + styles.fontMedium + ' ' + styles.textGray500 + ' ' + styles.uppercase + ' ' + styles.trackingWider}>Applied Amount</th>
                      <th className={styles.px4 + ' ' + styles.py3 + ' ' + styles.textLeft + ' ' + styles.textXs + ' ' + styles.fontMedium + ' ' + styles.textGray500 + ' ' + styles.uppercase + ' ' + styles.trackingWider}>New Balance</th>
                    </tr>
                  </thead>
                  <tbody className={styles.bgWhite + ' ' + styles.divideY + ' ' + styles.divideGray200}>
                    <tr>
                      <td className={styles.px4 + ' ' + styles.py3 + ' ' + styles.textSm + ' ' + styles.fontMedium + ' ' + styles.textGray900}>INV-2024-001</td>
                      <td className={styles.px4 + ' ' + styles.py3 + ' ' + styles.textSm + ' ' + styles.textGray500}>2081-03-15</td>
                      <td className={styles.px4 + ' ' + styles.py3 + ' ' + styles.textSm + ' ' + styles.textGray500}>13%</td>
                      <td className={styles.px4 + ' ' + styles.py3 + ' ' + styles.textSm + ' ' + styles.textGray900}>Rs.15,000.00</td>
                      <td className={styles.px4 + ' ' + styles.py3 + ' ' + styles.textSm + ' ' + styles.textGray900}>Rs.500.00</td>
                      <td className={styles.px4 + ' ' + styles.py3}>
                        <input 
                          type="number" 
                          className={styles.wFull + ' ' + styles.px2 + ' ' + styles.py1 + ' ' + styles.border + ' ' + styles.borderBlue300 + ' ' + styles.rounded + ' ' + styles.focusRing2 + ' ' + styles.focusRingBlue500 + ' ' + styles.focusBorderBlue500}
                          defaultValue="14500.00"
                        />
                      </td>
                      <td className={styles.px4 + ' ' + styles.py3 + ' ' + styles.textSm + ' ' + styles.fontMedium + ' ' + styles.textGreen600}>Rs.0.00</td>
                    </tr>
                    <tr>
                      <td className={styles.px4 + ' ' + styles.py3 + ' ' + styles.textSm + ' ' + styles.fontMedium + ' ' + styles.textGray900}>INV-2024-002</td>
                      <td className={styles.px4 + ' ' + styles.py3 + ' ' + styles.textSm + ' ' + styles.textGray500}>2081-04-15</td>
                      <td className={styles.px4 + ' ' + styles.py3 + ' ' + styles.textSm + ' ' + styles.textGray500}>13%</td>
                      <td className={styles.px4 + ' ' + styles.py3 + ' ' + styles.textSm + ' ' + styles.textGray900}>Rs.15,000.00</td>
                      <td className={styles.px4 + ' ' + styles.py3 + ' ' + styles.textSm + ' ' + styles.textGray900}>Rs.0.00</td>
                      <td className={styles.px4 + ' ' + styles.py3}>
                        <input 
                          type="number" 
                          className={styles.wFull + ' ' + styles.px2 + ' ' + styles.py1 + ' ' + styles.border + ' ' + styles.borderBlue300 + ' ' + styles.rounded + ' ' + styles.focusRing2 + ' ' + styles.focusRingBlue500 + ' ' + styles.focusBorderBlue500}
                          defaultValue="15000.00"
                        />
                      </td>
                      <td className={styles.px4 + ' ' + styles.py3 + ' ' + styles.textSm + ' ' + styles.fontMedium + ' ' + styles.textRed600}>Rs.15,000.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Correction Controls */}
            <div className={styles.correctionControls + ' ' + styles.bgWhite + ' ' + styles.roundedLg + ' ' + styles.shadowSm + ' ' + styles.border + ' ' + styles.borderGray200 + ' ' + styles.mb6}>
              <div className={styles.px4 + ' ' + styles.py3 + ' ' + styles.borderB + ' ' + styles.borderGray200}>
                <h4>Correction Controls</h4>
              </div>
              <div className={styles.p4}>
                <div className={styles.grid + ' ' + styles.gridCols12 + ' ' + styles.gap4}>
                  <div className={styles.colSpan3}>
                    <label>Payment Mode <span className={styles.required}>*</span></label>
                    <select className={styles.wFull + ' ' + styles.px3 + ' ' + styles.py2 + ' ' + styles.border + ' ' + styles.borderGray300 + ' ' + styles.roundedMd + ' ' + styles.focusRing2 + ' ' + styles.focusRingBlue500 + ' ' + styles.focusBorderBlue500}>
                      <option value="">Select Payment Mode</option>
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="online">Online Payment</option>
                      <option value="card">Card Payment</option>
                    </select>
                  </div>
                  <div className={styles.colSpan3}>
                    <label>Effective Date (BS) <span className={styles.required}>*</span></label>
                    <input 
                      type="text" 
                      className={styles.wFull + ' ' + styles.px3 + ' ' + styles.py2 + ' ' + styles.border + ' ' + styles.borderGray300 + ' ' + styles.roundedMd + ' ' + styles.focusRing2 + ' ' + styles.focusRingBlue500 + ' ' + styles.focusBorderBlue500}
                      placeholder="2081-XX-XX"
                    />
                  </div>
                  <div className={styles.colSpan6}>
                    <label>Remarks <span className={styles.required}>*</span></label>
                    <textarea 
                      className={styles.wFull + ' ' + styles.px3 + ' ' + styles.py2 + ' ' + styles.border + ' ' + styles.borderGray300 + ' ' + styles.roundedMd + ' ' + styles.focusRing2 + ' ' + styles.focusRingBlue500 + ' ' + styles.focusBorderBlue500}
                      rows={3}
                      placeholder="Enter correction remarks..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className={styles.actionBar + ' ' + styles.bgWhite + ' ' + styles.roundedLg + ' ' + styles.shadowSm + ' ' + styles.border + ' ' + styles.borderGray200 + ' ' + styles.mb6}>
              <div className={styles.p4 + ' ' + styles.flex + ' ' + styles.justifyBetween + ' ' + styles.itemsCenter}>
                <div className={styles.flex + ' ' + styles.spaceX3}>
                  <button className={styles.btnUpdate}>
                    <i className="fas fa-save mr-2"></i>Update Receipt
                  </button>
                  <button className={styles.btnVoid}>
                    <i className="fas fa-trash-alt mr-2"></i>Void Receipt
                  </button>
                  <button className={styles.btnPrint}>
                    <i className="fas fa-print mr-2"></i>Print Revised Receipt
                  </button>
                </div>
                <div className={styles.textSm + ' ' + styles.textGray500}>
                  <i className="fas fa-info-circle mr-1"></i>
                  IRD Compliance: All changes are logged and tracked
                </div>
              </div>
            </div>

            {/* Audit Sidebar */}
            <div className={styles.auditSidebar + ' ' + styles.bgWhite + ' ' + styles.roundedLg + ' ' + styles.shadowSm + ' ' + styles.border + ' ' + styles.borderGray200}>
              <div className={styles.px4 + ' ' + styles.py3 + ' ' + styles.borderB + ' ' + styles.borderGray200 + ' ' + styles.bgBlue50}>
                <h4>
                  <i className="fas fa-shield-alt mr-2"></i>Non-Repudiation Logs
                </h4>
              </div>
              <div className={styles.p4}>
                <div className={styles.spaceY3}>
                  <div className={styles.borderL4 + ' ' + styles.borderBlue400 + ' ' + styles.pl4 + ' ' + styles.py2}>
                    <div className={styles.flex + ' ' + styles.justifyBetween + ' ' + styles.itemsStart}>
                      <div>
                        <p className={styles.textSm + ' ' + styles.fontMedium + ' ' + styles.textGray900}>Transaction Modified</p>
                        <p className={styles.textXs + ' ' + styles.textGray500}>Invoice: INV-2024-001</p>
                      </div>
                      <span className={styles.textXs + ' ' + styles.textGray400}>2081-04-22 14:30:15</span>
                    </div>
                    <div className={styles.mt2 + ' ' + styles.grid + ' ' + styles.gridCols2 + ' ' + styles.gap4 + ' ' + styles.textXs}>
                      <div>
                        <p className={styles.textGray500}>Previous:</p>
                        <p className={styles.textRed600}>Applied: Rs.14,000.00</p>
                      </div>
                      <div>
                        <p className={styles.textGray500}>New:</p>
                        <p className={styles.textGreen600}>Applied: Rs.14,500.00</p>
                      </div>
                    </div>
                    <p className={styles.textXs + ' ' + styles.textGray500 + ' ' + styles.mt1}>Actor: ADMIN-001 (System Administrator)</p>
                  </div>

                  <div className={styles.borderL4 + ' ' + styles.borderYellow400 + ' ' + styles.pl4 + ' ' + styles.py2}>
                    <div className={styles.flex + ' ' + styles.justifyBetween + ' ' + styles.itemsStart}>
                      <div>
                        <p className={styles.textSm + ' ' + styles.fontMedium + ' ' + styles.textGray900}>Discount Applied</p>
                        <p className={styles.textXs + ' ' + styles.textGray500}>Invoice: INV-2024-002</p>
                      </div>
                      <span className={styles.textXs + ' ' + styles.textGray400}>2081-04-22 13:15:30</span>
                    </div>
                    <div className={styles.mt2 + ' ' + styles.grid + ' ' + styles.gridCols2 + ' ' + styles.gap4 + ' ' + styles.textXs}>
                      <div>
                        <p className={styles.textGray500}>Previous:</p>
                        <p className={styles.textRed600}>Discount: Rs.0.00</p>
                      </div>
                      <div>
                        <p className={styles.textGray500}>New:</p>
                        <p className={styles.textGreen600}>Discount: Rs.500.00</p>
                      </div>
                    </div>
                    <p className={styles.textXs + ' ' + styles.textGray500 + ' ' + styles.mt1}>Actor: FIN-003 (Finance Officer)</p>
                  </div>

                  <div className={styles.borderL4 + ' ' + styles.borderGreen400 + ' ' + styles.pl4 + ' ' + styles.py2}>
                    <div className={styles.flex + ' ' + styles.justifyBetween + ' ' + styles.itemsStart}>
                      <div>
                        <p className={styles.textSm + ' ' + styles.fontMedium + ' ' + styles.textGray900}>Receipt Generated</p>
                        <p className={styles.textXs + ' ' + styles.textGray500}>Invoice: INV-2024-001</p>
                      </div>
                      <span className={styles.textXs + ' ' + styles.textGray400}>2081-04-20 10:45:00</span>
                    </div>
                    <div className={styles.mt2 + ' ' + styles.textXs}>
                      <p className={styles.textGray500}>Action: Initial receipt creation</p>
                      <p className={styles.textGray500}>Amount: Rs.15,000.00</p>
                    </div>
                    <p className={styles.textXs + ' ' + styles.textGray500 + ' ' + styles.mt1}>Actor: SYS-001 (Automated System)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
