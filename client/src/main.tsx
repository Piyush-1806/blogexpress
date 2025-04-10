import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add page title
const titleElement = document.createElement('title');
titleElement.textContent = "BlogExpress - Simple & Elegant Blogging Platform";
document.head.appendChild(titleElement);

// Add meta description
const metaDescription = document.createElement('meta');
metaDescription.name = "description";
metaDescription.content = "BlogExpress - A modern and user-friendly blogging platform for sharing your stories with the world";
document.head.appendChild(metaDescription);

// Add viewport meta tag
const viewportMeta = document.createElement('meta');
viewportMeta.name = "viewport";
viewportMeta.content = "width=device-width, initial-scale=1.0";
document.head.appendChild(viewportMeta);

createRoot(document.getElementById("root")!).render(<App />);
