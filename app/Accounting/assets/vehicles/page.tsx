"use client";

import React from "react";
import CategoryAssetsPage from "../category_template";

const VehicleAssets = () => {
  const assets = [
    { id: 1, code: "VEH-001", name: "Tata LP 407 School Bus", brand: "Tata Motors", location: "Garage", cost: 3800000, date: "2078-02-15", status: "Active" },
    { id: 2, code: "VEH-002", name: "Mahindra Scorpio (Principal)", brand: "Mahindra", location: "Garage", cost: 5200000, date: "2080-06-10", status: "Active" },
  ];

  return <CategoryAssetsPage categoryName="Vehicles" categoryTitle="School Vehicles" assets={assets} />;
};

export default VehicleAssets;
