import { useEffect, useState } from 'react'
import { supabase, createDebouncedRefetch } from '../lib/supabase'

export function useSiteAbout(defaults) {
  const [aboutData, setAboutData] = useState(null)

  useEffect(() => {
    const fetchAbout = async () => {
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category', '__site_about__')
        .maybeSingle()
      setAboutData(data ?? null)
    }

    const debouncedFetch = createDebouncedRefetch(fetchAbout, 350)
    fetchAbout()

    const channel = supabase
      .channel('about-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu_items',
          filter: 'category=eq.__site_about__',
        },
        debouncedFetch
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return {
    heading: aboutData?.name || defaults.heading,
    description: aboutData?.description || defaults.description,
    image: aboutData?.image || defaults.image,
    blurData: aboutData?.blur_data || null,
  }
}
