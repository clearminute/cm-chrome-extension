/* global chrome */
import * as React from 'react';
import { useEffect } from 'react';
import Focus from './Focus';
import Stats from './Stats';
import styles from './home.module.css';
import logo from './logo.svg';

export default function Home() {
  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <img src={logo} className={styles.logo} alt="clearminute logo" />
        <h2 className={styles.title}>
          <span className={styles.thin}>clear</span>minute
        </h2>
      </header>
      <main className={styles.main}>
        <Focus />
        <Stats />
      </main>
    </div>
  );
}
