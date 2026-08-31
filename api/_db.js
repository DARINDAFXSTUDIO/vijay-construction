// Central DB Seed & Shared State
let globalDB = {
  projects: [
    { id: 'P1', client: 'Sharma Ji', name: 'Flat 309 (Dilshad Garden)', totalValue: 500000, received: 180000, progress: 65, phase: 'Plaster & Electrical Piping' },
    { id: 'P2', client: 'Gupta Ji', name: 'Villa 12 (Shahdara)', totalValue: 1200000, received: 400000, progress: 35, phase: 'Brickwork & Conduit Wiring' }
  ],
  suppliers: ["Gupta Building Material", "Aggarwal Hardware", "Sharma Paint & Sanitary"],
  workers: [
    { id: 'W1', name: 'Ramesh Mistri', role: 'Mistri', rate: 800, otRate: 100, site: 'P1', phone: '9811000001', pin: '1234', photo: '', att: {}, advance: 200, advanceList: [{ date: '2026-08-28', amount: 200, reason: 'Field Cash' }], bakaaya: 0, gpsMatch: true },
    { id: 'W2', name: 'Suresh Mazdoor', role: 'Mazdoor', rate: 500, otRate: 65, site: 'P1', phone: '9811000004', pin: '1234', photo: '', att: {}, advance: 100, advanceList: [{ date: '2026-08-28', amount: 100, reason: 'Field Cash' }], bakaaya: 0, gpsMatch: true }
  ],
  thekedars: [
    { id: 'T1', name: 'Raju Electrical Thekedar', phone: '9811000002', pin: '1234', site: 'P2', work: 'Wiring & DB Dressing @ Villa 12', value: 85000, paid: 54200, progress: 60 }
  ],
  materials: [
    { id: 'M1', type: 'material', category: 'Cement & Masonry', item: 'Ultratech PPC Cement (10 Bags)', site: 'P1', supplier: 'Gupta Building Material', requestedBy: 'Ramesh Mistri', time: '09:30 AM', status: 'Pending' }
  ],
  siteProofs: [],
  ledger: [
    { id: 'L1', site: 'P1', type: 'income', amount: 180000, note: 'Sharma Ji Advance (Flat 309)', date: '2026-08-29' }
  ],
  settlements: [] // Immutable settlement audit log
};

export function getGlobalDB() {
  return globalDB;
}

export function setGlobalDB(newDB) {
  globalDB = newDB;
}
