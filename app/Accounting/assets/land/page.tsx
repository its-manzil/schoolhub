"use client";

import React from "react";
import CategoryAssetsPage from "../category_template";

const LandAssets = () => {
  const assets = [
    { id: 1, code: "LND-001", name: "Main Campus Ground", brand: "Real Estate", location: "Kathmandu", cost: 55000000, date: "2075-04-12", status: "Active" },
    { id: 2, code: "LND-002", name: "Hostel Building A", brand: "Structure", location: "Kathmandu", cost: 25000000, date: "2078-05-10", status: "Active" },
    { id: 3, code: "LND-003", name: "Secondary Playground", brand: "Real Estate", location: "Kathmandu", cost: 12000000, date: "2080-02-15", status: "Active" },
  ];

  return <CategoryAssetsPage categoryName="Land" categoryTitle="Land & Buildings" assets={assets} />;
};

export default LandAssets;
