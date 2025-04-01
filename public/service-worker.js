const SUPPORTED_ORIGINS = [
  "https://preprod.myinvois.hasil.gov.my",
  "https://myinvois.hasil.gov.my",
];

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.storage.sync.set({ entities: [] }).then(() => {
      chrome.tabs.create({ url: "pages/welcome.html" });
    });
  }
  if (details.reason === "update") {
    switch (details.previousVersion) {
      case "0.1.1":
        chrome.storage.sync.get("entities", (data) => {
          const entities = data.entities.map((entity) => {
            
            const address = entity.address.split(",").map((v) => v.trim()).filter((v) => (v)).reverse();
            const addressAfterRemovedMandatory = address.slice(3, address.length);
            const postcode = Number.isNaN(addressAfterRemovedMandatory[0]) ? "" : addressAfterRemovedMandatory[0];
            const addressAfterRemovedPostcode = addressAfterRemovedMandatory.slice(1, addressAfterRemovedMandatory.length).reverse();
            return {
              ...entity,
              normalisedAddress: {
                country: address[0],
                state: address[1],
                city: address[2],
                postcode: postcode,
                line1: addressAfterRemovedPostcode[0],
                line2: addressAfterRemovedPostcode[1] ?? "",
                line3: addressAfterRemovedPostcode[2] ?? "",
              },
            };
          });
          chrome.storage.sync.set({ entities });
        });
        break;
      default:
        break;
    }
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, _, tab) => {
  const url = new URL(tab.url);
  if (SUPPORTED_ORIGINS.includes(url.origin)) {
    await chrome.sidePanel.setOptions({
      tabId,
      path: "index.html",
      enabled: true,
    });
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error(error));
    chrome.action.setIcon({ path: "images/icon-16.png", tabId });
  } else {
    chrome.action.setIcon({ path: "images/icon-16-disabled.png", tabId });
  }
});
