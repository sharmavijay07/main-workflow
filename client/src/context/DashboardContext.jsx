"use client";

import { createContext, useContext } from "react";

const DashboardContext = createContext();

export const DashboardProvider = ({ children, recentReviews, hasNewReviews, markReviewsAsSeen }) => {
  return (
    <DashboardContext.Provider value={{ recentReviews, hasNewReviews, markReviewsAsSeen }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
