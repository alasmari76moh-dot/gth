(function () {
  var STORAGE_KEY = 'gth-theme';
  var ORDER = [
    'index.html',
    '1.html',
    '1.1.1.html',
    '1.1.2.html',
    '2.1.html',
    '2.2.html',
    '2.3.html',
    '2.4.html',
    '2.5.html',
    '3.1.html',
    '3.2.html',
    '3.3.html',
    '3.4.html',
    '3.5.html',
    '4.1.html',
    '4.2.html',
    '4.3.html',
    '4.4.html'
  ];

  function currentPage() {
    var name = window.location.pathname.split('/').pop();
    return name || 'index.html';
  }

  function applyTheme(theme) {
    var next = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    if (next === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.textContent = next === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي';
      btn.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
      btn.setAttribute('type', 'button');
    });
  }

  function makeLink(href, label, className) {
    var a = document.createElement('a');
    a.setAttribute('href', href);
    a.textContent = label;
    if (className) a.className = className;
    return a;
  }

  function makeToggle() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.setAttribute('data-theme-toggle', '');
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = 'الوضع الليلي';
    return btn;
  }

  function ensureNavigation() {
    var page = currentPage();
    var index = ORDER.indexOf(page);
    var isNumbered = page !== 'index.html';

    var topNavs = Array.prototype.slice.call(document.querySelectorAll('.page-nav-top'));
    var top = topNavs[0];
    topNavs.slice(1).forEach(function (nav) { nav.remove(); });
    if (!top) {
      top = document.createElement('nav');
      top.className = 'page-nav-top';
      top.setAttribute('aria-label', 'تنقل الصفحة العلوي');
      document.body.insertBefore(top, document.body.firstChild);
    }
    top.removeAttribute('style');
    top.innerHTML = '';
    if (isNumbered) top.appendChild(makeLink('index.html', 'الرئيسية', 'nav-home'));
    top.appendChild(makeToggle());

    var bottomNavs = Array.prototype.slice.call(document.querySelectorAll('.page-nav-bottom'));
    var bottom = bottomNavs[0];
    bottomNavs.slice(1).forEach(function (nav) { nav.remove(); });
    if (isNumbered) {
      if (!bottom) {
        bottom = document.createElement('nav');
        bottom.className = 'page-nav-bottom';
        bottom.setAttribute('aria-label', 'تنقل الصفحة السفلي');
        document.body.appendChild(bottom);
      }
      bottom.removeAttribute('style');
      bottom.innerHTML = '';
      if (index > 0) {
        bottom.appendChild(makeLink(ORDER[index - 1], 'السابق', 'nav-prev'));
      }
      bottom.appendChild(makeLink('index.html', 'الرئيسية', 'nav-home'));
      if (index >= 0 && index < ORDER.length - 1) {
        bottom.appendChild(makeLink(ORDER[index + 1], 'التالي', 'nav-next'));
      }
      bottom.appendChild(makeToggle());
    } else if (bottom) {
      bottom.remove();
    }

    applyTheme(localStorage.getItem(STORAGE_KEY) || 'light');
  }

  function isTableWrapped(table) {
    return !!table.closest('.table-wrap, .tbl-wrap, .score-matrix-wrap');
  }

  function wrapTables() {
    document.querySelectorAll('table').forEach(function (table) {
      if (isTableWrapped(table)) return;
      var parent = table.parentElement;
      if (!parent) return;

      var style = window.getComputedStyle(parent);
      if (style.overflowX === 'auto' || style.overflowX === 'scroll') {
        parent.classList.add('table-wrap');
        return;
      }

      var wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      parent.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }

  function markScrollableDiagrams() {
    document.querySelectorAll('.tree-container, .dt-tree, .venn-pair, .matrix-grid, .score-matrix-wrap').forEach(function (el) {
      if (el.scrollWidth > el.clientWidth + 1) {
        el.classList.add('diagram-scroll');
      }
    });
  }

  document.documentElement.setAttribute('data-theme', localStorage.getItem(STORAGE_KEY) || 'light');

  document.addEventListener('DOMContentLoaded', function () {
    ensureNavigation();
    wrapTables();
    markScrollableDiagrams();
    applyTheme(localStorage.getItem(STORAGE_KEY) || 'light');
  });

  document.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-theme-toggle]');
    if (!btn) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    var current = document.documentElement.getAttribute('data-theme') || 'light';
    var next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }, true);

  if (!window.Chart) {
    window.Chart = function MiniChart(target, config) {
      this.canvas = target && target.canvas ? target.canvas : target;
      this.config = config || {};
      this.draw();
    };

    window.Chart.prototype.destroy = function () {
      if (!this.canvas) return;
      var ctx = this.canvas.getContext && this.canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    window.Chart.prototype.draw = function () {
      if (!this.canvas || !this.canvas.getContext) return;
      var canvas = this.canvas;
      var ctx = canvas.getContext('2d');
      var rect = canvas.getBoundingClientRect();
      var width = Math.max(280, Math.round(rect.width || canvas.clientWidth || 320));
      var height = Math.max(220, Math.round(rect.height || canvas.clientHeight || 240));
      canvas.width = width;
      canvas.height = height;
      canvas.classList.add('gth-chart-fallback');

      var data = this.config.data || {};
      var labels = data.labels || [];
      var datasets = data.datasets || [];
      var values = [];
      datasets.forEach(function (set) {
        (set.data || []).forEach(function (value) {
          var number = Number(value);
          if (Number.isFinite(number)) values.push(number);
        });
      });
      var min = Math.min.apply(null, values.concat([0]));
      var max = Math.max.apply(null, values.concat([1]));
      if (max === min) max = min + 1;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--gth-nav-bg') || '#ffffff';
      ctx.fillRect(0, 0, width, height);

      var pad = 34;
      var plotW = width - pad * 2;
      var plotH = height - pad * 2;
      ctx.strokeStyle = 'rgba(100,116,139,0.28)';
      ctx.lineWidth = 1;
      for (var i = 0; i <= 4; i += 1) {
        var y = pad + (plotH * i / 4);
        ctx.beginPath();
        ctx.moveTo(pad, y);
        ctx.lineTo(width - pad, y);
        ctx.stroke();
      }

      datasets.forEach(function (set, setIndex) {
        var color = set.borderColor || set.backgroundColor || ['#0284c7', '#059669', '#d97706', '#7c3aed'][setIndex % 4];
        var arr = (set.data || []).map(Number).filter(Number.isFinite);
        if (!arr.length) return;

        if ((this.config.type || '').toLowerCase() === 'bar') {
          var group = plotW / Math.max(arr.length, 1);
          var barW = Math.max(8, group / (datasets.length + 1));
          ctx.fillStyle = Array.isArray(color) ? color[0] : color;
          arr.forEach(function (value, i) {
            var h = (value - min) / (max - min) * plotH;
            var x = pad + i * group + setIndex * barW + 4;
            ctx.fillRect(x, height - pad - h, barW, h);
          });
        } else {
          ctx.strokeStyle = Array.isArray(color) ? color[0] : color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          arr.forEach(function (value, i) {
            var x = pad + (arr.length === 1 ? plotW / 2 : i * plotW / (arr.length - 1));
            var y = height - pad - ((value - min) / (max - min) * plotH);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
        }
      }, this);

      ctx.fillStyle = 'rgba(71,85,105,0.85)';
      ctx.font = '12px Tahoma, Arial, sans-serif';
      ctx.textAlign = 'center';
      labels.slice(0, 6).forEach(function (label, i) {
        var x = pad + (labels.length === 1 ? plotW / 2 : i * plotW / Math.max(labels.length - 1, 1));
        ctx.fillText(String(label).slice(0, 8), x, height - 10);
      });
    };
  }
})();
