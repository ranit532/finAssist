import React from "react";
import ReactDOM from "react-dom/client";
import('./App.tsx').then(AppModule => {
  const App = AppModule.default;
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
