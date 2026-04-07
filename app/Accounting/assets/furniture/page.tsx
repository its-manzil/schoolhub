"use client";

import React from "react";
import CategoryAssetsPage from "../category_template";

const FurnitureAssets = () => {
  const assets = [
    { id: 1, code: "FUR-001", name: "Classroom Desks (Set of 50)", brand: "Local Carpentry", location: "Block A", cost: 450000, date: "2080-03-15", status: "Active" },
    { id: 2, code: "FUR-002", name: "Office Executive Chairs", brand: "Godrej", location: "Admin Office", cost: 120000, date: "2081-01-10", status: "Active" },
    { id: 3, code: "FUR-003", name: "Staff Room Sofa Set", brand: "Comfort Plus", location: "Staff Room", cost: 85000, date: "2079-11-20", status: "Active" },
  ];

  return <CategoryAssetsPage categoryName="Furniture" categoryTitle="Furniture & Fixtures" assets={assets} />;
};

export default FurnitureAssets;
