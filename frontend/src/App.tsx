import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { CommandPalette } from './components/CommandPalette';
import { ComparisonDrawer } from './components/ComparisonDrawer';
import { DashboardOverview } from './pages/DashboardOverview';
import { SampleAnalysisSetup } from './pages/SampleAnalysisSetup';
import { DrugTissueExplorer } from './pages/DrugTissueExplorer';
import { DrugResponsePrediction } from './pages/DrugResponsePrediction';
import { VisualAnalytics } from './pages/VisualAnalytics';
import { PersonalizedReports } from './pages/PersonalizedReports';
import { api } from './services/api';
import { Sample, Drug, ComparisonItem, CalibrationSettings } from './types';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [samples, setSamples] = useState<Sample[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('');
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [pinnedItems, setPinnedItems] = useState<ComparisonItem[]>([]);
  const [calibration, setCalibration] = useState<CalibrationSettings | null>(null);

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

  // Keyboard Shortcuts (⌘K for command palette, ⌘B for sidebar toggle, ⌘1-⌘6 for page switching)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        return;
      }

      // ⌘B or Ctrl+B to toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
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

  // Pin / Compare handlers
  const handleTogglePin = (item: ComparisonItem) => {
    setPinnedItems(prev => {
      const exists = prev.some(p => String(p.id) === String(item.id));
      if (exists) {
        return prev.filter(p => String(p.id) !== String(item.id));
      }
      const palette = ['#10b981', '#8b5cf6', '#f59e0b'];
      const newItem = { ...item, color: palette[prev.length % 3] };
      if (prev.length >= 3) {
        // Shift out oldest
        return [...prev.slice(1), newItem];
      }
      return [...prev, newItem];
    });
  };

  const handleRemovePin = (id: string | number) => {
    setPinnedItems(prev => prev.filter(p => String(p.id) !== String(id)));
  };

  const handleClearPins = () => {
    setPinnedItems([]);
  };

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

      {/* Docked Side-by-Side Comparison Drawer */}
      <ComparisonDrawer
        pinnedItems={pinnedItems}
        onRemoveItem={handleRemovePin}
        onClearAll={handleClearPins}
        onNavigateToPrediction={(drugId) => {
          if (drugId) {
            setCalibration(prev => ({
              drugId,
              minConc: prev?.minConc ?? 0.0039,
              maxConc: prev?.maxConc ?? 1.0,
            }));
          }
          setCurrentPage('prediction');
        }}
      />

      {/* Collapsible Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        selectedSampleId={selectedSampleId}
        samples={samples}
        onSampleChange={setSelectedSampleId}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar 
          currentPageTitle={getPageTitle(currentPage)} 
          samples={samples}
          selectedSampleId={selectedSampleId}
          onSampleChange={setSelectedSampleId}
          activeSample={activeSample}
          onOpenSearch={() => setIsCommandPaletteOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
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
              pinnedItems={pinnedItems}
              onTogglePin={handleTogglePin}
              calibration={calibration}
              onApplyCalibration={setCalibration}
            />
          )}

          {currentPage === 'explorer' && (
            <DrugTissueExplorer
              onNavigate={setCurrentPage}
              activeSample={activeSample}
              pinnedItems={pinnedItems}
              onTogglePin={handleTogglePin}
            />
          )}

          {currentPage === 'prediction' && (
            <DrugResponsePrediction
              sampleId={selectedSampleId}
              samples={samples}
              onSampleChange={setSelectedSampleId}
              onNavigate={setCurrentPage}
              pinnedItems={pinnedItems}
              onTogglePin={handleTogglePin}
              calibration={calibration}
              onClearCalibration={() => setCalibration(null)}
            />
          )}

          {currentPage === 'analytics' && (
            <VisualAnalytics
              sampleId={selectedSampleId}
              samples={samples}
              onSampleChange={setSelectedSampleId}
              onNavigate={setCurrentPage}
              onTogglePin={handleTogglePin}
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
