let userDropdown;
let username = 'Loading…';
let passedOver = false;

function updateUsernameDisplay() {
  const el = document.getElementById('username');
  if (el) el.innerText = username;
}

function parseGetUsernameResponse(body) {
  if (!body && body !== '') return '';

  // If the caller passed an object (already-parsed JSON), prefer its fields
  if (typeof body === 'object') {
    if (body.description) return String(body.description).trim();
    if (body.html) {
      return new DOMParser()
        .parseFromString(String(body.html), 'text/html')
        .body.textContent.trim();
    }
    return '';
  }

  const trimmed = String(body || '').trim();
  if (!trimmed) return '';

  // JSON string
  if (trimmed.startsWith('{')) {
    try {
      const data = JSON.parse(trimmed);
      if (data.description) return String(data.description).trim();
      if (data.html) {
        return new DOMParser()
          .parseFromString(data.html, 'text/html')
          .body.textContent.trim();
      }
    } catch {
      return '';
    }
  }

  // If HTML, try to extract username from meta tags or visible text
  if (/[<>]/.test(trimmed)) {
    try {
      const doc = new DOMParser().parseFromString(trimmed, 'text/html');
      // meta name="description" often contains username in some endpoints
      const metaDesc = doc.querySelector('meta[name="description"]');
      if (metaDesc && metaDesc.content) return String(metaDesc.content).trim();

      // Look for visible text like "Currently logged in as John..."
      const bodyText = (doc.body && doc.body.textContent) ? doc.body.textContent : '';
      const m = bodyText.match(/Currently\s+(?:logged|signed)\s+in\s+as[:\s]*([A-Za-z0-9_\- ]+)/i);
      if (m && m[1]) return m[1].trim();

      // fallback: look for any meta property or tag that might hold a username
      const metaOgDesc = doc.querySelector('meta[property="og:description"]') || doc.querySelector('meta[name="description"]');
      if (metaOgDesc && metaOgDesc.content) return String(metaOgDesc.content).trim();
    } catch {
      // parsing failed -> continue
    }
    return '';
  }

  // Plain text with no HTML
  if (!/[<>]/.test(trimmed)) return trimmed;

  return '';
}

async function updateSignedInUsername() {
  const iframe = document.getElementById('iframe');

  try {
    let name = '';
    let phpsessid = '';

    if (window.phpizzaDesktop?.getSignedInUser) {
      const result = await window.phpizzaDesktop.getSignedInUser();
      name = parseGetUsernameResponse(result.body);
      phpsessid = result.phpsessid || '';
    }

    if (!name) {
      try {
        const response = await fetch('/api/GetUsername.php', {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          name = parseGetUsernameResponse(await response.text());
        }
      } catch (error) {
        console.error('[account-menu] API username fetch failed:', error);
      }
    }

    username = name || 'Guest';
    // If server reports Guest but the iframe is same-origin and shows a logged-in user,
    // try to extract the username from the iframe UI as a fallback.
    if ((username === 'Guest' || !username) && iframe?.contentDocument) {
      try {
        const doc = iframe.contentDocument;
        // Look for an element that mentions "Currently logged in as" or similar
        const xpath = "//*[contains(text(), 'Currently logged in as') or contains(text(), 'Currently signed in as')]";
        const node = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (node) {
          const text = node.textContent || '';
          const m = text.match(/Currently (?:logged|signed) in as\s*:?\s*([A-Za-z0-9_\- ]+)/i);
          if (m && m[1]) {
            username = m[1].trim();
          }
        }
      } catch (err) {
        // ignore cross-origin or other access errors
      }
    }
    updateUsernameDisplay();

    if (!passedOver && iframe?.contentWindow && phpsessid) {
      iframe.contentWindow.postMessage({ phpsessid });
      passedOver = true;
    }
  } catch (error) {
    console.error('[account-menu] Failed to fetch username:', error);
    username = 'Guest';
    updateUsernameDisplay();
  }
}

function toggleAccountMenu() {
  if (!userDropdown) {
    userDropdown = document.getElementById('user-dropdown');
    
  }
  console.debug('[account-menu] toggleAccountMenu called');
  if (!userDropdown) {
    console.warn('[account-menu] user-dropdown element not found');
    return;
  }

  const wasOpen = userDropdown.classList.contains('open');
  userDropdown.classList.toggle('open');
  if (wasOpen) {
    if (window.__accountMenuOutsideHandler) {
      document.removeEventListener('click', window.__accountMenuOutsideHandler, true);
      window.__accountMenuOutsideHandler = null;
    }
    return;
  }

  // Position the dropdown relative to the account switch button if possible.
  // Measure the dropdown while hidden so width/height are available.
  const btn = document.getElementById('account_switch_button');
  userDropdown.style.position = 'fixed';
  userDropdown.style.zIndex = 100000;
  userDropdown.style.pointerEvents = 'auto';
  userDropdown.style.boxShadow = '0 6px 24px rgba(0,0,0,0.25)';

  try {
    if (btn) {
      const btnRect = btn.getBoundingClientRect();
      const ddRect = userDropdown.getBoundingClientRect();
      // place below the button using viewport coords (fixed positioning)
      let top = btnRect.bottom + 8;
      let left = btnRect.right - ddRect.width;
      // constrain to viewport
      const minLeft = 8;
      const maxLeft = window.innerWidth - ddRect.width - 8;
      if (left < minLeft) left = minLeft;
      if (left > maxLeft) left = maxLeft;

      userDropdown.style.top = top + 'px';
      userDropdown.style.left = left + 'px';
    } else {
      // fallback: center near top-right
      userDropdown.style.top = '56px';
      userDropdown.style.right = '16px';
      userDropdown.style.left = '';
    }
  } catch (e) {
    console.debug('[account-menu] position calculation failed', e);
  }


  // Add outside click handler to close the menu
  window.__accountMenuOutsideHandler = function outsideClick(e) {
    const target = e.target;
    if (!userDropdown.contains(target) && target !== btn) {
      toggleAccountMenu();
    }
  };
  // Use capture so we run before other handlers that might stopPropagation
  setTimeout(() => document.addEventListener('click', window.__accountMenuOutsideHandler, true), 0);

  updateSignedInUsername();
}

updateUsernameDisplay();
