(() => {
  console.log("Content script is loaded.");

  const rootPath = "/html/body/div[1]/div/main/div/div/div[2]/div";

  const prePath = `${rootPath}/div[3]/div[2]/div/div/div[2]/div[1]/div[2]/div/div/div[1]/div[2]`;
  const inputPaths = {
    name: `${prePath}/div[2]/div[1]/div[1]/div[2]/div/div/input`,
    tin: `${prePath}/div[2]/div[1]/div[2]/div[2]/div/div/input`,
    type: `${prePath}/div[2]/div[2]/div[1]/div[2]/div/div/input`,
    id: `${prePath}/div[2]/div[2]/div[2]/div[2]/div/div/input`,
    sst: `${prePath}/div[2]/div[3]/div/div[2]/div/div/input`,
    address: `${prePath}/div[2]/div[4]/div/div[2]/div/div/textarea`,
    email: `${prePath}/div[2]/div[5]/div[1]/div[2]/div/div/input`,
    contactNumber: `${prePath}/div[2]/div[5]/div[2]/div[2]/div/div/input`,
  };

  function getPath(xpath) {
    return document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
  }

  function getPathValue(xpath) {
    const element = getPath(xpath);
    return element ? element.value : null;
  }

  const onDocumentPageReady = async () => {
    // Check buyer info
    const data = {
      name: getPathValue(inputPaths.name),
      tin: getPathValue(inputPaths.tin),
      type: getPathValue(inputPaths.type),
      id: getPathValue(inputPaths.id),
      sst: getPathValue(inputPaths.sst),
      address: getPathValue(inputPaths.address),
      email: getPathValue(inputPaths.email),
      contactNumber: getPathValue(inputPaths.contactNumber),
    };

    chrome.runtime.sendMessage({
      action: "VALIDATE_BUYER_INFO",
      data,
    });
  };

  // Observer B: Monitor the page for buyer information
  const buyerSectionObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        const entityNameElement = getPath(inputPaths.contactNumber);
        if (entityNameElement) {
          buyerSectionObserver.disconnect();
          onDocumentPageReady();
          break;
        }
      }
    }
  });

  // URL Observer: Monitor URL changes
  const targetUrls = [
    "https://preprod.myinvois.hasil.gov.my/documents/",
    "https://myinvois.hasil.gov.my/documents/",
  ];

  const observeBuyerSection = () => {
    console.log("Target URL detected, activate buyer info observer.");
    buyerSectionObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  };

  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      if (targetUrls.some((targetUrl) => url.startsWith(targetUrl))) {
        observeBuyerSection();
      } else {
        buyerSectionObserver.disconnect();
      }
    }
  });
  urlObserver.observe(document, { childList: true, subtree: true });

  // Initial check to handle page load
  if (targetUrls.some((targetUrl) => location.href.startsWith(targetUrl))) {
    observeBuyerSection();
  }

  // Listener for HIGHLIGHT_FIELDS
  chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    if (request.action === "HIGHLIGHT_FIELDS" && request.data) {
      const classNameKey = "issue-input";
      const errorKeys = request.data.map((error) => error.key);
      for (const key in inputPaths) {
        const element = getPath(inputPaths[key]);

        // Remove error message
        const errorMessage =
          element.parentElement.parentElement.querySelector(".issue-message");
        if (errorMessage) {
          errorMessage.remove();
        }

        if (errorKeys.includes(key)) {
          element.classList.add(classNameKey);
          // Add error message
          const div = document.createElement("div");
          div.className = "issue-message";
          div.innerText = `${
            request.data.find((error) => error.key === key).expected
          }`;
          element.parentElement.parentElement.appendChild(div);
        } else {
          element.classList.remove(classNameKey);
        }
      }
      sendResponse({ status: "fields highlighted" });
    }
  });
})();
