import React, { useState } from 'react'

const B2BMember = () => {
  const [selectedMember, setSelectedMember] = useState(null);

  const b2bMembers = [
    { id: 1, name: "Heritage Holdings", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/Heritage_Holdings_240x240.png", description: "A leader in the Cayman Islands Commercial Market, Heritage Holdings is determined to set the standard.", phone: "+1 (345) 949-1234", email: "info@heritageholdings.ky" },
    { id: 2, name: "Squeaky Home Care Services", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/Squeaky_Home240x240_0USpwWC.jpg", description: "Reliable freight forwarding, customs brokerage, and courier services for businesses.", phone: "+1 (345) 949-5678", email: "contact@squeakyhome.ky" },
    { id: 3, name: "H2Only", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/H2only240x2402.png", description: "Managed IT services, cybersecurity, and cloud solutions for modern enterprises.", phone: "+1 (345) 949-9012", email: "support@h2only.ky" },
    { id: 4, name: "A. Quality Pest Control", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/AQ_Pest_control_Alt_page_01240.jpg", description: "Premium catering services for corporate events, meetings, and office parties.", phone: "+1 (345) 949-3456", email: "service@qualitypest.ky" },
    { id: 5, name: "Artic Air Conditoning Plumbing & Maintenance", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/Artic_Airconditioning.jpg", description: "Expert legal advice and representation for corporate law and business regulations.", phone: "+1 (345) 949-7890", email: "info@articair.ky" },
    { id: 6, name: "ADvantage", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/Advantage_Plaque2402_x86RqkS.jpg", description: "Professional bookkeeping, auditing, and tax services for businesses of all sizes.", phone: "+1 (345) 949-1122", email: "hello@advantage.ky" },
    { id: 7, name: "Hurley's Media", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/Hurleys_Media240_gUDyTYC.jpg  ", description: "Strategic digital marketing, branding, and advertising services to grow your business.", phone: "+1 (345) 949-3344", email: "ads@hurleysmedia.ky" },
    { id: 8, name: "Lee's Office Products", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/LEES_LOGO_NEW240.jpg", description: "Commercial cleaning and janitorial services maintaining high hygiene standards.", phone: "+1 (345) 949-5566", email: "sales@leesoffice.ky" },
    { id: 9, name: "Big Screen Cinema Advertising", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/Big_Screen_Black_240x2402_xVz4L4r.png", description: "Advanced security systems, surveillance, and guarding services for commercial properties.", phone: "+1 (345) 949-7788", email: "info@bigscreen.ky" },
    { id: 10, name: "The Cayman Reporter", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/The_cayman_reporter240_WtqVzZO.png", description: "Recruitment, payroll management, and human resources consulting.", phone: "+1 (345) 949-9900", email: "news@caymanreporter.ky" },
    { id: 11, name: "Kingpin Apps", image: "https://web.archive.org/web/20161021122644im_/https://clubsave.ky/media/KINGPIN_240x240.jpg", description: "Bulk food and beverage distribution for restaurants and retailers.", phone: "+1 (345) 949-2233", email: "dev@kingpinapps.ky" }
  ];
  return (
    <div id="b2b" className="container mx-auto px-4 py-8 -mt-0">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">B2B Members</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {b2bMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="h-48 overflow-hidden">
              <img src={member.image} alt={member.name} className="w-full h-full object-contain" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{member.name}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{member.description}</p>
              <button onClick={() => setSelectedMember(member)} className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 transition-colors">View Details</button>
            </div>
          </div>
        ))}
      </div>

      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMember(null)}>
          <div className="bg-white rounded-lg max-w-4xl w-full overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedMember(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 flex items-center justify-center p-4">
                <img src={selectedMember.image} alt={selectedMember.name} className="max-w-full max-h-full object-contain" />
              </div>
              <div className="w-full md:w-1/2 p-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">{selectedMember.name}</h2>
                <p className="text-gray-600 mb-6">{selectedMember.description}</p>
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center text-gray-700"><span className="font-semibold w-20">Phone:</span><span>{selectedMember.phone}</span></div>
                  <div className="flex items-center text-gray-700"><span className="font-semibold w-20">Email:</span><span>{selectedMember.email}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default B2BMember