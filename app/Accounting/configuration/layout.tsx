"use client";

import React from 'react';
import Layout from '../components/Layout';
import Sidebar from './components/Sidebar';
import styles from './styles/ConfigurationLayout.module.css';

const ConfigurationLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Layout>
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </Layout>
  );
};

export default ConfigurationLayout;
