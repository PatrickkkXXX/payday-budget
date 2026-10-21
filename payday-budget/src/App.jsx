import { useEffect, useState } from 'react'
import Dashboard from './components/Dashboard'
import Header from './components/Header'
import SettingsScreen from './components/SettingsScreen'
import SetupWizard from './components/SetupWizard'
import { useToast } from './components/Toast'
import { catalog } from './lib/catalog'
import { load, store, storageWorks } from './lib/storage'

export default function App() {
  const toast = useToast()
  // Everything is read from this browser's storage, so last inputs show right away.
  const [profile, setProfile] = useState(() => load().profile)
  const [screen, setScreen] = useState(() => (load().profile.setup_done ? 'main' : 'setup')) // setup | main | settings
  const [saved] = useState(storageWorks)

  useEffect(() => { window.scrollTo(0, 0) }, [screen])

  async function finishSetup(patch) {
    setProfile(await store.updateProfile(patch))
    setScreen('main')
    toast('All set! Check your payslip card, then add your expenses.')
  }

  return (
    <div className="wrap">
      <Header
        status={saved ? 'Saved on this device' : "This browser can't save. Your entries will be lost when you close it."}
        warn={!saved}
        onSettings={screen === 'main' ? () => setScreen('settings') : null}
      />

      {screen === 'setup' && <SetupWizard catalog={catalog} profile={profile} onFinish={finishSetup} />}
      {screen === 'main' && <Dashboard catalog={catalog} profile={profile} onProfile={setProfile} />}
      {screen === 'settings' && (
        <SettingsScreen
          catalog={catalog}
          profile={profile}
          onProfile={setProfile}
          onDone={() => { setScreen('main'); toast('Settings saved') }}
          onErased={() => { setProfile(load().profile); setScreen('setup') }}
        />
      )}
    </div>
  )
}
