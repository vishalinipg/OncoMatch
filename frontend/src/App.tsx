import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { CommandPalette } from './components/CommandPalette';
import { DashboardOverview } from './pages/DashboardOverview';
import { SampleAnalysisSetup } from './pages/SampleAnalysisSetup';
import { DrugTissueExplorer } from './pages/DrugTissueExplorer';
import { DrugResponsePrediction } from './pages/DrugResponsePrediction';
import { VisualAnalytics } from './pages/VisualAnalytics';
import { PersonalizedReports } from './pages/PersonalizedReports';
import { api } from './services/api';
import { Sample, Drug } from './types';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [samples, setSamples] = useState<Sample[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('');
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getSamples(),
      api.getDrugs()
    ])
      .then(([sList, drugList]) => {
        setSamples(sList);
        setDrugs(drugList);
        if (sList.length > 0) {
          setSelectedSampleId(sList[0].sample_id);
        }
      })
      .catch(err => console.error("Error loading initial data:", err))
      .finally(() => setLoading(false));
  }, []);

  // Keyboard Shortcuts (⌘K for command palette, ⌘1-⌘6 for page switching)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        return;
      }

      // ⌘1 - ⌘6
      if ((e.metaKey || e.ctrlKey) && ['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        e.preventDefault();
        const pageMap: Record<string, string> = {
          '1': 'dashboard',
          '2': 'setup',
          '3': 'explorer',
          '4': 'prediction',
          '5': 'analytics',
          '6': 'reports'
        };
        if (pageMap[e.key]) {
          setCurrentPage(pageMap[e.key]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSampleCreated = (newSample: Sample) => {
    setSamples(prev => {
      const exists = prev.some(s => s.sample_id === newSample.sample_id);
      if (exists) {
        return prev.map(s => s.sample_id === newSample.sample_id ? newSample : s);
      }
      return [newSample, ...prev];
    });
    setSelectedSampleId(newSample.sample_id);
  };

  const getPageTitle = (page: string) => {
    switch (page) {
      case 'dashboard': return 'Dashboard Overview';
      case 'setup': return 'Sample & Analysis Setup';
      case 'explorer': return 'Drug & Tissue Explorer';
      case 'prediction': return 'Drug Response Prediction';
      case 'analytics': return 'Visual Analytics';
      case 'reports': return 'Personalized Reports';
      default: return 'OncoMatch Platform';
    }
  };

  const activeSample = samples.find(s => s.sample_id === selectedSampleId);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Universal Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setCurrentPage}
        samples={samples}
        onSelectSample={setSelectedSampleId}
        drugs={drugs}
      />

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
          onOpenSearch={() => setIsCommandPaletteOpen(true)}
        />

        <main className="flex-1 pb-16">
          {currentPage === 'dashboard' && (
            <DashboardOverview 
              onNavigate={setCurrentPage} 
              samples={samples} 
            />
          )}

          {currentPage === 'setup' && (
            <SampleAnalysisSetup
              samples={samples}
              selectedSampleId={selectedSampleId}
              onSampleSelect={setSelectedSampleId}
              onSampleCreated={handleSampleCreated}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'explorer' && (
            <DrugTissueExplorer
              onNavigate={setCurrentPage}
              activeSample={activeSample}
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
