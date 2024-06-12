import React,{useState} from 'react';
import Login from './login/login';
import Chating from './chating/Chating';
import Create from './create/Create';
import Password from './password/Password';
import Confirm from './confirm/Confirm' ;
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
const App = () => {
    const [mode,setMode] = useState(false);

    const settingMode = () => {
        setMode(!mode);
    };
return (
    <div className={mode ? 'dark-mode' : 'light-mode'}>
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/chating" element={<Chating mode={mode} settingMode={settingMode} />} />
            <Route path="/create" element={<Create />} />
            <Route path="/password" element={<Password />} />
            <Route path='/confirm' element={<Confirm />} />
        </Routes>
    </BrowserRouter>
</div>
    );
};

export default App;
