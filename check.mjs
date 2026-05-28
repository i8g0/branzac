import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yjgtablerdbkzuwxkmyp.supabase.co'
const supabaseKey = 'sb_publishable_ZeQ_IIQ26DFUCb5KYFlovQ_45rH0Jd1'

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data, error } = await supabase.from('orders').select('*').limit(1)
  if (error) {
    console.error('Error fetching orders:', error.message)
  } else {
    console.log(`Successfully fetched orders! Table exists. Data length:`, data ? data.length : 0)
    if (data) {
      console.log('Orders refs and statuses:', data.map(o => ({ id: o.id, ref: o.order_ref, status: o.status })))
    }
  }
}

check()
