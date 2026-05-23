import React from "react";
import { useParams, Navigate } from "react-router-dom";

const CategoriesDetailsPage = () => {
  const { category } = useParams();

  if (!category) {
    return <Navigate to="/categories" replace />;
  }

  // Redirect legacy category path to dynamic browse-discounts category page
  return <Navigate to={`/browse-discounts?category=${category}`} replace />;
};

export default CategoriesDetailsPage;