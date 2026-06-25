import { Coffee, CupSoda, CakeSlice, Utensils, Croissant, IceCream, Cookie, Bean } from 'lucide-react'

export default function IconRenderer({ iconStr, size = 24, color = "currentColor", className = "" }) {
  if (!iconStr) return <Utensils size={size} color={color} className={className} />
  
  // If it's a direct URL (uploaded custom icon)
  if (iconStr.startsWith('http') || iconStr.startsWith('/')) {
    return (
      <img 
        src={iconStr} 
        alt="Category Icon" 
        style={{ width: size, height: size, objectFit: 'contain' }} 
        className={className}
      />
    )
  }
  
  if (iconStr.includes('☕') || iconStr.includes('hot') || iconStr.includes('ساخن')) {
    return <Coffee size={size} color={color} className={className} />
  }
  if (iconStr.includes('🧊') || iconStr.includes('cold') || iconStr.includes('بارد')) {
    return <CupSoda size={size} color={color} className={className} />
  }
  if (iconStr.includes('🍰') || iconStr.includes('dessert') || iconStr.includes('حلو')) {
    return <CakeSlice size={size} color={color} className={className} />
  }
  if (iconStr.includes('croissant') || iconStr.includes('مخبوزات')) {
    return <Croissant size={size} color={color} className={className} />
  }
  if (iconStr.includes('icecream') || iconStr.includes('ايس كريم')) {
    return <IceCream size={size} color={color} className={className} />
  }
  if (iconStr.includes('cookie') || iconStr.includes('كوكيز')) {
    return <Cookie size={size} color={color} className={className} />
  }
  if (iconStr.includes('bean') || iconStr.includes('بن') || iconStr.includes('شاي') || iconStr.includes('🍵')) {
    return <Coffee size={size} color={color} className={className} />
  }
  
  return <Utensils size={size} color={color} className={className} />
}
