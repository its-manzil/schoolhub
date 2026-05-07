"use client";

import React from "react";
import CategoryAssetsPage from "../category_template";

const ITAssets = () => {
  const assets = [
    { id: 1, code: "IT-001", name: "Dell Latitude 5420 Laptops", brand: "Dell", location: "IT Lab", cost: 1250000, date: "2080-04-05", status: "Active" },
    { id: 2, code: "IT-002", name: "HP Laserjet Pro Printers", brand: "HP", location: "Exam Dept", cost: 85000, date: "2081-02-12", status: "Active" },
    { id: 3, code: "IT-003", name: "Cisco Networking Switches", brand: "Cisco", location: "Server Room", cost: 340000, date: "2079-12-20", status: "Active" },
  ];

  return <CategoryAssetsPage categoryName="IT" categoryTitle="Computers & IT" assets={assets} />;
};

export default ITAssets;
