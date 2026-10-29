console.log("Cuportal Revanced", location.href);

const banner = document.createElement("div");

banner.textContent = "Extension active";

banner.style.cssText =
	"position:fixed;bottom:10px;right:10px;padding:6px 10px;" +
	"background:#1a73e8;color:#fff;font:12px sans-serif;" +
	"z-index:999999;border-radius:4px;";

document.body.appendChild(banner);
