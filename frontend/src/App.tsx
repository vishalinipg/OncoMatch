import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './pages/DashboardOverview';
import { PatientProfileUpload } from './pages/PatientProfileUpload';
import { MolecularProfile } from './pages/MolecularProfile';
import { DrugResponsePrediction } from './pages/DrugResponsePrediction';
import { VisualAnalytics } from './pages/VisualAnalytics';
import { PersonalizedReports } from './pages/PersonalizedReports';
import { api } from './services/api';
import { Sample } from './types';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [samples, setSamples] = useState<Sample[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('MCF7-REF');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSamples()
      .then(sList => {
        setSamples(sList);
        if (sList.length > 0) {
          setSelectedSampleId(sList[0].sample_id);
        }
      })
      .catch(err => console.error("Error loading initial samples:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSampleCreated = (newSample: Sample) => {
    setSamples(prev => [newSample, ...prev]);
    setSelectedSampleId(newSample.sample_id);
  };

  const getPageTitle = (page: string) => {
    switch (page) {
      case 'dashboard': return 'Page 1 — Dashboard Overview';
      case 'upload': return 'Page 2 — Patient Profile & Sample Upload';
      case 'molecular': return 'Page 3 — Molecular Profile & L1000 Expression';
      case 'prediction': return 'Page 4 — Chemotherapy Drug Response Prediction';
      case 'analytics': return 'Page 5 — Visual Analytics (PCA & HMM)';
      case 'reports': return 'Page 6 — Personalized Report Generation';
      default: return 'OncoMatch Platform';
    }
  };

  const activeSample = samples.find(s => s.sample_id === selectedSampleId);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        selectedSampleId={selectedSampleId}
        samples={samples}
        onSampleChange={setSelectedSampleId}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar 
          currentPageTitle={getPageTitle(currentPage)} 
          activeSample={activeSample}
        />

        <main className="flex-1 pb-12">
          {currentPage === 'dashboard' && (
            <DashboardOverview 
              onNavigate={setCurrentPage} 
              samples={samples} 
            />
          )}

          {currentPage === 'upload' && (
            <PatientProfileUpload
              samples={samples}
              selectedSampleId={selectedSampleId}
              onSampleSelect={setSelectedSampleId}
              onSampleCreated={handleSampleCreated}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'molecular' && (
            <MolecularProfile
              sampleId={selectedSampleId}
              samples={samples}
              onSampleChange={setSelectedSampleId}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'prediction' && (
            <DrugResponsePrediction
              sampleId={selectedSampleId}
              samples={samples}
              onSampleChange={setSelectedSampleId}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'analytics' && (
            <VisualAnalytics
              sampleId={selectedSampleId}
              samples={samples}
              onSampleChange={setSelectedSampleId}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'reports' && (
            <PersonalizedReports
              sampleId={selectedSampleId}
              samples={samples}
              onSampleChange={setSelectedSampleId}
              onNavigate={setCurrentPage}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
