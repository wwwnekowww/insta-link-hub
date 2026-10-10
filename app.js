const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
let dataset;
let toastTimer;

function safeText(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function accountUrl(id) { return `#/a/${encodeURIComponent(id)}`; }
function accountById(id) { return dataset.accounts.find((account) => account.id === id); }
function normalizedNumber(value) { return String(value).replace(/^0+/, "") || "0"; }

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

async function copyPageLink(id) {
  const url = `${location.href.split("#")[0]}${accountUrl(id)}`;
  try {
    await navigator.clipboard.writeText(url);
    showToast("이 계정 페이지 주소를 복사했어요.");
  } catch {
    showToast("주소창에서 페이지 주소를 복사해 주세요.");
  }
}

function renderHome() {
  app.innerHTML = `
    <section class="hero">
      <span class="eyebrow">A SIMPLE LINK PAGE FOR EACH ACCOUNT</span>
      <h1>계정마다 다른 취향,<br><em>링크는 한곳에</em></h1>
      <p class="hero-copy">인스타 프로필에 연결할 수 있는 링크 페이지 예시예요.<br>계정을 고르면 각 페이지를 미리 볼 수 있어요.</p>
      <div class="hero-stats"><span>10</span> SAMPLE PROFILES <i></i> MOBILE READY</div>
    </section>
    <section class="directory" aria-labelledby="directory-title">
      <div class="section-heading"><div><span class="eyebrow">PICK A PROFILE</span><h2 id="directory-title">어떤 계정을 볼까요?</h2></div><span class="section-count">01 — 10</span></div>
      <div class="account-grid">
        ${dataset.accounts.map((account, index) => `
          <a class="account-card tone-${safeText(account.tone)}" href="${accountUrl(account.id)}" aria-label="${safeText(account.name)} 페이지 열기">
            <span class="account-avatar">${safeText(account.emoji)}</span>
            <span class="account-info"><span class="account-category">${safeText(account.category)}</span><strong>${safeText(account.name)}</strong><small>${safeText(account.handle)}</small></span>
            <span class="account-index">${String(index + 1).padStart(2, "0")} <b>↗</b></span>
          </a>`).join("")}
      </div>
    </section>
    <aside class="demo-note"><span>✳</span><p><strong>이 시안의 링크는 예시예요.</strong><br>계정과 실제 링크를 받으면 각 버튼을 해당 주소로 연결할 수 있어요.</p></aside>`;
}

function renderProfile(account) {
  const hasPostBundles = Array.isArray(account.posts);
  const links = account.links || [];
  app.innerHTML = `
    <a class="back-link" href="#/">← 계정 목록</a>
    <section class="profile-page tone-${safeText(account.tone)}">
      <div class="profile-cover" aria-hidden="true"><small class="cover-label">${safeText(account.coverLabel || account.category)}</small><span>${safeText(account.emoji)}</span><i></i><b></b></div>
      <div class="profile-content">
        <div class="profile-identity">
          <div class="profile-avatar">${safeText(account.emoji)}</div>
          <span class="profile-category">${safeText(account.category)}</span>
          <h1>${safeText(account.name)}</h1>
          <p class="profile-handle">${safeText(account.handle)}</p>
          <p class="profile-bio">${safeText(account.tagline)}</p>
        </div>
        <div class="number-search">
          <label for="profile-number-search">번호로 찾기</label>
          <div class="number-search-control"><span aria-hidden="true">#</span><input id="profile-number-search" type="search" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="번호 입력 (예: 03)" data-number-search><button type="button" data-clear-search>초기화</button></div>
          <p class="number-search-status" aria-live="polite" data-search-status>번호를 입력하면 해당 링크만 표시됩니다.</p>
        </div>
        ${hasPostBundles ? `
          <section class="post-bundles" aria-label="${safeText(account.name)} 게시물별 상품 링크">
            ${account.posts.map((post, postPosition) => `
              <article class="post-bundle" data-default-expanded="${postPosition === 0}">
                <button class="post-toggle" type="button" aria-expanded="${postPosition === 0}" aria-controls="products-${safeText(account.id)}-${safeText(post.id || postPosition + 1)}" data-toggle-post>
                  <span class="post-toggle-title"><span class="post-index">POST ${String(post.index || postPosition + 1).padStart(2, "0")}</span><strong>${safeText(post.title)}</strong></span>
                  <span class="post-toggle-meta">상품 ${post.products.length}개 <span class="post-chevron" aria-hidden="true">⌄</span></span>
                </button>
                <ol class="product-links" id="products-${safeText(account.id)}-${safeText(post.id || postPosition + 1)}" ${postPosition === 0 ? "" : "hidden"}>
                  ${post.products.map((product, productPosition) => `
                    <li data-search-number="${String(product.index || productPosition + 1).padStart(2, "0")}">
                      <a class="product-link ${product.url ? "" : "demo-link"}" href="${safeText(product.url || "#demo-link")}" ${product.url ? 'target="_blank" rel="noopener noreferrer"' : 'data-demo-link aria-disabled="true"'}>
                        <span class="product-index">${String(product.index || productPosition + 1).padStart(2, "0")}</span>
                        <span class="product-label"><strong>${safeText(product.title)}</strong><small>${safeText(product.subtitle)}</small></span>
                        <span class="product-arrow">↗</span>
                      </a>
                    </li>`).join("")}
                </ol>
              </article>`).join("")}
          </section>` : `
          <div class="profile-links" aria-label="${safeText(account.name)} 링크">
            ${links.map((link, index) => `
              <a class="profile-link ${index === 0 ? "featured" : ""}" data-search-number="${String(link.index || index + 1).padStart(2, "0")}" href="#demo-link" data-demo-link aria-disabled="true">
                <span class="link-index">${String(link.index || index + 1).padStart(2, "0")}</span>
                <span class="link-icon">${safeText(link.icon || "↗")}</span>
                <span class="link-label"><strong>${safeText(link.title)}</strong><small>${safeText(link.subtitle)}</small></span>
                <span class="link-arrow">↗</span>
              </a>`).join("")}
          </div>`}
        <button class="share-button" type="button" data-copy-page="${safeText(account.id)}"><span>↗</span> 이 페이지 주소 복사</button>
        <div class="profile-footer"><span>LINKS · CONTENT · CONTACT</span></div>
      </div>
    </section>
    <p class="profile-demo-caption">페이지 디자인 예시 · 버튼은 아직 실제 링크와 연결되지 않았어요.</p>`;
}

function renderNotFound() {
  app.innerHTML = `<section class="not-found"><span class="eyebrow">404 · PAGE NOT FOUND</span><h1>페이지를 찾지 못했어요.</h1><a class="back-link" href="#/">← 계정 목록으로</a></section>`;
}

function route() {
  if (!dataset) return;
  const parts = decodeURIComponent(location.hash.replace(/^#\/?/, "")).split("/").filter(Boolean);
  if (!parts.length) return renderHome();
  if (parts[0] !== "a" || !parts[1]) return renderNotFound();
  const account = accountById(parts[1]);
  if (!account) return renderNotFound();
  renderProfile(account);
}

document.addEventListener("click", (event) => {
  const postToggle = event.target.closest("[data-toggle-post]");
  if (postToggle) {
    const expanded = postToggle.getAttribute("aria-expanded") === "true";
    postToggle.setAttribute("aria-expanded", String(!expanded));
    const productList = document.getElementById(postToggle.getAttribute("aria-controls"));
    if (productList) productList.hidden = expanded;
  }

  const copyButton = event.target.closest("[data-copy-page]");
  if (copyButton) {
    event.preventDefault();
    copyPageLink(copyButton.dataset.copyPage);
  }
  const clearSearch = event.target.closest("[data-clear-search]");
  if (clearSearch) {
    const input = clearSearch.closest(".number-search").querySelector("[data-number-search]");
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  }
  if (event.target.closest("[data-demo-link]")) {
    event.preventDefault();
    showToast("예시 버튼이에요. 실제 주소를 넣으면 바로 연결돼요.");
  }
});

document.addEventListener("input", (event) => {
  const input = event.target.closest("[data-number-search]");
  if (!input) return;
  input.value = input.value.replace(/\D/g, "");
  const query = input.value ? normalizedNumber(input.value) : "";
  const profile = input.closest(".profile-content");
  const status = profile.querySelector("[data-search-status]");
  const matches = [...profile.querySelectorAll("[data-search-number]")];
  let matchCount = 0;

  matches.forEach((item) => {
    const matched = !query || normalizedNumber(item.dataset.searchNumber) === query;
    item.hidden = !matched;
    if (query && matched) matchCount += 1;
  });

  profile.querySelectorAll(".post-bundle").forEach((bundle) => {
    const hasVisibleProduct = [...bundle.querySelectorAll("[data-search-number]")].some((item) => !item.hidden);
    const toggle = bundle.querySelector("[data-toggle-post]");
    const productList = bundle.querySelector(".product-links");
    bundle.hidden = Boolean(query && !hasVisibleProduct);
    if (query && hasVisibleProduct) {
      toggle.setAttribute("aria-expanded", "true");
      productList.hidden = false;
    } else if (!query) {
      const defaultExpanded = bundle.dataset.defaultExpanded === "true";
      toggle.setAttribute("aria-expanded", String(defaultExpanded));
      productList.hidden = !defaultExpanded;
    }
  });

  status.textContent = !query
    ? "번호를 입력하면 해당 링크만 표시됩니다."
    : matchCount
      ? `${query.padStart(2, "0")}번 항목 ${matchCount}개를 찾았어요.`
      : `${query.padStart(2, "0")}번 항목이 없어요. 번호를 다시 확인해 주세요.`;
});

window.addEventListener("hashchange", () => {
  route();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

fetch("data.json?v=6", { cache: "no-store" })
  .then((response) => {
    if (!response.ok) throw new Error("계정 데이터를 불러오지 못했어요.");
    return response.json();
  })
  .then((data) => {
    dataset = data;
    route();
  })
  .catch((error) => {
    app.innerHTML = `<section class="not-found"><h1>페이지를 표시할 수 없어요.</h1><p>${safeText(error.message)}</p></section>`;
  });
