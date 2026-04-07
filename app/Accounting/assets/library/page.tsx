"use client";

import React from "react";
import CategoryAssetsPage from "../category_template";

const LibraryAssets = () => {
  const assets = [
    { id: 1, code: "LIB-001", name: "Britannica Encyclopedia Set", brand: "Oxford", location: "Library", cost: 45000, date: "2079-05-20", status: "Active" },
    { id: 2, code: "LIB-002", name: "Digital Resource Server", brand: "QNAP", location: "Library", cost: 185000, date: "2081-01-05", status: "Active" },
  ];

  return <CategoryAssetsPage categoryName="Library" categoryTitle="Library Resources" assets={assets} />;
};

export default LibraryAssets;
