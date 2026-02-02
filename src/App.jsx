import { Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Campaigns from './pages/Campaigns'
import NewCampaign from './pages/NewCampaign'
import BacklinkAnalysis from './pages/BacklinkAnalysis'
import ContentGenerator from './pages/ContentGenerator'
import RankTracker from './pages/RankTracker'
import ProxyManager from './pages/ProxyManager'
import DiscoverySources from './pages/DiscoverySources'
import Accounts from './pages/Accounts'
import AutomationCenter from './pages/AutomationCenter'
import Laboratory from './pages/Laboratory'
import SEODiagrams from './pages/SEODiagrams'
import AgentCommand from './pages/AgentCommand'
import PageNotFound from './lib/PageNotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="campaigns/new" element={<NewCampaign />} />
        <Route path="backlink-analysis" element={<BacklinkAnalysis />} />
        <Route path="content-generator" element={<ContentGenerator />} />
        <Route path="rank-tracker" element={<RankTracker />} />
        <Route path="proxy-manager" element={<ProxyManager />} />
        <Route path="discovery-sources" element={<DiscoverySources />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="automation-center" element={<AutomationCenter />} />
        <Route path="laboratory" element={<Laboratory />} />
        <Route path="seo-diagrams" element={<SEODiagrams />} />
        <Route path="agent-command" element={<AgentCommand />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  )
}

export default App
