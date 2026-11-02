import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerWebMcpTools } from './utils/webMcp';

// Register in-browser WebMCP agent tools
registerWebMcpTools();

createRoot(document.getElementById('root')!).render(<App />);
