import AppHeader from './AppHeader'
import BlobBackground from './BlobBackground'
import './PageLayout.less'

export default function PageLayout({ title, showBack = false, right, children }) {
  return (
    <div className="page">
      <BlobBackground />
      <AppHeader title={title || 'Maker Karma Yoga'} showBack={showBack} right={right} />
      <div className="page-content">
        {children}
      </div>
    </div>
  )
}
