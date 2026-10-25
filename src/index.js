import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App';
import ScrollToTop from './scrollToTop';
import Resume from 'containers/Resume/Resume';

import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<App />}>
				<Route index element={<Resume />} />
				<Route path="*" element={<Resume />} />
			</Route>
		</Routes>
		<ScrollToTop />
	</BrowserRouter>
);
