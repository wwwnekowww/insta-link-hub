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
  const hasDemoProfiles = dataset.accounts.some((account) => account.demo);
  app.innerHTML = `
    <section class="hero">
      <span class="eyebrow">A SIMPLE LINK PAGE FOR EACH ACCOUNT</span>
      <h1>계정마다 다른 취향,<br><em>링크는 한곳에</em></h1>
      <p class="hero-copy">계정별 링크를 한곳에서 모아 보여줘요.<br>계정을 고르면 해당 계정의 상품과 콘텐츠를 볼 수 있어요.</p>
      <div class="hero-stats"><span>${dataset.accounts.length}</span> ACCOUNT PAGES <i></i> MOBILE READY</div>
    </section>
    <section class="directory" aria-labelledby="directory-title">
      <div class="section-heading"><div><span class="eyebrow">PICK A PROFILE</span><h2 id="directory-title">어떤 계정을 볼까요?</h2></div><span class="section-count">01 — 10</span></div>
      <div class="account-grid">
        ${dataset.accounts.map((account, index) => `
          <a class="account-card tone-${safeText(account.tone)}" href="${accountUrl(account.id)}" aria-label="${safeText(account.name)} 페이지 열기">
            <span class="account-avatar">${account.avatarImage ? `<img src="${safeText(account.avatarImage)}" alt="">` : safeText(account.emoji)}</span>
            <span class="account-info"><span class="account-category">${safeText(account.category)}</span><strong>${safeText(account.name)}</strong><small>${safeText(account.handle)}</small></span>
            <span class="account-index">${String(index + 1).padStart(2, "0")} <b>↗</b></span>
          </a>`).join("")}
      </div>
    </section>
    ${hasDemoProfiles ? '<aside class="demo-note"><span>✳</span><p><strong>일부 계정은 아직 예시 링크를 보여줘요.</strong><br>검수 완료된 계정 콘텐츠가 등록되면 실제 주소로 연결됩니다.</p></aside>' : ''}`;
}

function renderProfile(account) {
  const posts = Array.isArray(account.posts) ? account.posts : [];
  const links = account.links || [];
  app.innerHTML = `
    <section class="profile-page tone-${safeText(account.tone)}">
      <div class="profile-cover" aria-hidden="true"><small class="cover-label">${safeText(account.coverLabel || account.category)}</small><span>${safeText(account.emoji)}</span><i></i><b></b></div>
      <div class="profile-content">
        <div class="profile-identity">
          <div class="profile-avatar">${account.avatarImage ? `<img src="${safeText(account.avatarImage)}" alt="">` : safeText(account.emoji)}</div>
          <span class="profile-category">${safeText(account.category)}</span>
          <h1>${safeText(account.name)}</h1>
          <p class="profile-handle">${safeText(account.handle)}</p>
          <p class="profile-bio">${safeText(account.tagline)}</p>
        </div>
        ${account.socialLinks?.length ? `
          <nav class="social-links" aria-label="${safeText(account.name)} 소셜 계정">
            ${account.socialLinks.map((link) => `<a class="social-link" href="${safeText(link.url)}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">${safeText(link.icon)}</span><span>${safeText(link.label)}</span><b aria-hidden="true">↗</b></a>`).join("")}
          </nav>` : ''}
        <div class="number-search">
          <label for="profile-number-search">키워드 또는 번호로 찾기</label>
          <div class="number-search-control"><span aria-hidden="true">🔍</span><input id="profile-number-search" type="search" autocomplete="off" placeholder="키워드 또는 번호 검색 (예: 욕실 꿀템, 136)" data-number-search><button type="button" data-clear-search>초기화</button></div>
          <p class="number-search-status" aria-live="polite" data-search-status>영상에서 안내된 키워드(예: 욕실 꿀템)나 번호를 입력하세요.</p>
        </div>
        ${posts.length ? `
          <section class="post-bundles" aria-label="${safeText(account.name)} 게시물별 상품 링크">
            ${posts.map((post, postPosition) => `
              <article class="post-bundle" data-default-expanded="${postPosition === 0}" data-search-topic="${safeText(post.topic || '')}" data-search-title="${safeText(post.title || '')}">
                <button class="post-toggle" type="button" aria-expanded="${postPosition === 0}" aria-controls="products-${safeText(account.id)}-${safeText(post.id || postPosition + 1)}" data-toggle-post>
                  <span class="post-toggle-title"><span class="post-index">POST ${String(post.index || postPosition + 1).padStart(2, "0")}</span><strong>${safeText(post.title)}</strong></span>
                  <span class="post-toggle-meta">상품 ${post.products.length}개 <span class="post-chevron" aria-hidden="true">⌄</span></span>
                </button>
                <ol class="product-links" id="products-${safeText(account.id)}-${safeText(post.id || postPosition + 1)}" ${postPosition === 0 ? "" : "hidden"}>
                  ${post.products.map((product, productPosition) => `
                    <li data-search-number="${String(product.index || productPosition + 1).padStart(2, "0")}" data-search-text="${safeText((product.title || '') + ' ' + (product.subtitle || ''))}">
                      <a class="product-link ${product.url ? "" : "demo-link"}" href="${safeText(product.url || "#demo-link")}" ${product.url ? 'target="_blank" rel="noopener noreferrer"' : 'data-demo-link aria-disabled="true"'}>
                        <span class="product-index">${String(product.index || productPosition + 1).padStart(2, "0")}</span>
                        <span class="product-label"><strong>${safeText(product.title)}</strong><small>${safeText(product.subtitle)}</small></span>
                        <span class="product-arrow">↗</span>
                      </a>
                    </li>`).join("")}
                </ol>
              </article>`).join("")}
          </section>` : ''}
        ${links.length ? `
          <div class="profile-links" aria-label="${safeText(account.name)} 링크">
            ${links.map((link, index) => `
              <a class="profile-link ${index === 0 && !posts.length ? "featured" : ""} ${link.url ? "" : "demo-link"}" data-search-number="${String(link.index || index + 1).padStart(2, "0")}" data-search-text="${safeText((link.title || '') + ' ' + (link.subtitle || ''))}" href="${safeText(link.url || "#demo-link")}" ${link.url ? 'target="_blank" rel="noopener noreferrer"' : 'data-demo-link aria-disabled="true"'}>
                <span class="link-index">${String(link.index || index + 1).padStart(2, "0")}</span>
                <span class="link-icon">${safeText(link.icon || "↗")}</span>
                <span class="link-label"><strong>${safeText(link.title)}</strong><small>${safeText(link.subtitle)}</small></span>
                <span class="link-arrow">↗</span>
              </a>`).join("")}
          </div>` : ''}
        <button class="share-button" type="button" data-copy-page="${safeText(account.id)}"><span>↗</span> 이 페이지 주소 복사</button>
        <div class="profile-footer"><span>LINKS · CONTENT · CONTACT</span></div>
      </div>
    </section>
    <p class="profile-demo-caption">${account.demo ? '페이지 디자인 예시 · 검수된 콘텐츠가 등록되면 실제 링크로 교체됩니다.' : '링크를 누르면 해당 상품 또는 콘텐츠 페이지가 새 창에서 열립니다.'}</p>`;
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
  const rawQuery = input.value.trim();
  const profile = input.closest(".profile-content");
  const status = profile.querySelector("[data-search-status]");
  
  if (!rawQuery) {
    // Reset all
    profile.querySelectorAll("[data-search-number]").forEach((item) => { item.hidden = false; });
    profile.querySelectorAll(".post-bundle").forEach((bundle) => {
      bundle.hidden = false;
      const defaultExpanded = bundle.dataset.defaultExpanded === "true";
      const toggle = bundle.querySelector("[data-toggle-post]");
      const productList = bundle.querySelector(".product-links");
      if (toggle) toggle.setAttribute("aria-expanded", String(defaultExpanded));
      if (productList) productList.hidden = !defaultExpanded;
    });
    status.textContent = "영상에서 안내된 키워드(예: 욕실 꿀템)나 번호를 입력하세요.";
    return;
  }

  const isNumeric = /^\d+$/.test(rawQuery);
  const normQuery = rawQuery.toLowerCase().replace(/\s+/g, "");
  let matchCount = 0;

  if (isNumeric) {
    const numQuery = normalizedNumber(rawQuery);
    // Match by item number
    profile.querySelectorAll(".post-bundle").forEach((bundle) => {
      const items = [...bundle.querySelectorAll("li[data-search-number]")];
      let bundleHasMatch = false;
      items.forEach((item) => {
        const matched = normalizedNumber(item.dataset.searchNumber) === numQuery;
        item.hidden = !matched;
        if (matched) {
          bundleHasMatch = true;
          matchCount += 1;
        }
      });
      bundle.hidden = !bundleHasMatch;
      const toggle = bundle.querySelector("[data-toggle-post]");
      const productList = bundle.querySelector(".product-links");
      if (bundleHasMatch) {
        if (toggle) toggle.setAttribute("aria-expanded", "true");
        if (productList) productList.hidden = false;
      }
    });

    profile.querySelectorAll(".profile-links [data-search-number]").forEach((link) => {
      const matched = normalizedNumber(link.dataset.searchNumber) === numQuery;
      link.hidden = !matched;
      if (matched) matchCount += 1;
    });

    status.textContent = matchCount
      ? `${numQuery.padStart(2, "0")}번 항목 ${matchCount}개를 찾았어요.`
      : `${numQuery.padStart(2, "0")}번 항목이 없어요. 번호를 다시 확인해 주세요.`;
  } else {
    // Match by keyword (topic, post title, product title, subtitle)
    profile.querySelectorAll(".post-bundle").forEach((bundle) => {
      const bTopic = (bundle.dataset.searchTopic || "").toLowerCase().replace(/\s+/g, "");
      const bTitle = (bundle.dataset.searchTitle || "").toLowerCase().replace(/\s+/g, "");
      const bundleKeywordMatch = bTopic.includes(normQuery) || bTitle.includes(normQuery);

      const items = [...bundle.querySelectorAll("li[data-search-number]")];
      let itemMatchCountInBundle = 0;

      items.forEach((item) => {
        const itemText = (item.dataset.searchText || "").toLowerCase().replace(/\s+/g, "");
        const matched = bundleKeywordMatch || itemText.includes(normQuery);
        item.hidden = !matched;
        if (matched) {
          itemMatchCountInBundle += 1;
          matchCount += 1;
        }
      });

      const bundleVisible = bundleKeywordMatch || itemMatchCountInBundle > 0;
      bundle.hidden = !bundleVisible;
      const toggle = bundle.querySelector("[data-toggle-post]");
      const productList = bundle.querySelector(".product-links");
      if (bundleVisible) {
        if (toggle) toggle.setAttribute("aria-expanded", "true");
        if (productList) productList.hidden = false;
      }
    });

    profile.querySelectorAll(".profile-links [data-search-number]").forEach((link) => {
      const linkText = (link.dataset.searchText || "").toLowerCase().replace(/\s+/g, "");
      const matched = linkText.includes(normQuery);
      link.hidden = !matched;
      if (matched) matchCount += 1;
    });

    status.textContent = matchCount
      ? `'${rawQuery}' 관련 상품 ${matchCount}개를 찾았어요.`
      : `'${rawQuery}' 검색 결과가 없어요. 다른 키워드를 입력해 보세요.`;
  }
});

window.addEventListener("hashchange", () => {
  route();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

fetch("data.json?v=7", { cache: "no-store" })
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
