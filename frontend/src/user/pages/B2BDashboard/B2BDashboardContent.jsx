import React, { useState, useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast';
import Icon from '../../components/ui/AppIcon';
import AppImage from '../../components/ui/AppImage';

const B2BDashboardContent = () => {
  const [user] = useState({ id: 'mock-b2b-id', email: 'b2b@example.com' });
  const [activeTab, setActiveTab] = useState('directory');
  const [directory, setDirectory] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [campaignForm, setCampaignForm] = useState({
    campaign_name: '',
    subject: '',
    html_body: '',
    recipient_type: 'employers'
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch B2B Directory
      setDirectory([
        { id: 1, company_name: 'Cayman Logistics', partner_type: 'Business Partner', category: 'Logistics', logo_url: null, is_active: true },
        { id: 2, company_name: 'Island HR Solutions', partner_type: 'Employer', category: 'HR', logo_url: null, is_active: true },
      ]);

      // Fetch Email Campaigns
      setCampaigns([
        { id: 1, campaign_name: 'Summer Partnership', subject: 'Exclusive offers for partners', recipient_type: 'employers', sent_count: 120, status: 'sent', created_at: new Date().toISOString() }
      ]);

      // Fetch Billing
      setBilling({
        billing_year: 2024,
        annual_fee: 1200,
        payment_status: 'paid',
        renewal_date: '2025-01-01'
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!campaignForm.campaign_name || !campaignForm.subject || !campaignForm.html_body) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      // Mock send

      toast.success('Campaign sent successfully!');
      setCampaignForm({ campaign_name: '', subject: '', html_body: '', recipient_type: 'employers' });
      fetchDashboardData();
    } catch (error) {
      toast.error(error.message || 'Failed to send campaign');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <Toaster position="top-right" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-2">B2B Business Partner Dashboard</h1>
          <p className="text-lg text-slate-600">Manage your B2B partnerships and communications</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-10 overflow-hidden">
          <div className="border-b border-slate-100 px-6">
            <div className="flex gap-8 overflow-x-auto scrollbar-hide">
              {[
                { key: 'directory', label: 'Directory', icon: 'BuildingOffice2Icon' },
                { key: 'profile', label: 'My Profile', icon: 'UserCircleIcon' },
                { key: 'campaigns', label: 'Email Campaigns', icon: 'EnvelopeIcon' },
                { key: 'advertising', label: 'Advertising', icon: 'MegaphoneIcon' },
                { key: 'billing', label: 'Billing', icon: 'CreditCardIcon' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 border-b-2 font-semibold transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.key 
                      ? 'border-[#1C4D8D] text-[#1C4D8D]' 
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Icon name={tab.icon} size={20} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Directory Tab */}
            {activeTab === 'directory' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">B2B Directory</h2>
                  <p className="text-slate-600">Connect with employers, business partners, and associations</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {directory.map((partner) => (
                    <div key={partner.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all text-center group">
                      {partner.logo_url ? (
                        <AppImage
                          src={partner.logo_url}
                          alt={partner.company_name}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-contain mx-auto mb-4 rounded-xl"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Icon name="BuildingOffice2Icon" size={32} className="text-[#1C4D8D]" />
                        </div>
                      )}
                      <h3 className="font-bold text-slate-900 mb-1">{partner.company_name}</h3>
                      <p className="text-sm text-slate-500 mb-3">{partner.partner_type}</p>
                      {partner.category && (
                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                          {partner.category}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Email Campaigns Tab */}
            {activeTab === 'campaigns' && (
              <div>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Create Email Campaign</h2>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Campaign Name</label>
                        <input
                          type="text"
                          value={campaignForm.campaign_name}
                          onChange={(e) => setCampaignForm({ ...campaignForm, campaign_name: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                          placeholder="Monthly Newsletter"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Recipients</label>
                        <select
                          value={campaignForm.recipient_type}
                          onChange={(e) => setCampaignForm({ ...campaignForm, recipient_type: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                        >
                          <option value="employers">Employers</option>
                          <option value="business_partners">Business Partners</option>
                          <option value="associations">Associations</option>
                          <option value="all">All B2B Partners</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Subject Line</label>
                      <input
                        type="text"
                        value={campaignForm.subject}
                        onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                        placeholder="Exclusive B2B Opportunities"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Email Content (HTML)</label>
                      <textarea
                        value={campaignForm.html_body}
                        onChange={(e) => setCampaignForm({ ...campaignForm, html_body: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all h-48 font-mono text-sm"
                        placeholder="<h1>Hello!</h1><p>Your email content here...</p>"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleSendCampaign}
                        className="px-8 py-3 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-[#1C4D8D]/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      >
                        Send Campaign
                      </button>
                    </div>
                  </div>
                </div>

                {/* Campaign History */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Campaign History</h2>
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all">
                        <div>
                          <h3 className="font-bold text-slate-900">{campaign.campaign_name}</h3>
                          <p className="text-sm text-slate-500">{campaign.subject}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Sent to <span className="font-medium text-slate-600">{campaign.recipient_type}</span> • {campaign.sent_count || 0} recipients
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            campaign.status === 'sent' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {campaign.status}
                          </span>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(campaign.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Annual Billing</h2>
                  <p className="text-slate-600">Manage your subscription and payments</p>
                </div>
                
                {billing ? (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                        <p className="text-sm text-blue-600 font-medium mb-1">Billing Year</p>
                        <p className="text-3xl font-bold text-blue-900">{billing.billing_year}</p>
                      </div>
                      <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                        <p className="text-sm text-emerald-600 font-medium mb-1">Annual Fee</p>
                        <p className="text-3xl font-bold text-emerald-900">${billing.annual_fee}</p>
                      </div>
                      <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                        <p className="text-sm text-purple-600 font-medium mb-1">Payment Status</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                          billing.payment_status === 'paid' ? 'bg-white text-emerald-600 shadow-sm' : 'bg-white text-orange-600 shadow-sm'
                        }`}>
                          {billing.payment_status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-500 mb-1">Next Renewal Date</p>
                          <p className="text-xl font-bold text-slate-900">
                            {new Date(billing.renewal_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        {billing.payment_status === 'paid' && (
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Icon name="CheckIcon" size={24} className="text-emerald-600" />
                          </div>
                        )}
                      </div>
                    </div>

                    {billing.payment_status !== 'paid' && (
                      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Icon name="DocumentTextIcon" size={32} className="text-orange-600" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Payment Required</h3>
                        <p className="text-slate-600 mb-6 max-w-md mx-auto">Please upload your payment proof to activate your renewal for the upcoming year.</p>
                        
                        <div className="max-w-sm mx-auto">
                          <label className="block w-full cursor-pointer">
                            <span className="sr-only">Choose file</span>
                            <input type="file" accept="image/*,application/pdf" className="block w-full text-sm text-slate-500
                              file:mr-4 file:py-2.5 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-[#1C4D8D] file:text-white
                              hover:file:bg-[#1C4D8D]/90
                            "/>
                          </label>
                          <button className="mt-4 w-full px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                            Submit Payment Proof
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Icon name="CreditCardIcon" size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No billing records found</p>
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon name="UserCircleIcon" size={40} className="text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">My Profile</h2>
                <p className="text-slate-500">Profile management features coming soon</p>
              </div>
            )}

            {/* Advertising Tab */}
            {activeTab === 'advertising' && (
              <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon name="MegaphoneIcon" size={40} className="text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Advertising</h2>
                <p className="text-slate-500">Advertising management features coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default B2BDashboardContent