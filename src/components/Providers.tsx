"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CompareProvider } from "@/context/CompareContext";
import { SearchProvider } from "@/context/SearchContext";
import { MiniCartDrawer } from "@/components/MiniCartDrawer";
import { FaqChatbot } from "@/components/FaqChatbot";
import { PwaRegister } from "@/components/PwaRegister";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <CompareProvider>
            <SearchProvider>
            <ToastProvider>
              {children}
              <MiniCartDrawer />
              <FaqChatbot />
              <PwaRegister />
            </ToastProvider>
            </SearchProvider>
          </CompareProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
