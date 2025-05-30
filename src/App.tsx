import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import serverData from './data/serverData';
import PartLibrary from './components/PartLibrary';
import Canvas from './components/Canvas';
import InfoPanel from './components/InfoPanel';
import exportToPDF from './components/ExportPDF';
import './App.css';

type PartType = 'cpu' | 'gpu' | 'memory';
type TabType = 'server' | PartType;

interface AddedParts {
  cpu: number;
  gpu: number;
  memory: number;
}

function App() {
  const [selectedServerId, setSelectedServerId] = useState<number | null>(null);
  const [addedParts, setAddedParts] = useState<AddedParts>({
    cpu: 0,
    gpu: 0,
    memory: 0
  });
  const [activeTab, setActiveTab] = useState<TabType>('server');

  // 부품 추가
  const addPart = (type: PartType) => {
    if (selectedServerId === null) {
      alert('서버를 먼저 선택해주세요.');
      return;
    }

    const server = serverData.server;

    if (type === 'cpu' && addedParts.cpu >= server.maxCpuSockets) {
      alert(`CPU는 최대 ${server.maxCpuSockets}개까지 추가할 수 있습니다.`);
      return;
    }
    if (type === 'gpu' && addedParts.gpu >= server.maxGpuSlots) {
      alert(`GPU는 최대 ${server.maxGpuSlots}개까지 추가할 수 있습니다.`);
      return;
    }
    if (type === 'memory' && addedParts.memory >= server.maxMemorySlots) {
      alert(`메모리는 최대 ${server.maxMemorySlots}개까지 추가할 수 있습니다.`);
      return;
    }

    setAddedParts(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
  };

  const removePart = (type: PartType) => {
    if (addedParts[type] > 0) {
      setAddedParts(prev => ({
        ...prev,
        [type]: prev[type] - 1
      }));
    }
  };

  const selectServer = (id: number) => {
    setSelectedServerId(id);
    setAddedParts({
      cpu: 0,
      gpu: 0,
      memory: 0
    });
  };

  const handleExportPDF = async () => {
    try {
      const result = await exportToPDF({
        selectedServerId,
        addedParts,
        serverData
      });
      if (result) {
        console.log('PDF 내보내기 성공');
      }
    } catch (error) {
      console.error('PDF 내보내기 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <header className="header">
          <div className="logo">
            <span className="icon">💻</span> 서버 구성 시스템
          </div>
        </header>

        <main className="main-content">
          <h1>서버 구성 시스템</h1>

          <div className="action-buttons">
            <button className="action-button" disabled>저장</button>
            <button className="action-button" disabled>불러오기</button>
            <button className="action-button" onClick={handleExportPDF}>내보내기</button>
          </div>

          <div className="workspace">
            <div className="left-panel">
              <h2>부품 라이브러리</h2>
              <div className="tabs">
                {['server', 'cpu', 'gpu', 'memory'].map(tab => (
                  <button
                    key={tab}
                    className={`tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab as TabType)}
                  >
                    {tab === 'server' ? '서버' : tab.toUpperCase()}
                  </button>
                ))}
              </div>

              <PartLibrary
                activeTab={activeTab}
                serverData={serverData}
                onSelectServer={selectServer}
                onAddPart={addPart}
                selectedServerId={selectedServerId}
              />
            </div>

            <div className="center-panel">
              <Canvas
                selectedServerId={selectedServerId}
                serverData={serverData}
                addedParts={addedParts}
                onRemovePart={removePart}
              />
            </div>

            <div className="right-panel">
              <InfoPanel
                selectedServerId={selectedServerId}
                serverData={serverData}
                addedParts={addedParts}
              />
            </div>
          </div>
        </main>

        <footer className="footer">
          서버 구성 시스템 데모 - 2025
        </footer>
      </div>
    </DndProvider>
  );
}

export default App;
