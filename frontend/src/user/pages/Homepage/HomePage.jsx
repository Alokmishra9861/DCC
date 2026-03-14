import React from 'react'
import HeroSection from './HeroSection'
import RollUpSection from './RollUpSection'
import LocalSavings from './LocalSavings'
import RedeemableCertificates from './RedeemableCertificates'
import FinalCTA from './FinalCTA'
import TravelSavings from './TravelSavings'

const HomePage = () => {
    return (
        <>
            <HeroSection />
            <TravelSavings />
            <LocalSavings />
            <RedeemableCertificates />
            <RollUpSection />
            <FinalCTA />
        </>
    )
}

export default HomePage