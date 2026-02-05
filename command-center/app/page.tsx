export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl">🦞</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Command Center</h1>
              <p className="text-gray-600">OpenClaw Management Dashboard</p>
            </div>
          </div>
        </header>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">System Status</h3>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-700">All systems operational</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">Last Backup</h3>
            <p className="text-gray-700">2 hours ago</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">Active Tasks</h3>
            <p className="text-gray-700">8 tasks in progress</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Run Backup
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
              Check Status
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
              Clean Files
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              Refresh All
            </button>
          </div>
        </div>

        {/* Simple Task List */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Tasks</h2>
          <div className="space-y-3">
            {[
              { title: 'Set up GitHub repository', status: 'Done' },
              { title: 'Initialize Next.js project', status: 'In Progress' },
              { title: 'Build dashboard UI', status: 'To Do' },
              { title: 'Deploy to Vercel', status: 'To Do' },
            ].map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <span className="text-gray-800">{task.title}</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  task.status === 'Done' ? 'bg-green-100 text-green-800' :
                  task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-8 border-t text-center text-gray-500 text-sm">
          <p>Command Center v1.0 • Built with care in Sydney 🦞</p>
          <p className="mt-1">OpenClaw Management System</p>
          <div className="mt-2 p-2 bg-blue-50 rounded-lg inline-block">
            <p className="text-blue-700 font-medium">
              🕒 Live: Updated {new Date().toLocaleTimeString('en-AU', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'Australia/Sydney'
              })} Sydney time
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}