import React, { useState } from "react";
import "./App.css";
import { createBrowserRouter, Route, RouterProvider, Routes } from "react-router-dom";
import HomePage from "./containers/Home";
import CodingPage from "./containers/Coding";
import { Toaster } from "sonner";

const App = () => {

  const routes = createBrowserRouter([
    { index: true, Component: HomePage },
    {
      Component: CodingPage,
      path: "/coding/:projectId",
      errorElement: <div>Something went wrong</div>,
    },
  ]);

  return (
    <>
      <RouterProvider router={routes} />
      <Toaster />
    </>
  );
};

export default App;
