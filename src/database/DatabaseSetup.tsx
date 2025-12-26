import React, { useState, useEffect } from 'react'
import TableManage, { type TableManageProps } from './TableManage'
import './DatabaseSetup.css'

export interface TableConfig {
  name: string
  description: string
  createSQL: () => string
  showHowToCreate?: boolean  // Show "How to Create" button even when table exists
}

export interface DatabaseSetupProps {
  projectName: string
  description: string
  tableConfigs: TableConfig[]
  checkTableExists: (tableName: string) => Promise<{ code: number; data?: boolean; message?: string }>
}

const DatabaseSetup: React.FC<DatabaseSetupProps> = ({
  projectName,
  description,
  tableConfigs,
  checkTableExists
}) => {
  const [tableStatus, setTableStatus] = useState<Record<string, boolean | null>>(
    Object.fromEntries(tableConfigs.map(config => [config.name, null]))
  )
  const [error, setError] = useState<string | null>(null)

  const handleRefreshSingle = async (tableName: string) => {
    setTableStatus(prev => ({ ...prev, [tableName]: null }))
    const startTime = Date.now()
    const result = await checkTableExists(tableName)
    const elapsed = Date.now() - startTime
    if (elapsed < 200) {
      await new Promise(resolve => setTimeout(resolve, 200 - elapsed))
    }
    if (result.code === 0) {
      setTableStatus(prev => ({ ...prev, [tableName]: result.data || false }))
    }
  }

  const checkAllTables = async () => {
    setError(null)
    // Reset to loading state
    setTableStatus(Object.fromEntries(tableConfigs.map(config => [config.name, null])))
    
    // Check all tables in parallel
    const tablePromises = tableConfigs.map(async (config) => {
      const result = await checkTableExists(config.name)
      
      if (result.code === 0) {
        setTableStatus(prev => ({ ...prev, [config.name]: result.data || false }))
        return { name: config.name, success: true, code: result.code }
      } else if (result.code === -1) {
        setTableStatus(prev => ({ ...prev, [config.name]: false }))
        return { name: config.name, success: false, code: result.code }
      } else {
        setTableStatus(prev => ({ ...prev, [config.name]: false }))
        return { name: config.name, success: false, code: result.code }
      }
    })

    // Wait for all checks to complete
    const tableResults = await Promise.all(tablePromises)
    
    // Check if any table had configuration error
    const configError = tableResults.find(r => r.code === -1)
    if (configError) {
      setError('Please configure Supabase connection first.')
    }
  }

  useEffect(() => {
    checkAllTables()
  }, [])

  return (
    <div className="database-setup">
      <h2>{projectName} - Database Setup</h2>
      <p className="description">{description}</p>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="dismiss-btn">×</button>
          {error.includes('configure Supabase') && (
            <button onClick={checkAllTables} className="retry-btn" style={{ marginLeft: '8px' }}>
              Retry
            </button>
          )}
        </div>
      )}

      <div className="tables-container">
        {tableConfigs.map(config => (
          <TableManage
            key={config.name}
            tableName={config.name}
            description={config.description}
            exists={tableStatus[config.name]}
            createSQL={config.createSQL()}
            onRefresh={checkAllTables}
            onRefreshSingle={() => handleRefreshSingle(config.name)}
            showHowToCreate={config.showHowToCreate}
          />
        ))}
      </div>
    </div>
  )
}

export default DatabaseSetup

