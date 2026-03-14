import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import AutomativeMarine from './pages/AutomativeMarine';
import B2BMember from './pages/B2BMember';
import BeautyBarber from './pages/BeautyBarber';
import Construction from './pages/Construction';
import Electronicsoffice from './pages/Electronicsoffice';
import Recreational from './pages/Recreational';
import FoodBeverage from './pages/FoodBeverage';
import HealthFitness from './pages/HealthFitness';
import HomeGarden from './pages/HomeGarden';
import KidsFashion from './pages/KidsFashion';
import Retail from './pages/Retail';

const categoryComponents = {
  'automotive-marine': AutomativeMarine,
  'b2b': B2BMember,
  'beauty': BeautyBarber,
  'construction': Construction,
  'recreational': Recreational,
  'electronics': Electronicsoffice,
  'fashion': KidsFashion,
  'food': FoodBeverage,
  'health': HealthFitness,
  'home': HomeGarden,
  'kids': KidsFashion,
  'retail': Retail,
};

const CategoriesDetailsPage = () => {
     const { category } = useParams();
  const CategoryComponent = categoryComponents[category];

  if (!CategoryComponent) {
    return <Navigate to="/categories" replace />;
  }
   return <CategoryComponent />;
}

export default CategoriesDetailsPage