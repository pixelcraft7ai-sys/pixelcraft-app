import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Template {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: string;
}

const TEMPLATES: Template[] = [
  {
    id: "landing-page",
    name: "Landing Page",
    description: "Modern landing page with hero section",
    prompt: "Create a modern landing page with a hero section featuring a headline, subheading, and CTA button. Include a navigation bar with logo and menu items. Add a features section with 3 cards showcasing key benefits. Include a testimonials section and a footer with links.",
    icon: "🚀",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Professional portfolio showcase",
    prompt: "Design a professional portfolio website with a header, hero section with profile image, about section, portfolio grid with 6 project cards, skills section, and contact form. Use a modern color scheme with smooth animations.",
    icon: "🎨",
  },
  {
    id: "blog",
    name: "Blog",
    description: "Clean blog layout",
    prompt: "Create a clean blog layout with a header, sidebar for categories and recent posts, main content area with blog post cards, pagination, and a footer. Include search functionality and proper typography for readability.",
    icon: "📝",
  },
  {
    id: "ecommerce",
    name: "E-Commerce",
    description: "Product showcase store",
    prompt: "Design an e-commerce product page with a header, product image gallery, product details, price, add to cart button, related products section, and customer reviews. Include a shopping cart icon in the header.",
    icon: "🛍️",
  },
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Admin dashboard",
    prompt: "Create a professional admin dashboard with a sidebar navigation, top header with user profile, main content area with dashboard cards showing statistics, charts, and tables. Include a responsive layout that works on mobile.",
    icon: "📊",
  },
  {
    id: "contact",
    name: "Contact Form",
    description: "Contact form page",
    prompt: "Design a contact form page with a header, contact information section, contact form with fields for name, email, subject, and message. Include form validation, success message, and a professional layout with proper spacing.",
    icon: "📧",
  },
];

interface DesignTemplatesProps {
  onSelectTemplate: (prompt: string) => void;
  isLoading?: boolean;
}

export function DesignTemplates({ onSelectTemplate, isLoading }: DesignTemplatesProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Templates</h3>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className="p-3 cursor-pointer hover:shadow-md transition"
              onClick={() => onSelectTemplate(template.prompt)}
            >
              <div className="flex items-start gap-2">
                <span className="text-xl">{template.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {template.name}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {template.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
