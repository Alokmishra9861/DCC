import React from "react";
import HeroSection from "./HeroSection";
import RollUpSection from "./RollUpSection";
import LocalSavings from "./LocalSavings";
import RedeemableCertificates from "./RedeemableCertificates";
import FinalCTA from "./FinalCTA";
import TravelSavings from "./TravelSavings";
import BannerCarousel from "../../../user/components/common/BannerCarousel";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <div className="px-4 md:px-8 lg:px-12 py-8">
        <BannerCarousel />
      </div>
      <TravelSavings />
      <LocalSavings />
      <RedeemableCertificates />
      <RollUpSection />
      <FinalCTA />
    </>
  );
};

export default HomePage;
