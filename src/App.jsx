import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientManagement from './components/ClientManagement';
import ClientDetailModal from './components/ClientDetailModal';
import GSTModule from './components/GSTModule';
import ITModule from './components/ITModule';
import ROCAndAuditModule from './components/ROCAndAuditModule';
import TaskManager from './components/TaskManager';
import BillingModule from './components/BillingModule';
import ComplianceCalendar from './components/ComplianceCalendar';
import TaxCalculatorModal from './components/TaxCalculatorModal';
import QuickClientModal from './components/QuickClientModal';
import FirebaseConfigModal from './components/FirebaseConfigModal';

import {
  getClients, saveClients,
  getGSTWork, saveGSTWork,
  getITWork, saveITWork,
  getROCWork, saveROCWork,
  getTasks, saveTasks,
  getInvoices, saveInvoices,
  getStaff, resetAllData
} from './utils/storage';

import {
  syncClientsToFirebase, subscribeToClientsFromFirebase,
  syncGSTWorkToFirebase, subscribeToGSTWorkFromFirebase,
  syncITWorkToFirebase, subscribeToITWorkFromFirebase,
  syncTasksToFirebase, subscribeToTasksFromFirebase,
  syncInvoicesToFirebase, subscribeToInvoicesFromFirebase
} from './services/firebaseService';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Local Storage States
  const [clients, setClientsState] = useState(getClients);
  const [gstWork, setGstWorkState] = useState(getGSTWork);
  const [itWork, setItWorkState] = useState(getITWork);
  const [rocWork, setRocWorkState] = useState(getROCWork);
  const [tasks, setTasksState] = useState(getTasks);
  const [invoices, setInvoicesState] = useState(getInvoices);
  const [staff] = useState(getStaff);

  // Modals State
  const [selectedClientDetail, setSelectedClientDetail] = useState(null);
  const [showTaxCalcModal, setShowTaxCalcModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);

  // Subscribe to Firebase Firestore if connected
  useEffect(() => {
    const unsubClients = subscribeToClientsFromFirebase((data) => setClientsState(data));
    const unsubGST = subscribeToGSTWorkFromFirebase((data) => setGstWorkState(data));
    const unsubIT = subscribeToITWorkFromFirebase((data) => setItWorkState(data));
    const unsubTasks = subscribeToTasksFromFirebase((data) => setTasksState(data));
    const unsubInvoices = subscribeToInvoicesFromFirebase((data) => setInvoicesState(data));

    return () => {
      if (unsubClients) unsubClients();
      if (unsubGST) unsubGST();
      if (unsubIT) unsubIT();
      if (unsubTasks) unsubTasks();
      if (unsubInvoices) unsubInvoices();
    };
  }, []);

  // Sync state helpers
  const setClients = (data) => {
    setClientsState(data);
    saveClients(data);
    syncClientsToFirebase(data);
  };

  const setGstWork = (data) => {
    setGstWorkState(data);
    saveGSTWork(data);
    syncGSTWorkToFirebase(data);
  };

  const setItWork = (data) => {
    setItWorkState(data);
    saveITWork(data);
    syncITWorkToFirebase(data);
  };

  const setRocWork = (data) => {
    setRocWorkState(data);
    saveROCWork(data);
  };

  const setTasks = (data) => {
    setTasksState(data);
    saveTasks(data);
    syncTasksToFirebase(data);
  };

  const setInvoices = (data) => {
    setInvoicesState(data);
    saveInvoices(data);
    syncInvoicesToFirebase(data);
  };

  const handleAddClient = (newClient) => {
    setClients([newClient, ...clients]);
  };

  const handleDeleteClient = (clientId) => {
    setClients(clients.filter(c => c.id !== clientId));
  };

  const counts = {
    clients: clients.length,
    pendingGst: gstWork.filter(g => g.status !== 'Filed').length,
    pendingIt: itWork.filter(i => i.status !== 'Filed' && i.status !== 'Completed').length,
    openTasks: tasks.filter(t => t.status !== 'Completed').length
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenNewClient={() => setShowNewClientModal(true)}
        onOpenTaxCalc={() => setShowTaxCalcModal(true)}
        onOpenFirebaseModal={() => setShowFirebaseModal(true)}
        onResetData={resetAllData}
        activeTab={activeTab}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          counts={counts}
        />

        {/* Mobile Navigation Pills */}
        <div className="md:hidden flex overflow-x-auto bg-slate-900 border-b border-slate-800 p-2 gap-2 fixed bottom-0 left-0 right-0 z-40">
          {['dashboard', 'clients', 'gst', 'it', 'roc', 'tasks', 'billing', 'calendar'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap uppercase ${
                activeTab === tab ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full pb-20 md:pb-6">
          {activeTab === 'dashboard' && (
            <Dashboard
              clients={clients}
              gstWork={gstWork}
              itWork={itWork}
              tasks={tasks}
              invoices={invoices}
              setActiveTab={setActiveTab}
              onOpenNewClient={() => setShowNewClientModal(true)}
              onOpenTaxCalc={() => setShowTaxCalcModal(true)}
            />
          )}

          {activeTab === 'clients' && (
            <ClientManagement
              clients={clients}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onOpenClientDetail={(client) => setSelectedClientDetail(client)}
              onOpenNewClient={() => setShowNewClientModal(true)}
              onDeleteClient={handleDeleteClient}
            />
          )}

          {activeTab === 'gst' && (
            <GSTModule
              gstWork={gstWork}
              setGstWork={setGstWork}
              clients={clients}
            />
          )}

          {activeTab === 'it' && (
            <ITModule
              itWork={itWork}
              setItWork={setItWork}
              onOpenTaxCalc={() => setShowTaxCalcModal(true)}
            />
          )}

          {activeTab === 'roc' && (
            <ROCAndAuditModule
              rocWork={rocWork}
              setRocWork={setRocWork}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskManager
              tasks={tasks}
              setTasks={setTasks}
              clients={clients}
              staff={staff}
            />
          )}

          {activeTab === 'billing' && (
            <BillingModule
              invoices={invoices}
              setInvoices={setInvoices}
              clients={clients}
            />
          )}

          {activeTab === 'calendar' && (
            <ComplianceCalendar />
          )}
        </main>
      </div>

      {/* Modals */}
      {selectedClientDetail && (
        <ClientDetailModal
          client={selectedClientDetail}
          onClose={() => setSelectedClientDetail(null)}
        />
      )}

      {showTaxCalcModal && (
        <TaxCalculatorModal
          onClose={() => setShowTaxCalcModal(false)}
        />
      )}

      {showNewClientModal && (
        <QuickClientModal
          onClose={() => setShowNewClientModal(false)}
          onAddClient={handleAddClient}
          staff={staff}
        />
      )}

      {showFirebaseModal && (
        <FirebaseConfigModal
          onClose={() => setShowFirebaseModal(false)}
        />
      )}
    </div>
  );
}
