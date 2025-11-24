// Back to top button - vanilla JS implementation
(function() {
  const buttons = document.querySelectorAll('.back-to-top-footer, .back-to-top-link');
  if (buttons.length === 0) return;

  // Create sentinel for Intersection Observer (better performance than scroll listener)
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:300px;height:1px;width:1px;pointer-events:none';
  document.body.prepend(sentinel);

  // Show/hide buttons based on scroll position
  const observer = new IntersectionObserver(
    function(entries) {
      const visible = !entries[0].isIntersecting;
      buttons.forEach(function(button) {
        if (visible) {
          button.style.display = 'inline-flex';
          button.style.opacity = '1';
          button.style.visibility = 'visible';
          button.classList.add('visible');
        } else {
          button.style.opacity = '0';
          button.style.visibility = 'hidden';
          setTimeout(function() {
            if (button.style.opacity === '0') {
              button.style.display = 'none';
              button.classList.remove('visible');
            }
          }, 300);
        }
      });
    },
    { threshold: 0 }
  );

  observer.observe(sentinel);

  // Add click handlers
  buttons.forEach(function(button) {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    });
  });
})();

// Image toggles - vanilla JS for dithered/original switching
(function() {
  const figures = document.querySelectorAll('figure.has-toggle');

  figures.forEach(function(figure) {
    const ditheredImg = figure.querySelector('.dithered-img');
    const originalImg = figure.querySelector('.original-img');
    const toggleBtn = figure.querySelector('.toggle-original');

    if (!ditheredImg || !originalImg || !toggleBtn) return;

    let showOriginal = false;

    // Update visibility
    function updateImages() {
      if (showOriginal) {
        ditheredImg.style.display = 'none';
        originalImg.style.display = 'block';
        toggleBtn.setAttribute('aria-pressed', 'true');
        // Update button text
        const spans = toggleBtn.querySelectorAll('span');
        if (spans.length === 2) {
          spans[0].style.display = 'none'; // "show original"
          spans[1].style.display = 'inline'; // "dither"
        }
      } else {
        ditheredImg.style.display = 'block';
        originalImg.style.display = 'none';
        toggleBtn.setAttribute('aria-pressed', 'false');
        // Update button text
        const spans = toggleBtn.querySelectorAll('span');
        if (spans.length === 2) {
          spans[0].style.display = 'inline'; // "show original"
          spans[1].style.display = 'none'; // "dither"
        }
      }
    }

    // Initialize
    updateImages();

    // Toggle on click
    toggleBtn.addEventListener('click', function() {
      showOriginal = !showOriginal;
      updateImages();
    });
  });
})();

// Cursor gradient effect - only on headings and links
(function() {
  // Only enable on desktop
  if (window.innerWidth <= 680) return;
  
  // Create cursor element
  const cursor = document.createElement('div');
  cursor.id = 'cursor';
  cursor.className = 'gradient';
  cursor.style.opacity = '0';
  document.body.appendChild(cursor);
  
  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;
  let isOverTarget = false;
  
  // Check if element is a heading or link
  function isTargetElement(element) {
    if (!element) return false;
    
    // Check if it's a heading
    if (/^H[1-6]$/.test(element.tagName)) return true;
    
    // Check if it's a link or inside a link
    if (element.tagName === 'A') return true;
    if (element.closest('a')) return true;
    
    return false;
  }
  
  // Track mouse position and hover state (throttled)
  let rafId = null;
  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (!rafId) {
      rafId = requestAnimationFrame(function() {
        const target = document.elementFromPoint(mouseX, mouseY);
        const shouldShow = isTargetElement(target);
        
        if (shouldShow !== isOverTarget) {
          isOverTarget = shouldShow;
          cursor.style.opacity = shouldShow ? '1' : '0';
        }
        rafId = null;
      });
    }
  }, { passive: true });
  
  // Smooth cursor movement
  function animateCursor() {
    const speed = 0.15;
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;
    
    cursor.style.left = (cursorX - 125) + 'px';
    cursor.style.top = (cursorY - 125) + 'px';
    
    requestAnimationFrame(animateCursor);
  }
  
  animateCursor();
})();

// Page transitions
(function() {
  // Add fade-in on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFadeIn);
  } else {
    initFadeIn();
  }
  
  function initFadeIn() {
    document.body.style.opacity = '0';
    requestAnimationFrame(function() {
      document.body.style.transition = 'opacity 0.3s ease';
      document.body.style.opacity = '1';
    });
  }
  
  // Smooth transitions for internal links (if View Transitions API is supported)
  if (document.startViewTransition) {
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a[href]');
      if (!link || link.target || !link.href || link.href.startsWith('#')) return;
      
      // Only for same-origin links
      try {
        const url = new URL(link.href);
        if (url.origin === window.location.origin) {
          e.preventDefault();
          document.startViewTransition(function() {
            window.location.href = link.href;
          });
        }
      } catch (err) {
        // Invalid URL, ignore
      }
    });
  }
})();

// Remove inline styles from code blocks (Zola adds background colors)
(function() {
  const STYLES_TO_REMOVE = ['background-color', 'background', 'color'];
  
  function removeInlineStyles(elements) {
    elements.forEach(function(el) {
      STYLES_TO_REMOVE.forEach(function(prop) {
        if (el.style[prop] || el.style.getPropertyValue(prop)) {
          el.style.removeProperty(prop);
        }
      });
    });
  }
  
  function processCodeBlocks() {
    removeInlineStyles(document.querySelectorAll('pre'));
    removeInlineStyles(document.querySelectorAll('code'));
  }
  
  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processCodeBlocks);
  } else {
    processCodeBlocks();
  }
  
  // Also run after dynamic content loads
  const observer = new MutationObserver(function(mutations) {
    const newCodeElements = [];
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) {
          if (node.tagName === 'PRE' || node.tagName === 'CODE') {
            newCodeElements.push(node);
          }
          const nested = node.querySelectorAll && node.querySelectorAll('pre, code');
          if (nested) {
            newCodeElements.push(...Array.from(nested));
          }
        }
      });
    });
    
    if (newCodeElements.length > 0) {
      removeInlineStyles(newCodeElements);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();

// Copy to clipboard functionality for code blocks
(function() {
  function addCopyButtons() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(function(codeBlock) {
      const pre = codeBlock.parentElement;
      
      // Skip if button already exists
      if (pre.querySelector('.copy-button')) {
        return;
      }
      
      // Create copy button
      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button';
      copyButton.textContent = 'Copy';
      copyButton.setAttribute('aria-label', 'Copy code to clipboard');
      
      // Add click handler
      copyButton.addEventListener('click', function() {
        const text = codeBlock.textContent || codeBlock.innerText;
        const RESET_DELAY = 2000;
        
        function showFeedback(message, isError) {
          copyButton.textContent = message;
          if (!isError) {
            copyButton.classList.add('copied');
          }
          
          setTimeout(function() {
            copyButton.textContent = 'Copy';
            copyButton.classList.remove('copied');
          }, RESET_DELAY);
        }
        
        // Use modern Clipboard API if available
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text)
            .then(function() {
              showFeedback('Copied!', false);
            })
            .catch(function(err) {
              console.error('Failed to copy:', err);
              showFeedback('Error', true);
            });
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          textArea.style.pointerEvents = 'none';
          document.body.appendChild(textArea);
          textArea.select();
          
          try {
            const success = document.execCommand('copy');
            if (success) {
              showFeedback('Copied!', false);
            } else {
              showFeedback('Error', true);
            }
          } catch (err) {
            console.error('Failed to copy:', err);
            showFeedback('Error', true);
          }
          
          document.body.removeChild(textArea);
        }
      });
      
      // Insert button into pre element
      pre.appendChild(copyButton);
    });
  }
  
  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addCopyButtons);
  } else {
    addCopyButtons();
  }
  
  // Also run after dynamic content loads (if using a framework)
  // This is useful if code blocks are added dynamically
  const observer = new MutationObserver(function(mutations) {
    let shouldAddButtons = false;
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1 && (node.tagName === 'PRE' || node.querySelector('pre'))) {
            shouldAddButtons = true;
          }
        });
      }
    });
    
    if (shouldAddButtons) {
      addCopyButtons();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();

// Table of Contents is handled by toc.js

// Prefetch recent post links on hover for faster navigation
(function() {
  const recentPostsSection = document.querySelector('.recent-posts');
  if (!recentPostsSection) return;
  
  const links = recentPostsSection.querySelectorAll('a[href]');
  const prefetchedUrls = new Set();
  const HOVER_DELAY = 100;
  
  function prefetchUrl(url) {
    if (prefetchedUrls.has(url)) return;
    
    const linkElement = document.createElement('link');
    linkElement.rel = 'prefetch';
    linkElement.href = url;
    linkElement.as = 'document';
    document.head.appendChild(linkElement);
    prefetchedUrls.add(url);
  }
  
  links.forEach(function(link) {
    const url = link.getAttribute('href');
    if (!url || url.startsWith('#')) return;
    
    // Prefetch on hover with a small delay to avoid unnecessary requests
    let hoverTimeout;
    link.addEventListener('mouseenter', function() {
      hoverTimeout = setTimeout(function() {
        prefetchUrl(url);
      }, HOVER_DELAY);
    }, { passive: true });
    
    link.addEventListener('mouseleave', function() {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    }, { passive: true });
  });
})();

// Newsletter form validation - vanilla JS
(function() {
  const newsletterContainer = document.querySelector('.footer-newsletter');
  if (!newsletterContainer) return;

  const form = newsletterContainer.querySelector('form');
  const emailInput = form.querySelector('input[type="email"]');
  const submitButton = form.querySelector('button[type="submit"]');
  const formContent = newsletterContainer.querySelector('.newsletter-form');
  const successMessage = newsletterContainer.querySelector('.newsletter-success');
  const errorContainer = newsletterContainer.querySelector('.newsletter-error');
  const errorMessage = errorContainer ? errorContainer.querySelector('span') : null;

  let submitting = false;

  function validateEmail(email) {
    if (!email || email.trim() === '') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function showError(message) {
    if (errorContainer && errorMessage) {
      errorMessage.textContent = message;
      errorContainer.style.display = 'block';
      emailInput.setAttribute('aria-invalid', 'true');
    }
  }

  function hideError() {
    if (errorContainer) {
      errorContainer.style.display = 'none';
      emailInput.removeAttribute('aria-invalid');
    }
  }

  function showSuccess() {
    formContent.style.display = 'none';
    successMessage.style.display = 'block';
  }

  // Clear error on input
  if (emailInput) {
    emailInput.addEventListener('input', hideError);
  }

  // Handle form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = emailInput.value.trim();

    // Validate email
    if (!validateEmail(email)) {
      showError('Please enter a valid email address');
      return;
    }

    hideError();
    submitting = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    // Submit to Netlify
    const formData = new FormData(form);

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      });

      if (response.ok) {
        form.reset();
        showSuccess();
      } else {
        showError('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showError('Something went wrong. Please try again.');
    } finally {
      submitting = false;
      submitButton.disabled = false;
      submitButton.textContent = 'Send';
    }
  });
})();

// Spoiler galleries - vanilla JS for expand/collapse
(function() {
  const containers = document.querySelectorAll('.spoiler-gallery-container');

  containers.forEach(function(container) {
    const button = container.querySelector('.spoiler-toggle');
    const content = container.querySelector('.spoiler-content');

    if (!button || !content) return;

    let isOpen = false;

    function updateState() {
      if (isOpen) {
        button.classList.add('active');
        button.setAttribute('aria-expanded', 'true');
        content.style.display = 'block';
        // Update button text
        const spans = button.querySelectorAll('span');
        if (spans.length === 2) {
          spans[0].style.display = 'none'; // Show label
          spans[1].style.display = 'inline'; // Hide label
        }
      } else {
        button.classList.remove('active');
        button.setAttribute('aria-expanded', 'false');
        content.style.display = 'none';
        // Update button text
        const spans = button.querySelectorAll('span');
        if (spans.length === 2) {
          spans[0].style.display = 'inline'; // Show label
          spans[1].style.display = 'none'; // Hide label
        }
      }
    }

    // Initialize
    updateState();

    // Toggle on click
    button.addEventListener('click', function() {
      isOpen = !isOpen;
      updateState();
    });
  });
})();

// Giscus: Hide comment form when comments are disabled (reactions only mode)
(function() {
  const giscusContainer = document.querySelector('.giscus-container.giscus-comments-disabled');
  if (!giscusContainer) return;

  // Function to hide comment form in Giscus iframe
  function hideGiscusCommentForm() {
    const giscusFrame = giscusContainer.querySelector('iframe');
    if (!giscusFrame) return;

    try {
      // Try to access iframe content (may fail due to CORS)
      const iframeDoc = giscusFrame.contentDocument || giscusFrame.contentWindow.document;
      
      // Hide comment form elements - try multiple selectors
      const selectors = [
        'form[data-target="giscus.comment-form"]',
        'form.giscus-comment-form',
        'textarea[data-target="giscus.comment"]',
        'textarea.giscus-comment',
        'button[data-target="giscus.submit"]',
        'button.giscus-submit',
        '[data-target="giscus.sign-in"]',
        '.giscus-sign-in',
        // Common Giscus comment form selectors
        'form[action*="discussions"]',
        'textarea[placeholder*="comment"]',
        'textarea[placeholder*="Comment"]',
        // Hide the entire comment input section
        'div:has(textarea[placeholder*="comment"])',
        'div:has(textarea[placeholder*="Comment"])'
      ];
      
      selectors.forEach(selector => {
        try {
          const elements = iframeDoc.querySelectorAll(selector);
          elements.forEach(el => {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.height = '0';
            el.style.overflow = 'hidden';
          });
        } catch (e) {
          // Selector might not be supported
        }
      });
      
      // Also try to hide parent containers
      const textareas = iframeDoc.querySelectorAll('textarea');
      textareas.forEach(textarea => {
        const placeholder = textarea.getAttribute('placeholder') || '';
        if (placeholder.toLowerCase().includes('comment')) {
          let parent = textarea.parentElement;
          // Hide up to 3 levels of parents
          for (let i = 0; i < 3 && parent; i++) {
            parent.style.display = 'none';
            parent = parent.parentElement;
          }
        }
      });
      
    } catch (e) {
      // CORS error - cannot access iframe content
      // Fall back to CSS-based approach (already handled in CSS)
    }
  }

  // Wait for Giscus to load - use multiple strategies
  const observer = new MutationObserver(function(mutations) {
    const giscusFrame = giscusContainer.querySelector('iframe');
    if (giscusFrame) {
      // Try multiple times as Giscus content loads
      giscusFrame.addEventListener('load', function() {
        hideGiscusCommentForm();
        // Try again after a delay as content might load asynchronously
        setTimeout(hideGiscusCommentForm, 500);
        setTimeout(hideGiscusCommentForm, 1500);
        setTimeout(hideGiscusCommentForm, 3000);
      });
      
      // Also try immediately if iframe is already loaded
      if (giscusFrame.contentDocument || giscusFrame.contentWindow) {
        hideGiscusCommentForm();
      }
      
      observer.disconnect();
    }
  });

  observer.observe(giscusContainer, { childList: true, subtree: true });

  // Also try immediately and at intervals in case Giscus is already loaded
  hideGiscusCommentForm();
  setTimeout(hideGiscusCommentForm, 500);
  setTimeout(hideGiscusCommentForm, 1000);
  setTimeout(hideGiscusCommentForm, 2000);
  setTimeout(hideGiscusCommentForm, 3000);
  setTimeout(hideGiscusCommentForm, 5000);
})();
