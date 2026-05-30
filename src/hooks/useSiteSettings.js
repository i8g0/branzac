import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { workingHours as fallbackHours } from '../data/menuData'

export function useSiteSettings() {
  const [settings, setSettings] = useState({
    phone: '+966 53 300 4327',
    whatsapp: '966533004327',
    instagram: 'https://www.instagram.com/branzac_/',
    tiktok: 'https://www.tiktok.com/@branzac_',
    address: 'الرياض، المملكة العربية السعودية',
    hours: fallbackHours
  })

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category', '__site_settings__')
      
      if (data && data.length > 0) {
        setSettings(prev => {
          const newSettings = { ...prev }
          data.forEach(item => {
            if (item.name === 'hours') {
              try {
                newSettings.hours = JSON.parse(item.description)
              } catch (e) {}
            } else {
              newSettings[item.name] = item.description
            }
          })
          return newSettings
        })
      }
    }
    fetchSettings()
  }, [])

  return settings
}
