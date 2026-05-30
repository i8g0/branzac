/**
 * سكريبت إنشاء حساب الأدمن في Supabase Auth
 * 
 * الاستخدام:
 *   node scripts/create-admin.mjs admin@branzac.com yourpassword123
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yjgtablerdbkzuwxkmyp.supabase.co'
const supabaseKey = 'sb_publishable_ZeQ_IIQ26DFUCb5KYFlovQ_45rH0Jd1'

const supabase = createClient(supabaseUrl, supabaseKey)

const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error('Usage: node scripts/create-admin.mjs <email> <password>')
  console.error('Example: node scripts/create-admin.mjs admin@branzac.com MySecurePass123')
  process.exit(1)
}

if (password.length < 6) {
  console.error('Error: Password must be at least 6 characters')
  process.exit(1)
}

async function createAdmin() {
  console.log(`Creating admin account for: ${email}...`)
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Error creating admin:', error.message)
    process.exit(1)
  }

  console.log('✅ Admin account created successfully!')
  console.log(`   Email: ${email}`)
  console.log(`   User ID: ${data.user?.id}`)
  console.log('')
  console.log('⚠️  Important: Check your email to confirm the account if email confirmation is enabled in Supabase.')
  console.log('   You can also disable email confirmation in Supabase Dashboard → Authentication → Settings')
}

createAdmin()
