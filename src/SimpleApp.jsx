import React from 'react';
import { DataProvider } from './context/SimpleDataContext';
import SimpleAuth from './components/SimpleAuth';
import SimpleSchoolYear from './components/SimpleSchoolYear';
import './styles/global.css';

function App() {
  return (
    <DataProvider>
      <SimpleAuth>
        <SimpleSchoolYear />
      </SimpleAuth>
    </DataProvider>
  );
}

export default App;