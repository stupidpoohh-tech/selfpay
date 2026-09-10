/* 스크린샷 화면들의 공통 이동 처리.
 * data-go="home.html" 이 붙은 요소를 누르면 그 화면으로 간다.
 * 리뷰 보드 안(iframe)에서 열렸을 때는 보기 모드를 그대로 물고 간다. */
(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  var suffix = (function () {
    var q = [];
    if (params.has('embed')) q.push('embed=1');
    if (params.get('debug') === 'hits') q.push('debug=hits');
    return q.length ? '?' + q.join('&') : '';
  })();

  if (params.has('embed')) document.documentElement.classList.add('embed');

  document.addEventListener('click', function (e) {
    var go = e.target.closest('[data-go]');
    if (!go) return;
    location.href = go.getAttribute('data-go') + suffix;
  });
})();
