(function () {
  const DEFAULT_CONFIG = {
    enabled: true,
    timeoutMs: 5000,
    ipServiceUrl: "https://api.ipify.org?format=json",
    providerName: "proxycheck",
    providerUrlTemplate: "https://proxycheck.io/v2/{ip}?vpn=1&asn=1&risk=1",
    providerApiKey: "",
    playAudioOnDetection: false,
  };

  const toBool = function (value) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      return normalized === "true" || normalized === "yes" || normalized === "1";
    }
    return false;
  };

  const requestJson = async function (url, timeoutMs) {
    const controller = new AbortController();
    const timerId = window.setTimeout(function () {
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error("Request failed with status " + response.status);
      }
      return await response.json();
    } finally {
      window.clearTimeout(timerId);
    }
  };

  const buildProviderUrl = function (config, ipAddress) {
    if (!config.providerUrlTemplate) return "";

    let url = config.providerUrlTemplate.replace(
      "{ip}",
      encodeURIComponent(ipAddress || "")
    );
    url = url.replace("{key}", encodeURIComponent(config.providerApiKey || ""));

    if (config.providerApiKey && !config.providerUrlTemplate.includes("{key}")) {
      const separator = url.includes("?") ? "&" : "?";
      url += separator + "key=" + encodeURIComponent(config.providerApiKey);
    }

    return url;
  };

  const extractData = function (payload, ipAddress) {
    if (!payload || typeof payload !== "object") return {};

    if (ipAddress && payload[ipAddress] && typeof payload[ipAddress] === "object") {
      return payload[ipAddress];
    }

    if (payload.data && typeof payload.data === "object") {
      return payload.data;
    }

    if (payload.security && typeof payload.security === "object") {
      return payload.security;
    }

    return payload;
  };

  const normalizeResult = function (payload, ipAddress, providerName) {
    const data = extractData(payload, ipAddress);
    const security = data.security && typeof data.security === "object" ? data.security : {};

    const readFlag = function (keys) {
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        if (key in security) return toBool(security[key]);
        if (key in data) return toBool(data[key]);
        if (key in payload) return toBool(payload[key]);
      }
      return false;
    };

    const indicators = {
      vpn: readFlag(["vpn", "is_vpn", "active_vpn"]),
      proxy: readFlag(["proxy", "is_proxy", "active_proxy"]),
      tor: readFlag(["tor", "is_tor", "active_tor"]),
      hosting: readFlag(["hosting", "is_hosting", "active_hosting"]),
    };

    const detectedTypes = Object.keys(indicators).filter(function (key) {
      return indicators[key];
    });

    return {
      detected: detectedTypes.length > 0,
      indicators: indicators,
      details: {
        provider: providerName,
        ipAddress: ipAddress || null,
        detectedTypes: detectedTypes,
      },
      raw: data,
    };
  };

  const renderBanner = function (result) {
    if (!document.body || document.getElementById("vpn-detection-banner")) return;

    const banner = document.createElement("section");
    banner.id = "vpn-detection-banner";
    banner.className = "vpn-detection-banner";
    banner.setAttribute("role", "alert");
    banner.setAttribute("aria-live", "assertive");

    const textWrapper = document.createElement("div");
    textWrapper.className = "vpn-detection-banner__text";

    const title = document.createElement("strong");
    title.className = "vpn-detection-banner__title";
    title.textContent = "VPN/Proxy network detected";

    const message = document.createElement("p");
    message.className = "vpn-detection-banner__message";
    message.textContent =
      "This visit appears to be using a VPN, proxy, Tor, or hosting network.";

    const detail = document.createElement("p");
    detail.className = "vpn-detection-banner__detail";
    detail.textContent =
      "Flags: " +
      (result.details.detectedTypes.length
        ? result.details.detectedTypes.join(", ")
        : "unknown");

    textWrapper.appendChild(title);
    textWrapper.appendChild(message);
    textWrapper.appendChild(detail);

    const dismissButton = document.createElement("button");
    dismissButton.type = "button";
    dismissButton.className = "vpn-detection-banner__dismiss";
    dismissButton.setAttribute("aria-label", "Dismiss VPN detection notice");
    dismissButton.textContent = "Dismiss";
    dismissButton.addEventListener("click", function () {
      banner.remove();
    });

    banner.appendChild(textWrapper);
    banner.appendChild(dismissButton);
    document.body.appendChild(banner);
  };

  const playAlertTone = function () {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return false;

    try {
      const audioContext = new AudioCtx();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "triangle";
      oscillator.frequency.value = 830;
      gain.gain.value = 0.08;

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.18);
      oscillator.onended = function () {
        audioContext.close();
      };
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleDetectionAudio = function (config) {
    if (!config.playAudioOnDetection) return;

    if (playAlertTone()) return;

    const replayOnInteraction = function () {
      if (playAlertTone()) {
        document.removeEventListener("click", replayOnInteraction);
        document.removeEventListener("keydown", replayOnInteraction);
      }
    };

    document.addEventListener("click", replayOnInteraction);
    document.addEventListener("keydown", replayOnInteraction);
  };

  const runVpnDetection = async function () {
    const config = Object.assign({}, DEFAULT_CONFIG, window.VPN_DETECTION_CONFIG || {});
    if (!config.enabled) return;

    try {
      const ipData = await requestJson(config.ipServiceUrl, config.timeoutMs);
      const ipAddress = ipData.ip || ipData.query || ipData.address || "";
      const providerUrl = buildProviderUrl(config, ipAddress);
      if (!providerUrl) return;

      const providerPayload = await requestJson(providerUrl, config.timeoutMs);
      const normalizedResult = normalizeResult(
        providerPayload,
        ipAddress,
        config.providerName
      );

      if (!normalizedResult.detected) return;

      renderBanner(normalizedResult);
      handleDetectionAudio(config);
      window.VPN_DETECTION_LAST_RESULT = normalizedResult;
    } catch (error) {
      console.warn("VPN detection check failed:", error.message);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runVpnDetection);
  } else {
    runVpnDetection();
  }
})();
