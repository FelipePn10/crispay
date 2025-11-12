import { useState, useEffect } from "react";

export interface TronLinkState {
  installed: boolean;
  loggedIn: boolean;
  address: string | null;
}

export const useTronLinkDetection = () => {
  const [tronLink, setTronLink] = useState<TronLinkState>({
    installed: false,
    loggedIn: false,
    address: null,
  });

  useEffect(() => {
    const checkTronLink = () => {
      const tronWeb = (window as any).tronWeb;
      const tronLink = (window as any).tronLink;

      const installed = !!(tronWeb || tronLink);
      let loggedIn = false;
      let address = null;

      if (tronWeb) {
        loggedIn =
          tronWeb.ready &&
          tronWeb.defaultAddress &&
          tronWeb.defaultAddress.base58;
        address = loggedIn ? tronWeb.defaultAddress.base58 : null;
      } else if (tronLink) {
        loggedIn = tronLink.ready;
      }

      setTronLink({
        installed,
        loggedIn,
        address,
      });
    };

    checkTronLink();

    const interval = setInterval(checkTronLink, 1000);

    return () => clearInterval(interval);
  }, []);

  return tronLink;
};
