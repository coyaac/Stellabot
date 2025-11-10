(function () {
  // Simple embeddable Stellabot widget: injects a floating button that opens the
  // deployed frontend in a popup. Hosts should serve this file over HTTPS.

  function init(el) {
    const url = el.getAttribute('data-stellabot-url') || window.STELLABOT_URL || ''
    const btnLabel = el.getAttribute('data-label') || 'Chat'
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
    btn.innerText = btnLabel
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
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
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

      // create container
      const container = document.createElement('div')
      Object.assign(container.style, {
        width: '420px',
        height: '620px',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.35)',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
      })

      // header with close button
      const header = document.createElement('div')
      Object.assign(header.style, { padding: '8px', display: 'flex', justifyContent: 'flex-end', background: 'transparent' })
      const closeBtn = document.createElement('button')
      closeBtn.innerText = '✕'
      closeBtn.setAttribute('aria-label', 'Close Stellabot')
      Object.assign(closeBtn.style, { background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', marginRight: '6px' })
      header.appendChild(closeBtn)

      // iframe
      const iframe = document.createElement('iframe')
      iframe.src = url
      iframe.setAttribute('title', 'Stellabot')
      Object.assign(iframe.style, { border: 'none', width: '100%', height: '100%', flex: '1 1 auto', background: 'white' })

      closeBtn.addEventListener('click', () => {
        document.body.removeChild(overlay)
        document.body.style.overflow = ''
      })

      // clicking backdrop closes
      overlay.addEventListener('click', (ev) => {
        if (ev.target === overlay) {
          closeBtn.click()
        }
      })

      container.appendChild(header)
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
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'none',
      })
      applyPosition(panel, position, offsetX, offsetY + size + 12) // nudge above button by 12px

      // header with close/minimize
      const header = document.createElement('div')
      Object.assign(header.style, {
        padding: '8px 10px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        background: 'transparent',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        pointerEvents: 'auto',
      })
      const closeBtn = document.createElement('button')
      closeBtn.innerText = '✕'
      closeBtn.setAttribute('aria-label', 'Close Stellabot')
      Object.assign(closeBtn.style, { background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer' })
      header.appendChild(closeBtn)

      const iframe = document.createElement('iframe')
      iframe.src = url
      iframe.setAttribute('title', 'Stellabot')
      Object.assign(iframe.style, { border: 'none', width: '100%', height: '100%', flex: '1 1 auto', background: 'white', pointerEvents: 'auto' })

      closeBtn.addEventListener('click', () => {
        panel.style.display = 'none'
        btn.setAttribute('aria-expanded', 'false')
      })

      panel.appendChild(header)
      panel.appendChild(iframe)
      document.body.appendChild(panel)

      inlinePanel = panel
      inlineIframe = iframe
      panel.style.display = 'none' // Start hidden by default
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
        setTimeout(() => inlineIframe && inlineIframe.focus?.(), 100)
      } else {
        panel.style.display = 'none'
        btn.setAttribute('aria-expanded', 'false')
      }
    }

    btn.addEventListener('click', function () {
      if (mode === 'iframe') {
        openIframeModal()
      } else if (mode === 'inline') {
        toggleInlinePanel()
      } else {
        openPopup()
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
