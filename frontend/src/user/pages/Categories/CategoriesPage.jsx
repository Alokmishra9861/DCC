import React from 'react'
import { Link } from 'react-router-dom';
import Icon from '../../components/ui/AppIcon';
import AppImage from '../../components/ui/AppImage';

const CategoriesPage = () => {
     const categories = [
    { slug: 'automotive-marine', title: 'Automotive & Marine', icon: 'TruckIcon', deals: 12, image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070&auto=format&fit=crop', description: 'Find the best deals on vehicle maintenance, parts, detailing, and marine services.' },
    { slug: 'b2b', title: 'B2B Members', icon: 'BriefcaseIcon', deals: 8, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop', description: 'Exclusive business-to-business services, wholesale opportunities, and corporate solutions.' },
    { slug: 'beauty', title: 'Beauty Salon & Barber Shop', icon: 'SparklesIcon', deals: 15, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop', description: 'Pamper yourself with discounts on haircuts, styling, spa treatments, and grooming.' },
    { slug: 'construction', title: 'Construction', icon: 'WrenchScrewdriverIcon', deals: 10, image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2031&auto=format&fit=crop', description: 'Save on building materials, contractors, renovation services, and heavy equipment.' },
    { slug: 'electronics', title: 'Electronics & Office Supplies', icon: 'ComputerDesktopIcon', deals: 20, image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop', description: 'Upgrade your tech and stock up on essential office supplies and furniture for less.' },
    { slug: 'fashion', title: 'Recreational', icon: 'ShoppingBagIcon', deals: 25, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop', description: 'Stay stylish with offers on apparel, accessories, footwear, and jewelry.' },
    { slug: 'food', title: 'Food & Beverage', icon: 'CakeIcon', deals: 40, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop', description: 'Delicious dining experiences, cafes, and beverage deals across the island.' },
    { slug: 'health', title: 'Health & Fitness', icon: 'HeartIcon', deals: 18, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop', description: 'Gym memberships, wellness centers, healthcare savings, and pharmacy deals.' },
    { slug: 'home', title: 'Home & Garden', icon: 'HomeIcon', deals: 22, image: 'https://plus.unsplash.com/premium_photo-1678836292816-fdf0ac484cf1?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aG9tZSUyMGFuZCUyMGdhcmRlbnxlbnwwfHwwfHx8MA%3D%3D', description: 'Furniture, decor, gardening supplies, and home improvement services.' },
    { slug: 'kids', title: 'Kids & Fashion', icon: 'FaceSmileIcon', deals: 14, image: 'https://trendyfashionguide.com/wp-content/uploads/2025/07/23-July-Feature-Image-3-Kids-Fashion.jpg', description: 'Fun activities, toys, educational resources, and entertainment for children.' },
    { slug: 'retail', title: 'Retail', icon: 'TagIcon', deals: 30, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop', description: 'General retail shopping for gifts, hobbies, pets, and everyday items.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Browse Categories</h1>
          <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">Find exactly what you're looking for. Explore our diverse range of discount categories.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/categoriespage/${cat.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
            >
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10" />
                <AppImage src={cat.image} alt={cat.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">{cat.deals} Deals</div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1C4D8D]">
                    <Icon name={cat.icon} size={20} />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors">{cat.title}</h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">{cat.description}</p>
                <div className="flex items-center text-[#1C4D8D] font-semibold text-sm">
                  Explore Category
                  <Icon name="ArrowRightIcon" size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CategoriesPage