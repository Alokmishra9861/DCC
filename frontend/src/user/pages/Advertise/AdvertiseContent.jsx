import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import Icon from '../../components/ui/AppIcon'

const AdvertiseContent = () => {
     const [selectedDuration, setSelectedDuration] = useState('monthly');

  const bannerPricing = [
    {
      id: 'top',
      position: 'Top Banner',
      description: 'Prime placement at the top of the discounts page. Maximum visibility.',
      monthly: 500,
      sixMonth: 2850,
      annual: 5400,
      color: 'bg-[#1C4D8D]/10 text-[#1C4D8D]'
    },
    {
      id: 'mid',
      position: 'Mid Banner',
      description: 'Strategic placement after featured discounts. High engagement.',
      monthly: 350,
      sixMonth: 1995,
      annual: 3780,
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'bottom',
      position: 'Bottom Banner',
      description: 'Placement below all discounts. Great value for budget-conscious advertisers.',
      monthly: 250,
      sixMonth: 1425,
      annual: 2700,
      color: 'bg-indigo-100 text-indigo-800'
    }
  ];

  const features = [
    { id: 'feat_1', icon: 'UserGroupIcon', text: 'Reach thousands of engaged members' },
    { id: 'feat_2', icon: 'ChartBarIcon', text: 'Premium 728 x 200px banner size' },
    { id: 'feat_3', icon: 'ArrowPathIcon', text: 'Automatic rotation with multiple ads' },
    { id: 'feat_4', icon: 'CalendarIcon', text: 'Flexible duration options' },
    { id: 'feat_5', icon: 'TagIcon', text: 'Category-specific targeting available' },
    { id: 'feat_6', icon: 'ChartPieIcon', text: 'Performance analytics included' }
  ];

  const getPrice = (tier) => {
    if (selectedDuration === 'monthly') return tier.monthly;
    if (selectedDuration === 'six_months') return tier.sixMonth;
    return tier.annual;
  };

  const getSavings = (tier) => {
    if (selectedDuration === 'six_months') return Math.round(tier.monthly * 6 * 0.05);
    if (selectedDuration === 'annual') return Math.round(tier.monthly * 12 * 0.10);
    return 0;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-5xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              Advertise with Discount Club Cayman
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Boost your business visibility with premium banner placements on our high-traffic discount directory. Reach thousands of engaged members actively looking for local deals.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Why Advertise with Us?
            </h2>
            <p className="text-xl text-slate-600">
              Powerful features to maximize your advertising ROI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.id} className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all flex items-start gap-5">
                <div className="w-12 h-12 bg-[#1C4D8D]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name={feature.icon} size={24} className="text-[#1C4D8D]" />
                </div>
                <span className="text-slate-700 font-semibold pt-3">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-slate-100 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Banner Advertising Pricing
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Choose your placement and duration
            </p>

            {/* Duration Selector */}
            <div className="inline-flex gap-2 bg-white rounded-full p-2 border border-slate-200 shadow-sm">
              <button
                onClick={() => setSelectedDuration('monthly')}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  selectedDuration === 'monthly' ? 'bg-[#1C4D8D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedDuration('six_months')}
                className={`px-6 py-3 rounded-full font-semibold transition-all relative ${
                  selectedDuration === 'six_months' ? 'bg-[#1C4D8D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                6 Months <span className="text-[#4FB7B3] ml-1">(Save 5%)</span>
              </button>
              <button
                onClick={() => setSelectedDuration('annual')}
                className={`px-6 py-3 rounded-full font-semibold transition-all relative ${
                  selectedDuration === 'annual' ? 'bg-[#1C4D8D] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Annual <span className="text-[#4FB7B3] ml-1">(Save 10%)</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {bannerPricing.map((tier) => (
              <div key={tier.id} className={`bg-white rounded-2xl p-8 border-2 hover:shadow-2xl transition-all flex flex-col ${tier.id === 'mid' ? 'border-[#1C4D8D] shadow-xl' : 'border-transparent shadow-lg'}`}>
                <div className={`w-16 h-16 ${tier.color} rounded-xl flex items-center justify-center mb-6`}>
                  <Icon name="MegaphoneIcon" size={32} />
                </div>

                <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
                  {tier.position}
                </h3>
                <p className="text-slate-500 mb-6">
                  {tier.description}
                </p>

                <div className="mb-6">
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-bold text-slate-900">${getPrice(tier)}</span>
                    <span className="text-slate-500 mb-2">
                      /{selectedDuration === 'monthly' ? 'mo' : selectedDuration === 'six_months' ? '6mo' : 'yr'}
                    </span>
                  </div>
                  {getSavings(tier) > 0 && (
                    <p className="text-green-600 font-bold">
                      Save ${getSavings(tier)} with this plan
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <Icon name="CheckIcon" size={20} className="text-[#1C4D8D] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">728 x 200px banner size</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="CheckIcon" size={20} className="text-[#1C4D8D] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">Automatic rotation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="CheckIcon" size={20} className="text-[#1C4D8D] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">Performance analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="CheckIcon" size={20} className="text-[#1C4D8D] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">Category targeting option</span>
                  </li>
                </ul>

                <Link
                  to="/contact"
                  className="w-full mt-auto px-6 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-[#1C4D8D] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group/btn"
                >
                  Get Started
                  <Icon name="ArrowRightIcon" size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-slate-500 mt-12">
            *Multiple slots available per position. Banners rotate automatically when multiple ads are active.
          </p>
        </div>
      </div>

      {/* Banner Specifications */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-lg">
            <h3 className="font-heading text-3xl font-bold text-slate-900 mb-8 tracking-tight">
              Banner Specifications
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-slate-800 mb-4">Technical Requirements</h4>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-start gap-3">
                    <Icon name="CheckCircleIcon" size={20} className="text-[#1C4D8D] flex-shrink-0 mt-0.5" variant="solid" />
                    <span>Size: 728 x 200 pixels</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="CheckCircleIcon" size={20} className="text-[#1C4D8D] flex-shrink-0 mt-0.5" variant="solid" />
                    <span>Format: JPG, PNG, or GIF</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="CheckCircleIcon" size={20} className="text-[#1C4D8D] flex-shrink-0 mt-0.5" variant="solid" />
                    <span>Max file size: 500KB</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="CheckCircleIcon" size={20} className="text-[#1C4D8D] flex-shrink-0 mt-0.5" variant="solid" />
                    <span>Animated GIFs allowed</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-4">What You Get</h4>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-start gap-3">
                    <Icon name="CheckCircleIcon" size={20} className="text-[#1C4D8D] flex-shrink-0 mt-0.5" variant="solid" />
                    <span>Clickable banner with custom URL</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="CheckCircleIcon" size={20} className="text-[#1C4D8D] flex-shrink-0 mt-0.5" variant="solid" />
                    <span>Impression and click tracking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="CheckCircleIcon" size={20} className="text-[#1C4D8D] flex-shrink-0 mt-0.5" variant="solid" />
                    <span>Monthly performance reports</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Icon name="CheckCircleIcon" size={20} className="text-[#1C4D8D] flex-shrink-0 mt-0.5" variant="solid" />
                    <span>Dedicated account support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#1C4D8D] to-[#153e75] py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
            Ready to Boost Your Visibility?
          </h2>
          <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Contact us today to reserve your banner placement and start reaching thousands of engaged members.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/contact"
              className="px-8 py-4 bg-white text-[#1C4D8D] rounded-xl text-lg font-bold hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-flex items-center gap-3"
            >
              Contact Sales
              <Icon name="ArrowRightIcon" size={20} />
            </Link>
            <Link
              to="/sign-up"
              className="px-8 py-4 bg-white/10 text-white border-2 border-white/30 rounded-xl text-lg font-semibold hover:bg-white/20 hover:border-white/50 transition-all"
            >
              Become a Partner
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvertiseContent