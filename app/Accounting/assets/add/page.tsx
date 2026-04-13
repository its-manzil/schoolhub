"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import { ChevronLeft, Save, X } from "lucide-react";
import "./add.css";

const AddAssetPage = () => {
  const router = useRouter();

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
        <div className="add-asset-card">
          <form className="asset-form">
            <div className="form-grid">
              {/* Asset Name */}
              <div className="form-group">
                <label>Asset Name <span className="required">*</span></label>
                <input type="text" placeholder="e.g., Dell Latitude Laptop" required />
              </div>

              {/* Category */}
              <div className="form-group">
                <label>Category <span className="required">*</span></label>
                <select required>
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
                <input type="text" placeholder="YYYY-MM-DD" required />
              </div>

              {/* Cost */}
              <div className="form-group">
                <label>Purchase Cost (NPR) <span className="required">*</span></label>
                <input type="number" placeholder="0.00" required />
              </div>

              {/* Vendor Name */}
              <div className="form-group">
                <label>Vendor Name</label>
                <input type="text" placeholder="Supplier name" />
              </div>

              {/* Invoice Number */}
              <div className="form-group">
                <label>Invoice Number</label>
                <input type="text" placeholder="INV-000" />
              </div>

              {/* Location */}
              <div className="form-group">
                <label>Location / Department</label>
                <input type="text" placeholder="e.g., IT Lab, Admin Office" />
              </div>

              {/* Useful Life */}
              <div className="form-group">
                <label>Useful Life (Years)</label>
                <input type="number" placeholder="5" />
              </div>

              {/* Depreciation Rate */}
              <div className="form-group">
                <label>Depreciation Rate (%)</label>
                <input type="number" placeholder="15" />
              </div>

              {/* Residual Value */}
              <div className="form-group">
                <label>Residual Value (NPR)</label>
                <input type="number" placeholder="0.00" />
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
      </div>
    </Layout>
  );
};

export default AddAssetPage;
