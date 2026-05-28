import { Coffee, CupSoda, CakeSlice, Utensils } from 'lucide-react'

export default function IconRenderer({ iconStr, size = 24, color = "currentColor", className = "" }) {
  if (!iconStr) return <Utensils size={size} color={color} className={className} />
  
  if (iconStr.includes('☕') || iconStr.includes('hot') || iconStr.includes('ساخن')) {
    return <Coffee size={size} color={color} className={className} />
  }
  if (iconStr.includes('🧊') || iconStr.includes('cold') || iconStr.includes('بارد')) {
    return <CupSoda size={size} color={color} className={className} />
  }
  if (iconStr.includes('🍰') || iconStr.includes('dessert') || iconStr.includes('حلو')) {
    return <CakeSlice size={size} color={color} className={className} />
  }
  
  return <Utensils size={size} color={color} className={className} />
}
