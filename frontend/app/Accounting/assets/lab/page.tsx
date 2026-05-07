"use client";

import React from "react";
import CategoryAssetsPage from "../category_template";

const LabAssets = () => {
  const assets = [
    { id: 1, code: "LAB-001", name: "Compound Microscopes (Set of 10)", brand: "Olympus", location: "Biology Lab", cost: 250000, date: "2080-08-15", status: "Active" },
    { id: 2, code: "LAB-002", name: "Digital Weighing Scales", brand: "Shimadzu", location: "Chemistry Lab", cost: 45000, date: "2081-03-10", status: "Active" },
  ];

  return <CategoryAssetsPage categoryName="Lab" categoryTitle="Laboratory Equipment" assets={assets} />;
};

export default LabAssets;
