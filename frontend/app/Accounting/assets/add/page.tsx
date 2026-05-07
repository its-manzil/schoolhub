"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import { ChevronLeft, Save, X } from "lucide-react";
import "./add.css";

const AddAssetPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    assetName: '',
    category: '',
    purchaseDate: '',
    purchaseCost: '',
    vendorName: '',
    invoiceNumber: '',
    location: '',
    usefulLife: '',
    depreciationRate: '',
    residualValue: ''
  });
  const [isSaved, setIsSaved] = useState(false);
  const [savedAsset, setSavedAsset] = useState<typeof formData | null>(null);

  const formatBSDate = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 4) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 4)}-${digits.slice(4, 6)}`;
    } else {
      return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'purchaseDate') {
      setFormData({ ...formData, [name]: formatBSDate(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedAsset(formData);
    setIsSaved(true);
  };

  const handleReset = () => {
    setFormData({
      assetName: '',
      category: '',
      purchaseDate: '',
      purchaseCost: '',
      vendorName: '',
      invoiceNumber: '',
      location: '',
      usefulLife: '',
      depreciationRate: '',
      residualValue: ''
    });
    setSavedAsset(null);
    setIsSaved(false);
  };

  return (
    <Layout>
      <div className="add-asset-container">
        {/* Header */}
        <div className="add-asset-header">
          <button className="back-btn" onClick={() => router.back()}>
            <ChevronLeft size={18} />
            Back
          </button>
          <div className="header-title">
            <h1>Add New Asset</h1>
            <p>Register a new fixed asset into the school&apos;s inventory.</p>
          </div>
        </div>

        {/* Form Card */}
        {!isSaved ? (
          <div className="add-asset-card">
            <form className="asset-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                {/* Asset Name */}
                <div className="form-group">
                  <label>Asset Name <span className="required">*</span></label>
                  <input 
                    type="text" 
                    name="assetName"
                    placeholder="e.g., Dell Latitude Laptop" 
                    required 
                    value={formData.assetName}
                    onChange={handleChange}
                  />
                </div>

                {/* Category */}
                <div className="form-group">
                  <label>Category <span className="required">*</span></label>
                  <select 
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">Select Category</option>
                    <option value="land">Land & Buildings</option>
                    <option value="furniture">Furniture & Fixtures</option>
                    <option value="it">Computers & IT</option>
                    <option value="vehicles">Vehicles</option>
                    <option value="library">Library Books</option>
                    <option value="lab">Lab Equipment</option>
                  </select>
                </div>

                {/* Purchase Date */}
                <div className="form-group">
                  <label>Purchase Date (BS) <span className="required">*</span></label>
                  <input 
                    type="text" 
                    name="purchaseDate"
                    placeholder="YYYY-MM-DD" 
                    required 
                    value={formData.purchaseDate}
                    onChange={handleChange}
                  />
                </div>

                {/* Cost */}
                <div className="form-group">
                  <label>Purchase Cost (NPR) <span className="required">*</span></label>
                  <input 
                    type="number" 
                    name="purchaseCost"
                    placeholder="0.00" 
                    required 
                    value={formData.purchaseCost}
                    onChange={handleChange}
                  />
                </div>

                {/* Vendor Name */}
                <div className="form-group">
                  <label>Vendor Name</label>
                  <input 
                    type="text" 
                    name="vendorName"
                    placeholder="Supplier name" 
                    value={formData.vendorName}
                    onChange={handleChange}
                  />
                </div>

                {/* Invoice Number */}
                <div className="form-group">
                  <label>Invoice Number</label>
                  <input 
                    type="text" 
                    name="invoiceNumber"
                    placeholder="INV-000" 
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                  />
                </div>

                {/* Location */}
                <div className="form-group">
                  <label>Location / Department</label>
                  <input 
                    type="text" 
                    name="location"
                    placeholder="e.g., IT Lab, Admin Office" 
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>

                {/* Useful Life */}
                <div className="form-group">
                  <label>Useful Life (Years)</label>
                  <input 
                    type="number" 
                    name="usefulLife"
                    placeholder="5" 
                    value={formData.usefulLife}
                    onChange={handleChange}
                  />
                </div>

                {/* Depreciation Rate */}
                <div className="form-group">
                  <label>Depreciation Rate (%)</label>
                  <input 
                    type="number" 
                    name="depreciationRate"
                    placeholder="15" 
                    value={formData.depreciationRate}
                    onChange={handleChange}
                  />
                </div>

                {/* Residual Value */}
                <div className="form-group">
                  <label>Residual Value (NPR)</label>
                  <input 
                    type="number" 
                    name="residualValue"
                    placeholder="0.00" 
                    value={formData.residualValue}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Checkbox */}
              <div className="form-checkbox">
                <input type="checkbox" id="create-entry" />
                <label htmlFor="create-entry">Create Accounting Entry (Journal Voucher)</label>
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => router.back()}>
                  <X size={18} />
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  <Save size={18} />
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Result Container */
          <div className="add-asset-card">
            <div className="asset-result-container">
              <div className="result-header">
                <h2>Asset Successfully Added</h2>
                <p>The following asset has been registered in the inventory.</p>
              </div>
              <div className="result-details">
                <div className="result-row">
                  <span className="result-label">Asset Name:</span>
                  <span className="result-value">{savedAsset?.assetName}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Category:</span>
                  <span className="result-value">{savedAsset?.category}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Purchase Date (BS):</span>
                  <span className="result-value">{savedAsset?.purchaseDate}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Purchase Cost (NPR):</span>
                  <span className="result-value">{savedAsset?.purchaseCost}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Vendor Name:</span>
                  <span className="result-value">{savedAsset?.vendorName || 'N/A'}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Invoice Number:</span>
                  <span className="result-value">{savedAsset?.invoiceNumber || 'N/A'}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Location / Department:</span>
                  <span className="result-value">{savedAsset?.location || 'N/A'}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Useful Life (Years):</span>
                  <span className="result-value">{savedAsset?.usefulLife || 'N/A'}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Depreciation Rate (%):</span>
                  <span className="result-value">{savedAsset?.depreciationRate || 'N/A'}</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Residual Value (NPR):</span>
                  <span className="result-value">{savedAsset?.residualValue || 'N/A'}</span>
                </div>
              </div>
              <div className="result-actions">
                <button type="button" className="btn-cancel" onClick={() => router.back()}>
                  <X size={18} />
                  Back to Assets
                </button>
                <button type="button" className="btn-save" onClick={handleReset}>
                  <Save size={18} />
                  Add Another Asset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AddAssetPage;
