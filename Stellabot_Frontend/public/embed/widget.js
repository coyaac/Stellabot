(function () {
  // Simple embeddable Stellabot widget: injects a floating button that opens the
  // deployed frontend in a popup. Hosts should serve this file over HTTPS.

  function init(el) {
    const url = el.getAttribute('data-stellabot-url') || window.STELLABOT_URL || ''
  // Icon-only launcher; keep aria-label for accessibility
  const btnLabel = el.getAttribute('data-label') || 'Open chat'
    const bg = el.getAttribute('data-bg') || '#ca2ca3'
    const size = parseInt(el.getAttribute('data-size') || '56', 10)
    const mode = (el.getAttribute('data-mode') || 'popup').toLowerCase() // 'popup' | 'iframe' | 'inline'
    const winName = el.getAttribute('data-window-name') || 'stellabot_chat'
    const winOpts = `width=420,height=620,menubar=no,toolbar=no,location=no,status=no`;

    // Inline mode configuration
    const inlineWidth = parseInt(el.getAttribute('data-inline-width') || '420', 10)
    const inlineHeight = parseInt(el.getAttribute('data-inline-height') || '620', 10)
    const position = (el.getAttribute('data-position') || 'br').toLowerCase() // br | bl | tr | tl
    const offsetX = parseInt(el.getAttribute('data-offset-x') || '20', 10)
    const offsetY = parseInt(el.getAttribute('data-offset-y') || '20', 10)
    const startOpen = (el.getAttribute('data-start-open') || 'false').toLowerCase() === 'true'

    if (!url) {
      console.warn('[Stellabot] data-stellabot-url not provided on script tag.')
      return
    }

    const btn = document.createElement('button')
    btn.type = 'button'
    btn.setAttribute('aria-label', 'Open Stellabot chat')
    // Icon-only button
    const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H10l-6 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    btn.innerHTML = iconSvg
    Object.assign(btn.style, {
      position: 'fixed',
      zIndex: 999999,
      background: bg,
      color: 'white',
      border: 'none',
      borderRadius: '999px',
      width: `${size}px`,
      height: `${size}px`,
      boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
      lineHeight: '0',
      fontSize: '0',
    })

    // position helper for button/panel
    function applyPosition(node, pos, x, y) {
      node.style.left = ''
      node.style.right = ''
      node.style.top = ''
      node.style.bottom = ''
      if (pos === 'br') { node.style.right = `${x}px`; node.style.bottom = `${y}px` }
      else if (pos === 'bl') { node.style.left = `${x}px`; node.style.bottom = `${y}px` }
      else if (pos === 'tr') { node.style.right = `${x}px`; node.style.top = `${y}px` }
      else if (pos === 'tl') { node.style.left = `${x}px`; node.style.top = `${y}px` }
      else { node.style.right = `${x}px`; node.style.bottom = `${y}px` }
    }

    applyPosition(btn, position, offsetX, offsetY)

    let popup = null
    let inlinePanel = null
    let inlineIframe = null

    // Listen for messages from embedded chat
    window.addEventListener('message', function(event) {
      if (event.data === 'stellabot-closed') {
        // Chat sent close signal, hide the inline panel
        if (inlinePanel) {
          inlinePanel.style.display = 'none'
          btn.setAttribute('aria-expanded', 'false')
        }
      }
    })

    function openPopup() {
      if (popup && !popup.closed) { popup.focus(); return }
      popup = window.open(url, winName, winOpts)
      if (!popup) { window.location.href = url }
    }

    function openIframeModal() {
      // prevent duplicate modal
      if (document.getElementById('stellabot-iframe-modal')) return

      // create overlay
      const overlay = document.createElement('div')
      overlay.id = 'stellabot-iframe-modal'
      Object.assign(overlay.style, {
        position: 'fixed',
        inset: '0',
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000000,
      })

      // create container (transparent, no extra chrome)
      const container = document.createElement('div')
      Object.assign(container.style, {
        width: '420px',
        height: '620px',
        borderRadius: '0',
        overflow: 'visible',
        boxShadow: 'none',
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
      })

      // iframe
      const iframe = document.createElement('iframe')
      iframe.src = url
      iframe.setAttribute('title', 'Stellabot')
      Object.assign(iframe.style, { border: 'none', width: '100%', height: '100%', flex: '1 1 auto', background: 'transparent' })

      // clicking backdrop closes
      overlay.addEventListener('click', (ev) => {
        if (ev.target === overlay) {
          document.body.removeChild(overlay)
          document.body.style.overflow = ''
        }
      })

      container.appendChild(iframe)
      overlay.appendChild(container)
      document.body.appendChild(overlay)
      document.body.style.overflow = 'hidden'
      // focus the iframe for accessibility
      setTimeout(() => iframe.focus?.(), 200)
    }

    function createInlinePanel() {
      if (inlinePanel) return inlinePanel
      const panel = document.createElement('div')
      Object.assign(panel.style, {
        position: 'fixed',
        zIndex: 1000000,
        width: `${inlineWidth}px`,
        height: `${inlineHeight}px`,
        borderRadius: '0',
        overflow: 'visible',
        boxShadow: 'none',
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
      })
      applyPosition(panel, position, offsetX, offsetY + size + 12) // nudge above button by 12px

      const iframe = document.createElement('iframe')
      iframe.src = url
      iframe.setAttribute('title', 'Stellabot')
      Object.assign(iframe.style, { border: 'none', width: '100%', height: '100%', flex: '1 1 auto', background: 'transparent' })

      panel.appendChild(iframe)
      document.body.appendChild(panel)

      inlinePanel = panel
      inlineIframe = iframe
      return panel
    }

    function toggleInlinePanel() {
      const panel = inlinePanel || createInlinePanel()
      const isHidden = panel.style.display === 'none' || !panel.style.display
      if (isHidden) {
        panel.style.display = 'flex'
        // place the panel; ensure position recalculated in case of scroll/layout changes
        applyPosition(panel, position, offsetX, offsetY + size + 12)
        btn.setAttribute('aria-expanded', 'true')
        // Send message to chat to reopen
        setTimeout(() => {
          if (inlineIframe && inlineIframe.contentWindow) {
            inlineIframe.contentWindow.postMessage('stellabot-reopen', '*')
          }
        }, 100)
        setTimeout(() => inlineIframe && inlineIframe.focus?.(), 150)
      } else {
        panel.style.display = 'none'
        btn.setAttribute('aria-expanded', 'false')
      }
    }

    btn.addEventListener('click', function () {
      if (mode === 'iframe') {
        const overlay = document.getElementById('stellabot-iframe-modal')
        if (overlay) {
          document.body.removeChild(overlay)
          document.body.style.overflow = ''
          btn.setAttribute('aria-expanded', 'false')
        } else {
          openIframeModal()
          btn.setAttribute('aria-expanded', 'true')
        }
      } else if (mode === 'inline') {
        toggleInlinePanel()
      } else {
        if (popup && !popup.closed) {
          popup.close()
          btn.setAttribute('aria-expanded', 'false')
          popup = null
        } else {
          openPopup()
          // best-effort expanded (will be true if popup opened; ignored if navigated)
          btn.setAttribute('aria-expanded', 'true')
        }
      }
    })

    document.body.appendChild(btn)

    // Auto-open inline if requested
    if (mode === 'inline' && startOpen) {
      createInlinePanel()
      inlinePanel.style.display = 'flex'
      btn.setAttribute('aria-expanded', 'true')
      setTimeout(() => inlineIframe && inlineIframe.focus?.(), 150)
    }
  }

  // Auto-init: If the script tag includes data-stellabot-url, use it.
  // Otherwise, wait for DOMContentLoaded and find script tags that loaded this file.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const scripts = document.scripts
      for (let i = 0; i < scripts.length; i++) {
        const s = scripts[i]
        if (s.src && s.src.indexOf('widget.js') !== -1) {
          init(s)
          return
        }
      }
      // fallback: init with a default config if globals provided
      if (window.STELLABOT_URL) {
        const fake = document.createElement('div')
        fake.setAttribute('data-stellabot-url', window.STELLABOT_URL)
        init(fake)
      }
    })
  } else {
    const scripts = document.scripts
    for (let i = 0; i < scripts.length; i++) {
      const s = scripts[i]
      if (s.src && s.src.indexOf('widget.js') !== -1) {
        init(s)
        break
      }
    }
  }
})();
